import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import mongoose from 'mongoose'
import { connectDB, disconnectDB, syncIndexes } from '../../helpers/db.js'
import Department from '../../../models/department.js'
import supertest from 'supertest'
import express from 'express'

let app
let server
let port

// Setup express app for integration testing
beforeAll(async () => {
  // Connect to in-memory MongoDB using the helper
  await connectDB()
  // Sync indexes to ensure uniqueness constraints are applied
  await syncIndexes()
  
  // Setup Express app
  app = express()
  app.use(express.json())
  
  // Simple department routes for testing
  app.get('/departments', async (req, res) => {
    try {
      const departments = await Department.find({})
      res.json(departments)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })
  
  app.post('/departments', async (req, res) => {
    try {
      const department = new Department(req.body)
      const savedDepartment = await department.save()
      res.status(201).json(savedDepartment)
    } catch (err) {
      res.status(400).json({ error: err.message })
    }
  })

  app.get('/departments/:dept_id', async (req, res) => {
    try {
      const department = await Department.findOne({ dept_id: req.params.dept_id })
      if (!department) {
        return res.status(404).json({ error: 'Department not found' })
      }
      res.json(department)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })
  
  // Start the server
  server = app.listen(0)
  port = server.address().port
})

afterAll(async () => {
  // Close the HTTP server
  server.close()
  // Disconnect from MongoDB using the helper
  await disconnectDB()
})

beforeEach(async () => {
  // Clear the database between tests
  const collections = mongoose.connection.collections
  for (const key in collections) {
    await collections[key].deleteMany({})
  }
})

describe('Department API Integration', () => {
  it('should create a department via API', async () => {
    const response = await supertest(app)
      .post('/departments')
      .send({
        dept_id: 'DEPT101',
        dept_name: 'Cardiology',
        labs: [{ lab_name: 'Heart Lab' }]
      })
    
    expect(response.status).toBe(201)
    expect(response.body.dept_id).toBe('DEPT101')
    expect(response.body.labs).toHaveLength(1)
    expect(response.body.labs[0].lab_name).toBe('Heart Lab')
  })
  
  it('should retrieve departments via API', async () => {
    // Create test departments
    await new Department({
      dept_id: 'DEPT102',
      dept_name: 'Neurology'
    }).save()
    
    await new Department({
      dept_id: 'DEPT103',
      dept_name: 'Orthopedics'
    }).save()
    
    const response = await supertest(app).get('/departments')
    
    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(2)
    expect(response.body.some(d => d.dept_id === 'DEPT102')).toBe(true)
    expect(response.body.some(d => d.dept_id === 'DEPT103')).toBe(true)
  })
  
  it('should reject creating department with duplicate dept_id', async () => {
    // First create a department
    await supertest(app)
      .post('/departments')
      .send({
        dept_id: 'DEPT104',
        dept_name: 'Pediatrics'
      })
    
    // Ensure indexes are created before testing uniqueness
    await Department.createIndexes()
    
    // Try to create another with the same dept_id
    const response = await supertest(app)
      .post('/departments')
      .send({
        dept_id: 'DEPT104',
        dept_name: 'Different Department'
      })
    
    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty('error')
  })

  it('should retrieve a specific department by dept_id', async () => {
    // Create a department
    await new Department({
      dept_id: 'DEPT105',
      dept_name: 'Oncology',
      labs: [{ lab_name: 'Cancer Research Lab' }]
    }).save()
    
    const response = await supertest(app).get('/departments/DEPT105')
    
    expect(response.status).toBe(200)
    expect(response.body.dept_id).toBe('DEPT105')
    expect(response.body.dept_name).toBe('Oncology')
    expect(response.body.labs[0].lab_name).toBe('Cancer Research Lab')
  })
  
  it('should return 404 for non-existent department', async () => {
    const response = await supertest(app).get('/departments/NONEXISTENT')
    expect(response.status).toBe(404)
  })
  
  it('should handle aggregate operations for departments', async () => {
    // This test simulates the getUniqueDepartments function from adminController
    
    // Create departments with duplicate names but different IDs
    await new Department({
      dept_id: 'DEPT106',
      dept_name: 'Radiology'
    }).save()
    
    await new Department({
      dept_id: 'DEPT107',
      dept_name: 'Radiology' // Same name as above
    }).save()
    
    await new Department({
      dept_id: 'DEPT108',
      dept_name: 'Dermatology'
    }).save()
    
    // Perform an aggregate operation similar to getUniqueDepartments
    const uniqueDepartments = await Department.aggregate([
      {
        $group: {
          _id: "$dept_name",
          id: { $first: "$_id" }
        }
      },
      {
        $project: {
          _id: 0,
          dept_name: "$_id",
          id: 1
        }
      }
    ])
    
    expect(uniqueDepartments).toHaveLength(2) // Should only get Radiology once and Dermatology
    expect(uniqueDepartments.some(d => d.dept_name === 'Radiology')).toBe(true)
    expect(uniqueDepartments.some(d => d.dept_name === 'Dermatology')).toBe(true)
  })
})
