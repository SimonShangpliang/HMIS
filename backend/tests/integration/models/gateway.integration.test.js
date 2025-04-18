// tests/integration/models/gateway.integration.test.js
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import supertest from 'supertest'
import express from 'express'
import mongoose from 'mongoose'
import PaymentGateway from '../../../models/gateway.js'
import { connectDB, disconnectDB } from '../../helpers/db.js'

let app
let server
let port

describe('PaymentGateway API Integration', () => {
  beforeAll(async () => {
    await connectDB()
    
    // Setup a minimal Express app for testing
    app = express()
    app.use(express.json())
    
    // Simple gateway routes for testing
    app.get('/gateways', async (req, res) => {
      try {
        const gateways = await PaymentGateway.find({})
        res.json(gateways)
      } catch (error) {
        res.status(500).json({ error: error.message })
      }
    })
    
    app.get('/gateways/active', async (req, res) => {
      try {
        const gateways = await PaymentGateway.find({ status: 'active' })
        res.json(gateways)
      } catch (error) {
        res.status(500).json({ error: error.message })
      }
    })
    
    app.post('/gateways', async (req, res) => {
      try {
        const gateway = new PaymentGateway(req.body)
        const savedGateway = await gateway.save()
        res.status(201).json(savedGateway)
      } catch (error) {
        res.status(400).json({ error: error.message })
      }
    })
    
    app.put('/gateways/:id', async (req, res) => {
      try {
        const gateway = await PaymentGateway.findByIdAndUpdate(
          req.params.id,
          req.body,
          { new: true, runValidators: true }
        )
        if (!gateway) return res.status(404).json({ message: 'Gateway not found' })
        res.json(gateway)
      } catch (error) {
        res.status(400).json({ error: error.message })
      }
    })
    
    app.delete('/gateways/:id', async (req, res) => {
      try {
        const gateway = await PaymentGateway.findByIdAndDelete(req.params.id)
        if (!gateway) return res.status(404).json({ message: 'Gateway not found' })
        res.status(204).end()
      } catch (error) {
        res.status(500).json({ error: error.message })
      }
    })
    
    server = app.listen(0)
    port = server.address().port
  })
  
  afterAll(async () => {
    await disconnectDB()
    server.close()
  })
  
  beforeEach(async () => {
    await PaymentGateway.deleteMany({})
  })
  
  it('should create a payment gateway via API', async () => {
    const response = await supertest(app)
      .post('/gateways')
      .send({
        gateway_name: 'API Test Gateway',
        status: 'active',
        gateway_url: 'https://test.api',
        api_key: 'test_api_key'
      })
    
    expect(response.status).toBe(201)
    expect(response.body.gateway_name).toBe('API Test Gateway')
    expect(response.body.status).toBe('active')
  })
  
  it('should retrieve payment gateways via API', async () => {
    // Create test gateways
    await PaymentGateway.create([
      {
        gateway_name: 'Gateway 1',
        status: 'active',
      },
      {
        gateway_name: 'Gateway 2',
        status: 'inactive',
      }
    ])
    
    const response = await supertest(app).get('/gateways')
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    
    // Sort the results before asserting order
    const sortedGateways = [...response.body].sort((a, b) => 
      a.gateway_name.localeCompare(b.gateway_name)
    );
    expect(sortedGateways[0].gateway_name).toBe('Gateway 1');
    expect(sortedGateways[1].gateway_name).toBe('Gateway 2');
  })
  
  it('should filter active gateways via API', async () => {
    // Create test gateways with mixed statuses
    await PaymentGateway.create([
      {
        gateway_name: 'Active Gateway',
        status: 'active',
      },
      {
        gateway_name: 'Inactive Gateway',
        status: 'inactive',
      }
    ])
    
    const response = await supertest(app).get('/gateways/active')
    
    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(1)
    expect(response.body[0].gateway_name).toBe('Active Gateway')
  })
  
  it('should update a payment gateway via API', async () => {
    // Create a gateway
    const gateway = await PaymentGateway.create({
      gateway_name: 'Original Name',
      status: 'active',
    })
    
    // Update via API
    const response = await supertest(app)
      .put(`/gateways/${gateway._id}`)
      .send({
        gateway_name: 'Updated Name',
        status: 'inactive'
      })
    
    expect(response.status).toBe(200)
    expect(response.body.gateway_name).toBe('Updated Name')
    expect(response.body.status).toBe('inactive')
    
    // Verify in database
    const updatedGateway = await PaymentGateway.findById(gateway._id)
    expect(updatedGateway.gateway_name).toBe('Updated Name')
  })
  
  it('should delete a payment gateway via API', async () => {
    // Create a gateway
    const gateway = await PaymentGateway.create({
      gateway_name: 'Gateway to Delete',
      status: 'active',
    })
    
    // Delete via API
    const response = await supertest(app).delete(`/gateways/${gateway._id}`)
    expect(response.status).toBe(204)
    
    // Verify deletion
    const deletedGateway = await PaymentGateway.findById(gateway._id)
    expect(deletedGateway).toBeNull()
  })
  
  it('should fail when creating a gateway with invalid status', async () => {
    const response = await supertest(app)
      .post('/gateways')
      .send({
        gateway_name: 'Invalid Gateway',
        status: 'unknown_status', // Invalid enum value
      })
    
    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty('error')
  })
  
  it('should handle non-existent gateway ID', async () => {
    const nonExistentId = new mongoose.Types.ObjectId()
    const response = await supertest(app).put(`/gateways/${nonExistentId}`)
    
    expect(response.status).toBe(404)
  })
})
