import express from 'express';
import { 
  fetchAppointments, 
  updateAppointments, 
  fetchPatientConsultations,
  fetchPatientProgress,
  addDiagnosis,
  addRemarks,
  addPrescription,
  updateAllDiagnosis,
  updateDiagnosisById,
  updateRemark,
  updateAllPrescription,
  updatePrescriptionById, 
  addReport,
  fetchAllDiagnoses,
} from '../controllers/doctor.controller.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

// router.get('/appointments', authenticateUser, fetchAppointments);
router.get('/appointments', fetchAppointments);

// router.put('/appointments', authenticateUser, updateAppointments);
router.put('/appointments', updateAppointments);

//  Expects:
//  - req.params.patientId: String (Patient ID)
//  - Authentication token with doctor_id in req.user
router.get('/consultations', fetchPatientConsultations);
router.get('/consultations/fetchAllDiagnoses', fetchAllDiagnoses);

// Expects:
// - req.params.patientId: String (Patient ID)
// - Authentication token with doctor_id in req.user
// - Doctor must have previously had consultations with this patient
router.get('/progress/:patientId', fetchPatientProgress);


/**
 * Request Parameters:
 * - consultationId: The ID of the consultation to add diagnosis to (in URL path)
 *
 * Request Headers:
 * - Authorization: Bearer <token> (must contain doctor_id in payload)
 *
 * Request Body:
 * {
 *   "diagnosis": ["Diagnosis 1", "Diagnosis 2", "..."] // Array of strings, can't be empty
 * }
 */
router.post('/updateConsultations/:consultationId/adddiagnosis', authenticateUser, addDiagnosis);

/**
 * Updates a specific diagnosis by ID
 * 
 * {string} req.params.consultationId - MongoDB ObjectId of the consultation
 * req.params.diagnosisId - MongoDB ObjectId of the diagnosis to update
 * req.body - Request body
 * req.body.diagnosis - New diagnosis text to replace the existing one
 * 
 * Request body example:
 * {
 *   "diagnosis": "Updated diagnosis description"
 * }
 */
router.put('/updateConsultations/:consultationId/updatediagnosis/:diagnosisId', authenticateUser, updateDiagnosisById);

/**
 * Replaces all existing diagnoses with a new one
 * 
 * req.params.consultationId - MongoDB ObjectId of the consultation
 * req.body - Request body
 * req.body.diagnosis - New diagnosis array
 * 
 * Request body example:
 * {
 *   "diagnosis": ["Diagnosis 1", "Diagnosis 2", "..."] // Array of strings, can't be empty
 * }
 */
router.put('/updateConsultations/:consultationId/updatediagnosis', updateAllDiagnosis);


// Expects:
// - req.params.consultationId: String (MongoDB ObjectId)
// - req.body.remark: String
// - Authentication token with doctor_id in req.user
router.post('/updateConsultations/:consultationId/addremarks', authenticateUser, addRemarks);
router.put('/updateConsultations/:consultationId/remark', updateRemark);

/**
 * Adds a new prescription to a consultation
 * 
 * req.params.consultationId - ID of the consultation to add prescription to
 * req.body.prescriptionData - Prescription information
 * req.body.prescriptionData.entries - Array of medication entries
 * 
 * Request body format:
 * {
 *   "prescriptionData": {
 *     "entries": [
 *       {
 *         "medicine_id": 2045,      // ID of the medicine
 *         "dosage": "10mg",         // Dosage amount
 *         "frequency": "Once daily", // Frequency of intake
 *         "duration": "7 days",     // Duration of treatment
 *         "quantity": 7             // Total quantity prescribed
 *       },
 *       // More medication entries as needed
 *     ]
 *   }
 * }
 */
router.post('/updateConsultations/:consultationId/addprescriptions', addPrescription);
router.post('/updateConsultations/:consultationId/addreports', addReport);


/**
 * Updates a specific prescription by ID
 * 
 * req.params.consultationId - MongoDB ObjectId of the consultation
 * req.params.prescriptionId - ID of the prescription to update
 * req.body - Request body
 * req.body.prescriptionData - Updated prescription information
 * req.body.prescriptionData.entries - Array of medication entries
 * 
 * Request body example:
 * {
 *   "prescriptionData": {
 *     "entries": [
 *       {
 *         "medicine_id": 2045,
 *         "dosage": "20mg",
 *         "frequency": "Twice daily",
 *         "duration": "10 days",
 *         "quantity": 20
 *       },
 *       {
 *         "medicine_id": 3076,
 *         "dosage": "500mg",
 *         "frequency": "Three times daily",
 *         "duration": "5 days",
 *         "quantity": 15
 *       }
 *     ]
 *   }
 * }
 */
router.put('/updateConsultations/:consultationId/updateprescription/:prescriptionId', authenticateUser, updatePrescriptionById);

/**
 * Replaces all existing prescriptions with a new one
 * 
 * req.params.consultationId - MongoDB ObjectId of the consultation
 * req.body - Request body
 * req.body.prescriptionData - New prescription information
 * req.body.prescriptionData.entries - Array of medication entries
 * 
 * Request body example:
 * {
 *   "prescriptionData": {
 *     "entries": [
 *       {
 *         "medicine_id": 2045,
 *         "dosage": "10mg",
 *         "frequency": "Once daily",
 *         "duration": "30 days",
 *         "quantity": 30
 *       }
 *     ]
 *   }
 * }
 */
router.put('/updateConsultations/:consultationId/updateprescription', authenticateUser, updateAllPrescription);

export default router;
