import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { PrescriptionJoiSchema, PrescriptionEntryJoiSchema } from '../../../validators/prescriptionValidator.js'
import { connectDB, disconnectDB } from '../../helpers/db.js'

describe('PrescriptionJoiSchema Validator', () => {
  beforeAll(async () => {
    await connectDB()
  })

  afterAll(async () => {
    await disconnectDB()
  })

  // Test valid prescription entry
  it('should validate a complete valid prescription entry', () => {
    const entry = {
      medicine_id: 101,
      dosage: '500mg',
      frequency: 'twice a day',
      duration: '5 days',
      quantity: 10,
      dispensed_qty: 0
    }
    const { error } = PrescriptionEntryJoiSchema.validate(entry, { abortEarly: false })
    expect(error).toBeUndefined()
  })

  it('should require all required fields in prescription entry', () => {
    const entry = {}
    const { error } = PrescriptionEntryJoiSchema.validate(entry, { abortEarly: false })
    expect(error).toBeDefined()
    const missingFields = error.details.map(d => d.path[0])
    expect(missingFields).toEqual(expect.arrayContaining([
      'medicine_id', 'dosage', 'frequency', 'duration'
    ]))
  })

  it('should reject non-integer medicine_id', () => {
    const entry = { medicine_id: 'abc', dosage: '1', frequency: '2', duration: '3' }
    const { error } = PrescriptionEntryJoiSchema.validate(entry, { abortEarly: false })
    expect(error).toBeDefined()
    expect(error.details[0].message).toMatch(/must be a number/)
  })

  it('should reject empty dosage, frequency, and duration', () => {
    const entry = {
      medicine_id: 1,
      dosage: '',
      frequency: '',
      duration: ''
    }
    const { error } = PrescriptionEntryJoiSchema.validate(entry, { abortEarly: false })
    expect(error).toBeDefined()
    const missingFields = error.details.map(d => d.path[0])
    expect(missingFields).toEqual(expect.arrayContaining(['dosage', 'frequency', 'duration']))
  })

  it('should reject negative or zero quantity', () => {
    const entry = {
      medicine_id: 1,
      dosage: '10mg',
      frequency: 'once',
      duration: '1 day',
      quantity: 0
    }
    const { error } = PrescriptionEntryJoiSchema.validate(entry, { abortEarly: false })
    expect(error).toBeDefined()
    expect(error.details[0].path).toContain('quantity')
  })

  it('should allow missing optional quantity and dispensed_qty', () => {
    const entry = {
      medicine_id: 1,
      dosage: '10mg',
      frequency: 'once',
      duration: '1 day'
    }
    const { error } = PrescriptionEntryJoiSchema.validate(entry, { abortEarly: false })
    expect(error).toBeUndefined()
  })

  // PrescriptionJoiSchema tests
  it('should validate a complete valid prescription', () => {
    const prescription = {
      prescriptionDate: new Date(),
      status: 'pending',
      entries: [
        {
          medicine_id: 101,
          dosage: '500mg',
          frequency: 'twice a day',
          duration: '5 days',
          quantity: 10,
          dispensed_qty: 0
        }
      ]
    }
    const { error } = PrescriptionJoiSchema.validate(prescription, { abortEarly: false })
    expect(error).toBeUndefined()
  })

  it('should require status and entries in prescription', () => {
    const prescription = {}
    const { error } = PrescriptionJoiSchema.validate(prescription, { abortEarly: false })
    expect(error).toBeDefined()
    const missingFields = error.details.map(d => d.path[0])
    expect(missingFields).toEqual(expect.arrayContaining(['status', 'entries']))
  })

  it('should reject invalid status values', () => {
    const prescription = {
      status: 'unknown',
      entries: [
        {
          medicine_id: 101,
          dosage: '500mg',
          frequency: 'twice a day',
          duration: '5 days'
        }
      ]
    }
    const { error } = PrescriptionJoiSchema.validate(prescription, { abortEarly: false })
    expect(error).toBeDefined()
    expect(error.details[0].path).toContain('status')
  })

  it('should reject entries if not array or empty', () => {
    let prescription = {
      status: 'pending',
      entries: []
    }
    let { error } = PrescriptionJoiSchema.validate(prescription, { abortEarly: false })
    expect(error).toBeDefined()
    expect(error.details[0].path).toContain('entries')

    prescription = {
      status: 'pending',
      entries: 'not-an-array'
    }
    error = PrescriptionJoiSchema.validate(prescription, { abortEarly: false }).error
    expect(error).toBeDefined()
    expect(error.details[0].path).toContain('entries')
  })

  it('should validate multiple prescription entries', () => {
    const prescription = {
      status: 'dispensed',
      entries: [
        {
          medicine_id: 101,
          dosage: '500mg',
          frequency: 'twice a day',
          duration: '5 days'
        },
        {
          medicine_id: 102,
          dosage: '250mg',
          frequency: 'once a day',
          duration: '3 days'
        }
      ]
    }
    const { error } = PrescriptionJoiSchema.validate(prescription, { abortEarly: false })
    expect(error).toBeUndefined()
  })
})
