import express from 'express';
import {
  bookConsultation,
  rescheduleConsultation,
  fetchConsultationById,
  fetchBillByConsultationId,
  fetchPrescriptionByConsultationId,
  fetchDiagnosisByConsultationId,
  updateConsultation
} from '../controllers/consultation.controller.js';


const router = express.Router();

// POST: Book a consultation
router.post('/book', bookConsultation);

// PUT: Reschedule a consultation
router.put('/reschedule/:consultationId', rescheduleConsultation);
router.put('/update/:consultationId', updateConsultation);

// GET:
router.get('/:consultationId/diagnosis', fetchConsultationById);
router.get('/:consultationId/view', fetchConsultationById);
router.get('/:consultationId/bill', fetchBillByConsultationId);
router.get('/:consultationId/prescription', fetchConsultationById);


export default router;
