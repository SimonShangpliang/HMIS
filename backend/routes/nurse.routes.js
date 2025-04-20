import express from 'express';
import { searchPatientInfo, addPatientVitals, updatePatientVitals } from '../controllers/nurse.controller.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/searchQuery', searchPatientInfo);

/**
 * Add new vitals for a patient
 * 
 *  param.patientId - Patient ID number
 *  Authentication token in request headers
 * 
 * bodyFormat
 * {
 *   "bloodPressure": 120,    // Required, numeric value (systolic)
 *   "bodyTemp": 98.6,        // Required, numeric value in Fahrenheit
 *   "pulseRate": 72,         // Required, numeric value (beats per minute)
 *   "breathingRate": 16      // Required, numeric value (breaths per minute)
 * }
 * 
 */
router.post('/patients/:patientId/vitals', addPatientVitals);

/**
 *  Update existing vitals for a patient
 * 
 *  param.patientId - Patient ID number
 *  param.vitalId - ID of the specific vital record to update
 *  Authentication token in request headers
 * 
 * bodyFormat
 * {
 *   "bloodPressure": 120,    // Required, numeric value (systolic)
 *   "bodyTemp": 98.6,        // Required, numeric value in Fahrenheit
 *   "pulseRate": 72,         // Required, numeric value (beats per minute)
 *   "breathingRate": 16      // Required, numeric value (breaths per minute)
 * }
 */
router.put('/patients/:patientId/vitals/:vitalId', updatePatientVitals);

export default router;