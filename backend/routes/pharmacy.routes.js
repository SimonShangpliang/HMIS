import express from 'express';
import { searchPatientPrescriptions, updatePrescriptionEntry } from '../controllers/pharmacist.controller.js';

const router = express.Router();

// TODO: Add routes for pharmacy
router.get('/prescriptions', searchPatientPrescriptions);
// router.put("/prescriptions/:prescriptionId/entries/:entryId", updatePrescriptionEntry);
router.put("/prescriptions/:prescriptionId/entries/:entryId", updatePrescriptionEntry);

export default router;