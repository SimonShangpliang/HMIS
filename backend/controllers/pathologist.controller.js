import Patient from "../models/patient.js";
import Equipment from "../models/equipment.js";
import { Consultation, Report } from "../models/consultation.js";
import cloudinary from "../config/cloudinary.js";

// Search equipment by name
export const searchEquipment = async (req, res) => {
  try {
    const { searchBy } = req.query;
    const equipment = await Equipment.find({
      name: { $regex: searchBy, $options: "i" },
    });

    res.status(200).json(equipment);
  } catch (error) {
    console.error("Error in searchEquipment:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get patient info, consultations and associated tests
export const searchPatientInfoAndTest = async (req, res) => {
  try {
    const { searchById } = req.query;

    if (!searchById) {
      return res.status(400).json({ message: "Search query is required." });
    }

    if (isNaN(searchById)) {
      return res.status(400).json({ message: "Invalid patient ID format." });
    }

    // Get patient details
    const patientDetails = await Patient.findOne({
      _id: Number(searchById),
    }).select("name patient_info.age patient_info.bloodGrp phone_number");

    if (!patientDetails) {
      return res.status(404).json({ message: "Patient not found." });
    }

    // Get all consultations for the patient with their tests
    const consultations = await Consultation.find({
      patient_id: Number(searchById),
    })
      .populate({
        path: "doctor_id",
        select: "_id",
        populate: {
          path: "employee_id",
          select: "name",
        },
      })
      .sort({ actual_start_datetime: -1 });

    res.status(200).json({
      patient: patientDetails,
      consultations: consultations.map((consultation) => ({
        ...consultation._doc,
        doctorName:
          consultation.doctor_id?.employee_id?.name || "Unknown Doctor",
        reports: consultation.reports || [],
      })),
    });
  } catch (error) {
    console.error("Error in searchPatientInfoAndTest:", error);
    res.status(500).json({ message: error.message });
  }
};

// Upload a report (with or without consultation/test association)
export const uploadReport = async (req, res) => {
  try {
    const {
      patientId,
      consultationId,
      testId,
      reportTitle,
      reportType,
      description,
    } = req.body;

    // Basic validation
    if (!patientId || !reportTitle || !reportType || !consultationId) {
      return res.status(400).json({
        message:
          "Patient ID, consultation, report title, and report type are required.",
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Report file is required." });
    }

    // Verify patient exists
    const patient = await Patient.findOne({ _id: Number(patientId) });
    if (!patient) {
      return res.status(404).json({ message: "Patient not found." });
    }

    // Create report object using the Cloudinary URL
    const report = {
      status: "completed",
      reportFile: req.file.path, // This will be the Cloudinary URL
      reportText: req.file.filename,
      title: reportTitle,
      type: reportType,
      description: description || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Find existing consultation
    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found." });
    }
    if (testId) {
      // Update existing test
      const testIndex = consultation.reports.findIndex(
        (report) => report._id.toString() === testId
      );
      if (testIndex === -1) {
        return res
          .status(404)
          .json({ message: "Test not found in consultation." });
      }

      // If there's an existing report file, delete it from Cloudinary
      if (consultation.reports[testIndex].reportFile) {
        const oldFileUrl = consultation.reports[testIndex].reportFile;
        // Extract the public ID using patientId-reportId format
        const publicId = `test_reports/${patientId}-${testId}`;
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (error) {
          console.error("Error deleting old file from Cloudinary:", error);
        }
      }

      consultation.reports[testIndex] = {
        ...consultation.reports[testIndex],
        ...report,
      };
    } else {
      // Add new report
      consultation.reports.push(report);
    }

    await consultation.save();

    res.status(200).json({
      message: "Report uploaded successfully.",
      consultationId: consultation._id,
      report: testId
        ? consultation.reports.find((r) => r._id.toString() === testId)
        : consultation.reports[consultation.reports.length - 1],
    });
  } catch (error) {
    console.error("Error in uploadReport:", error);
    res.status(500).json({ message: error.message });
  }
};
