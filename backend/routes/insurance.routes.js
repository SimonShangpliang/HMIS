// routes/insurance.js
import express from 'express';
import Insurance from '../models/insurance.js';
import Patient from '../models/patient.js';
const router = express.Router();

// GET /api/insurance-providers
router.get('/insurance-providers', async (req, res) => {
  try {
    const providers = await Insurance.find({}, '_id insurance_provider');
    res.status(200).json(providers);
  } catch (err) {
    console.error('Error fetching insurance providers:', err);
    res.status(500).json({ message: 'Server error fetching insurance providers' });
  }
});

// Get all insurances for a patient
router.get('/:patientId/insurances', async (req, res) => {
    try {
      const { patientId } = req.params;
      
      // Find the patient and populate insurance details
      const patient = await Patient.findById(patientId).populate('insurance_details');
    
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      // Extract insurance data from each insurance document
      const insurances = [];
      
      // If patient has insurance details, fetch them
      if (patient.insurance_details && patient.insurance_details.length > 0) {
        for (let insuranceId of patient.insurance_details) {
          const insurance = await Insurance.findById(insuranceId);
          
          if (insurance) {
            // Find the specific patient's details in this insurance
            const patientInsuranceDetails = insurance.patients.find(
              p => p.patient_id.toString() === patientId
            );
            
            if (patientInsuranceDetails) {
              insurances.push({
                insurance_provider: insurance.insurance_provider,
                policy_number: patientInsuranceDetails.policy_number,
                amount_paid: patientInsuranceDetails.amount_paid,
                policy_end_date: patientInsuranceDetails.policy_end_date
              });
            }
          }
        }
      }
      
      res.json(insurances);
    } catch (error) {
      console.error('Error getting patient insurances:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  

  router.post('/:patientId/verify-insurance', async (req, res) => {
    try {
      const { patientId } = req.params;
      const { insurance_provider, policy_number, amount_paid, policy_end_date } = req.body;
      
      // Find the patient
      const patient = await Patient.findById(patientId);
      
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      // Find or create the insurance provider
      let insurance = await Insurance.findOne({ insurance_provider });
      
      if (!insurance) {
        // Create new insurance provider if it doesn't exist
        insurance = new Insurance({
          insurance_provider,
          patients: []
        });
      }
      
      // Check if patient already has this insurance
      const existingPatientIndex = insurance.patients.findIndex(
        p => p.patient_id.toString() === patientId
      );
      
      if (existingPatientIndex !== -1) {
        return res.status(400).json({ message: 'Patient already has this insurance' });
      }
      //check policy-end-date
      const currentDate = new Date();
      const policyEndDate = new Date(policy_end_date);
      if (policyEndDate < currentDate) {
        return res.status(400).json({ message: 'Policy end date must be in the future' });
      }
      // Check if policy number already exists for this insurance
      const existingPolicyIndex = insurance.patients.findIndex(
        p => p.policy_number === policy_number
      );
      if (existingPolicyIndex !== -1) {
        return res.status(400).json({ message: 'Policy number already exists for this insurance' });
      }
      
      // Add patient to insurance
      insurance.patients.push({
        patient_id: patientId,
        policy_number,
        amount_paid,
        policy_end_date
      });
      
      await insurance.save();
      
      // Add insurance to patient if not already there
      if (!patient.insurance_details.includes(insurance._id)) {
        patient.insurance_details.push(insurance._id);
        await patient.save();
      }
      
      // Return the newly added insurance details
      res.json({
        insurance_provider,
        policy_number,
        amount_paid,
        policy_end_date
      });
    } catch (error) {
      console.error('Error verifying insurance:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

export default router;
