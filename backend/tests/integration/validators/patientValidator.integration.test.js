import { describe, it, expect } from 'vitest'
import { PatientJoiSchema } from '../../../validators/patientValidator.js'

describe('Integration: PatientJoiSchema Validator', () => {
  it('should accept a valid patient payload', () => {
    const payload = {
      name: 'Jane Doe',
      phone_number: '9876543210',
      email: 'jane@example.com',
      patient_info: { age: 28, bloodGrp: 'B+' },
      vitals: [{ date: new Date(), time: '10:30', bloodPressure: '110/70' }]
    }
    const { error, value } = PatientJoiSchema.validate(payload, { abortEarly: false })
    expect(error).toBeUndefined()
    expect(value.name).toBe('Jane Doe')
  })

  it('should reject payload with invalid nested vitals', () => {
    const payload = {
      vitals: [{ date: new Date(), time: 'notatime' }]
    }
    const { error } = PatientJoiSchema.validate(payload, { abortEarly: false })
    expect(error).toBeDefined()
    expect(error.details[0].path).toEqual(['vitals', 0, 'time'])
  })

  it('should reject payload with invalid insurance_details', () => {
    const payload = {
      insurance_details: ['invalidobjectid']
    }
    const { error } = PatientJoiSchema.validate(payload, { abortEarly: false })
    expect(error).toBeDefined()
    expect(error.details[0].path).toEqual(['insurance_details', 0])
  })

  it('should reject invalid phone and email', () => {
    const payload = {
      phone_number: '1234',
      email: 'notanemail'
    }
    const { error } = PatientJoiSchema.validate(payload, { abortEarly: false })
    expect(error).toBeDefined()
    const fields = error.details.map(d => d.path[0])
    expect(fields).toEqual(expect.arrayContaining(['phone_number', 'email']))
  })

  it('should accept empty object as valid', () => {
    const { error } = PatientJoiSchema.validate({}, { abortEarly: false })
    expect(error).toBeUndefined()
  })
})
