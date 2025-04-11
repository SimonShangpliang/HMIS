import express from 'express';
import {
  bookConsultation,
  rescheduleConsultation,
  fetchConsultationById,
  fetchBillByConsultationId,
  fetchPrescriptionByConsultationId,
  fetchDiagnosisByConsultationId
} from '../controllers/consultation.controller.js';


const router = express.Router();

// POST: Book a consultation
router.post('/book', bookConsultation);

// PUT: Reschedule a consultation
router.put('/reschedule/:consultationId', rescheduleConsultation);

// GET:
router.get('/:consultationId/diagnosis', fetchDiagnosisByConsultationId);
router.get('/:consultationId/view', fetchConsultationById);
router.get('/:consultationId/bill', fetchBillByConsultationId);
router.get('/:consultationId/prescription', fetchPrescriptionByConsultationId);


export default router;
