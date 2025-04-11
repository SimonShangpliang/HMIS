import express from 'express';

const router = express.Router();

// TODO: Add routes for patient
import { FetchPatientProfile, fetchConsultations, getAllDoctors,registerPatient,sendFeedback  } from '../controllers/patientController.js';

router.get('/profile/:patientId', FetchPatientProfile);
router.get('/consultations/:patientId', fetchConsultations);
router.get('/doctors', getAllDoctors)
router.post('/register', registerPatient);
router.post('/:patientId/consultations/:consultationId/feedback', sendFeedback);



export default router;
