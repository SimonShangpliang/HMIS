import Consultation from "../models/consultation.js";

// Get consultations for doctor's calendar
export const getDoctorCalendar = async (req, res) => {
  try {
    const { doctorId, startDate, endDate } = req.query;
    
    if (!doctorId) {
      return res.status(400).json({ message: "Doctor ID is required" });
    }
    
    // Create date range filter if provided
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        booked_date_time: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }
    
    // Find all consultations for this doctor
    const consultations = await Consultation.find({
      doctor_id: doctorId,
      ...dateFilter
    })
    .populate('patient_id', 'name email phone_number')
    .sort({ booked_date_time: 1 });
    
    // Transform data for calendar view
    const calendarEvents = consultations.map(consultation => {
      const startTime = new Date(consultation.booked_date_time);
      // Assuming consultations last 1 hour
      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + 1);
      
      return {
        id: consultation._id,
        title: `Consultation with ${consultation.patient_id.name}`,
        start: startTime,
        end: endTime,
        status: consultation.status,
        reason: consultation.reason,
        patientId: consultation.patient_id._id,
        patientPhone: consultation.patient_id.phone_number,
        patientEmail: consultation.patient_id.email
      };
    });
    
    res.status(200).json(calendarEvents);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get consultations for patient's calendar
export const getPatientCalendar = async (req, res) => {
  try {
    const { patientId, startDate, endDate } = req.query;
    
    if (!patientId) {
      return res.status(400).json({ message: "Patient ID is required" });
    }
    
    // Create date range filter if provided
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        booked_date_time: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }
    
    // Find all consultations for this patient
    const consultations = await Consultation.find({
      patient_id: patientId,
      ...dateFilter
    })
    .populate('doctor_id', 'name role dept_id')
    .populate('doctor_id.dept_id', 'name') // Populate department name
    .sort({ booked_date_time: 1 });
    
    // Transform data for calendar view
    const calendarEvents = consultations.map(consultation => {
      const startTime = new Date(consultation.booked_date_time);
      // Assuming consultations last 1 hour
      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + 1);
      
      return {
        id: consultation._id,
        title: `Appointment with Dr. ${consultation.doctor_id.name}`,
        start: startTime,
        end: endTime,
        status: consultation.status,
        reason: consultation.reason,
        doctorId: consultation.doctor_id._id,
        department: consultation.doctor_id.dept_id?.name || 'Not Specified'
      };
    });
    
    res.status(200).json(calendarEvents);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

