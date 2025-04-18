// tests/integration/validators/consultValidator.integration.test.js
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { ConsultationJoiSchema } from '../../../validators/consultValidator.js'
import { ReportJoiSchema } from '../../../validators/reportValidator.js'
import { connectDB, disconnectDB } from '../../helpers/db.js'

describe('ConsultationJoiSchema Integration', () => {
  beforeAll(async () => {
    await connectDB()
  })

  afterAll(async () => {
    await disconnectDB()
  })

  // Test the integration with ReportJoiSchema
  it('should properly validate reports using ReportJoiSchema', () => {
    // We need to create a report that passes ReportJoiSchema validation
    // This test depends on the actual implementation of ReportJoiSchema
    const consultation = {
      patient_id: 12345,
      reports: [
        {
          test_name: 'Blood Test',
          test_type: 'pathology',
          date: new Date(),
          result: 'Normal',
          status: 'completed',
          title: 'Blood Test Report', // Add title (min 3 chars)
          createdBy: '507f1f77bcf86cd799439011' // Add createdBy (valid string)
        }
      ]
    }

    const { error } = ConsultationJoiSchema.validate(consultation)
    expect(error).toBeUndefined()
  })

  // Test validation in a simulated API context
  it('should validate consultation data in a simulated API context', () => {
    // Simulated request body data
    const requestBody = {
      patient_id: 12345,
      doctor_id: 67890,
      booked_date_time: '2025-04-20T09:00:00Z',
      status: 'scheduled',
      reason: 'Annual checkup',
      appointment_type: 'regular'
    }

    // This simulates validation in a controller/middleware
    const { error, value } = ConsultationJoiSchema.validate(requestBody)
    
    expect(error).toBeUndefined()
    expect(value.patient_id).toBe(12345)
    expect(value.doctor_id).toBe(67890)
    expect(value.status).toBe('scheduled')
    
    // Verify date parsing worked
    expect(value.booked_date_time).toBeInstanceOf(Date)
  })

  // Test with invalid data in API context
  it('should reject invalid consultation data in API context', () => {
    // Invalid request body (wrong status value)
    const invalidRequestBody = {
      patient_id: 12345,
      doctor_id: 67890,
      status: 'pending', // Invalid status
      appointment_type: 'regular'
    }

    // Validate in the way a controller would
    const { error } = ConsultationJoiSchema.validate(invalidRequestBody)
    
    expect(error).toBeDefined()
    expect(error.message).toContain('status')
  })
})
