import express from 'express';
import {
  searchPatientPrescriptions,
  updatePrescriptionEntry} from '../controllers/pharmacist.controller.js';

const router = express.Router();

router.get('/prescriptions/search', searchPatientPrescriptions);
router.put('/prescription/:prescriptionId/entry/:entryId', updatePrescriptionEntry);

export default router;