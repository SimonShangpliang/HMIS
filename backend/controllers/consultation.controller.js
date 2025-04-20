import { Consultation } from '../models/consultation.js';
import Medicine from '../models/inventory.js';
import { Prescription } from '../models/consultation.js';
import Patient from '../models/patient.js';
import BillModels from '../models/bill.js';
const { Bill, BillItem} = BillModels;

import { Doctor, Receptionist } from '../models/staff.js';
import Employee from '../models/employee.js'; 
import{appointmentEmail,updateAppointmentEmail} from "../config/sendMail.js";

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
      created_by, // This is employee._id (number)
      appointment_type,
      status
    } = req.body;

    // Validate booking date is not in the past
    const bookingDate = new Date(booked_date_time);
    const now = new Date();
    
    if (bookingDate <= now) {
      return res.status(400).json({
        message: 'Cannot book consultation in the past',
        currentTime: now,
        attemptedBookingTime: bookingDate
      });
    }

    // Check if patient exists
    const patient = await Patient.findById(patient_id);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    const doctor = await Doctor.findById(doctor_id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found for the given ID' });
    }

    // Find receptionist document by employee_id
    const receptionist = await Receptionist.findOne({ employee_id: created_by });
    if (!receptionist) {
      return res.status(404).json({ message: 'Receptionist not found for the given employee ID' });
    }

    // Create new consultation
    const newConsultation = new Consultation({
      patient_id,
      doctor_id,
      booked_date_time,
      reason,
      created_by: receptionist._id, // Use receptionist's MongoDB ObjectId
      appointment_type,
      status: status
    });

    await appointmentEmail({
            toEmail: patient.email,
            patient_name: patient.name,
            patient_id,
            doctor_id,
            reason,
            appointment_type,
            booked_date_time
    });
    await newConsultation.save();
    


    res.status(201).json({
      message: 'Consultation booked successfully',
      consultation: newConsultation
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reschedule an existing consultation
export const rescheduleConsultation = async (req, res) => {
  try {
    const { consultationId } = req.params;
    const { new_booked_date_time } = req.body;

    // Validate new booking date is not in the past
    const newBookingDate = new Date(new_booked_date_time);
    const now = new Date();
    
    if (newBookingDate <= now) {
      return res.status(400).json({
        message: 'Cannot reschedule consultation to a past date/time',
        currentTime: now,
        attemptedRescheduleTime: newBookingDate
      });
    }

    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    consultation.booked_date_time = newBookingDate;
    consultation.status = 'requested';

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
    const { consultationId: id } = req.params;
    console.log("Received request for consultation " + id);

    let consultation = await Consultation.findById(id)
      .populate("diagnosis")
      .populate({
        path: 'prescription',
        populate: {
          path: 'entries.medicine_id',
          model: 'Medicine',
          select: 'med_name' // fetch only medicine name
        }
      })
      .populate({
        path : 'reports',
        model : 'Report',
        select : 'status reportText title description createdBy createdAt updatedAt',
      })
      console.log(JSON.stringify(consultation.prescription, null, 2));


      // Populate entries.medicine_id manually for each prescription
      if (consultation && consultation.prescription) {
        await Promise.all(
          consultation.prescription.map(async (prescription) => {
            await Prescription.populate(prescription, {
              path: 'entries.medicine_id',
              model: 'Medicine',
              select: 'med_name'
            });
          })
        );
      }


    // If consultation not found, return dummy data
    if (!consultation) {
      const dummy = {
        id: "dummy-id",
        date: null,
        doctor: {
          id: null,
          name: "Unknown",
          specialization: null,
          profilePic: null
        },
        location: "N/A",
        details: "No consultation found",
        reason: "N/A",
        status: "N/A",
        appointment_type: "N/A",
        actual_start_datetime: null,
        remark: "",
        diagnosis: [],
        prescription: [],
        reports: [],
        bill_id: null,
        recordedAt: null,
        feedback: null
      };
      return res.status(200).json({ consultation: dummy, dummy: true });
    }

    // Fetch doctor and employee info
    const doctor = await Doctor.findById(consultation.doctor_id);
    let employee = null;

    if (doctor && doctor.employee_id) {
      employee = await Employee.findById(doctor.employee_id);
    }

    const formatted = {
      id: consultation._id,
      date: consultation.booked_date_time?.toISOString().split("T")[0],
      doctor: {
        id: doctor?._id,
        name: employee?.name || "Unknown Doctor",
        specialization: doctor?.specialization || null,
        profilePic: employee?.profile_pic || null
      },
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

    console.log(consultation);

    if (consultation && consultation.bill_id) {
      bill = await Bill.findById(consultation.bill_id);
      console.log("Bill fetched:", bill);
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
      generation_date: sourceBill.generation_date,
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
    const { id } = req.params;
    console.log("Received request for consultation" + id);

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
    const { consultationId } = req.params;
    const id = consultationId ; 
    console.log("Received request for consultation2" + id);

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


export const updateConsultation = async (req, res) => {
  try {
    const { consultationId } = req.params;
    const { 
      doctor_id, 
      booked_date_time, 
      reason, 
      appointment_type, 
      updated_by,
      status,
      bill_id
    } = req.body;

    // Validate new booking date is not in the past if provided
    if (booked_date_time) {
      const newBookingDate = new Date(booked_date_time);
      const now = new Date();
      
      if (newBookingDate <= now) {
        return res.status(400).json({
          message: 'Cannot update consultation to a past date/time',
          currentTime: now,
          attemptedUpdateTime: newBookingDate
        });
      }
    }

    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    // Update fields if provided
    if (doctor_id) consultation.doctor_id = doctor_id;
    if (booked_date_time) consultation.booked_date_time = new Date(booked_date_time);
    if (reason) consultation.reason = reason;
    if (appointment_type) consultation.appointment_type = appointment_type;
    if (updated_by) consultation.updated_by = updated_by;
    if (status)consultation.status=status
    if (bill_id)consultation.bill_id=bill_id
    await consultation.save();

    // Ensure status is always updated when date changes
     // Fetch patient details
     const patient = await Patient.findById(consultation.patient_id);
     if (!patient) {
       return res.status(404).json({ message: 'Patient not found' });
     }
    await updateAppointmentEmail({
      toEmail: patient.email,
      name: patient.name,
      patient_id: consultation.patient_id,
      doctor_id: consultation.doctor_id,
      reason: consultation.reason,
      appointment_type: consultation.appointment_type,
      booked_date_time: consultation.booked_date_time
    });


    res.json({
      message: 'Consultation updated successfully',
      consultation
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const fetchRequestedConsultations = async (req, res) => {
  try {
    const consultations = await Consultation.find({ status: "requested" })
      .select('patient_id doctor_id appointment_type booked_date_time reason')
      .populate({
        path: 'patient_id',
        select: 'name email'
      })
      .populate({
        path: 'doctor_id',
        select: '_id',
        populate: {
          path: 'employee_id',
          select: 'name'
        }
      });

    const formattedConsultations = consultations.map(consultation => {
      // Create a safe object with default values
      const formattedConsultation = {
        id: consultation._id || null,
        appointment_type: consultation.appointment_type || null,
        booked_date_time: consultation.booked_date_time || null,
        reason: consultation.reason || null,
        patient_id: null,
        patient_name: null,
        patient_email: null,
        doctor_id: null,
        doctor_name: null
      };

      // Safely access patient information
      if (consultation.patient_id) {
        formattedConsultation.patient_id = consultation.patient_id._id || null;
        formattedConsultation.patient_name = consultation.patient_id.name || null;
        formattedConsultation.patient_email = consultation.patient_id.email || null;
      }

      // Safely access doctor information
      if (consultation.doctor_id) {
        formattedConsultation.doctor_id = consultation.doctor_id._id || null;
        
        // Check if doctor has employee_id before accessing name
        if (consultation.doctor_id.employee_id) {
          formattedConsultation.doctor_name = consultation.doctor_id.employee_id.name || null;
        }
      }

      return formattedConsultation;
    });

    res.json(formattedConsultations);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};

export const updateRequestStatus = async (req, res) => {
  try {
    const { consultationId } = req.params;
    const { status } = req.body;

    if (!['scheduled', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const consultation = await Consultation.findById(consultationId)
      .select('patient_id doctor_id reason appointment_type booked_date_time status')
      .populate('patient_id', 'name email')
      .populate({
        path: 'doctor_id',
        select: '_id',
        populate: {
          path: 'employee_id',
          select: 'name'
        }
      });

    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    consultation.status = status;
    await consultation.save();

    if (status === 'scheduled') {
      await appointmentEmail({
        toEmail: consultation.patient_id.email,
        patient_name: consultation.patient_id.name,
        patient_id: consultation.patient_id._id,
        doctor_id: consultation.doctor_id._id,
        reason: consultation.reason,
        appointment_type: consultation.appointment_type,
        booked_date_time: consultation.booked_date_time
      });
    }

    res.json({ 
      message: `Consultation ${status} successfully`, 
      consultation: {
        id: consultation._id,
        status: consultation.status,
        patient_name: consultation.patient_id.name,
        doctor_name: consultation.doctor_id.employee_id.name
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};