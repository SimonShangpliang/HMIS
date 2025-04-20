import Patient from "../models/patient.js";
import Equipment from "../models/equipment.js";
import { Consultation, Report } from "../models/consultation.js";

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
      reportFile,
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

    // Create report object
    const report = {
      status: "completed",
      reportFile: req.file.path,
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
      // If testId provided, update existing test
      const testIndex = consultation.reports.findIndex(
        (report) => report._id.toString() === testId
      );
      if (testIndex === -1) {
        return res
          .status(404)
          .json({ message: "Test not found in consultation." });
      }
      consultation.reports[testIndex] = {
        ...consultation.reports[testIndex],
        ...report,
      };
    } else {
      // Add new report to existing consultation
      const newReport = new Report(report);
      await newReport.save();
      consultation.reports.push({ ...report, _id: newReport._id });
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
