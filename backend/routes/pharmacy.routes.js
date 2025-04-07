import express from 'express';

const router = express.Router();

// TODO: Add routes for pharmacy
router.get('/prescriptions', searchPatientPrescriptions);

export default router;