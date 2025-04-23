// routes/insurance.js
import express from 'express';
import {
  getInsuranceProviders,
  getPatientInsurances,
  verifyInsurance
} from '../controllers/insuranceController.js';

import { authenticateUser } from '../middleware/authMiddleware.js';
const router = express.Router();


// GET /api/insurance-providers
router.get('/insurance-providers',authenticateUser, getInsuranceProviders);

// Get all insurances for a patient
router.get('/:patientId/insurances',authenticateUser, getPatientInsurances);

// POST /api/verify-insurance
router.post('/:patientId/verify-insurance',authenticateUser, verifyInsurance);

// // GET /api/insurance-providers
// router.get('/insurance-providers', getInsuranceProviders);

// // Get all insurances for a patient
// router.get('/:patientId/insurances', getPatientInsurances);

// // POST /api/verify-insurance
// router.post('/:patientId/verify-insurance', verifyInsurance);

export default router;
