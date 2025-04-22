import mongoose from "mongoose";
import { Consultation, Prescription, Report } from "../models/consultation.js";
import Diagnosis from "../models/diagnosis.js";
import Patient from "../models/patient.js";
import Medicine from "../models/inventory.js";
import cloudinary from "../config/cloudinary.js";
import fetch from "node-fetch";

// Utility to format a 30-min time slot
const formatTimeSlot = (start) => {
  const startTime = new Date(start);
  const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);
  const format = (d) =>
    d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  return `${format(startTime)} - ${format(endTime)}`;
};

// GET /doctor/appointments
export const fetchAppointments = async (req, res) => {
  console.log("requested");

  try {
    const doctorId = req.query.user;
    console.log(doctorId);
    if (!doctorId) {
      return res.status(400).json({ error: "Doctor ID missing in token" });
    }

    const consultations = await Consultation.find({
      doctor_id: doctorId,
      status: { $in: ["scheduled", "ongoing", "completed"] },
    })
      .populate("patient_id", "name")
      .sort({ booked_date_time: 1 });

    if (!consultations.length) {
      return res.status(200).json({ message: "No appointments found" });
    }

    const appointments = consultations.map((c) => ({
      id: c._id,
      patientName: c.patient_id?.name || "Unknown",
      patientId: c.patient_id?._id,
      // Format date as YYYY-MM-DD
      date: new Date(c.booked_date_time).toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }),
      // Format time as HH:MM AM/PM
      time: new Date(c.booked_date_time).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      appointmentType: c.appointment_type || "regular",
      status: c.status,
    }));

    res.json(appointments);
  } catch (err) {
    console.error("Error in fetchAppointments:", err);
    res.status(500).json({ error: "Server error while fetching appointments" });
  }
};

// PUT /doctor/appointments
export const updateAppointments = async (req, res) => {
  try {
    const doctorId = req.query.user;
    if (!doctorId) {
      return res.status(400).json({ error: "Doctor ID missing in token" });
    }

    const { id, isDone } = req.body;

    if (!id || typeof isDone !== "boolean") {
      return res
        .status(400)
        .json({ error: "Missing or invalid 'id' or 'isDone' field" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid consultation ID format" });
    }

    const consultation = await Consultation.findOne({
      _id: id,
      doctor_id: doctorId,
    });
    if (!consultation) {
      return res
        .status(404)
        .json({ error: "Consultation not found for this doctor" });
    }

    consultation.status = isDone ? "completed" : "ongoing";
    await consultation.save();

    res.json({ message: "Appointment status updated successfully" });
  } catch (err) {
    console.error("Error in updateAppointments:", err);
    res.status(500).json({ error: "Server error while updating appointment" });
  }
};

export const fetchPatientConsultations = async (req, res) => {
  try {
    const { doctorId, patientId } = req.query;

    if (!doctorId) {
      return res.status(400).json({ error: "Doctor ID missing in token" });
    }

    if (!patientId) {
      return res.status(400).json({
        error: "Patient ID is required",
      });
    }

    const query = {
      patient_id: parseInt(patientId),
    };

    const consultations = await Consultation.find(query)
      .populate({
        path: "doctor_id",
        populate: {
          path: "employee_id",
          select: "name", // this gets the name from Employee
        },
        select: "specialization employee_id", // select doctor fields (include employee_id so nested populate works)
      })
      .populate("prescription")
      .sort({ booked_date_time: -1 });

    if (!consultations.length) {
      return res
        .status(200)
        .json({ message: "No consultations found for this patient" });
    }

    res.json(consultations);
  } catch (error) {
    console.error("Error fetching patient consultations:", error);
    res.status(500).json({
      error: "Server error while fetching consultations",
      message: error.message,
    });
  }
};

export const fetchPatientProgress = async (req, res) => {
  try {
    // const doctor_id = req.user?.doctor_id;
    // const doctor_id = "10008" ;
    const { patientId } = req.params;

    // if (!doctor_id) {
    //   return res.status(400).json({ error: "Doctor ID missing in token" });
    // }

    if (!patientId) {
      return res.status(400).json({
        error: "Patient ID is required",
      });
    }

    // // First verify this doctor has access to this patient (has consultations)
    // const hasConsultation = await Consultation.findOne({
    //   doctor_id: doctor_id,
    //   patient_id: parseInt(patientId)
    // });

    // if (!hasConsultation) {
    //   return res.status(403).json({
    //     error: "Unauthorized: No consultations found for this patient under your care"
    //   });
    // }

    // Fetch the patient with vitals
    const patient = await Patient.findById(parseInt(patientId)).select(
      "name vitals"
    );

    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    // Sort vitals by date (most recent first)
    const sortedVitals = patient.vitals.sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });

    res.status(200).json({
      success: true,
      patientName: patient.name,
      data: sortedVitals,
    });
  } catch (error) {
    console.error("Error fetching patient progress:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching patient progress",
      error: error.message,
    });
  }
};

export const addDiagnosis = async (req, res) => {
  try {
    const doctor_id = req.user?.doctor_id;
    const { consultationId } = req.params;
    const { diagnosis } = req.body; // Always an array of diagnosis strings

    if (!doctor_id) {
      return res.status(400).json({ error: "Doctor ID missing in token" });
    }

    if (
      !consultationId ||
      !diagnosis ||
      !Array.isArray(diagnosis) ||
      diagnosis.length === 0
    ) {
      return res
        .status(400)
        .json({ error: "Consultation ID and diagnosis array are required" });
    }

    // Find the consultation and verify doctor has permission
    const consultation = await Consultation.findOne({
      _id: consultationId,
      doctor_id: doctor_id,
    });

    if (!consultation) {
      return res
        .status(404)
        .json({ error: "Consultation not found or access denied" });
    }

    // Create and save diagnosis objects
    const diagnosisPromises = diagnosis.map(async (diagnosisName) => {
      if (typeof diagnosisName !== "string" || !diagnosisName.trim()) {
        throw new Error("All diagnosis entries must be non-empty strings");
      }
      const newDiagnosis = new Diagnosis({ name: diagnosisName });
      return await newDiagnosis.save();
    });

    const savedDiagnoses = await Promise.all(diagnosisPromises);
    const diagnosisIds = savedDiagnoses.map((d) => d._id);

    // Update consultation with new diagnosis IDs
    const updatedConsultation = await Consultation.findByIdAndUpdate(
      consultationId,
      { $addToSet: { diagnosis: { $each: diagnosisIds } } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: updatedConsultation,
    });
  } catch (error) {
    console.error("Error adding diagnosis:", error);
    res.status(500).json({
      error: "Server error while adding diagnosis",
      message: error.message,
    });
  }
};

export const addRemarks = async (req, res) => {
  try {
    const doctor_id = req.user?.doctor_id;
    const { consultationId } = req.params;
    const { remark } = req.body;

    if (!doctor_id) {
      return res.status(400).json({ error: "Doctor ID missing in token" });
    }

    if (!consultationId || !remark) {
      return res
        .status(400)
        .json({ error: "Consultation ID and remark are required" });
    }

    // Find the consultation and verify doctor has permission
    const consultation = await Consultation.findOne({
      _id: consultationId,
      doctor_id: doctor_id,
    });

    if (!consultation) {
      return res
        .status(404)
        .json({ error: "Consultation not found or access denied" });
    }

    // Update consultation with new remark
    const updatedConsultation = await Consultation.findByIdAndUpdate(
      consultationId,
      { remark: remark },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: updatedConsultation,
    });
  } catch (error) {
    console.error("Error adding remark:", error);
    res.status(500).json({
      error: "Server error while adding remark",
      message: error.message,
    });
  }
};

export const addPrescription = async (req, res) => {
  try {
    // const doctor_id = req.user?.doctor_id;

    const { consultationId } = req.params;
    const doctor_id = req.query.doctor?.replace(/"/g, ""); // to remove the quotes if you're passing "10008"

    const prescriptionData = req.body;

    console.log(consultationId);
    console.log(doctor_id);
    console.log(prescriptionData);
    console.log("prescription:", JSON.stringify(prescriptionData, null, 2));

    if (!doctor_id) {
      return res.status(400).json({ error: "Doctor ID missing in token" });
    }

    if (!consultationId || !prescriptionData || !prescriptionData.entries) {
      return res
        .status(400)
        .json({ error: "Consultation ID and prescription data are required" });
    }

    // Find the consultation and verify doctor has permission
    const consultation = await Consultation.findOne({
      _id: consultationId,
      // doctor_id: doctor_id
    });

    if (!consultation) {
      return res
        .status(404)
        .json({ error: "Consultation not found or access denied" });
    }

    // Process each entry: ensure medicine_id is present
    const processedEntries = [];

    for (const entry of prescriptionData.entries) {
      let medId = entry.medicine_id;

      // If medicine_id is missing, try to create or fetch by name
      if (!medId && entry.medicine) {
        let medicine = await Medicine.findOne({ med_name: entry.medicine });

        if (!medicine) {
          medicine = await Medicine.create({ med_name: entry.medicine });
        }

        medId = medicine._id;
      }

      if (!medId) {
        continue;
        // return res.status(400).json({ error: `Missing medicine_id or valid medicine name for entry.` });
      }

      processedEntries.push({
        medicine_id: medId,
        dosage: entry.dosage,
        frequency: entry.frequency,
        duration: entry.duration,
        quantity: entry.quantity,
        dispensed_qty: entry.dispensed_qty,
      });
    }

    // Create a new prescription
    const newPrescription = new Prescription({
      prescriptionDate: new Date(),
      status: "pending",
      entries: processedEntries,
    });

    const savedPrescription = await newPrescription.save();

    // Update consultation with new prescription
    const updatedConsultation = await Consultation.findByIdAndUpdate(
      consultationId,
      { prescription: [savedPrescription._id] }, // replaces the whole array
      { new: true }
    ).populate({
      path: "prescription",
      populate: {
        path: "entries.medicine_id",
        model: "Medicine",
        select: "med_name dosage duration",
      },
    });

    res.status(200).json({
      success: true,
      data: updatedConsultation,
    });
  } catch (error) {
    console.error("Error adding prescription:", error);
    res.status(500).json({
      error: "Server error while adding prescription",
      message: error.message,
    });
  }
};

export const downloadReport = async (req, res) => {
  try {
    const { consultationId, reportId } = req.params;

    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).json({ error: "Consultation not found" });
    }

    const report = consultation.reports.find(
      (r) => r._id.toString() === reportId
    );
    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    if (!report.reportFile) {
      return res.status(404).json({ error: "No file attached to this report" });
    }

    // Parse URL to get file information
    const urlParts = report.reportFile.split("/");
    const filename = urlParts[urlParts.length - 1];
    const fileExt = filename.split(".").pop().toLowerCase();

    // For test_reports folder, take the last two parts of the path (folder/filename)
    const publicId = urlParts.slice(-2).join("/").split(".")[0];

    try {
      const resourceType = ["pdf", "doc", "docx"].includes(fileExt)
        ? "raw"
        : "image";

      // Generate the direct download URL using Cloudinary's API
      const downloadUrl = cloudinary.url(publicId, {
        resource_type: resourceType,
        secure: true,
        format: fileExt,
      });

      // Redirect to the download URL
      return res.redirect(downloadUrl);
    } catch (cloudinaryError) {
      console.error("Cloudinary error:", cloudinaryError);
      return res.status(500).json({ error: "Error accessing report file" });
    }
  } catch (error) {
    console.error("Error downloading report:", error);
    res.status(500).json({ error: "Error downloading report" });
  }
};

// Update a specific diagnosis by ID
export const updateDiagnosisById = async (req, res) => {
  try {
    const doctor_id = req.user?.doctor_id;
    const { consultationId, diagnosisId } = req.params;
    const { diagnosis } = req.body;

    if (!doctor_id) {
      return res.status(400).json({ error: "Doctor ID missing in token" });
    }

    if (!consultationId || !diagnosisId || !diagnosis) {
      return res.status(400).json({
        error:
          "Consultation ID, diagnosis ID and updated diagnosis are required",
      });
    }

    // Find the consultation and verify doctor has permission
    const consultation = await Consultation.findOne({
      _id: consultationId,
      doctor_id: doctor_id,
      diagnosis: diagnosisId,
    });

    if (!consultation) {
      return res.status(404).json({
        error:
          "Consultation not found, access denied, or diagnosis not found in this consultation",
      });
    }

    // Update the specific diagnosis
    await Diagnosis.findByIdAndUpdate(diagnosisId, { name: diagnosis });

    // Fetch updated consultation
    const updatedConsultation = await Consultation.findById(consultationId);

    res.status(200).json({
      success: true,
      data: updatedConsultation,
    });
  } catch (error) {
    console.error("Error updating diagnosis by ID:", error);
    res.status(500).json({
      error: "Server error while updating diagnosis",
      message: error.message,
    });
  }
};
// write a function to fetch all diagonis available in diagnosis collection

export const fetchAllDiagnoses = async (req, res) => {
  try {
    const diagnoses = await Diagnosis.find({});
    res.status(200).json({
      success: true,
      data: diagnoses,
    });
  } catch (error) {
    console.error("Error fetching all diagnoses:", error);
    res.status(500).json({
      error: "Server error while fetching diagnoses",
      message: error.message,
    });
  }
};

// Update all diagnoses for a consultation (replace with new one)
export const updateAllDiagnosis = async (req, res) => {
  try {
    const doctor_id = req.query.user;
    // const doctor_id = "10008";
    const { consultationId } = req.params;
    const diagnosisList = req.body; // Array of diagnosis strings
    const diagnosis = diagnosisList;
    console.log(consultationId);
    console.log(diagnosisList);

    if (!doctor_id) {
      return res.status(400).json({ error: "Doctor ID missing in token" });
    }

    if (
      !consultationId ||
      !diagnosis ||
      !Array.isArray(diagnosis) ||
      diagnosis.length === 0
    ) {
      return res
        .status(400)
        .json({ error: "Consultation ID and diagnosis array are required" });
    }

    // Find the consultation and verify doctor has permission
    const consultation = await Consultation.findOne({
      _id: consultationId,
      doctor_id: doctor_id,
    });

    if (!consultation) {
      return res
        .status(404)
        .json({ error: "Consultation not found or access denied" });
    }

    // Create and save diagnosis objects
    const diagnosisPromises = diagnosis.map(async (diagnosisName) => {
      if (typeof diagnosisName !== "string" || !diagnosisName.trim()) {
        throw new Error("All diagnosis entries must be non-empty strings");
      }

      // Check if diagnosis already exists
      let existing = await Diagnosis.findOne({ name: diagnosisName.trim() });
      if (existing) return existing;

      // Create a new one if it doesn't exist
      const newDiagnosis = new Diagnosis({ name: diagnosisName.trim() });
      return await newDiagnosis.save();
    });

    const savedDiagnoses = await Promise.all(diagnosisPromises);
    const diagnosisIds = savedDiagnoses.map((d) => d._id);

    // Replace all existing diagnosis entries with the new ones
    const updatedConsultation = await Consultation.findByIdAndUpdate(
      consultationId,
      { diagnosis: diagnosisIds }, // Complete replacement
      { new: true }
    ).populate("diagnosis");

    res.status(200).json({
      success: true,
      data: updatedConsultation,
    });
  } catch (error) {
    console.error("Error updating all diagnoses:", error);
    res.status(500).json({
      error: "Server error while updating diagnoses",
      message: error.message,
    });
  }
};

export const updateRemark = async (req, res) => {
  try {
    const doctor_id = req.query.user;
    // const doctor_id = "10008";
    const { consultationId } = req.params;
    const remark = req.body.message;

    console.log(consultationId);
    console.log(remark);
    if (!doctor_id) {
      return res.status(400).json({ error: "Doctor ID missing in token" });
    }

    if (!consultationId || !remark) {
      return res
        .status(400)
        .json({ error: "Consultation ID and remark are required" });
    }

    // Find and update the consultation
    const updatedConsultation = await Consultation.findOneAndUpdate(
      { _id: consultationId, doctor_id: doctor_id },
      { remark: remark },
      { new: true }
    );

    if (!updatedConsultation) {
      return res
        .status(404)
        .json({ error: "Consultation not found or access denied" });
    }

    res.status(200).json({
      success: true,
      data: updatedConsultation,
    });
  } catch (error) {
    console.error("Error updating remark:", error);
    res.status(500).json({
      error: "Server error while updating remark",
      message: error.message,
    });
  }
};

// Update a specific prescription by ID
export const updatePrescriptionById = async (req, res) => {
  try {
    const doctor_id = req.user?.doctor_id;
    const { consultationId, prescriptionId } = req.params;
    const { prescriptionData } = req.body;

    if (!doctor_id) {
      return res.status(400).json({ error: "Doctor ID missing in token" });
    }

    if (
      !consultationId ||
      !prescriptionId ||
      !prescriptionData ||
      !prescriptionData.entries
    ) {
      return res.status(400).json({
        error:
          "Consultation ID, prescription ID and prescription data are required",
      });
    }

    // Find the consultation and verify doctor has permission
    const consultation = await Consultation.findOne({
      _id: consultationId,
      doctor_id: doctor_id,
      prescription: parseInt(prescriptionId),
    });

    if (!consultation) {
      return res.status(404).json({
        error:
          "Consultation not found, access denied, or prescription not found in this consultation",
      });
    }

    // Update the specific prescription
    await Prescription.findByIdAndUpdate(parseInt(prescriptionId), {
      entries: prescriptionData.entries,
      status: "pending", // Reset to pending since it was modified
    });

    // Fetch updated consultation
    const updatedConsultation = await Consultation.findById(consultationId)
      .populate("diagnosis")
      .populate("prescription");

    res.status(200).json({
      success: true,
      data: updatedConsultation,
    });
  } catch (error) {
    console.error("Error updating prescription by ID:", error);
    res.status(500).json({
      error: "Server error while updating prescription",
      message: error.message,
    });
  }
};

// Update all prescriptions for a consultation
export const updateAllPrescription = async (req, res) => {
  try {
    const doctor_id = req.user?.doctor_id;
    const { consultationId } = req.params;
    const { prescriptionData } = req.body;

    if (!doctor_id) {
      return res.status(400).json({ error: "Doctor ID missing in token" });
    }

    if (!consultationId || !prescriptionData || !prescriptionData.entries) {
      return res
        .status(400)
        .json({ error: "Consultation ID and prescription data are required" });
    }

    // Find the consultation and verify doctor has permission
    const consultation = await Consultation.findOne({
      _id: consultationId,
      doctor_id: doctor_id,
    });

    if (!consultation) {
      return res
        .status(404)
        .json({ error: "Consultation not found or access denied" });
    }

    // Create a new prescription
    const newPrescription = new Prescription({
      prescriptionDate: new Date(),
      status: "pending",
      entries: prescriptionData.entries,
    });

    const savedPrescription = await newPrescription.save();

    // Replace all existing prescriptions with just this new one
    const updatedConsultation = await Consultation.findByIdAndUpdate(
      consultationId,
      { prescription: [savedPrescription._id] }, // Complete replacement
      { new: true }
    )
      .populate("diagnosis")
      .populate("prescription");

    res.status(200).json({
      success: true,
      data: updatedConsultation,
    });
  } catch (error) {
    console.error("Error updating all prescriptions:", error);
    res.status(500).json({
      error: "Server error while updating prescriptions",
      message: error.message,
    });
  }
};
