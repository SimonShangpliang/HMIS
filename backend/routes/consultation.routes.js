import express from 'express';
import {
  bookConsultation,
  rescheduleConsultation,
  fetchConsultationById,
  fetchBillByConsultationId,
  fetchPrescriptionByConsultationId,
  fetchDiagnosisByConsultationId,
  updateConsultation,
  fetchRequestedConsultations,
  updateRequestStatus
} from '../controllers/consultation.controller.js';

const router = express.Router();

// POST routes
router.post('/book', bookConsultation);

// PUT routes
router.put('/reschedule/:consultationId', rescheduleConsultation);
router.put('/update/:consultationId', updateConsultation);
router.put('/:consultationId/status', updateRequestStatus);

// GET routes
router.get('/requested', fetchRequestedConsultations);
router.get('/:consultationId/diagnosis', fetchDiagnosisByConsultationId);
router.get('/:consultationId/view', fetchConsultationById);
router.get('/:consultationId/bill', fetchBillByConsultationId);
router.get('/:consultationId/prescription', fetchPrescriptionByConsultationId);

export default router;