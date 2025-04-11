import express from 'express';
import { generatePayslip, searchEmployees, updateInventory, addStaff, updateSalary, processPayroll } from '../controllers/adminController.js';

import bodyParser from 'body-parser';

const router = express.Router();

router.post('/generate-payslip', generatePayslip);
router.get('/search-employees', searchEmployees);
router.post('/update-inventory', updateInventory);
router.post('/add-staff', addStaff);
router.post('/update-salary', updateSalary);
router.post('/process-payroll', processPayroll)
export default router;
