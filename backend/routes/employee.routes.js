import express from 'express';
import Employee from '../models/employee.js';
import { sendAdmin } from '../controllers/employeeController.js';


const router = express.Router();

/**
 * @route   GET /api/employees
 * @desc    Get employees with optional filtering
 * @access  Private
 * 
 * Supported query parameters:
 * - id: Employee ID (exact match)
 * - name: Employee name (case-insensitive partial match)
 * - role: Employee role (exact match)
 * - dept_id: Department ID (exact match)
 * - email: Email address (case-insensitive partial match)
 * - gender: Gender (exact match)
 * - bloodGrp: Blood group (exact match)
 * - minSalary: Minimum salary threshold
 * - maxSalary: Maximum salary threshold
 * - joinedAfter: Joined after this date (ISO format)
 * - joinedBefore: Joined before this date (ISO format)
 * - limit: Maximum number of results to return (default: 100)
 * - sort: Field to sort by (default: _id)
 * - order: Sort order (asc or desc, default: asc)
 */
router.post('/send', sendAdmin);
router.get('/', async (req, res) => {
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
      order = 'asc'
    } = req.query;

    // Build filter object based on provided query parameters
    const filter = {};

    // Add filters conditionally
    if (id) filter._id = parseInt(id);
    if (name) filter.name = { $regex: name, $options: 'i' }; // Case-insensitive search
    if (role) filter.role = role;
    if (dept_id) filter.dept_id = dept_id;
    if (email) filter.email = { $regex: email, $options: 'i' };
    if (gender) filter.gender = gender;
    if (bloodGrp) filter.bloodGrp = bloodGrp;

    // Salary range
    if (minSalary || maxSalary) {
      filter.salary = {};
      if (minSalary) filter.salary.$gte = parseInt(minSalary);
      if (maxSalary) filter.salary.$lte = parseInt(maxSalary);
    }

    // Date range for joining
    if (joinedAfter || joinedBefore) {
      filter.date_of_joining = {};
      if (joinedAfter) filter.date_of_joining.$gte = new Date(joinedAfter);
      if (joinedBefore) filter.date_of_joining.$lte = new Date(joinedBefore);
    }

    // Create sort object
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj = { [sort]: sortOrder };

    console.log('Filter:', filter);
    console.log('Sort:', sortObj);

    // Execute query with filters, sort, and limit
    const employees = await Employee.find(filter)
      .sort(sortObj)
      .limit(parseInt(limit));

    // Return the result
    res.json(employees);
  } catch (err) {
    console.error('Error fetching employees:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

/**
 * @route   GET /api/employees/by-id/:id
 * @desc    Get employee by ID
 * @access  Private
 */
router.get('/by-id/:id', async (req, res) => {
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
});

/**
 * @route   GET /api/employees/by-dept/:deptId
 * @desc    Get employees by department ID
 * @access  Private
 */
router.get('/by-dept/:deptId', async (req, res) => {
  try {
    const employees = await Employee.find({ dept_id: req.params.deptId });
    res.json(employees);
  } catch (err) {
    console.error('Error fetching employees by department:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

/**
 * @route   GET /api/employees/by-role/:role
 * @desc    Get employees by role
 * @access  Private
 */
router.get('/by-role/:role', async (req, res) => {
  try {
    const employees = await Employee.find({ role: req.params.role });
    res.json(employees);
  } catch (err) {
    console.error('Error fetching employees by role:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

export default router;