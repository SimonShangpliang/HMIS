import Equipment from "../models/equipment.js";
import { Consultation, Report } from "../models/consultation.js";
import Patient from "../models/patient.js";

export const searchEquipment = async (req, res) => {
  try {
    const { searchBy } = req.query;

    if (!searchBy) {
      return res.status(400).json({ message: "Search query is required." });
    }

    let searchFilter = {};

    if (!isNaN(searchBy)) {
      searchFilter = { _id: Number(searchBy) };
    } else {
      searchFilter = {
        equipment_name: { $regex: searchBy, $options: "i" },
      };
    }

    const equipmentDetails = await Equipment.find(searchFilter).select(
      "equipment_name last_service_date quantity"
    );
    res.status(200).json(equipmentDetails);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const searchPatientInfoAndTest = async (req, res) => {
  try {
    const { searchById } = req.query;

    if (!searchById) {
      return res.status(400).json({ message: "Search query is required." });
    }

    if (isNaN(searchById)) {
      return res.status(400).json({ message: "Invalid patient ID format." });
    }

    const patientDetails = await Patient.findOne({
      _id: Number(searchById),
    }).select("name patient_info.age patient_info.bloodGrp phone_number");

    if (!patientDetails) {
      return res.status(404).json({ message: "Patient not found." });
    }

    // Get the most recent consultation for the patient with doctor info
    const consultation = await Consultation.findOne({
      patient_id: Number(searchById),
    })
      .populate("doctor_id", "name")
      .sort({ actual_start_datetime: -1 });

    if (!consultation) {
      return res.status(200).json({
        patient: patientDetails,
        tests: [],
        lastConsultation: null,
        message: "No consultations found for this patient.",
      });
    }

    // Format the consultation data
    const lastConsultationData = {
      _id: consultation._id, // Include consultation ID
      date: consultation.actual_start_datetime,
      doctorName: consultation.doctor_id?.name || "Unknown Doctor",
      reason: consultation.reason || "General Checkup",
      status: consultation.status,
    };

    // Get the tests from consultation
    const tests = consultation.reports.map((report) => ({
      _id: report._id,
      title: report.title,
      status: report.status,
    }));

    res.status(200).json({
      patient: patientDetails,
      tests,
      lastConsultation: lastConsultationData,
    });
  } catch (error) {
    console.error("Error in searchPatientInfoAndTest:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get available tests for a specific patient and upload them
export const getPatientPendingTests = async (req, res) => {
  try {
    const { patientId } = req.params;

    if (!patientId || isNaN(patientId)) {
      return res.status(400).json({ message: "Valid patient ID is required." });
    }

    // First check if patient exists
    const patient = await Patient.findOne({ _id: Number(patientId) });

    if (!patient) {
      return res.status(404).json({ message: "Patient not found." });
    }

    // Find the most recent consultation for this patient
    const consultation = await Consultation.findOne({
      patient_id: Number(patientId),
    }).sort({ actual_start_datetime: -1 });

    if (!consultation) {
      return res
        .status(404)
        .json({ message: "No consultations found for this patient." });
    }

    // Filter for only pending tests
    const pendingTests = consultation.reports
      .filter((report) => report.status === "pending")
      .map((report) => ({
        _id: report._id,
        title: report.title,
        description: report.description,
      }));

    if (pendingTests.length === 0) {
      return res
        .status(404)
        .json({ message: "No pending tests found for this patient." });
    }

    res.status(200).json({
      patientName: patient.name,
      patientId: patient._id,
      pendingTests,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload test results for a specific test
export const uploadTestResults = async (req, res) => {
  try {
    const { patientId, testId, consultationId } = req.body;

    // Basic validation
    if (!patientId || !testId || !consultationId) {
      return res.status(400).json({
        message: "Patient ID, test ID, and consultation ID are required.",
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Test result file is required." });
    }

    // Find the consultation
    const consultation = await Consultation.findById(consultationId);

    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found." });
    }

    // Verify patient ID matches consultation
    if (consultation.patient_id.toString() !== patientId.toString()) {
      return res
        .status(400)
        .json({ message: "Patient ID mismatch with consultation." });
    }

    // Find the specific report within the consultation
    const reportIndex = consultation.reports.findIndex(
      (report) => report._id.toString() === testId
    );

    if (reportIndex === -1) {
      return res
        .status(404)
        .json({ message: "Test not found in this consultation." });
    }

    // Verify test is still pending
    if (consultation.reports[reportIndex].status !== "pending") {
      return res
        .status(400)
        .json({ message: "Test is not in pending status." });
    }

    // Update the report status and add the report text
    consultation.reports[reportIndex].status = "completed";
    consultation.reports[reportIndex].reportText = req.file.path;
    consultation.reports[reportIndex].updatedAt = new Date();

    await consultation.save();

    res.status(200).json({
      message: "Test results uploaded successfully.",
      updatedReport: consultation.reports[reportIndex],
    });
  } catch (error) {
    console.error("Error in uploadTestResults:", error);
    res.status(500).json({ message: error.message });
  }
};

// Upload a standalone report for a patient
export const uploadStandaloneReport = async (req, res) => {
  try {
    const { patientId, reportTitle, description } = req.body;
    // Basic validation
    if (!patientId || !reportTitle) {
      return res.status(400).json({
        message: "Patient ID and report title are required.",
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

    // Create a new report document
    const report = new Report({
      status: "completed",
      reportText: req.file.path,
      title: reportTitle,
      description: description || "",
      // createdBy: req.user._id, // Assuming authenticated user's ID is available
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Save the report first
    await report.save();

    // Create a consultation to hold the report reference
    const consultation = new Consultation({
      patient_id: patientId,
      status: "completed",
      appointment_type: "consultation",
      actual_start_datetime: new Date(),
      reports: [report], // Add the saved report
    });

    // Save the consultation
    await consultation.save();

    res.status(201).json({
      message: "Report uploaded successfully.",
      report,
      consultationId: consultation._id,
    });
  } catch (error) {
    console.error("Error in uploadStandaloneReport:", error);
    res.status(500).json({ message: error.message });
  }
};
