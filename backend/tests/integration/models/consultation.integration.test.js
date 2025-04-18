// tests/integration/models/consultation.integration.test.js
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import mongoose from 'mongoose'
import { connectDB, disconnectDB } from '../../helpers/db.js'
import { 
  Consultation, 
  Prescription
} from '../../../models/consultation.js'
import supertest from 'supertest'
import express from 'express'

let app
let server
let port

// Setup and teardown
beforeAll(async () => {
  await connectDB()
  
  // Setup Express app
  app = express()
  app.use(express.json())
  
  // Simple routes for consultation testing
  app.post('/consultations', async (req, res) => {
    try {
      const consultation = new Consultation(req.body)
      const savedConsultation = await consultation.save()
      res.status(201).json(savedConsultation)
    } catch (err) {
      res.status(400).json({ error: err.message })
    }
  })
  
  app.post('/prescriptions', async (req, res) => {
    try {
      const prescription = new Prescription(req.body)
      const savedPrescription = await prescription.save()
      res.status(201).json(savedPrescription)
    } catch (err) {
      res.status(400).json({ error: err.message })
    }
  })
  
  app.get('/consultations/:id', async (req, res) => {
    try {
      const consultation = await Consultation.findById(req.params.id)
      if (!consultation) {
        return res.status(404).json({ message: 'Consultation not found' })
      }
      res.json(consultation)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })
  
  app.put('/consultations/:id/reports', async (req, res) => {
    try {
      const consultation = await Consultation.findById(req.params.id)
      if (!consultation) {
        return res.status(404).json({ message: 'Consultation not found' })
      }
      
      consultation.reports.push(req.body)
      const updatedConsultation = await consultation.save()
      res.json(updatedConsultation)
    } catch (err) {
      res.status(400).json({ error: err.message })
    }
  })
  
  // Start the server
  server = app.listen(0)
  port = server.address().port
})

afterAll(async () => {
  await disconnectDB()
  server.close()
})

beforeEach(async () => {
  // Clean collections before each test
  await Consultation.deleteMany({})
  await Prescription.deleteMany({})
  
  // Reset counter
  const counterCollection = mongoose.connection.db.collection('counters')
  await counterCollection.updateOne(
    { _id: 'prescription_id_counter' },
    { $set: { seq: 10000 } },
    { upsert: true }
  )
})

describe('Consultation API Integration', () => {
  it('should create a consultation via API', async () => {
    const response = await supertest(app)
      .post('/consultations')
      .send({
        patient_id: 12345,
        doctor_id: 67890,
        status: 'scheduled',
        appointment_type: 'regular',
        reason: 'Annual checkup'
      })
    
    expect(response.status).toBe(201)
    expect(response.body.patient_id).toBe(12345)
    expect(response.body.reason).toBe('Annual checkup')
  })
  
  it('should create a prescription via API and link to consultation', async () => {
    // First create a prescription
    const prescriptionResponse = await supertest(app)
      .post('/prescriptions')
      .send({
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
    
    expect(prescriptionResponse.status).toBe(201)
    const prescriptionId = prescriptionResponse.body._id
    
    // Now create a consultation that references the prescription
    const consultationResponse = await supertest(app)
      .post('/consultations')
      .send({
        patient_id: 12345,
        doctor_id: 67890,
        status: 'completed',
        appointment_type: 'regular',
        prescription: [prescriptionId]
      })
    
    expect(consultationResponse.status).toBe(201)
    expect(consultationResponse.body.prescription).toContain(prescriptionId)
    
    // Finally, retrieve the consultation and verify the prescription link
    const retrieveResponse = await supertest(app)
      .get(`/consultations/${consultationResponse.body._id}`)
    
    expect(retrieveResponse.status).toBe(200)
    expect(retrieveResponse.body.prescription).toContain(prescriptionId)
  })
  
  it('should reject invalid consultation data', async () => {
    const response = await supertest(app)
      .post('/consultations')
      .send({
        patient_id: 12345,
        doctor_id: 67890,
        status: 'invalid_status', // Invalid value
        appointment_type: 'regular'
      })
    
    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty('error')
  })
  
  it('should add a report to an existing consultation', async () => {
    // Create a consultation first
    const consultationResponse = await supertest(app)
      .post('/consultations')
      .send({
        patient_id: 12345,
        doctor_id: 67890,
        status: 'ongoing',
        appointment_type: 'regular'
      })
    
    const consultationId = consultationResponse.body._id
    
    // Add a report
    const reportResponse = await supertest(app)
      .put(`/consultations/${consultationId}/reports`)
      .send({
        status: 'pending',
        title: 'Blood Test',
        description: 'Comprehensive blood panel'
      })
    
    expect(reportResponse.status).toBe(200)
    expect(reportResponse.body.reports).toHaveLength(1)
    expect(reportResponse.body.reports[0].title).toBe('Blood Test')
  })
})
