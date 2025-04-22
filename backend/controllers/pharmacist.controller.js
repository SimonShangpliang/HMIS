import mongoose from "mongoose";
import { Consultation, Prescription } from "../models/consultation.js";
import Medicine from "../models/inventory.js";

// Safe import for Patient to avoid duplicate model registration error
let Patient;
try {
  Patient = mongoose.model("Patient");
} catch (e) {
  Patient = await import("../models/patient.js").then((mod) => mod.default);
}

export const searchPatientPrescriptions = async (req, res) => {
  try {
    const { searchById, dispense } = req.query;
    console.log("Search by ID:", searchById, "Dispense:", dispense);

    if (!searchById) {
      return res.status(400).json({ message: "Search query is required." });
    }

    const patientDetails = await Patient.findById(searchById).populate(
      "patient_info"
    );

    if (!patientDetails) {
      return res.status(404).json({ message: "Patient not found." });
    }

    const consultation = await Consultation.findOne({
      patient_id: searchById,
    }).sort({ actual_start_datetime: -1 });

    // console.log("Consultation found:", consultation);

    if (
      !consultation ||
      !consultation.prescription ||
      consultation.prescription.length === 0
    ) {
      return res.status(200).json({
        patient: patientDetails,
        prescriptions: [],
        lastConsultation: consultation,
      });
    }

    const prescriptions = await Prescription.find({
      _id: { $in: consultation.prescription },
    })
      .sort({ prescriptionDate: -1 })
      .populate("entries.medicine_id");

    // console.log(prescriptions);

    const now = new Date();
    const updatedPrescriptions = [];

    for (let prescription of prescriptions) {
      let allDispensed = true;
      let anyDispensed = false;

      const processedEntries = [];

      for (let entry of prescription.entries) {
        const med = entry.medicine_id;
        if (!med) continue;

        let validBatches = med.inventory.filter(
          (batch) => new Date(batch.expiry_date) > now && batch.quantity > 0
        );

        let requiredQty = entry.quantity - entry.dispensed_qty;
        let originalQty = requiredQty;
        const dispensedBatches = [];

        if (dispense === "true" && requiredQty > 0) {
          for (let batch of validBatches) {
            if (requiredQty <= 0) break;

            const takeQty = Math.min(requiredQty, batch.quantity);
            dispensedBatches.push({
              batch_no: batch.batch_no,
              taken: takeQty,
            });

            batch.quantity -= takeQty;
            requiredQty -= takeQty;
          }

          entry.dispensed_qty += originalQty - requiredQty;
          await med.save();

          if (originalQty - requiredQty > 0) anyDispensed = true;
          if (requiredQty > 0) allDispensed = false;
        }

        processedEntries.push({
          medicine_name: med.med_name || "Unknown",
          medicine_id: med._id,
          dosage_form: med.dosage_form || "N/A",
          manufacturer: med.manufacturer || "N/A",
          available: med.available ?? false,
          dosage: entry.dosage,
          frequency: entry.frequency,
          duration: entry.duration,
          quantity: entry.quantity,
          dispensed_qty: entry.dispensed_qty,
          valid_batches: validBatches.map((batch) => ({
            batch_no: batch.batch_no,
            expiry_date: batch.expiry_date,
            quantity: batch.quantity,
            unit_price: batch.unit_price,
            supplier: batch.supplier,
          })),
          dispensed_from: dispensedBatches,
          entry_id: entry._id,
        });
      }

      // console.log(processedEntries);

      if (dispense === "true") {
        if (allDispensed) {
          prescription.status = "dispensed";
        } else if (anyDispensed) {
          prescription.status = "partially_dispensed";
        } else {
          prescription.status = "pending";
        }

        prescription.markModified("entries");
        await prescription.save();
      }

      updatedPrescriptions.push({
        prescription_id: prescription._id,
        prescription_date: prescription.prescriptionDate,
        status: prescription.status,
        entries: processedEntries,
      });
    }

    res.status(200).json({
      patient: patientDetails,
      prescriptions: updatedPrescriptions,
      lastConsultation: consultation,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePrescriptionEntry = async (req, res) => {
  try {
    const { prescriptionId, entryId } = req.params;
    const { dispensed_qty } = req.body;

    const prescription = await Prescription.findById(prescriptionId);
    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found." });
    }

    const entry = prescription.entries.id(entryId);
    if (!entry) {
      return res.status(404).json({ message: "Prescription entry not found." });
    }

    if (dispensed_qty === undefined || dispensed_qty < 0) {
      return res
        .status(400)
        .json({ message: "Valid dispensed quantity is required." });
    }

    const medicine = await Medicine.findById(entry.medicine_id);
    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found." });
    }
    // Prevent exceeding prescribed quantity
    if (dispensed_qty > entry.quantity) {
      return res.status(400).json({
        message: "Dispensed quantity cannot exceed prescribed quantity.",
      });
    }

    // Calculate how many more units need to be dispensed
    const additionalQty = dispensed_qty - entry.dispensed_qty;

    if (additionalQty > 0) {
      // Get valid batches (not expired and have stock)
      const now = new Date();
      const validBatches = medicine.inventory.filter(
        (batch) => new Date(batch.expiry_date) > now && batch.quantity > 0
      );

      let remainingQty = additionalQty;
      let dispensedBatches = [];

      // Dispense from available batches
      for (let batch of validBatches) {
        if (remainingQty <= 0) break;

        const takeQty = Math.min(remainingQty, batch.quantity);
        dispensedBatches.push({
          batch_no: batch.batch_no,
          taken: takeQty,
        });

        batch.quantity -= takeQty;
        remainingQty -= takeQty;
      }

      if (remainingQty > 0) {
        return res.status(400).json({
          message:
            "Insufficient stock available to dispense the requested quantity.",
        });
      }

      // Save the updated medicine inventory
      await medicine.save();
    }

    entry.dispensed_qty = dispensed_qty;

    // Check if all medicines are dispensed and update prescription status
    let allDispensed = true;
    let anyDispensed = false;

    for (const entry of prescription.entries) {
      if (entry.dispensed_qty > 0) {
        anyDispensed = true;
      }
      if (entry.dispensed_qty < entry.quantity) {
        allDispensed = false;
      }
    }

    if (allDispensed) {
      prescription.status = "dispensed";
    } else if (anyDispensed) {
      prescription.status = "partially_dispensed";
    } else {
      prescription.status = "pending";
    }

    prescription.markModified("entries");
    await prescription.save();

    res.status(200).json({
      message: "Dispensed quantity updated successfully.",
    });
  } catch (error) {
    console.error("Error in updatePrescriptionEntry:", error);
    res.status(500).json({ message: error.message });
  }
};
