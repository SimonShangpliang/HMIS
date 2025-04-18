// tests/unit/models/consultation.test.js
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import mongoose from 'mongoose'
import { connectDB, disconnectDB } from '../../helpers/db.js'
import { 
  Consultation, 
  Prescription, 
  PrescriptionEntry, 
  Feedback, 
  Report 
} from '../../../models/consultation.js'

// Setup and teardown
beforeAll(async () => {
  await connectDB()
})

afterAll(async () => {
  await disconnectDB()
})

beforeEach(async () => {
  // Clean all collections before each test
  await Consultation.deleteMany({})
  await Prescription.deleteMany({})
  
  // Reset counter collection for auto-increment
  const counterCollection = mongoose.connection.db.collection('counters')
  await counterCollection.updateOne(
    { _id: 'prescription_id_counter' },
    { $set: { seq: 10000 } },
    { upsert: true }
  )
})

describe('Consultation Model', () => {
  it('should create a new consultation successfully', async () => {
    const consultationData = {
      patient_id: 12345,
      doctor_id: 67890,
      booked_date_time: new Date(),
      status: 'scheduled',
      reason: 'Headache',
      appointment_type: 'regular'
    }
    
    const consultation = new Consultation(consultationData)
    const savedConsultation = await consultation.save()
    
    expect(savedConsultation._id).toBeDefined()
    expect(savedConsultation.patient_id).toBe(12345)
    expect(savedConsultation.status).toBe('scheduled')
    expect(savedConsultation.createdAt).toBeDefined()
    expect(savedConsultation.updatedAt).toBeDefined()
  })
  
  it('should reject invalid consultation status', async () => {
    const consultation = new Consultation({
      patient_id: 12345,
      doctor_id: 67890,
      status: 'invalid_status', // Invalid - not in enum
      appointment_type: 'regular'
    })
    
    await expect(consultation.save()).rejects.toThrow()
  })
  
  it('should reject invalid appointment type', async () => {
    const consultation = new Consultation({
      patient_id: 12345,
      doctor_id: 67890,
      status: 'scheduled',
      appointment_type: 'invalid_type' // Invalid - not in enum
    })
    
    await expect(consultation.save()).rejects.toThrow()
  })
  
  it('should update consultation fields', async () => {
    const consultation = new Consultation({
      patient_id: 12345,
      doctor_id: 67890,
      status: 'scheduled',
      appointment_type: 'regular'
    })
    
    const savedConsultation = await consultation.save()
    
    // Update to ongoing
    savedConsultation.status = 'ongoing'
    savedConsultation.actual_start_datetime = new Date()
    
    const updatedConsultation = await savedConsultation.save()
    
    expect(updatedConsultation.status).toBe('ongoing')
    expect(updatedConsultation.actual_start_datetime).toBeDefined()
  })
})

describe('Prescription Model', () => {
  it('should create a prescription with auto-incremented ID', async () => {
    const prescription = new Prescription({
      prescriptionDate: new Date(),
      status: 'pending',
      entries: []
    })
    
    const savedPrescription = await prescription.save()
    
    expect(savedPrescription._id).toBe(10000) // Starting value from schema
    
    // Add a second one to test auto-increment
    const prescription2 = new Prescription({
      prescriptionDate: new Date(),
      status: 'pending',
      entries: []
    })
    
    const savedPrescription2 = await prescription2.save()
    expect(savedPrescription2._id).toBe(10001) // Incremented by 1
  })
  
  it('should reject invalid prescription status', async () => {
    const prescription = new Prescription({
      prescriptionDate: new Date(),
      status: 'invalid_status', // Not in enum
      entries: []
    })
    
    await expect(prescription.save()).rejects.toThrow()
  })
  
  it('should create a prescription with entries', async () => {
    const prescription = new Prescription({
      prescriptionDate: new Date(),
      status: 'pending',
      entries: [
        {
          medicine_id: 101,
          dosage: '10mg',
          frequency: 'twice daily',
          duration: '7 days',
          quantity: 14
        },
        {
          medicine_id: 102,
          dosage: '500mg',
          frequency: 'once daily',
          duration: '5 days',
          quantity: 5
        }
      ]
    })
    
    const savedPrescription = await prescription.save()
    
    expect(savedPrescription.entries).toHaveLength(2)
    expect(savedPrescription.entries[0].medicine_id).toBe(101)
    expect(savedPrescription.entries[0].quantity).toBe(14)
    expect(savedPrescription.entries[0].dispensed_qty).toBe(0) // Default value
    expect(savedPrescription.entries[1].medicine_id).toBe(102)
  })
  
  it('should track dispensed quantities', async () => {
    const prescription = new Prescription({
      prescriptionDate: new Date(),
      status: 'pending',
      entries: [
        {
          medicine_id: 101,
          dosage: '10mg',
          frequency: 'twice daily',
          duration: '7 days',
          quantity: 14,
          dispensed_qty: 7 // Partially dispensed
        }
      ]
    })
    
    const savedPrescription = await prescription.save()
    
    expect(savedPrescription.entries[0].dispensed_qty).toBe(7)
    
    // Update dispensed quantity and status
    savedPrescription.entries[0].dispensed_qty = 14
    savedPrescription.status = 'dispensed'
    
    const updatedPrescription = await savedPrescription.save()
    
    expect(updatedPrescription.status).toBe('dispensed')
    expect(updatedPrescription.entries[0].dispensed_qty).toBe(14)
  })
})

describe('Report Schema', () => {
  it('should create a consultation with embedded reports', async () => {
    const consultation = new Consultation({
      patient_id: 12345,
      doctor_id: 67890,
      status: 'scheduled',
      appointment_type: 'regular',
      reports: [
        {
          status: 'pending',
          title: 'Blood Test',
          description: 'Complete blood count'
        },
        {
          status: 'completed',
          title: 'X-Ray',
          description: 'Chest X-ray',
          reportText: 'No abnormalities detected'
        }
      ]
    })
    
    const savedConsultation = await consultation.save()
    
    expect(savedConsultation.reports).toHaveLength(2)
    expect(savedConsultation.reports[0].title).toBe('Blood Test')
    expect(savedConsultation.reports[0].status).toBe('pending')
    expect(savedConsultation.reports[1].reportText).toBe('No abnormalities detected')
  })
  
  it('should reject report with invalid status', async () => {
    const consultation = new Consultation({
      patient_id: 12345,
      doctor_id: 67890,
      status: 'scheduled',
      appointment_type: 'regular',
      reports: [
        {
          status: 'invalid_status', // Not in enum
          title: 'Blood Test',
          description: 'Complete blood count'
        }
      ]
    })
    
    await expect(consultation.save()).rejects.toThrow()
  })
  
  it('should reject report without required title', async () => {
    const consultation = new Consultation({
      patient_id: 12345,
      doctor_id: 67890,
      status: 'scheduled',
      appointment_type: 'regular',
      reports: [
        {
          status: 'pending',
          // Missing required title
          description: 'Complete blood count'
        }
      ]
    })
    
    await expect(consultation.save()).rejects.toThrow()
  })
  
  it('should update report status and content', async () => {
    const consultation = new Consultation({
      patient_id: 12345,
      doctor_id: 67890,
      status: 'ongoing',
      appointment_type: 'regular',
      reports: [
        {
          status: 'pending',
          title: 'Blood Test',
          description: 'Complete blood count'
        }
      ]
    })
    
    const savedConsultation = await consultation.save()
    
    // Update the report
    savedConsultation.reports[0].status = 'completed'
    savedConsultation.reports[0].reportText = 'All parameters within normal range'
    savedConsultation.reports[0].updatedAt = new Date()
    
    const updatedConsultation = await savedConsultation.save()
    
    expect(updatedConsultation.reports[0].status).toBe('completed')
    expect(updatedConsultation.reports[0].reportText).toBe('All parameters within normal range')
  })
})

describe('Feedback Schema', () => {
  it('should create a consultation with feedback', async () => {
    const consultation = new Consultation({
      patient_id: 12345,
      doctor_id: 67890,
      status: 'completed',
      appointment_type: 'regular',
      feedback: {
        rating: 5,
        comments: 'Excellent service'
      }
    })
    
    const savedConsultation = await consultation.save()
    
    expect(savedConsultation.feedback).toBeDefined()
    expect(savedConsultation.feedback.rating).toBe(5)
    expect(savedConsultation.feedback.comments).toBe('Excellent service')
    expect(savedConsultation.feedback.created_at).toBeDefined()
  })
  
  it('should reject feedback with invalid rating', async () => {
    const consultation = new Consultation({
      patient_id: 12345,
      doctor_id: 67890,
      status: 'completed',
      appointment_type: 'regular',
      feedback: {
        rating: 6, // Not in enum (valid values are 1-5)
        comments: 'Good service'
      }
    })
    
    await expect(consultation.save()).rejects.toThrow()
  })
  
  it('should add feedback to existing consultation', async () => {
    const consultation = new Consultation({
      patient_id: 12345,
      doctor_id: 67890,
      status: 'completed',
      appointment_type: 'regular'
    })
    
    const savedConsultation = await consultation.save()
    
    // Add feedback
    savedConsultation.feedback = {
      rating: 4,
      comments: 'Very good experience'
    }
    
    const updatedConsultation = await savedConsultation.save()
    
    expect(updatedConsultation.feedback.rating).toBe(4)
    expect(updatedConsultation.feedback.comments).toBe('Very good experience')
  })
})

describe('Relationships and References', () => {
  it('should create a consultation with prescription references', async () => {
    // First create prescriptions
    const prescription1 = new Prescription({
      prescriptionDate: new Date(),
      status: 'pending',
      entries: []
    })
    
    const prescription2 = new Prescription({
      prescriptionDate: new Date(),
      status: 'dispensed',
      entries: []
    })
    
    const savedPrescription1 = await prescription1.save()
    const savedPrescription2 = await prescription2.save()
    
    // Now create consultation with references to these prescriptions
    const consultation = new Consultation({
      patient_id: 12345,
      doctor_id: 67890,
      status: 'completed',
      appointment_type: 'regular',
      prescription: [savedPrescription1._id, savedPrescription2._id]
    })
    
    const savedConsultation = await consultation.save()
    
    expect(savedConsultation.prescription).toHaveLength(2)
    expect(savedConsultation.prescription).toContain(savedPrescription1._id)
    expect(savedConsultation.prescription).toContain(savedPrescription2._id)
  })
  
  it('should allow adding new reports to existing consultation', async () => {
    // Create consultation without reports
    const consultation = new Consultation({
      patient_id: 12345,
      doctor_id: 67890,
      status: 'ongoing',
      appointment_type: 'regular'
    })
    
    const savedConsultation = await consultation.save()
    
    // Add a report
    savedConsultation.reports.push({
      status: 'pending',
      title: 'MRI Scan',
      description: 'Brain MRI'
    })
    
    const updatedConsultation = await savedConsultation.save()
    
    expect(updatedConsultation.reports).toHaveLength(1)
    expect(updatedConsultation.reports[0].title).toBe('MRI Scan')
  })
  
  it('should link consultation to diagnosis references', async () => {
    const diagnosisIds = [
      new mongoose.Types.ObjectId(),
      new mongoose.Types.ObjectId()
    ]
    
    const consultation = new Consultation({
      patient_id: 12345,
      doctor_id: 67890,
      status: 'completed',
      appointment_type: 'regular',
      diagnosis: diagnosisIds
    })
    
    const savedConsultation = await consultation.save()
    
    expect(savedConsultation.diagnosis).toHaveLength(2)
    expect(savedConsultation.diagnosis[0].toString()).toBe(diagnosisIds[0].toString())
    expect(savedConsultation.diagnosis[1].toString()).toBe(diagnosisIds[1].toString())
  })
})

describe('Complete Consultation Workflow', () => {
  it('should create a full consultation with all related data', async () => {
    // Create prescriptions with entries
    const prescription = new Prescription({
      prescriptionDate: new Date(),
      status: 'pending',
      entries: [
        {
          medicine_id: 101,
          dosage: '10mg',
          frequency: 'twice daily',
          duration: '7 days',
          quantity: 14
        }
      ]
    })
    
    const savedPrescription = await prescription.save()
    
    // Create a consultation with all possible fields
    const consultationData = {
      patient_id: 12345,
      doctor_id: 67890,
      booked_date_time: new Date(),
      status: 'completed',
      reason: 'Severe headache and dizziness',
      appointment_type: 'emergency',
      actual_start_datetime: new Date(),
      remark: 'Patient reported symptoms for 3 days',
      additional_info: 'Patient has history of migraines',
      diagnosis: [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()], // Simulate diagnosis IDs
      prescription: [savedPrescription._id],
      reports: [
        {
          status: 'completed',
          title: 'CT Scan',
          description: 'Brain CT scan',
          reportText: 'No evidence of stroke or hemorrhage',
          createdBy: new mongoose.Types.ObjectId()
        }
      ],
      bill_id: new mongoose.Types.ObjectId(),
      recordedAt: new Date(),
      feedback: {
        rating: 4,
        comments: 'Doctor was very thorough'
      }
    }
    
    const consultation = new Consultation(consultationData)
    const savedConsultation = await consultation.save()
    
    // Verify all fields were saved correctly
    expect(savedConsultation._id).toBeDefined()
    expect(savedConsultation.patient_id).toBe(12345)
    expect(savedConsultation.doctor_id).toBe(67890)
    expect(savedConsultation.status).toBe('completed')
    expect(savedConsultation.reason).toBe('Severe headache and dizziness')
    expect(savedConsultation.appointment_type).toBe('emergency')
    expect(savedConsultation.remark).toBe('Patient reported symptoms for 3 days')
    expect(savedConsultation.prescription).toHaveLength(1)
    expect(savedConsultation.prescription[0]).toBe(savedPrescription._id)
    expect(savedConsultation.reports).toHaveLength(1)
    expect(savedConsultation.reports[0].title).toBe('CT Scan')
    expect(savedConsultation.reports[0].reportText).toBe('No evidence of stroke or hemorrhage')
    expect(savedConsultation.feedback.rating).toBe(4)
    expect(savedConsultation.feedback.comments).toBe('Doctor was very thorough')
  })
})
