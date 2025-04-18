import express from 'express';
import { registerNewPatient, getAllBedInfo, assignBed, dischargeBed, getAllPatients,getAllRooms } from '../controllers/receptionistController.js';
import {addBill} from '../controllers/receptionistController.js'; // Assuming you have a billController for handling bills
import { fetchPatientInsurance } from '../controllers/receptionistController.js';
const router = express.Router();

// TODO: Add routes for receptionist
router.post('/register-patient', registerNewPatient);
router.get('/beds', getAllBedInfo);
router.get('/rooms', getAllRooms);
router.post('/add-bill', addBill);
// Routes for bed management
router.post('/assign-bed', assignBed);
router.post('/discharge-bed', dischargeBed);
router.get('/fetch-insurance', fetchPatientInsurance);

// Route to get all patients information  FOR TESTING
router.get('/patients', getAllPatients);

export default router;


