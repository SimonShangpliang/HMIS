import { Consultation } from '../models/consultation.js';
import Medicine from '../models/inventory.js';
import Patient from '../models/patient.js';

// dummy consultation remove after integrated with db
const dummy = {
  id: Number(123),
  date: "2025-04-07",
  doctor: "Dr. Williams",
  location: "Room 305",
  details: "Diagnosis",
  reason: "Fever and cough for 3 days",
  status: "completed",
  appointment_type: "regular",
  actual_start_datetime: "2025-04-07T10:00:00Z",
  remark: "Patient responded well to treatment",
  diagnosis: [
    {
      _id: "6617f98e0a5f2dbf8c2d1234",
      title: "Viral Infection",
      description: "Suspected viral respiratory tract infection",
      createdAt: "2025-04-07T09:30:00Z"
    }
  ],
  prescription: [
    {
      _id: 10000,
      prescriptionDate: "2025-04-07T09:45:00Z",
      status: "dispensed",
      entries: [
        {
          medicine: "Heroin",
          medicine_id: 2001,
          dosage: "500mg",
          frequency: "Twice a day",
          duration: "5 days",
          quantity: 10,
          dispensed_qty: 10
        },
        {
          medicine: "LSD",
          medicine_id: 2002,
          dosage: "10ml",
          frequency: "Thrice a day",
          duration: "3 days",
          quantity: 9,
          dispensed_qty: 9
        }
      ]
    }
  ],
  reports: [
    {
      status: "completed",
      reportText: "No abnormalities found in chest X-ray.",
      title: "Chest X-Ray",
      description: "Investigation for persistent cough",
      createdBy: "6617f9f90a5f2dbf8c2d5678",
      createdAt: "2025-04-07T09:15:00Z",
      updatedAt: "2025-04-07T09:50:00Z"
    }
  ],
  bill_id: "6617fa310a5f2dbf8c2d9876",
  recordedAt: "2025-04-07T10:30:00Z",
  feedback: {
    rating: 4,
    comments: "Doctor was very attentive and explained everything well.",
    created_at: "2025-04-07T11:00:00Z"
  }
};

const dummyBill = {
  _id: "dummy-bill-001",
  patient_id: 12345,
  generation_date: "2025-04-07T12:00:00Z",
  total_amount: 500,
  payment_status: "paid",
  items: [
    {
      item_type: "consultation",
      consult_id: "6617fa310a5f2dbf8c2d1234",
      item_description: "General Consultation",
      item_amount: 200,
      quantity: 1
    },
    {
      item_type: "test",
      report_id: "6617f9f90a5f2dbf8c2d5678",
      item_description: "Chest X-Ray",
      item_amount: 300,
      quantity: 1
    }
  ],
  payments: [
    {
      amount: 500,
      payment_date: "2025-04-07T12:15:00Z",
      transaction_id: "TXN1234567890",
      status: "success",
      payment_method: "card"
    }
  ]
};

// Book a new consultation
export const bookConsultation = async (req, res) => {
  try {
    const {
      patient_id,
      doctor_id,
      booked_date_time,
      reason,
      created_by,
      appointment_type
    } = req.body;

    // Check if patient exists
    const patient = await Patient.findById(patient_id);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    // Create new consultation
    const newConsultation = new Consultation({
      patient_id,
      doctor_id,
      booked_date_time,
      reason,
      created_by,
      appointment_type,
      status: 'scheduled'
    });

    await newConsultation.save();

    res.status(201).json({
      message: 'Consultation booked successfully',
      consultation: newConsultation
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Reschedule an existing consultation
export const rescheduleConsultation = async (req, res) => {
  try {
    const { consultationId } = req.params;
    const { new_booked_date_time } = req.body;

    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    consultation.booked_date_time = new Date(new_booked_date_time);
    consultation.status = 'scheduled';

    await consultation.save();

    res.json({
      message: 'Consultation rescheduled successfully',
      consultation
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/**
 * @desc    Get consultation by ID
 * @route   GET /api/patient/consultations/:id
 * @access  Protected (Patient)
 */
export const fetchConsultationById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Received request for consultation" + id);
    const consultation = await Consultation.findById(id)
      .populate("doctor_id", "name")
      .populate("diagnosis")
      .populate("prescription")
      .populate("reports");

    // If consultation not found, return dummy data
    if (!consultation) {
      return res.status(200).json({ consultation: dummy, dummy: true });
    }

    // Format for frontend
    const formatted = {
      id: consultation._id,
      date: consultation.booked_date_time?.toISOString().split("T")[0],
      doctor: consultation.doctor_id?.name || "Unknown",
      location: "Room 101", // Placeholder
      details: consultation.reason,
      reason: consultation.reason,
      status: consultation.status,
      appointment_type: consultation.appointment_type,
      actual_start_datetime: consultation.actual_start_datetime,
      remark: consultation.remark,
      diagnosis: consultation.diagnosis,
      prescription: consultation.prescription,
      reports: consultation.reports,
      bill_id: consultation.bill_id,
      recordedAt: consultation.recordedAt,
      feedback: consultation.feedback
    };

    return res.status(200).json({ consultation: formatted });

  } catch (err) {
    console.error("Error fetching consultation:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * @desc    Get bill by consultation ID
 * @route   GET /api/consultations/:consultationId/bill
 * @access  Protected
 */
export const fetchBillByConsultationId = async (req, res) => {
  try {
    const { consultationId } = req.params;

    const consultation = await Consultation.findById(consultationId);
    let bill;

    if (consultation && consultation.bill_id) {
      bill = await Bill.findById(consultation.bill_id);
    }

    // Use dummyBill if no valid bill found
    const isDummy = !bill;
    const sourceBill = isDummy ? dummyBill : bill;

    // === REMOVE THIS BLOCK ONCE BILLS ARE FULLY SAVED IN DB ===
    const breakdown = (sourceBill.items || []).map((item, index) => ({
      id: index + 1,
      type: item.item_type,
      description: item.item_description || item.item_type,
      amount: item.item_amount * (item.quantity || 1)
    }));

    const formatted = {
      id: sourceBill._id || consultationId,
      totalAmount: sourceBill.total_amount,
      paymentStatus: sourceBill.payment_status,
      breakdown
    };
    // ==========================================================

    return res.status(200).json({ bill: formatted, dummy: isDummy });
  } catch (error) {
    console.error("Error fetching bill:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * @desc    Get consultation by ID
 * @route   GET /api/consultations/:consultationId/prescription
 * @access  Protected (Patient)
 */
export const fetchPrescriptionByConsultationId = async (req, res) => {
  try {
    console.log("Received request for prescription.");
    const { consultationId: id } = req.params;

    const consultation = await Consultation.findById(id)
      .populate({
        path: 'prescription',
        populate: {
          path: 'entries.medicine_id',
          model: 'Medicine',
          select: 'med_name' // fetch only medicine name
        }
      });

    // === REMOVE THIS BLOCK ONCE PRESCRIPTIONS ARE FULLY SAVED IN DB ===
    if (!consultation || !consultation.prescription || consultation.prescription.length === 0) {
      console.warn("Consultation or prescriptions not found, using dummy data.");
      return res.status(200).json({ 
        prescription: {
          ...dummy.prescription[0],
          consultationInfo: {
            id,
            date: dummy.date,
            doctor: dummy.doctor,
            location: dummy.location,
            details: dummy.details
          }
        }, 
        dummy: true 
      });
    }
    // ====================================================================

    const presc = consultation.prescription[0];

    // Format entries to include medicine name
    const formattedPrescription = {
      ...presc.toObject(),
      entries: presc.entries.map(entry => ({
        ...entry.toObject(),
        medicine: entry.medicine_id?.med_name || "Unknown"
      })),
      consultationInfo: {
        id: consultation._id,
        date: consultation.date,
        doctor: consultation.doctor,
        location: consultation.location
      }
    };

    return res.status(200).json({ prescription: formattedPrescription });

  } catch (err) {
    console.error("Error fetching prescription:", err);
    return res.status(500).json({ error: "Server error" });
  }
};


/**
 * @desc    Get consultation by ID
 * @route   GET /api/consultations/:consultationId/view/diagnosis
 * @access  Protected (Patient)
 */
export const fetchDiagnosisByConsultationId = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Received request for consultation" + id);
    const consultation = await Consultation.findById(id)
      .populate("doctor_id", "name")
      .populate("diagnosis");

    // If consultation not found, return dummy data
    if (!consultation) {
      return res.status(200).json({ consultation: dummy, dummy: true });
    }

    // Format for frontend
    const formatted = {
      id: consultation._id,
      date: consultation.booked_date_time?.toISOString().split("T")[0],
      doctor: consultation.doctor_id?.name || "Unknown",
      location: "Room 101", // Placeholder
      details: consultation.reason,
      remark: consultation.remark,
      diagnosis: consultation.diagnosis,
    };

    return res.status(200).json({ consultation: formatted });

  } catch (err) {
    console.error("Error fetching consultation:", err);
    return res.status(500).json({ error: "Server error" });
  }
};