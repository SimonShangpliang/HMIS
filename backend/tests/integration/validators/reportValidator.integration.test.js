import { describe, it, expect } from 'vitest'
import { ReportJoiSchema } from '../../../validators/reportValidator.js'

describe('Integration: ReportJoiSchema Validator', () => {
  it('should accept a valid report payload', () => {
    const payload = {
      status: 'completed',
      title: 'MRI Scan',
      createdBy: '507f1f77bcf86cd799439011',
      reportText: 'All clear',
      description: 'MRI scan for patient X',
      extraField: 'should be allowed'
    }
    const { error, value } = ReportJoiSchema.validate(payload, { abortEarly: false })
    expect(error).toBeUndefined()
    expect(value.extraField).toBe('should be allowed')
  })

  it('should reject payload missing required fields', () => {
    const payload = { reportText: 'Missing requireds' }
    const { error } = ReportJoiSchema.validate(payload, { abortEarly: false })
    expect(error).toBeDefined()
    const missingFields = error.details.map(d => d.path[0])
    expect(missingFields).toEqual(expect.arrayContaining(['status', 'title', 'createdBy']))
  })

  it('should reject payload with invalid status', () => {
    const payload = {
      status: 'archived',
      title: 'CT Scan',
      createdBy: '507f1f77bcf86cd799439011'
    }
    const { error } = ReportJoiSchema.validate(payload, { abortEarly: false })
    expect(error).toBeDefined()
    expect(error.details[0].path).toContain('status')
  })

  it('should reject payload with short title', () => {
    const payload = {
      status: 'pending',
      title: 'AB',
      createdBy: '507f1f77bcf86cd799439011'
    }
    const { error } = ReportJoiSchema.validate(payload, { abortEarly: false })
    expect(error).toBeDefined()
    expect(error.details[0].path).toContain('title')
  })

  it('should accept payload with empty description and reportText', () => {
    const payload = {
      status: 'completed',
      title: 'X-ray',
      createdBy: '507f1f77bcf86cd799439011',
      description: '',
      reportText: ''
    }
    const { error } = ReportJoiSchema.validate(payload, { abortEarly: false })
    expect(error).toBeUndefined()
  })
})
