import { sendMessage } from '../config/sendMail.js';
import Employee from '../models/employee.js';
// employeeController.js
import { Doctor, Nurse, Pharmacist, Receptionist, Admin, Pathologist, Driver } from '../models/staff.js';

export const getRoleSpecificId = async (req, res) => {
  try {
    const { employee_id, role } = req.query;

    let result = null;
    switch (role.toLowerCase()) {
      case 'doctor':
        result = await Doctor.findOne({ employee_id });
        break;
      case 'nurse':
        result = await Nurse.findOne({ employee_id });
        break;
      case 'pharmacist':
        result = await Pharmacist.findOne({ employee_id });
        break;
      case 'receptionist':
        result = await Receptionist.findOne({ employee_id });
        break;
      case 'admin':
        result = await Admin.findOne({ employee_id });
        break;
      case 'pathologist':
        result = await Pathologist.findOne({ employee_id });
        break;
      case 'driver':
        result = await Driver.findOne({ employee_id });
        break;
      default:
        return res.status(400).json({ error: 'Invalid role' });
    }

    if (!result) {
      return res.status(404).json({ error: 'No role-specific data found' });
    }
    return res.status(200).json({ role_id: result._id });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getDoctorIdByEmployeeId = async (req, res) => {
  try {
    const { employee_id } = req.params;
    
    // Find the doctor document using the employee_id
    const doctor = await Doctor.findOne({ employee_id: parseInt(employee_id) });

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found with this employee ID' });
    }

    // Return the doctor's _id
    return res.status(200).json({ doctor_id: doctor._id });
  } catch (err) {
    console.error('Error fetching doctor ID:', err);
    return res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};

export const sendAdmin = async (req, res) => {
    
    try {
      const { subject, message, email } = req.body;
  
      const adminEmailList = await Employee.find({ role: 'admin' }).select('email');
      for (const admin of adminEmailList) {
        await sendMessage(subject, message, email, admin.email);
      }
  
      res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ message: 'Failed to send email', error });
    }
  };

  export const getEmployees = async (req, res) => {
    try {
      const {
        id,
        name,
        role,
        dept_id,
        email,
        gender,
        bloodGrp,
        minSalary,
        maxSalary,
        joinedAfter,
        joinedBefore,
        limit = 100,
        sort = '_id',
        order = 'asc',
      } = req.query;
  
      const filter = {};
  
      if (id) filter._id = parseInt(id);
      if (name) filter.name = { $regex: name, $options: 'i' };
      if (role) filter.role = role;
      if (dept_id) filter.dept_id = dept_id;
      if (email) filter.email = { $regex: email, $options: 'i' };
      if (gender) filter.gender = gender;
      if (bloodGrp) filter.bloodGrp = bloodGrp;
  
      if (minSalary || maxSalary) {
        filter.salary = {};
        if (minSalary) filter.salary.$gte = parseInt(minSalary);
        if (maxSalary) filter.salary.$lte = parseInt(maxSalary);
      }
  
      if (joinedAfter || joinedBefore) {
        filter.date_of_joining = {};
        if (joinedAfter) filter.date_of_joining.$gte = new Date(joinedAfter);
        if (joinedBefore) filter.date_of_joining.$lte = new Date(joinedBefore);
      }
  
      const sortOrder = order === 'desc' ? -1 : 1;
      const sortObj = { [sort]: sortOrder };
  
      const employees = await Employee.find(filter)
        .sort(sortObj)
        .limit(parseInt(limit));
  
      res.json(employees);
    } catch (err) {
      console.error('Error fetching employees:', err);
      res.status(500).json({ message: 'Internal server error', error: err.message });
    }
  };
  
  export const getEmployeeById = async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const employee = await Employee.findById(id);
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }
      res.json(employee);
    } catch (err) {
      console.error('Error fetching employee:', err);
      res.status(500).json({ message: 'Internal server error', error: err.message });
    }
  };
  
  export const getEmployeesByDept = async (req, res) => {
    try {
      const employees = await Employee.find({ dept_id: req.params.deptId });
      res.json(employees);
    } catch (err) {
      console.error('Error fetching employees by department:', err);
      res.status(500).json({ message: 'Internal server error', error: err.message });
    }
  };
  
  export const getEmployeesByRole = async (req, res) => {
    try {
      const employees = await Employee.find({ role: req.params.role });
      res.json(employees);
    } catch (err) {
      console.error('Error fetching employees by role:', err);
      res.status(500).json({ message: 'Internal server error', error: err.message });
    }
  };