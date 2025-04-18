// tests/integration/models/diagnosis.integration.test.js
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { connectDB, disconnectDB } from '../../helpers/db.js'
import Diagnosis from '../../../models/diagnosis.js'
import supertest from 'supertest'
import express from 'express'

let app
let server
let port

// Setup express app for integration testing
beforeAll(async () => {
  // Connect to database
  await connectDB()
  
  // Setup Express app
  app = express()
  app.use(express.json())
  
  // Simple diagnosis routes for testing
  app.get('/diagnoses', async (req, res) => {
    try {
      const diagnoses = await Diagnosis.find({})
      res.json(diagnoses)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })
  
  app.post('/diagnoses', async (req, res) => {
    try {
      const diagnosis = new Diagnosis(req.body)
      const savedDiagnosis = await diagnosis.save()
      res.status(201).json(savedDiagnosis)
    } catch (err) {
      res.status(400).json({ error: err.message })
    }
  })
  
  app.put('/diagnoses/:id', async (req, res) => {
    try {
      const diagnosis = await Diagnosis.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      )
      if (!diagnosis) return res.status(404).json({ error: 'Diagnosis not found' })
      res.json(diagnosis)
    } catch (err) {
      res.status(400).json({ error: err.message })
    }
  })
  
  app.delete('/diagnoses/:id', async (req, res) => {
    try {
      const diagnosis = await Diagnosis.findByIdAndDelete(req.params.id)
      if (!diagnosis) return res.status(404).json({ error: 'Diagnosis not found' })
      res.status(204).send()
    } catch (err) {
      res.status(500).json({ error: err.message })
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
  await Diagnosis.deleteMany({})
})

describe('Diagnosis API Integration', () => {
  it('should create a diagnosis via API', async () => {
    const response = await supertest(app)
      .post('/diagnoses')
      .send({
        name: 'Dermatitis'
      })
    
    expect(response.status).toBe(201)
    expect(response.body.name).toBe('Dermatitis')
  })
  
  it('should retrieve diagnoses via API', async () => {
    // Create test diagnoses
    await Promise.all([
      new Diagnosis({ name: 'Eczema' }).save(),
      new Diagnosis({ name: 'Psoriasis' }).save()
    ])
    
    const response = await supertest(app).get('/diagnoses')
    
    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(2)
    expect(response.body.some(d => d.name === 'Eczema')).toBe(true)
    expect(response.body.some(d => d.name === 'Psoriasis')).toBe(true)
  })
    
  it('should update a diagnosis via API', async () => {
    // Create a diagnosis
    const createResponse = await supertest(app)
      .post('/diagnoses')
      .send({ name: 'Rhinitis' })
    
    // Update it
    const updateResponse = await supertest(app)
      .put(`/diagnoses/${createResponse.body._id}`)
      .send({ name: 'Allergic Rhinitis' })
    
    expect(updateResponse.status).toBe(200)
    expect(updateResponse.body.name).toBe('Allergic Rhinitis')
    
    // Verify it was updated in the database
    const diagnosis = await Diagnosis.findById(createResponse.body._id)
    expect(diagnosis.name).toBe('Allergic Rhinitis')
  })
  
  it('should delete a diagnosis via API', async () => {
    // Create a diagnosis
    const createResponse = await supertest(app)
      .post('/diagnoses')
      .send({ name: 'Tonsillitis' })
    
    // Delete it
    const deleteResponse = await supertest(app)
      .delete(`/diagnoses/${createResponse.body._id}`)
    
    expect(deleteResponse.status).toBe(204)
    
    // Verify it was deleted from the database
    const diagnosis = await Diagnosis.findById(createResponse.body._id)
    expect(diagnosis).toBeNull()
  })
})
