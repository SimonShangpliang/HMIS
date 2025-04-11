import express from 'express';
import { Consultation, Prescription, Report } from '../models/consultation.js';
import Patient from '../models/patient.js'; // Assuming you have a Patient model
import { Doctor, Receptionist } from '../models/staff.js'; // From your previous code
import Medicine from '../models/inventory.js'; // Assuming you have a Medicine model
import Diagnosis from '../models/diagnosis.js'; // Assuming you have a Diagnosis model

const router = express.Router();

// Route to add dummy consultation and prescription data
router.post('/generate', async (req, res) => {
  try {
    // Get references to existing data
    const patients = await getPatients();
    const doctors = await getDoctors();
    const medicines = await getMedicines();
    const diagnoses = await getDiagnoses();
    const receptionists = await getReceptionists()
    console.log(receptionists)
    
    // Check if we have the necessary data
    if (patients.length === 0 || doctors.length === 0) {
      return res.status(400).json({ 
        message: 'No patients or doctors found. Please add those first.' 
      });
    }
    
    if (medicines.length === 0) {
      return res.status(400).json({ 
        message: 'No medicines found. Please add medicines first.' 
      });
    }
    
    // Add dummy data
    const prescriptions = await addDummyPrescriptions(medicines);
    const consultations = await addDummyConsultations(patients, doctors, receptionists, prescriptions, diagnoses);
    
    res.status(200).json({
      message: 'Dummy consultation data added successfully',
      counts: {
        consultations: consultations.length
      }
    });
  } catch (error) {
    console.error('Error adding dummy consultation data:', error);
    res.status(500).json({ 
      message: 'Error adding dummy consultation data', 
      error: error.message 
    });
  }
});

// Helper functions to get existing data
async function getPatients() {
  try {
    return await Patient.find({});
  } catch (error) {
    console.error('Error fetching patients:', error);
    return [];
  }
}
async function getReceptionists() {
  try {
    return await Receptionist.find({});
  } catch (error) {
    console.error('Error fetching patients:', error);
    return [];
  }
}

async function getDoctors() {
  try {
    return await Doctor.find({});
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return [];
  }
}

async function getMedicines() {
  try {
    return await Medicine.find({});
  } catch (error) {
    console.error('Error fetching medicines:', error);
    // Create fallback data if Medicine model doesn't exist
    return createFallbackMedicines();
  }
}

async function getDiagnoses() {
  try {
    return await Diagnosis.find({});
  } catch (error) {
    console.error('Error fetching diagnoses:', error);
    // Create fallback data if Diagnosis model doesn't exist
    return createFallbackDiagnoses();
  }
}

// Create fallback data if models don't exist
function createFallbackMedicines() {
  // Creating dummy medicine IDs since the model might not exist
  const dummyMedicines = [];
  for (let i = 1; i <= 20; i++) {
    dummyMedicines.push({ _id: 10000 + i, name: `Medicine ${i}` });
  }
  return dummyMedicines;
}

function createFallbackDiagnoses() {
  // Common diagnoses used in hospitals
  return [
    "Hypertension",
    "Type 2 Diabetes",
    "Acute Upper Respiratory Infection",
    "Anxiety",
    "Asthma",
    "Urinary Tract Infection",
    "Depression",
    "Gastroesophageal Reflux Disease",
    "Hyperlipidemia",
    "Chronic Obstructive Pulmonary Disease",
    "Pneumonia",
    "Migraine",
    "Atrial Fibrillation",
    "Acute Bronchitis",
    "Hypothyroidism"
  ];
}

// Helper function to add dummy prescriptions
async function addDummyPrescriptions(medicines) {
  // Clear existing prescriptions
  await Prescription.deleteMany({});
  
  const prescriptionData = [];
  const statuses = ["pending", "dispensed", "partially_dispensed", "cancelled"];
  const frequencies = ["Once daily", "Twice daily", "Three times daily", "Four times daily", "Every 6 hours", "Every 8 hours", "Every 12 hours"];
  const durations = ["3 days", "5 days", "7 days", "10 days", "14 days", "1 month", "2 months"];
  
  // Generate 50 prescriptions
  for (let i = 0; i < 50; i++) {
    // Random date within last 6 months
    const prescriptionDate = new Date();
    prescriptionDate.setMonth(prescriptionDate.getMonth() - Math.floor(Math.random() * 6));
    
    // Random status
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    // Generate 1-5 medicine entries per prescription
    const entriesCount = Math.floor(Math.random() * 5) + 1;
    const entries = [];
    
    // Use a Set to avoid duplicate medicines in the same prescription
    const usedMedicines = new Set();
    
    for (let j = 0; j < entriesCount; j++) {
      // Pick a random medicine that hasn't been used yet
      let medicineIndex;
      do {
        medicineIndex = Math.floor(Math.random() * medicines.length);
      } while (usedMedicines.has(medicineIndex));
      
      usedMedicines.add(medicineIndex);
      const medicine = medicines[medicineIndex];
      
      // Random quantity between 5 and 30
      const quantity = Math.floor(Math.random() * 26) + 5;
      
      // For dispensed or partially dispensed, calculate dispensed quantity
      let dispensed_qty = 0;
      if (status === "dispensed") {
        dispensed_qty = quantity;
      } else if (status === "partially_dispensed") {
        dispensed_qty = Math.floor(quantity * (Math.random() * 0.8 + 0.1)); // 10-90% of total
      }
      
      entries.push({
        medicine_id: medicine._id,
        dosage: `${Math.floor(Math.random() * 3) + 1} tablet(s)`,
        frequency: frequencies[Math.floor(Math.random() * frequencies.length)],
        duration: durations[Math.floor(Math.random() * durations.length)],
        quantity: quantity,
        dispensed_qty: dispensed_qty
      });
    }
    
    prescriptionData.push({
      prescriptionDate: prescriptionDate,
      status: status,
      entries: entries
    });
  }
  // Delete existing prescriptions before adding new ones
  await Prescription.deleteMany({});
  return await Prescription.create(prescriptionData);
}

// Helper function to add dummy consultations
async function addDummyConsultations(patients, doctors, receptionists, prescriptions, diagnoses) {
  // Clear existing consultations
  await Consultation.deleteMany({});
  
  const consultationData = [];
  const statuses = ["scheduled", "ongoing", "completed", "cancelled"];
  const appointmentTypes = ["regular", "follow-up", "emergency", "consultation"];
  const reasons = [
    "Fever and headache", 
    "Chest pain", 
    "Difficulty breathing", 
    "Abdominal pain", 
    "Back pain",
    "Joint pain", 
    "Skin rash", 
    "Chronic cough", 
    "High blood pressure",
    "Dizziness",
    "Vision problems",
    "Hearing issues",
    "Digestive problems",
    "Sleep disturbances",
    "Fatigue"
  ];
  
  const remarks = [
    "Patient improving",
    "Condition stable",
    "Symptoms worsening",
    "Follow-up needed in 2 weeks",
    "Refer to specialist",
    "Additional tests required",
    "Monitor blood pressure daily",
    "Diet modification recommended",
    "Exercise regimen prescribed",
    "Medication dosage adjusted",
    "Surgical consult recommended",
    "Physical therapy recommended",
    "Patient education provided",
    "No significant changes",
    "Medication side effects discussed"
  ];
  
  // Current date for reference
  const currentDate = new Date();
  
  // Generate 100 consultations
  for (let i = 0; i < 100; i++) {
    // Select a random patient and doctor
    const patient = patients[Math.floor(Math.random() * patients.length)];
    const doctor = doctors[Math.floor(Math.random() * doctors.length)];
    const receptionist = receptionists[Math.floor(Math.random() * doctors.length)];
    
    // Generate random dates
    // Booked date: random date within last 3 months to next 1 month
    const bookedDate = new Date();
    bookedDate.setDate(currentDate.getDate() - Math.floor(Math.random() * 90) + Math.floor(Math.random() * 30));
    
    // Select random status
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    // Core consultation data
    const consultation = {
      patient_id: patient._id || patient.patient_id,
      doctor_id: doctor._id,
      booked_date_time: bookedDate,
      status: status,
      reason: reasons[Math.floor(Math.random() * reasons.length)],
      appointment_type: appointmentTypes[Math.floor(Math.random() * appointmentTypes.length)],
    };
    
    // Add fields based on status
    if (status === "ongoing" || status === "completed") {
      const actualStartDate = new Date(bookedDate);
      // Add random minutes (0-30) for realistic start time variation
      actualStartDate.setMinutes(actualStartDate.getMinutes() + Math.floor(Math.random() * 30));
      consultation.actual_start_datetime = actualStartDate;
      consultation.remark = remarks[Math.floor(Math.random() * remarks.length)];
      
      // For completed consultations, add more details
      if (status === "completed") {
        // Add 1-3 diagnoses
        const diagnosisCount = Math.floor(Math.random() * 3) + 1;
        consultation.diagnosis = [];
        
        for (let j = 0; j < diagnosisCount; j++) {
          const diagnosisIndex = Math.floor(Math.random() * diagnoses.length);
          consultation.diagnosis.push(diagnoses[diagnosisIndex]);
        }
        
        // Add prescription (30% chance)
        if (Math.random() < 0.3 && prescriptions.length > 0) {
          const prescriptionIndex = Math.floor(Math.random() * prescriptions.length);
          consultation.prescription = [prescriptions[prescriptionIndex]._id];
        }
        
        // Add reports (20% chance)
        if (Math.random() < 0.2) {
          const reportCount = Math.floor(Math.random() * 2) + 1;
          consultation.reports = [];
          
          const reportTitles = [
            "Blood Test", "X-Ray", "MRI", "CT Scan", "Ultrasound", 
            "ECG", "Urine Analysis", "Stool Analysis", "Biopsy"
          ];
          
          for (let j = 0; j < reportCount; j++) {
            const title = reportTitles[Math.floor(Math.random() * reportTitles.length)];
            const status = Math.random() < 0.7 ? "completed" : "pending";
            
            const report = {
              status: status,
              title: title,
              description: `${title} for ${patient.name || 'patient'}`,
              createdBy: receptionist._id,
              createdAt: new Date(actualStartDate),
              updatedAt: new Date(actualStartDate)
            };
            
            if (status === "completed") {
              report.reportText = `Normal ${title.toLowerCase()} results. No significant findings.`;
            }
            
            consultation.reports.push(report);
          }
        }
        
        // Add feedback (40% chance for completed consultations)
        if (Math.random() < 0.4) {
          const rating = Math.floor(Math.random() * 5) + 1;
          const feedbackComments = [
            "Doctor was very helpful and attentive.",
            "Satisfied with the consultation.",
            "Doctor listened carefully to my concerns.",
            "Wait time was too long.",
            "Very professional service.",
            "Doctor explained everything clearly.",
            "Would recommend this doctor.",
            "Doctor seemed rushed during the consultation.",
            "Excellent care received.",
            "Could improve on explanations of treatment options."
          ];
          
          consultation.feedback = {
            rating: rating,
            comments: feedbackComments[Math.floor(Math.random() * feedbackComments.length)],
            created_at: new Date(actualStartDate.getTime() + 24 * 60 * 60 * 1000) // 1 day after consultation
          };
        }
        
        // Record completion time
        const recordedTime = new Date(actualStartDate);
        recordedTime.setMinutes(recordedTime.getMinutes() + 15 + Math.floor(Math.random() * 30)); // 15-45 min consultation
        consultation.recordedAt = recordedTime;
      }
    }
    
    consultationData.push(consultation);
  }
  
  return await Consultation.create(consultationData);
}

// Route to clear all consultation and prescription data
router.delete('/', async (req, res) => {
  try {
    await Consultation.deleteMany({});
    await Prescription.deleteMany({});
    
    res.status(200).json({ message: 'All consultation and prescription data cleared successfully' });
  } catch (error) {
    console.error('Error clearing consultation data:', error);
    res.status(500).json({ 
      message: 'Error clearing consultation data', 
      error: error.message 
    });
  }
});

// Route to get all consultations with populated references
router.get('/', async (req, res) => {
  try {
    const consultations = await Consultation.find({})
      .populate('patient_id')
      .populate('doctor_id')
      .populate('prescription');
    
    res.status(200).json({
      count: consultations.length,
      consultations: consultations
    });
  } catch (error) {
    console.error('Error fetching consultations data:', error);
    res.status(500).json({ 
      message: 'Error fetching consultations data', 
      error: error.message 
    });
  }
});

router.post('/update/all', async (req, res) => {
  try {
    const consultations = await Consultation.find({});
    const diagnosis = await Diagnosis.find({});
    const prescriptions = await Prescription.find({});
    const reports = await Report.find({});
    for (let i = 0; i < consultations.length; i++) {
      const consultation = consultations[i];
      const prescriptionArr = [];
      const reportArr = [];
      const diagnosisArr = [];
      // console.log(diagnosis)
      // Add random prescription
      const prescriptionCount = Math.floor(Math.random() * 3);
      for (let j = 0; j < prescriptionCount; j++) {
        const randomPrescription = prescriptions[Math.floor(Math.random() * prescriptions.length)];
        prescriptionArr.push(randomPrescription._id);
      }
      // // Add random report
      const reportCount = Math.floor(Math.random() * 3);
      for (let j = 0; j < reportCount; j++) {
        const randomReport = reports[Math.floor(Math.random() * reports.length)];
        reportArr.push(randomReport);
      }
      // // Add random diagnosis
      const diagnosisCount = 1+Math.floor(Math.random() * 3);
      for (let j = 0; j < diagnosisCount; j++) {
        const randomDiagnosis = diagnosis[Math.floor(Math.random() * diagnosis.length)];
        console.log(randomDiagnosis.diagnosis_id)
        diagnosisArr.push(randomDiagnosis.diagnosis_id);
      }
      
      // // Update the consultation with new data
      consultation.prescription = prescriptionArr;
      consultation.reports = reportArr;
      consultation.diagnosis = diagnosisArr;

      // Save the updated consultation
      await consultation.save();
    } 
    res.status(200).json({ 
      message: 'Consultations updated successfully', 
      consultations: consultations 
    }); 
  } catch (error) {
    console.error('Error updating consultations:', error);
    res.status(500).json({ 
      message: 'Error updating consultations', 
      error: error.message 
    });
  }
});


router.post('/reports/generate', async (req, res) => {
  try {
    const consultations = await Consultation.find({});
    const receptionists = await Receptionist.find({});
    const reportTitles = [
      "Blood Test", "X-Ray", "MRI", "CT Scan", "Ultrasound", 
      "ECG", "Urine Analysis", "Stool Analysis", "Biopsy"
    ];
    const reportData = [];

    for (let i = 0; i < consultations.length; i++) {
      const consultation = consultations[i];
      const reportCount = Math.floor(Math.random() * 3) + 1; // Generate 1-3 reports per consultation

      for (let j = 0; j < reportCount; j++) {
      const title = reportTitles[Math.floor(Math.random() * reportTitles.length)];
      const status = Math.random() < 0.7 ? "completed" : "pending";
      const receptionist = receptionists[Math.floor(Math.random() * receptionists.length)];

      const report = {
        status: status,
        title: title,
        description: `${title} for consultation ID ${consultation._id}`,
        createdBy: receptionist._id,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (status === "completed") {
        report.reportText = `Normal ${title.toLowerCase()} results. No significant findings.`;
      }

      reportData.push(report);
      }
    }

    const report = await Report.insertMany(reportData);
    res.status(200).json({ report });
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ message: 'Error fetching report', error: error.message });
  }
});

export default router;