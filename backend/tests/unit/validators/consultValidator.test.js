// tests/unit/validators/consultValidator.test.js
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { ConsultationJoiSchema } from '../../../validators/consultValidator.js'
import { connectDB, disconnectDB } from '../../helpers/db.js'

describe('ConsultationJoiSchema Validator', () => {
  beforeAll(async () => {
    await connectDB()
  })

  afterAll(async () => {
    await disconnectDB()
  })

  // Test valid consultation object
  it('should validate a complete valid consultation object', () => {
    const validConsultation = {
      patient_id: 12345,
      doctor_id: 67890,
      booked_date_time: new Date(),
      status: 'scheduled',
      reason: 'Annual checkup',
      created_by: '507f1f77bcf86cd799439011', // Valid ObjectId
      appointment_type: 'regular',
      actual_start_datetime: new Date(),
      remark: 'Patient is doing well',
      diagnosis: ['Common cold', 'Slight fever'],
      prescription: [101, 102, 103],
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
      ],
      bill_id: '507f1f77bcf86cd799439012', // Valid ObjectId
      recordedAt: new Date()
    }

    const { error } = ConsultationJoiSchema.validate(validConsultation)
    expect(error).toBeUndefined()
  })

  it('should validate a minimal valid consultation object', () => {
    const minimalConsultation = {} // All fields are optional

    const { error } = ConsultationJoiSchema.validate(minimalConsultation)
    expect(error).toBeUndefined()
  })

  // Test field-specific validations
  describe('Field validations', () => {
    it('should validate patient_id correctly', () => {
      // Valid patient_id
      let result = ConsultationJoiSchema.validate({ patient_id: 12345 })
      expect(result.error).toBeUndefined()

      // Invalid patient_id (not an integer)
      result = ConsultationJoiSchema.validate({ patient_id: 'abc' })
      expect(result.error).toBeDefined()
      expect(result.error.message).toContain('patient_id')

      // Invalid patient_id (decimal)
      result = ConsultationJoiSchema.validate({ patient_id: 123.45 })
      expect(result.error).toBeDefined()
      expect(result.error.message).toContain('patient_id')
    })

    it('should validate doctor_id correctly', () => {
      // Valid doctor_id
      let result = ConsultationJoiSchema.validate({ doctor_id: 67890 })
      expect(result.error).toBeUndefined()

      // Invalid doctor_id (not an integer)
      result = ConsultationJoiSchema.validate({ doctor_id: 'abc' })
      expect(result.error).toBeDefined()
      expect(result.error.message).toContain('doctor_id')
    })

    it('should validate dates correctly', () => {
      // Valid dates
      let result = ConsultationJoiSchema.validate({ 
        booked_date_time: new Date(),
        actual_start_datetime: new Date(),
        recordedAt: new Date()
      })
      expect(result.error).toBeUndefined()

      // Invalid date (string instead of date)
      result = ConsultationJoiSchema.validate({ booked_date_time: 'tomorrow' })
      expect(result.error).toBeDefined()
      expect(result.error.message).toContain('booked_date_time')

      // Valid date (string that can be parsed to date)
      result = ConsultationJoiSchema.validate({ booked_date_time: '2025-04-16' })
      expect(result.error).toBeUndefined()
    })

    it('should validate status with allowed values', () => {
      // Valid status values
      const validStatuses = ['scheduled', 'ongoing', 'completed', 'cancelled']
      
      for (const status of validStatuses) {
        const result = ConsultationJoiSchema.validate({ status })
        expect(result.error).toBeUndefined()
      }

      // Invalid status
      const result = ConsultationJoiSchema.validate({ status: 'unknown' })
      expect(result.error).toBeDefined()
      expect(result.error.message).toContain('status')
    })

    it('should validate appointment_type with allowed values', () => {
      // Valid appointment types
      const validTypes = ['regular', 'follow-up', 'emergency', 'consultation']
      
      for (const type of validTypes) {
        const result = ConsultationJoiSchema.validate({ appointment_type: type })
        expect(result.error).toBeUndefined()
      }

      // Invalid appointment type
      const result = ConsultationJoiSchema.validate({ appointment_type: 'walk-in' })
      expect(result.error).toBeDefined()
      expect(result.error.message).toContain('appointment_type')
    })

    it('should validate object IDs correctly', () => {
      // Valid ObjectId
      let result = ConsultationJoiSchema.validate({ 
        created_by: '507f1f77bcf86cd799439011',
        bill_id: '507f1f77bcf86cd799439012'
      })
      expect(result.error).toBeUndefined()

      // Invalid ObjectId (too short)
      result = ConsultationJoiSchema.validate({ created_by: '123' })
      expect(result.error).toBeDefined()
      expect(result.error.message).toContain('created_by must be a valid ObjectId')

      // Invalid ObjectId (non-hex characters)
      result = ConsultationJoiSchema.validate({ bill_id: '507f1f77bcf86cd79943901Z' })
      expect(result.error).toBeDefined()
      expect(result.error.message).toContain('bill_id')
    })

    it('should validate diagnosis array correctly', () => {
      // Valid diagnosis array
      let result = ConsultationJoiSchema.validate({ diagnosis: ['Fever', 'Cough'] })
      expect(result.error).toBeUndefined()

      // Empty array is valid
      result = ConsultationJoiSchema.validate({ diagnosis: [] })
      expect(result.error).toBeUndefined()

      // Invalid (not an array)
      result = ConsultationJoiSchema.validate({ diagnosis: 'Fever' })
      expect(result.error).toBeDefined()
      expect(result.error.message).toContain('diagnosis')
    })

    it('should validate prescription array correctly', () => {
      // Valid prescription array of integers
      let result = ConsultationJoiSchema.validate({ prescription: [101, 102, 103] })
      expect(result.error).toBeUndefined()

      // Invalid (array with non-integers)
      result = ConsultationJoiSchema.validate({ prescription: [101, 'med-102', 103] })
      expect(result.error).toBeDefined()
      expect(result.error.message).toContain('prescription')
    })

    it('should validate reports array correctly', () => {
      // Valid reports array
      let result = ConsultationJoiSchema.validate({ 
        reports: [
            {
              test_name: 'Blood Test',
              test_type: 'pathology',
              date: new Date(),
              result: 'Normal',
              status: 'pending',
              title: 'Blood Test Report', // Add title
              createdBy: '507f1f77bcf86cd799439011' // Add createdBy
            },
            {
              test_name: 'X-Ray',
              test_type: 'radiology',
              date: new Date(),
              result: 'No abnormalities detected',
              status: 'completed',
              title: 'X-Ray Report', // Add title
              createdBy: '507f1f77bcf86cd799439011' // Add createdBy
            }
          ]
      })
      expect(result.error).toBeUndefined()

      // Empty array is valid
      result = ConsultationJoiSchema.validate({ reports: [] })
      expect(result.error).toBeUndefined()

      // We can't fully test report validation since we're mocking ReportJoiSchema
      // Complete testing of reports would depend on the actual ReportJoiSchema implementation
    })
  })

  // Test handling of multiple fields together
  it('should validate combinations of fields correctly', () => {
    const consultation = {
      patient_id: 12345,
      doctor_id: 67890,
      status: 'scheduled',
      appointment_type: 'regular',
      diagnosis: ['Common cold'],
      prescription: [101, 102]
    }

    const { error } = ConsultationJoiSchema.validate(consultation)
    expect(error).toBeUndefined()
  })

  // Test handling of extraneous fields
  it('should reject extraneous fields by default', () => {
    const consultationWithExtra = {
      patient_id: 12345,
      extra_field: 'should not be here'
    }

    const { error } = ConsultationJoiSchema.validate(consultationWithExtra)
    expect(error).toBeDefined()
    expect(error.message).toContain('extra_field')
  })

  // Test with allowUnknown option
  it('should allow extraneous fields when configured', () => {
    const consultationWithExtra = {
      patient_id: 12345,
      extra_field: 'should not be here'
    }

    const { error } = ConsultationJoiSchema.validate(consultationWithExtra, { allowUnknown: true })
    expect(error).toBeUndefined()
  })
})
