import Patient from '../models/patient.js';
import { Consultation } from '../models/consultation.js';
import bcrypt from 'bcrypt';
import { Doctor } from '../models/staff.js';
import Employee from '../models/employee.js';
import Department from '../models/department.js';
import cloudinary from "../config/cloudinary.js";

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

    const dobDate = new Date(dob);
    const currentDate = new Date();

    if (dobDate > currentDate) {
      return res.status(400).json({ message: 'Date of birth cannot be in the future.' });
    }

    if (height <= 0) {
      return res.status(400).json({ message: 'Height must be a positive number.' });
    }

    if (weight <= 0) {
      return res.status(400).json({ message: 'Weight must be a positive number.' });
    }

    const existingPatient = await Patient.findOne({ $or: [{ email }, { aadhar_number: aadharId }] });
    if (existingPatient) {
        return res.status(400).json({ message: 'Email or Aadhar ID already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const calculateAge = dob => {
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      return age;
    };

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
        age: calculateAge(dobDate),
        height: height,
        weight: weight,
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
    console.log("received profile request");
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



export const fetchConsultationsByPatientId = async (req, res) => {
  try {
    const { patientId } = req.params;
    console.log(`Received request for consultations of patientId: ${patientId}`);

    let consultations = await Consultation.find({ patient_id: patientId }).sort({ booked_date_time: -1 });

    if (!consultations.length) {
      // Return dummy data - code unchanged
      const dummyConsultations = [/* your dummy data */];
      console.log(`No consultations found. Returning dummy data for patientId: ${patientId}`);
      return res.status(200).json({ consultations: dummyConsultations, dummy: true });
    }

    // First get all doctor ids from consultations
    const doctorIds = consultations.map(c => c.doctor_id);
    
    // Fetch all related doctor records
    const doctors = await Doctor.find({ _id: { $in: doctorIds } });
    
    // Fetch all related employee records for those doctors
    const employeeIds = doctors.map(d => d.employee_id).filter(id => id !== null);
    const employees = await Employee.find({ _id: { $in: employeeIds } });
    
    // Create lookup maps for faster access
    const doctorMap = {};
    doctors.forEach(doctor => {
      doctorMap[doctor._id] = doctor;
    });
    
    const employeeMap = {};
    employees.forEach(employee => {
      employeeMap[employee._id] = employee;
    });

    // Populate other fields as needed
    consultations = await Consultation.populate(consultations, [
      { path: 'created_by', select: 'name role' },
      { path: 'diagnosis', strictPopulate: false },
      { path: 'prescription', strictPopulate: false },
      { path: 'bill_id', strictPopulate: false }
    ]);

    // Format the response with manual mapping
    const formattedConsultations = consultations.map(consultation => {
      const doctorId = consultation.doctor_id;
      const doctor = doctorMap[doctorId] || {};
      const employeeId = doctor.employee_id;
      const employee = employeeMap[employeeId] || {};
      
      return {
        ...consultation._doc,
        doctor: {
          id: doctor._id,
          name: employee.name || 'Unknown Doctor',
          specialization: doctor.specialization,
          profilePic: employee.profile_pic
        }
      };
    });

    console.log('Successfully processed consultation data');
    res.status(200).json(formattedConsultations);
  } catch (error) {
    console.error(`Error fetching consultations for patientId: ${req.params.patientId}`, error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// @route   GET /api/doctors
const getAllDoctors = async (req, res) => {
  try {
    const allDoctors = await Doctor.find({ employee_id: { $ne: null } })
    .populate({
      path: 'employee_id',
      select: 'name email phone_number address date_of_joining'
    })
    .populate({
      path: 'department_id',
      select: 'dept_name'
    });
  
  // Filter out any that failed to populate properly
  const doctors = allDoctors.filter(doc => doc.employee_id !== null);
  
  if (doctors.length === 0) {
    return res.status(404).json({ message: 'No doctors found' });
  }
  
  res.status(200).json(doctors);
  
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ message: 'Server error fetching doctors' });
  }
};

const getDoctorById = async (req, res) => {

try {
  const { id } = req.params;
  
  // Find specific doctor by ID and populate related data
  const doctor = await Doctor.findById(id)
    .populate({
      path: 'employee_id',
      select: 'name profile_pic phone_number email gender address emergency_contact date_of_joining',
      model: Employee
    })
    .populate({
      path: 'department_id',
      select: 'dept_name',
      model: Department
    });
  
  // If doctor not found
  if (!doctor) {
    return res.status(404).json({ message: 'Doctor not found' });
  }
  
  // Return doctor object
  res.status(200).json(doctor);
} catch (error) {
  console.error('Error fetching doctor details:', error);
  
  // Handle case where ID might be invalid format
  if (error.kind === 'ObjectId') {
    return res.status(404).json({ message: 'Doctor not found' });
  }
  
  res.status(500).json({ message: 'Server error while fetching doctor details' });
}
};

export {
  getAllDoctors,getDoctorById
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

  const doctor = await Doctor.findById(consultation.doctor_id);
    if (doctor) {
      // Initialize rating and num_ratings if they don't exist
      if (!doctor.rating) doctor.rating = 0;
      if (!doctor.num_ratings) doctor.num_ratings = 0;
      
      // Calculate new average rating
      const totalRatingPoints = doctor.rating * doctor.num_ratings + rating;
      doctor.num_ratings += 1;
      doctor.rating = totalRatingPoints / doctor.num_ratings;
      
      updatedDoctor = await doctor.save();
    }
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

    if (!["scheduled", "ongoing", "requested"].includes(consultation.status)) {
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
  const { consultationId:id } = req.params;

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


/**
 * Get all vitals for a specific patient
 * @route GET /api/patients/:patientId/vitals
 * @param {number} req.params.patientId - Patient ID
 * @returns {Object} 200 - Patient vitals array
 * @returns {Error} 404 - Patient not found
 * @returns {Error} 500 - Server error
 */
export const getPatientVitals = async (req, res) => {
  try {
    const patientId = parseInt(req.params.patientId);
    
    // Validate patient ID
    if (isNaN(patientId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid patient ID format' 
      });
    }

    // Find patient by ID
    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({ 
        success: false, 
        message: 'Patient not found' 
      });
    }
    // Return the vitals array
    return res.status(200).json({
      success: true,
      data: patient.vitals,
      count: patient.vitals.length
    });
  } catch (error) {
    console.error('Error fetching patient vitals:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching patient vitals',
      error: error.message
    });
  }
};

/**
 * Get a specific vital record for a patient
 * @route GET /api/patients/:patientId/vitals/:vitalId
 * @param {number} req.params.patientId - Patient ID
 * @param {string} req.params.vitalId - Vital record ID
 * @returns {Object} 200 - Patient vital record
 * @returns {Error} 404 - Patient or vital record not found
 * @returns {Error} 500 - Server error
 */
export const getPatientVitalById = async (req, res) => {
  try {
    const patientId = parseInt(req.params.patientId);
    const vitalId = req.params.vitalId;
    
    // Validate patient ID
    if (isNaN(patientId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid patient ID format' 
      });
    }

    // Find patient by ID
    const patient = await Patient.findById(patientId);
    
    if (!patient) {
      return res.status(404).json({ 
        success: false, 
        message: 'Patient not found' 
      });
    }

    // Find the specific vital record
    const vitalRecord = patient.vitals.id(vitalId);
    
    if (!vitalRecord) {
      return res.status(404).json({ 
        success: false, 
        message: 'Vital record not found' 
      });
    }

    // Return the specific vital record
    return res.status(200).json({
      success: true,
      data: vitalRecord
    });
  } catch (error) {
    console.error('Error fetching patient vital record:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching patient vital record',
      error: error.message
    });
  }
};

/**
 * Get the latest vital record for a patient
 * @route GET /api/patients/:patientId/vitals/latest
 * @param {number} req.params.patientId - Patient ID
 * @returns {Object} 200 - Latest patient vital record
 * @returns {Error} 404 - Patient not found or no vitals recorded
 * @returns {Error} 500 - Server error
 */
export const getLatestPatientVital = async (req, res) => {
  try {
    const patientId = parseInt(req.params.patientId);

    // Validate patient ID
    if (isNaN(patientId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid patient ID format' 
      });
    }

    // Find patient by ID
    const patient = await Patient.findById(patientId);

    if (!patient) {

      return res.status(404).json({ 
        success: false, 
        message: 'Patient not found' 
      });
    }

    if (!patient.vitals || patient.vitals.length === 0) {

      return res.status(200).json({ 
        success: false, 
        message: 'No vital records found for this patient' 
      });
    }

    // Get the latest vital by date and createdAt
    const latestVital = patient.vitals.sort((a, b) => {
      // First compare by date
      const dateComparison = new Date(b.date) - new Date(a.date);
      if (dateComparison !== 0) return dateComparison;
      
      // If dates are equal, compare by createdAt
      return new Date(b.createdAt) - new Date(a.createdAt);
    })[0];

    // Return the latest vital record
    return res.status(200).json({
      success: true,
      data: latestVital
    });
  } catch (error) {
    console.error('Error fetching latest patient vital:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching latest patient vital',
      error: error.message
    });
  }
};





export const uploadProfilePhoto = async (req, res) => {
  try {
    const { patientId } = req.params;

    // Check file uploaded by Cloudinary via multer
    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const newProfilePicUrl = req.file.path;

    // Step 1: Find existing patient
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Step 2: Delete old profile image from Cloudinary if it exists
    if (patient.profile_pic) {
      // Extract public_id from the old Cloudinary URL
      const segments = patient.profile_pic.split('/');
      const filenameWithExt = segments[segments.length - 1]; // eg: abc123.png
      const publicId = `profile_pics/${filenameWithExt.split('.')[0]}`; // assuming folder is profile_pics
      await cloudinary.uploader.destroy(publicId);
    }

    // Step 3: Update patient with new image URL
    patient.profile_pic = newProfilePicUrl;
    await patient.save();

    return res.status(200).json({
      message: "Profile photo uploaded successfully",
      profile_pic: newProfilePicUrl,
    });

  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ message: "Server error during upload" });
  }
};


// Controller function to update the patient profile
export const updatePatientProfile = async (req, res) => {
  try {
    const { patientId } = req.params;
    const {
      name,
      phone_number,
      emergency_contact,
      gender,
      email,
      address,
      date_of_birth,
      weight,
      height,
      bloodGrp,
      bedNo,
      roomNo
    } = req.body;

    // Find the patient by patientId (Auto-Incremented _id)
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Update the patient's profile with the provided data
    patient.name = name || patient.name;
    patient.phone_number = phone_number || patient.phone_number;
    patient.emergency_contact = emergency_contact || patient.emergency_contact;
    patient.email = email || patient.email;
    patient.address = address || patient.address;
    patient.gender = gender || patient.gender;
    // Validate date_of_birth
    if (date_of_birth) {
      const dob = new Date(date_of_birth);
      const now = new Date();
      if (dob > now) {
        return res.status(400).json({ message: "Date of birth cannot be in the future." });
      }
      patient.date_of_birth = dob;
    }


    patient.patient_info.height = height || patient.patient_info.height;
    patient.patient_info.weight = weight || patient.patient_info.weight;
    patient.patient_info.bloodGrp = bloodGrp || patient.patient_info.bloodGrp;
    patient.patient_info.bedNo = bedNo || patient.patient_info.bedNo;
    patient.patient_info.roomNo = roomNo || patient.patient_info.roomNo;

    // Save the updated patient data
    await patient.save();

    // Respond with the updated patient data
    res.status(200).json({ message: 'Profile updated successfully', patient });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
