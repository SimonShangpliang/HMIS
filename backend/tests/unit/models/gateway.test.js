// tests/unit/models/gateway.test.js
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import mongoose from 'mongoose'
import PaymentGateway from '../../../models/gateway.js'
import { connectDB, disconnectDB } from '../../helpers/db.js'

describe('PaymentGateway Model', () => {
  // Connect to the test database before running tests
  beforeAll(async () => {
    await connectDB()
  })

  // Disconnect from the test database after tests
  afterAll(async () => {
    await disconnectDB()
  })

  // Clear the database between tests
  beforeEach(async () => {
    await PaymentGateway.deleteMany({})
  })

  // Test basic gateway creation
  it('should create a payment gateway with valid fields', async () => {
    const gatewayData = {
      gateway_name: 'Stripe',
      status: 'active',
      gateway_url: 'https://api.stripe.com',
      api_key: 'sk_test_123456789'
    }
    
    const gateway = new PaymentGateway(gatewayData)
    const savedGateway = await gateway.save()
    
    expect(savedGateway._id).toBeDefined()
    expect(savedGateway.gateway_name).toBe('Stripe')
    expect(savedGateway.status).toBe('active')
    expect(savedGateway.gateway_url).toBe('https://api.stripe.com')
    expect(savedGateway.api_key).toBe('sk_test_123456789')
  })
  
  // Test enum validation for status field
  it('should reject invalid status values', async () => {
    const gateway = new PaymentGateway({
      gateway_name: 'PayPal',
      status: 'pending', // Invalid status
      gateway_url: 'https://api.paypal.com',
      api_key: 'paypal_test_key'
    })
    
    await expect(gateway.save()).rejects.toThrow()
  })
  
  // Test that non-required fields are optional
  it('should create a gateway with only required fields', async () => {
    // None of the fields are explicitly required in the schema,
    // but we should test minimal data case
    const gateway = new PaymentGateway({
      gateway_name: 'Minimal Gateway',
      status: 'inactive'
    })
    
    const savedGateway = await gateway.save()
    expect(savedGateway._id).toBeDefined()
    expect(savedGateway.gateway_name).toBe('Minimal Gateway')
    expect(savedGateway.status).toBe('inactive')
    expect(savedGateway.gateway_url).toBeUndefined()
    expect(savedGateway.api_key).toBeUndefined()
  })
  
  // Test updating a gateway
  it('should update a payment gateway', async () => {
    const gateway = new PaymentGateway({
      gateway_name: 'RazorPay',
      status: 'active',
      gateway_url: 'https://api.razorpay.com',
      api_key: 'rzp_test_key'
    })
    
    const savedGateway = await gateway.save()
    
    // Update the gateway
    savedGateway.status = 'inactive'
    savedGateway.api_key = 'rzp_new_test_key'
    
    const updatedGateway = await savedGateway.save()
    
    expect(updatedGateway.status).toBe('inactive')
    expect(updatedGateway.api_key).toBe('rzp_new_test_key')
    expect(updatedGateway.gateway_name).toBe('RazorPay') // Unchanged
  })
  
  // Test finding a gateway
  it('should find a payment gateway by name', async () => {
    // Create multiple gateways
    await PaymentGateway.create({
      gateway_name: 'Stripe',
      status: 'active',
      gateway_url: 'https://api.stripe.com',
      api_key: 'stripe_key'
    })
    
    await PaymentGateway.create({
      gateway_name: 'PayPal',
      status: 'active',
      gateway_url: 'https://api.paypal.com',
      api_key: 'paypal_key'
    })
    
    // Find one by name
    const gateway = await PaymentGateway.findOne({ gateway_name: 'Stripe' })
    
    expect(gateway).toBeDefined()
    expect(gateway.gateway_name).toBe('Stripe')
    expect(gateway.api_key).toBe('stripe_key')
  })
  
  // Test deleting a gateway
  it('should delete a payment gateway', async () => {
    const gateway = await PaymentGateway.create({
      gateway_name: 'Temporary Gateway',
      status: 'active'
    })
    
    await PaymentGateway.findByIdAndDelete(gateway._id)
    
    const deletedGateway = await PaymentGateway.findById(gateway._id)
    expect(deletedGateway).toBeNull()
  })
  
  // Test finding active gateways
  it('should find all active payment gateways', async () => {
    // Create multiple gateways with different statuses
    await PaymentGateway.create([
      {
        gateway_name: 'Active Gateway 1',
        status: 'active'
      },
      {
        gateway_name: 'Active Gateway 2',
        status: 'active'
      },
      {
        gateway_name: 'Inactive Gateway',
        status: 'inactive'
      }
    ])
    
    const activeGateways = await PaymentGateway.find({ status: 'active' })
    
    expect(activeGateways).toHaveLength(2)
    expect(activeGateways[0].status).toBe('active')
    expect(activeGateways[1].status).toBe('active')
  })
  
  // Test empty fields
  it('should handle empty fields with default values', async () => {
    // Create with empty object (no fields)
    const gateway = new PaymentGateway({})
    const savedGateway = await gateway.save()
    
    expect(savedGateway._id).toBeDefined()
    // No default values in schema, so these should be undefined
    expect(savedGateway.gateway_name).toBeUndefined()
    expect(savedGateway.status).toBeUndefined()
    expect(savedGateway.gateway_url).toBeUndefined()
    expect(savedGateway.api_key).toBeUndefined()
  })
  
  // Test with invalid types
  it('should handle type coercion and validation', async () => {
    const gateway = new PaymentGateway({
      gateway_name: 123, // Number instead of String
      status: 'active',
    })
    
    const savedGateway = await gateway.save()
    // Mongoose coerces numbers to strings
    expect(typeof savedGateway.gateway_name).toBe('string')
    expect(savedGateway.gateway_name).toBe('123')
  })
})
