import {Consultation} from "../models/consultation.js";
import Payroll from "../models/payroll.js"
import Employee from '../models/employee.js';
import Patient from '../models/patient.js';
import Medicine from '../models/inventory.js';
import { Doctor, Nurse, Pharmacist, Receptionist, Admin, Pathologist, Driver } from '../models/staff.js';

// Get consultations for doctor's calendar
export const getDoctorCalendar = async (req, res) => {
  try {
    const { doctorId, startDate, endDate } = req.query;
    console.log(req.query);
    
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
    
    console.log(consultations);
    
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

// Find all payrolls for a specific employee
export const findPayrollById = async (req, res) => {
  try {
    const { employeeId } = req.query;
      console.log(req.query)

      if (!employeeId) {
          return res.status(400).json({ message: "employeeId is required" });
      }

      // Find all payrolls for this employee
      const employeePayrolls = await Payroll.find({ employee_id: employeeId });

      res.status(200).json({ payrolls: employeePayrolls });
  } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const fetchProfile = async (req, res) => {
  try {
      const { userType, id } = req.params;
      let user;

      if (userType === 'patient') {
          user = await Patient.findById(Number(id))
              .select('-password');
      } else if (['doctor', 'nurse', 'pathologist', 'receptionist', 'pharmacist', 'admin', 'driver'].includes(userType)) {
          user = await Employee.findById(Number(id))
              .select('-password -bank_details.account_number');

          // Get role specific details
          const RoleModel = {
              'doctor': Doctor,
              'nurse': Nurse,
              'pathologist': Pathologist,
              'receptionist': Receptionist,
              'pharmacist': Pharmacist,
              'admin': Admin,
              'driver': Driver
          }[userType];

          if (user && RoleModel) {
              const roleSpecificInfo = await RoleModel.findOne({ employee_id: user._id })
                  .select('-_id');
              
              user = {
                  ...user.toObject(),
                  role_details: roleSpecificInfo
              };
          }
      }

      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json(user);
  } catch (error) {
      res.status(500).json({ 
          message: 'Error fetching profile',
          error: error.message 
      });
  }
};

export const updateProfile = async (req, res) => {
  try {
      const { userType, id } = req.params;
      const updateData = req.body;
      const requestingUser = req.user;
      let user;

      // Only allow users to edit their own profile
      if (requestingUser.id !== Number(id)) {
          return res.status(403).json({ 
              message: 'Unauthorized to update other user profiles' 
          });
      }

      if (userType === 'patient') {
          user = await Patient.findByIdAndUpdate(
              Number(id),
              updateData,
              { new: true, runValidators: true }
          ).select('-password');
      } else if (['doctor', 'nurse', 'pathologist', 'receptionist', 'pharmacist', 'admin', 'driver'].includes(userType)) {
          // Only admin can update these fields
          delete updateData.salary;
          delete updateData.bank_details;
          delete updateData.role;
          delete updateData.dept_id;

          // Update main employee document
          user = await Employee.findByIdAndUpdate(
              Number(id),
              updateData,
              { new: true, runValidators: true }
          ).select('-password -bank_details.account_number');

          // Update role-specific details if provided
          if (updateData.role_details) {
              const RoleModel = {
                  'doctor': Doctor,
                  'nurse': Nurse,
                  'pathologist': Pathologist,
                  'receptionist': Receptionist,
                  'pharmacist': Pharmacist,
                  'admin': Admin,
                  'driver': Driver
              }[userType];

              if (RoleModel) {
                  await RoleModel.findOneAndUpdate(
                      { employee_id: user._id },
                      updateData.role_details,
                      { new: true, runValidators: true }
                  );
              }
          }
      }

      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({
          message: 'Profile updated successfully',
          user
      });

  } catch (error) {
      res.status(500).json({
          message: 'Error updating profile',
          error: error.message
      });
  }
};

export const searchInventory = async (req, res) => {
  try {
      const { searchQuery } = req.query;
      
      if (!searchQuery) {
          return res.status(400).json({ message: "Search query is required." });
      }

      let searchFilter = {};

      // If searchQuery is a number, search by ID
      if (!isNaN(searchQuery)) {
          searchFilter = { _id: Number(searchQuery) };
      } 
      // If searchQuery is text, search by name, manufacturer, or dosage form
      else {
          searchFilter = {
              $or: [
                  { med_name: { $regex: searchQuery, $options: 'i' } },
                  { manufacturer: { $regex: searchQuery, $options: 'i' } },
                  { dosage_form: { $regex: searchQuery, $options: 'i' } }
              ]
          };
      }

      // Apply the search filter to the find query
      const medicines = await Medicine.find(searchFilter)
          .select('_id med_name effectiveness dosage_form manufacturer available inventory');

      if (!medicines.length) {
          return res.status(404).json({ 
              message: "No medicines found matching the search criteria." 
          });
      }

      // Transform the response to include the latest inventory details
      const transformedMedicines = medicines.map(med => {
          const latestInventory = med.inventory.length > 0 
              ? med.inventory[med.inventory.length - 1] 
              : null;

          return {
              id: med._id,
              name: med.med_name,
              effectiveness: med.effectiveness,
              dosage_form: med.dosage_form,
              manufacturer: med.manufacturer,
              available: med.available,
              current_stock: latestInventory ? {
                  quantity: latestInventory.quantity,
                  batch_no: latestInventory.batch_no,
                  expiry_date: latestInventory.expiry_date,
                  unit_price: latestInventory.unit_price,
                  supplier: latestInventory.supplier
              } : null
          };
      });

      res.status(200).json({
          count: medicines.length,
          items: transformedMedicines
      });

  } catch (error) {
      res.status(500).json({ 
          message: 'Error searching medicines',
          error: error.message 
      });
  }
};