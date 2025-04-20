import {Consultation} from "../models/consultation.js";
import Payroll from "../models/payroll.js"
import Employee from '../models/employee.js';
import Patient from '../models/patient.js';
import Medicine from '../models/inventory.js';
import { Doctor, Nurse, Pharmacist, Receptionist, Admin, Pathologist, Driver } from '../models/staff.js';
import Equipment from '../models/equipment.js';
import cloudinary from "../config/cloudinary.js";

// Get consultations for doctor's calendar
export const getDoctorCalendar = async (req, res) => {
  try {
    const { startDate, endDate, role } = req.query;
    let { doctorId } = req.query;
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
    
    let doctor_user;
    if(role === "doctor"){
      doctor_user = await Doctor.findOne({ employee_id: doctorId });
      if (!doctor_user) {
        return res.status(404).json({ message: "Doctor not found for this user" });
      }
      doctorId = doctor_user._id;
    }
  
    // Find all consultations for this doctor
    const consultations = await Consultation.find({
      doctor_id: doctorId,
      status: { $ne: 'requested' }, // Exclude consultations with "requested" status
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
      
      // Create a safe object with default values
      const calendarEvent = {
        id: consultation._id || null,
        title: "Consultation",
        start: startTime,
        end: endTime,
        status: consultation.status || null,
        reason: consultation.reason || null,
        patientId: null,
        patientPhone: null,
        patientEmail: null,
        appointment_type: consultation.appointment_type || null
      };
      
      // Safely access patient information
      if (consultation.patient_id) {
        // Handle case where patient exists but might lack some properties
        calendarEvent.patientId = consultation.patient_id._id || null;
        calendarEvent.patientPhone = consultation.patient_id.phone_number || null;
        calendarEvent.patientEmail = consultation.patient_id.email || null;
        
        // Update the title if patient name exists
        if (consultation.patient_id.name) {
          calendarEvent.title = `Consultation with ${consultation.patient_id.name}`;
        }
      }
      
      return calendarEvent;
    });
    
    console.log(calendarEvents);
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
      let employeePayrolls;
      if (!employeeId) {
          employeePayrolls = await Payroll.find({});
      }
      else {
          employeePayrolls = await Payroll.find({ employee_id: employeeId }).populate('employee_id');
      }

      //update has to be made here to fetch from finance logs

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
              .select('-password -bank_details.account_number')
              .populate('dept_id', 'dept_id dept_name');

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
              let roleSpecificInfo = await RoleModel.findOne({ employee_id: user._id })
                  .select('-_id');

              // Only populate department_id for doctor and nurse
              if (['doctor', 'nurse'].includes(userType)) {
                  roleSpecificInfo = await roleSpecificInfo
                      .populate(userType === 'doctor' ? 'department_id' : 'assigned_dept', 'dept_id dept_name');
              }
              
              // Format rating to 2 decimal places if it exists
              if (roleSpecificInfo && roleSpecificInfo.rating) {
                  roleSpecificInfo.rating = Number(roleSpecificInfo.rating.toFixed(2));
              }
              
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
      let user;

      // Completely protected fields (never editable by user)
      const protectedFields = [
          '_id',
          'email',
          'aadhar_number',
          'date_of_joining',
          'password',
          'role',
          'salary',
          'dept_id'
      ];

      // Fields that can be edited by user
      const editableFields = [
          'name',
          'phone_number',
          'emergency_contact',
          'address',
          'gender',
          'bloodGrp',
          'profile_pic',
          'date_of_birth'
      ];

      // Bank details fields that can be edited
      const editableBankFields = [
          'bank_name',
          'ifsc_code',
          'branch_name'
      ];

      // Filter update data to only include editable fields
      const filteredUpdateData = {};
      editableFields.forEach(field => {
          if (updateData[field] !== undefined) {
              filteredUpdateData[field] = updateData[field];
          }
      });

      // Handle bank details update separately
      if (updateData.bank_details) {
          filteredUpdateData.bank_details = {};
          editableBankFields.forEach(field => {
              if (updateData.bank_details[field] !== undefined) {
                  filteredUpdateData.bank_details[field] = updateData.bank_details[field];
              }
          });
      }

      if (userType === 'patient') {
          user = await Patient.findByIdAndUpdate(
              Number(id),
              filteredUpdateData,
              { new: true, runValidators: true }
          ).select('-password');
      } else if (['doctor', 'nurse', 'pathologist', 'receptionist', 'pharmacist', 'admin', 'driver'].includes(userType)) {
          // Update main employee document
          user = await Employee.findByIdAndUpdate(
              Number(id),
              filteredUpdateData,
              { new: true, runValidators: true }
          ).select('-password -bank_details.account_number -bank_details.balance')
           .populate('dept_id', 'dept_id dept_name');

          // Handle role-specific updates
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

              // Role-specific editable fields
              const roleEditableFields = {
                  'doctor': ['specialization', 'qualification', 'experience', 'room_num'],
                  'nurse': ['location', 'assigned_room', 'assigned_bed', 'assigned_amb'],
                  'pathologist': [],
                  'receptionist': [],
                  'pharmacist': [],
                  'admin': [],
                  'driver': []
              }[userType] || [];

              // Filter role-specific updates
              const filteredRoleData = {};
              roleEditableFields.forEach(field => {
                  if (updateData.role_details[field] !== undefined) {
                      filteredRoleData[field] = updateData.role_details[field];
                  }
              });

              if (Object.keys(filteredRoleData).length > 0 && RoleModel) {
                  let roleSpecificInfo = await RoleModel.findOneAndUpdate(
                      { employee_id: user._id },
                      filteredRoleData,
                      { new: true, runValidators: true }
                  );

                  // Only populate department_id for doctor and nurse
                  if (['doctor', 'nurse'].includes(userType)) {
                      roleSpecificInfo = await roleSpecificInfo
                          .populate(userType === 'doctor' ? 'department_id' : 'assigned_dept', 'dept_id dept_name');
                  }

                  if (roleSpecificInfo?.rating) {
                      roleSpecificInfo.rating = Number(roleSpecificInfo.rating.toFixed(2));
                  }

                  user = {
                      ...user.toObject(),
                      role_details: roleSpecificInfo
                  };
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
    const { searchQuery, page = 1, limit = 10, type = 'medicine', role = 'user', viewMode = 'inventory' } = req.query;
    const skip = (page - 1) * limit;
    
    let searchFilter = {};
    let results;
    let total;
    
    // Base search filter based on type
    if (searchQuery?.trim()) {
      if (type === 'medicine') {
        searchFilter.$or = [
          { _id: isNaN(searchQuery) ? null : Number(searchQuery) },
          { med_name: { $regex: searchQuery, $options: 'i' } },
          { manufacturer: { $regex: searchQuery, $options: 'i' } }
        ];
      } else {
        searchFilter.$or = [
          { _id: isNaN(searchQuery) ? null : Number(searchQuery) },
          { equipment_name: { $regex: searchQuery, $options: 'i' } }
        ];
      }
    }

    // Add order status filter based on role and view mode
    if (role !== 'admin') {
      // Non-admin users can only see ordered items
      searchFilter.order_status = 'ordered';
    } else if (viewMode === 'pending') {
      // Admin viewing pending requests
      searchFilter.order_status = 'requested';
    } else {
      // Admin viewing inventory (show ordered items)
      searchFilter.order_status = 'ordered';
    }

    if (type === 'medicine') {
      results = await Medicine.find(searchFilter)
        .select('_id med_name manufacturer available inventory')
        .sort({ _id: 1 })
        .skip(skip)
        .limit(Number(limit));
        
      total = await Medicine.countDocuments(searchFilter);

      results = results.map(med => {
        const latestInventory = med.inventory[med.inventory.length - 1] || {};
        return {
          id: med._id,
          name: med.med_name,
          manufacturer: med.manufacturer,
          available: med.available,
          quantity: latestInventory.quantity || 0,
          next_availability: (!med.available || latestInventory.quantity === 0) ? 
            new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0] : null,
          expired_quantity: calculateExpiredQuantity(latestInventory)
        };
      });
    } else {
      results = await Equipment.find(searchFilter)
        .select('_id equipment_name quantity installation_date last_service_date next_service_date')
        .sort({ _id: 1 })
        .skip(skip)
        .limit(Number(limit));
        
      total = await Equipment.countDocuments(searchFilter);

      results = results.map(equip => ({
        id: equip._id,
        name: equip.equipment_name,
        quantity: equip.quantity || 0,
        last_service_date: equip.last_service_date,
        next_service_date: equip.next_service_date,
        service_status: calculateServiceStatus(equip.next_service_date)
      }));
    }

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      items: results,
      total,
      page: Number(page),
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    });

  } catch (error) {
    res.status(500).json({ 
      message: 'Error searching inventory',
      error: error.message 
    });
  }
};

// Helper functions
const calculateExpiredQuantity = (inventory) => {
  if (!inventory || !inventory.expiry_date) return 0;
  const expiryDate = new Date(inventory.expiry_date);
  const today = new Date();
  return expiryDate < today ? inventory.quantity : 0;
};

const calculateServiceStatus = (nextServiceDate) => {
  if (!nextServiceDate) return 'Unknown';
  const today = new Date();
  const next = new Date(nextServiceDate);
  const daysUntil = Math.ceil((next - today) / (1000 * 60 * 60 * 24));
  
  if (daysUntil < 0) return 'Overdue';
  if (daysUntil <= 30) return 'Due Soon';
  return 'OK';
};


export const uploadEmployeePhoto = async (req, res) => {
  try {
    const { employeeId } = req.params;

    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const newProfilePicUrl = req.file.path;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Delete old image from Cloudinary
    if (employee.profile_pic) {
      const segments = employee.profile_pic.split('/');
      const filenameWithExt = segments[segments.length - 1];
      const publicId = `profile_pics/${filenameWithExt.split('.')[0]}`;
      console.log("Deleting from Cloudinary:", publicId);
      await cloudinary.uploader.destroy(publicId);
    }

    // Update new image URL
    employee.profile_pic = newProfilePicUrl;
    await employee.save();

    return res.status(200).json({
      message: "Profile photo uploaded successfully",
      profile_pic: newProfilePicUrl,
    });

  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ message: "Server error during upload" });
  }
};