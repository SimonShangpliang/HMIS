import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { ReportJoiSchema } from '../../../validators/reportValidator.js'
import { connectDB, disconnectDB } from '../../helpers/db.js'

describe('ReportJoiSchema Validator', () => {
  beforeAll(async () => {
    await connectDB()
  })

  afterAll(async () => {
    await disconnectDB()
  })

  // Test valid report object
  it('should validate a complete valid report object', () => {
    const validReport = {
      status: 'pending',
      reportText: 'Some findings',
      title: 'Blood Test',
      description: 'Routine blood test',
      createdBy: '507f1f77bcf86cd799439011'
    }
    const { error } = ReportJoiSchema.validate(validReport, { abortEarly: false })
    expect(error).toBeUndefined()
  })

  it('should validate a minimal valid report object', () => {
    const minimalReport = {
      status: 'completed',
      title: 'ECG',
      createdBy: '507f1f77bcf86cd799439011'
    }
    const { error } = ReportJoiSchema.validate(minimalReport, { abortEarly: false })
    expect(error).toBeUndefined()
  })

  // Field-specific validations
  describe('Field validations', () => {
    it('should require status, title, and createdBy', () => {
      const { error } = ReportJoiSchema.validate({}, { abortEarly: false })
      expect(error).toBeDefined()
      const messages = error.details.map(d => d.message)
      expect(messages.some(m => m.includes('"status" is required'))).toBe(true)
      expect(messages.some(m => m.includes('"title" is required'))).toBe(true)
      expect(messages.some(m => m.includes('"createdBy" is required'))).toBe(true)
    })

    it('should only allow status to be "pending" or "completed"', () => {
      const { error } = ReportJoiSchema.validate({
        status: 'archived',
        title: 'Urine Test',
        createdBy: '507f1f77bcf86cd799439011'
      }, { abortEarly: false })
      expect(error).toBeDefined()
      expect(error.details[0].message).toMatch(/must be one of/)
    })

    it('should require title to be at least 3 characters', () => {
      const { error } = ReportJoiSchema.validate({
        status: 'pending',
        title: 'AB',
        createdBy: '507f1f77bcf86cd799439011'
      }, { abortEarly: false })
      expect(error).toBeDefined()
      expect(error.details[0].message).toMatch(/length must be at least 3 characters long/)
    })

    it('should allow empty reportText and description', () => {
      const { error } = ReportJoiSchema.validate({
        status: 'pending',
        title: 'X-ray',
        reportText: '',
        description: '',
        createdBy: '507f1f77bcf86cd799439011'
      }, { abortEarly: false })
      expect(error).toBeUndefined()
    })

    it('should allow unknown fields', () => {
      const { error, value } = ReportJoiSchema.validate({
        status: 'completed',
        title: 'Ultrasound',
        createdBy: '507f1f77bcf86cd799439011',
        extraField: 'extra'
      }, { abortEarly: false })
      expect(error).toBeUndefined()
      expect(value.extraField).toBe('extra')
    })

    it('should show custom message for invalid createdBy (type)', () => {
      const { error } = ReportJoiSchema.validate({
        status: 'pending',
        title: 'Valid Title',
        createdBy: 12345 // Not a string
      }, { abortEarly: false })
      expect(error).toBeDefined()
      expect(error.details[0].message).toMatch(/must be a string/)
    })
  })

  // Test handling of extraneous fields
  it('should allow extraneous fields due to unknown(true)', () => {
    const reportWithExtra = {
      status: 'pending',
      title: 'Blood Test',
      createdBy: '507f1f77bcf86cd799439011',
      extra_field: 'should be here'
    }
    const { error } = ReportJoiSchema.validate(reportWithExtra, { abortEarly: false })
    expect(error).toBeUndefined()
  })
})
