import express from 'express';
import { authenticateUser } from '../middleware/authMiddleware.js';
import  upload  from '../middleware/multer.js';
import { uploadProfilePhoto } from "../controllers/patientController.js";
const router = express.Router();

// TODO: Add routes for patient
import {
    FetchPatientProfile,
    fetchConsultationsByPatientId,
    getAllDoctors,
    sendFeedback,
    rescheduleConsultation,
    cancelConsultation,
    registerPatient,getDoctorById,
    getLatestPatientVital,
    getPatientVitals,
    getPatientVitalById,
    updatePatientProfile
} from '../controllers/patientController.js';

// GETs (General and Fetch Routes)
router.get('/doctors', getAllDoctors); // No params, safest to be first
router.get('/profile/:patientId', FetchPatientProfile); // Single param
router.get('/:patientId/consultations', fetchConsultationsByPatientId);
// router.get('/:patientId/consultations', authenticateUser, fetchConsultationsByPatientId);  // Uncomment if middleware is needed
router.get('/doctors/:id', getDoctorById );

// Patient vitals routes
router.get('/:patientId/vitals', getPatientVitals);
router.get('/:patientId/vitals/latest', getLatestPatientVital);
router.get('/:patientId/vitals/:vitalId', getPatientVitalById);

// POSTs (Actions that create or send data)
router.post('/:patientId/consultations/:consultationId/feedback', sendFeedback);
router.post('/register', registerPatient);
router.post("/upload-photo/:patientId", upload.single("profile_pic"), uploadProfilePhoto);

// DELETE (Modify specific consultation)
router.delete("/:consultationId/cancel", cancelConsultation);

// PUTs (Modify data)
router.put('/:consultationId/reschedule', rescheduleConsultation);
router.put('/profile/:patientId', updatePatientProfile);

export default router;