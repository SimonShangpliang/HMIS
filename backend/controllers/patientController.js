import Patient from '../models/patient.js';
import { Doctor } from '../models/staff.js';
import Employee from '../models/employee.js'; 
import Diagnosis from '../models/diagnosis.js';
import Bill from '../models/bill.js';
import { Consultation, Prescription, Feedback } from '../models/consultation.js';

// @desc Get full patient profile
export const FetchPatientProfile = async (req, res) => {
  try {
    const { patientId } = req.params;
    let patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Populate insurance only if not empty
    if (patient.insurance_details && patient.insurance_details.length > 0) {
      patient = await patient.populate('insurance_details');
    }

    res.status(200).json(patient);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get consultation list by patientId
 * @route   GET /api/patients/:id/consultations
 * @access  Protected (Patient)
 */
export const fetchConsultationsByPatientId = async (req, res) => {
  try {
    const { patientId } = req.params;
    console.log(`Received request for consultations of patientId: ${patientId}`);

    let consultations = await Consultation.find({ patient_id: patientId }).sort({ booked_date_time: -1 });

    if (!consultations.length) {
      // Return dummy data
      const dummyConsultations = [
        {
          id: "6617f98e0a5f2dbf8c2d1234",
          date: "2025-05-05",
          doctor: "Dr. Smith",
          location: "Room 101",
          details: "Checkup",
        },
        {
          id: "6617f98e0a5f2dbf8c2d1235",
          date: "2025-05-05",
          doctor: "Dr. Adams",
          location: "Room 203",
          details: "Follow-up",
        },
        {
          id: "6617f98e0a5f2dbf8c2d1236",
          date: "2025-05-07",
          doctor: "Dr. Williams",
          location: "Room 305",
          details: "Diagnosis",
        },
        {
          id: "6617f98e0a5f2dbf8c2d1237",
          date: "2025-05-10",
          doctor: "Dr. Brown",
          location: "Room 408",
          details: "Consultation",
        },
      ];
      console.log(`No consultations found. Returning dummy data for patientId: ${patientId}`);
      return res.status(200).json({ consultations: dummyConsultations, dummy: true });
    }

    consultations = await Consultation.populate(consultations, [
      { path: 'doctor_id', select: 'name specialization' },
      { path: 'created_by', select: 'name role' },
      { path: 'diagnosis', strictPopulate: false },
      { path: 'prescription', strictPopulate: false },
      { path: 'bill_id', strictPopulate: false }
    ]);

    res.status(200).json(consultations);
  } catch (error) {
    console.error(`Error fetching consultations for patientId: ${req.params.patientId}`, error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET /api/doctors
const getAllDoctors = async (req, res) => {
  try {
    // Find all documents in the Doctor collection
    // Populate the 'employee_id' field to get associated employee details
    const doctors = await Doctor.find({}).populate({
      path: 'employee_id',
      model: Employee, // Specify the Employee model
      select: 'name email phone_number address' 
    });

    if (doctors.length === 0) {
      return res.status(404).json({ message: 'No doctors found' });
    }

    res.status(200).json(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ message: 'Server error fetching doctors' });
  }
};

export {
  getAllDoctors,
};


/**
 * @desc    Submit feedback for a consultation by the patient
 * @route   POST /api/patient/:patientId/consultations/:consultationId/feedback
 * @access  Protected (Patient)
 */
export const sendFeedback = async (req, res) => {
  try {
    const { patientId, consultationId } = req.params;
    const { rating, comments } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
    }

    const consultation = await Consultation.findById(consultationId);

    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    if (consultation.patient_id != patientId) {
      return res.status(403).json({ message: 'Unauthorized: Feedback can only be submitted by the patient who had the consultation' });
    }

    consultation.feedback = {
      rating,
      comments,
      created_at: new Date()
    };

    await consultation.save();

    res.status(200).json({ message: 'Feedback submitted successfully', feedback: consultation.feedback });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Reschedule a consultation
 * @route   PUT /api/consultations/:consultationId/reschedule
 * @access  Protected (assumes authentication middleware)
 */
export const rescheduleConsultation = async (req, res) => {
  try {
    const { consultationId } = req.params;
    const { newDateTime } = req.body;
    
    if (!newDateTime) {
      return res.status(400).json({ success: false, error: "New date/time must be provided." });
    }

    const newDate = new Date(newDateTime);
    const now = new Date();

    // Check if newDateTime is in the past
    if (newDate <= now) {
      return res.status(400).json({
        success: false,
        error: "The new consultation time must be in the future.",
      });
    }

    // Check if at least 1 hour ahead
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    if (newDate < oneHourLater) {
      return res.status(400).json({
        success: false,
        error: "Consultation must be rescheduled at least 1 hour from now.",
      });
    }

    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).json({ success: false, error: "Consultation not found." });
    }

    if (!["scheduled", "ongoing"].includes(consultation.status)) {
      return res.status(400).json({
        success: false,
        error: `Consultation cannot be rescheduled because it is marked as '${consultation.status}'.`,
      });
    }

    consultation.booked_date_time = newDate;
    const updatedConsultation = await consultation.save();

    return res.status(200).json({
      success: true,
      message: "Consultation rescheduled successfully.",
      consultation: updatedConsultation,
    });
  } catch (error) {
    console.error("Error rescheduling consultation:", error);
    return res.status(500).json({
      success: false,
      error: "Server error while rescheduling.",
    });
  }
};


// @desc    Delete a consultation by ID
// @route   DELETE /api/consultations/:id
// @access  Public (you can secure it with auth middleware if needed)
export const cancelConsultation = async (req, res) => {
  const { id } = req.params;

  try {
    const consultation = await Consultation.findById(id);

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: "Consultation not found",
        error: "Invalid consultation ID",
      });
    }

    // Disallow cancellation if it's already completed, ongoing, or cancelled
    if (["completed", "ongoing", "cancelled"].includes(consultation.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a ${consultation.status} consultation`,
        error: "Invalid status for cancellation",
      });
    }

    consultation.status = "cancelled";
    await consultation.save();

    return res.status(200).json({
      success: true,
      message: "Consultation cancelled successfully",
    });
  } catch (err) {
    console.error("Error cancelling consultation:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while cancelling consultation",
      error: err.message,
    });
  }
};

