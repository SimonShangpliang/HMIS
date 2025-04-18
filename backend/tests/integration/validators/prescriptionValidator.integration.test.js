import { describe, it, expect } from 'vitest'
import { PrescriptionJoiSchema } from '../../../validators/prescriptionValidator.js'

describe('Integration: PrescriptionJoiSchema Validator', () => {
  it('should accept a valid prescription payload', () => {
    const payload = {
      prescriptionDate: new Date(),
      status: 'dispensed',
      entries: [
        {
          medicine_id: 201,
          dosage: '10ml',
          frequency: 'once a day',
          duration: '7 days',
          quantity: 7,
          dispensed_qty: 7
        }
      ]
    }
    const { error, value } = PrescriptionJoiSchema.validate(payload, { abortEarly: false })
    expect(error).toBeUndefined()
    expect(value.entries).toHaveLength(1)
  })

  it('should reject payload missing required fields', () => {
    const payload = {}
    const { error } = PrescriptionJoiSchema.validate(payload, { abortEarly: false })
    expect(error).toBeDefined()
    const missingFields = error.details.map(d => d.path[0])
    expect(missingFields).toEqual(expect.arrayContaining(['status', 'entries']))
  })

  it('should reject invalid status', () => {
    const payload = {
      status: 'unknown',
      entries: [
        {
          medicine_id: 1,
          dosage: '10mg',
          frequency: 'once',
          duration: '1 day'
        }
      ]
    }
    const { error } = PrescriptionJoiSchema.validate(payload, { abortEarly: false })
    expect(error).toBeDefined()
    expect(error.details[0].path).toContain('status')
  })

  it('should reject non-array or empty array for entries', () => {
    let payload = {
      status: 'pending',
      entries: []
    }
    let { error } = PrescriptionJoiSchema.validate(payload, { abortEarly: false })
    expect(error).toBeDefined()
    expect(error.details[0].path).toContain('entries')

    payload = {
      status: 'pending',
      entries: 'not-an-array'
    }
    error = PrescriptionJoiSchema.validate(payload, { abortEarly: false }).error
    expect(error).toBeDefined()
    expect(error.details[0].path).toContain('entries')
  })

  it('should reject invalid prescription entry in entries', () => {
    const payload = {
      status: 'pending',
      entries: [
        {
          medicine_id: 1,
          dosage: '',
          frequency: '',
          duration: ''
        }
      ]
    }
    const { error } = PrescriptionJoiSchema.validate(payload, { abortEarly: false })
    expect(error).toBeDefined()
    const entryErrors = error.details.filter(d => d.path.includes('entries'))
    expect(entryErrors.length).toBeGreaterThan(0)
  })

  it('should accept multiple valid entries', () => {
    const payload = {
      status: 'partially_dispensed',
      entries: [
        {
          medicine_id: 1,
          dosage: '10mg',
          frequency: 'once',
          duration: '1 day'
        },
        {
          medicine_id: 2,
          dosage: '5mg',
          frequency: 'twice',
          duration: '2 days'
        }
      ]
    }
    const { error } = PrescriptionJoiSchema.validate(payload, { abortEarly: false })
    expect(error).toBeUndefined()
  })
})
