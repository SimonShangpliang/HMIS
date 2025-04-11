import Patient from '../models/patient.js';
import { Consultation } from '../models/consultation.js';
import bcrypt from 'bcrypt';



export const registerPatient = async (req, res) => {
  try {
    const {
      patientName,
      aadharId,
      dob,
      gender,
      bloodGroup,
      email,
      height,
      weight,
      address,
      emergencyNumber,
      mobile,
      password
    } = req.body;

    const existingPatient = await Patient.findOne({ $or: [{ email }, { aadhar_number: aadharId }] });
    if (existingPatient) {
        return res.status(400).json({ message: 'Email or Aadhar ID already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newPatient = new Patient({
      password: hashedPassword,
      name: patientName,
      phone_number: mobile,
      emergency_contact: emergencyNumber,
      email,
      date_of_birth: dob,
      aadhar_number: aadharId,
      gender: gender.toLowerCase(),
      address,
      patient_info: {
        height,
        weight,
        bloodGrp: bloodGroup
      }
    });

    await newPatient.save();
    res.status(201).json({ message: 'Patient registered successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


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


export const fetchConsultations = async (req, res) => {
  try {
    const { patientId } = req.params;

    let consultations = await Consultation.find({ patient_id: patientId }).sort({ booked_date_time: -1 });

    if (!consultations.length) {
      return res.status(404).json({ message: 'No consultations found' });
    }

    // Populate fields conditionally if not empty
    consultations = await Consultation.populate(consultations, [
      { path: 'doctor_id', select: 'name specialization' },
      { path: 'created_by', select: 'name role' },
      { path: 'diagnosis', strictPopulate: false },
      { path: 'prescription', strictPopulate: false },
      { path: 'bill_id', strictPopulate: false }
    ]);

    res.status(200).json(consultations);
  } catch (error) {
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
