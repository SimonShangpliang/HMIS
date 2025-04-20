// controllers/insuranceController.js
import Insurance from '../models/insurance.js';
import Patient from '../models/patient.js';

// Fetch all insurance providers
export const getInsuranceProviders = async (req, res) => {
  try {
    const providers = await Insurance.find({}, '_id insurance_provider');
    res.status(200).json(providers);
  } catch (err) {
    console.error('Error fetching insurance providers:', err);
    res.status(500).json({ message: 'Server error fetching insurance providers' });
  }
};

// Get all insurances for a patient
export const getPatientInsurances = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    // Find the patient and populate insurance details
    const patient = await Patient.findById(patientId).populate('insurance_details');
  
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    const insurances = [];
    
    if (patient.insurance_details && patient.insurance_details.length > 0) {
      for (let insuranceId of patient.insurance_details) {
        const insurance = await Insurance.findById(insuranceId);
        
        if (insurance) {
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
};

// Verify and add insurance for a patient
export const verifyInsurance = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { insurance_provider, policy_number, amount_paid, policy_end_date } = req.body;
    
    const patient = await Patient.findById(patientId);
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    let insurance = await Insurance.findOne({ insurance_provider });
    
    if (!insurance) {
      insurance = new Insurance({
        insurance_provider,
        patients: []
      });
    }
    
    const existingPatientIndex = insurance.patients.findIndex(
      p => p.patient_id.toString() === patientId
    );
    
    if (existingPatientIndex !== -1) {
      return res.status(400).json({ message: 'Patient already has this insurance' });
    }
    
    insurance.patients.push({
      patient_id: patientId,
      policy_number,
      amount_paid,
      policy_end_date
    });
    
    await insurance.save();
    
    if (!patient.insurance_details.includes(insurance._id)) {
      patient.insurance_details.push(insurance._id);
      await patient.save();
    }
    
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
};
