import mongoose from 'mongoose';
import { Consultation, Prescription } from '../models/consultation.js';
import Medicine from '../models/inventory.js';

// Safe import for Patient to avoid duplicate counter error
let Patient;
try {
  Patient = mongoose.model('Patient');
} catch (e) {
  Patient = await import('../models/Patient.js').then(mod => mod.default);
}

export const searchPatientPrescriptions = async (req, res) => {
  try {
    const { searchById, dispense } = req.query;

    if (!searchById) {
      return res.status(400).json({ message: "Search query is required." });
    }

    if (isNaN(searchById)) {
      return res.status(400).json({ message: "Invalid patient ID format." });
    }

    const numericId = Number(searchById);

    // Fetch patient info
    const patientDetails = await Patient.findOne({ _id: numericId }).select(
      "name patient_info.age patient_info.bloodGrp phone_number"
    );

    if (!patientDetails) {
      return res.status(404).json({ message: "Patient not found." });
    }

    // Get latest consultation
    const consultation = await Consultation.findOne({ patient_id: numericId })
      .sort({ actual_start_datetime: -1 });

    if (!consultation || !consultation.prescription || consultation.prescription.length === 0) {
      return res.status(200).json({
        patient: patientDetails,
        prescribed_medicines: [],
        lastConsultation: null,
        message: "No consultations or prescriptions found for this patient.",
      });
    }

    // Fetch prescriptions
    const prescriptions = await Prescription.find({
      _id: { $in: consultation.prescription },
    })
      .sort({ prescriptionDate: -1 })
      .populate("entries.medicine_id");

    const now = new Date();
    const updatedPrescriptions = [];

    for (let prescription of prescriptions) {
      let allDispensed = true;
      let anyDispensed = false;

      for (let entry of prescription.entries) {
        const med = entry.medicine_id;
        if (!med) continue;

        let validBatches = med.inventory.filter(batch => new Date(batch.expiry_date) > now && batch.quantity > 0);
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

          entry.dispensed_qty += (originalQty - requiredQty);
          await med.save();

          if (originalQty - requiredQty > 0) anyDispensed = true;
          if (requiredQty > 0) allDispensed = false;
        }

        entry._doc.valid_batches = validBatches.map(batch => ({
          batch_no: batch.batch_no,
          expiry_date: batch.expiry_date,
          quantity: batch.quantity,
          unit_price: batch.unit_price,
          supplier: batch.supplier,
        }));

        entry._doc.dispensed_from = dispensedBatches;
      }

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

      updatedPrescriptions.push(prescription);
    }

    const prescribedMedicines = updatedPrescriptions.flatMap(prescription =>
      prescription.entries.map(entry => ({
        medicine_name: entry.medicine_id?.med_name || "Unknown",
        dosage_form: entry.medicine_id?.dosage_form || "N/A",
        manufacturer: entry.medicine_id?.manufacturer || "N/A",
        available: entry.medicine_id?.available ?? false,
        dosage: entry.dosage,
        frequency: entry.frequency,
        duration: entry.duration,
        quantity: entry.quantity,
        dispensed_qty: entry.dispensed_qty,
        prescription_status: (() => {
          if (entry.quantity === 0) return "pending";
          if (entry.dispensed_qty === 0) return "pending";
          if (entry.dispensed_qty >= entry.quantity) return "dispensed";
          return "partially_dispensed";
        })(),
        prescription_date: prescription.prescriptionDate,
        valid_batches: entry._doc.valid_batches || [],
        dispensed_from: entry._doc.dispensed_from || [],
        prescription_id: prescription._id,
        entry_id: entry._id
      }))
    );

    const lastConsultationData = {
      _id: consultation._id,
      date: consultation.actual_start_datetime,
      status: consultation.status,
      reason: consultation.reason || "General Checkup",
    };

    res.status(200).json({
      patient: patientDetails,
      prescribed_medicines: prescribedMedicines,
      lastConsultation: lastConsultationData,
    });

  } catch (error) {
    console.error("Error in searchPatientPrescriptions:", error);
    res.status(500).json({ message: error.message });
  }
};

export const updatePrescriptionEntry = async (req, res) => {
  try {
    const { prescriptionId, entryId } = req.params;
    const { dispensed_qty } = req.body;

    // Validate dispensed_qty
    if (dispensed_qty === undefined || dispensed_qty < 0) {
      return res.status(400).json({ message: "Valid dispensed quantity is required." });
    }

    // Find the prescription in consultation
    const prescription = await Prescription.findById(prescriptionId);
    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found." });
    }

    // Find the specific entry in the prescription
    const entry = prescription.entries.id(entryId);
    if (!entry) {
      return res.status(404).json({ message: "Prescription entry not found." });
    }

    // Check if dispensed_qty is valid
    if (dispensed_qty > entry.quantity) {
      return res.status(400).json({ message: "Dispensed quantity cannot exceed prescribed quantity." });
    }

    // Update the dispensed_qty
    entry.dispensed_qty = dispensed_qty;

    // Update the prescription status based on dispensed_qty
    if (dispensed_qty === entry.quantity) {
      prescription.status = 'dispensed'; // All medicines are dispensed
    } else if (dispensed_qty > 0 && dispensed_qty < entry.quantity) {
      prescription.status = 'partially_dispensed'; // Partially dispensed
    } else {
      prescription.status = 'pending'; // No medicines dispensed yet
    }

    // Mark the prescription as modified and save
    prescription.markModified("entries");
    await prescription.save();

    res.status(200).json({ message: "Dispensed quantity updated successfully." });
  } catch (error) {
    console.error("Error in updatePrescriptionEntry:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};
