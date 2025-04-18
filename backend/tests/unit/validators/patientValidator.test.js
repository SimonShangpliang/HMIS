import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { PatientJoiSchema, VitalsJoiSchema, PatientInfoJoiSchema } from '../../../validators/patientValidator.js'
import { connectDB, disconnectDB } from '../../helpers/db.js'

describe('Patient Validator Schemas', () => {
  beforeAll(async () => {
    await connectDB()
  })

  afterAll(async () => {
    await disconnectDB()
  })

  // --- VitalsJoiSchema ---
  describe('VitalsJoiSchema', () => {
    it('should validate a complete valid vitals object', () => {
      const vitals = {
        date: new Date(),
        time: '14:30',
        bloodPressure: '120/80',
        bodyTemp: 98.6,
        pulseRate: 75,
        breathingRate: 16
      }
      const { error } = VitalsJoiSchema.validate(vitals, { abortEarly: false })
      expect(error).toBeUndefined()
    })

    it('should require date and time', () => {
      const { error } = VitalsJoiSchema.validate({}, { abortEarly: false })
      expect(error).toBeDefined()
      const missing = error.details.map(d => d.path[0])
      expect(missing).toEqual(expect.arrayContaining(['date', 'time']))
    })

    it('should reject invalid time format', () => {
      const { error } = VitalsJoiSchema.validate({ date: new Date(), time: '2pm' }, { abortEarly: false })
      expect(error).toBeDefined()
      expect(error.details[0].message).toMatch(/Time must be in HH:mm 24-hour format/)
    })

    it('should allow missing optional fields', () => {
      const { error } = VitalsJoiSchema.validate({ date: new Date(), time: '10:00' }, { abortEarly: false })
      expect(error).toBeUndefined()
    })

    it('should reject invalid bloodPressure format', () => {
      const { error } = VitalsJoiSchema.validate({
        date: new Date(),
        time: '08:00',
        bloodPressure: '120-80'
      }, { abortEarly: false })
      expect(error).toBeDefined()
      expect(error.details[0].message).toMatch(/Blood pressure must be in format/)
    })
  })

  // --- PatientInfoJoiSchema ---
  describe('PatientInfoJoiSchema', () => {
    it('should validate a complete valid patient info object', () => {
      const info = {
        age: 30,
        height: 175,
        weight: 70,
        bloodGrp: 'A+',
        familyHistory: 'Diabetes',
        bedNo: 2,
        roomNo: 101,
        other: 'N/A'
      }
      const { error } = PatientInfoJoiSchema.validate(info, { abortEarly: false })
      expect(error).toBeUndefined()
    })

    it('should allow missing optional fields', () => {
      const { error } = PatientInfoJoiSchema.validate({}, { abortEarly: false })
      expect(error).toBeUndefined()
    })

    it('should reject invalid blood group', () => {
      const { error } = PatientInfoJoiSchema.validate({ bloodGrp: 'X+' }, { abortEarly: false })
      expect(error).toBeDefined()
      expect(error.details[0].message).toMatch(/must be one of/)
    })

    it('should reject negative age, height, weight', () => {
      const { error } = PatientInfoJoiSchema.validate({ age: -1, height: -10, weight: -5 }, { abortEarly: false })
      expect(error).toBeDefined()
      const fields = error.details.map(d => d.path[0])
      expect(fields).toEqual(expect.arrayContaining(['age', 'height', 'weight']))
    })

    it('should reject bedNo and roomNo less than 1', () => {
      const { error } = PatientInfoJoiSchema.validate({ bedNo: 0, roomNo: 0 }, { abortEarly: false })
      expect(error).toBeDefined()
      const fields = error.details.map(d => d.path[0])
      expect(fields).toEqual(expect.arrayContaining(['bedNo', 'roomNo']))
    })
  })

  // --- PatientJoiSchema ---
  describe('PatientJoiSchema', () => {
    it('should validate a complete valid patient object', () => {
      const patient = {
        password: 'secret123',
        name: 'John Doe',
        profile_pic: 'https://example.com/pic.jpg',
        phone_number: '9876543210',
        emergency_contact: '9123456789',
        email: 'john@example.com',
        date_of_birth: '1990-01-01',
        aadhar_number: '123456789012',
        gender: 'male',
        address: '123 Main St',
        patient_info: {
          age: 34,
          bloodGrp: 'O+'
        },
        vitals: [
          { date: new Date(), time: '09:00', bloodPressure: '120/80' }
        ],
        insurance_details: ['507f1f77bcf86cd799439011']
      }
      const { error } = PatientJoiSchema.validate(patient, { abortEarly: false })
      expect(error).toBeUndefined()
    })

    it('should allow minimal valid patient object', () => {
      const { error } = PatientJoiSchema.validate({}, { abortEarly: false })
      expect(error).toBeUndefined()
    })

    it('should reject short password', () => {
      const { error } = PatientJoiSchema.validate({ password: '123' }, { abortEarly: false })
      expect(error).toBeDefined()
      expect(error.details[0].path).toContain('password')
    })

    it('should reject short name', () => {
      const { error } = PatientJoiSchema.validate({ name: 'Al' }, { abortEarly: false })
      expect(error).toBeDefined()
      expect(error.details[0].path).toContain('name')
    })

    it('should reject invalid profile_pic url', () => {
      const { error } = PatientJoiSchema.validate({ profile_pic: 'not-a-url' }, { abortEarly: false })
      expect(error).toBeDefined()
      expect(error.details[0].path).toContain('profile_pic')
    })

    it('should reject invalid phone_number and emergency_contact', () => {
      const { error } = PatientJoiSchema.validate({
        phone_number: '12345',
        emergency_contact: 'abc'
      }, { abortEarly: false })
      expect(error).toBeDefined()
      const fields = error.details.map(d => d.path[0])
      expect(fields).toEqual(expect.arrayContaining(['phone_number', 'emergency_contact']))
    })

    it('should reject future date_of_birth', () => {
      const future = new Date(Date.now() + 24 * 3600 * 1000)
      const { error } = PatientJoiSchema.validate({ date_of_birth: future }, { abortEarly: false })
      expect(error).toBeDefined()
      expect(error.details[0].message).toMatch(/Date of birth must be in the past/)
    })

    it('should reject invalid aadhar_number', () => {
      const { error } = PatientJoiSchema.validate({ aadhar_number: '123' }, { abortEarly: false })
      expect(error).toBeDefined()
      expect(error.details[0].path).toContain('aadhar_number')
    })

    it('should reject invalid gender', () => {
      const { error } = PatientJoiSchema.validate({ gender: 'other' }, { abortEarly: false })
      expect(error).toBeDefined()
      expect(error.details[0].path).toContain('gender')
    })

    it('should reject invalid insurance_details ObjectId', () => {
      const { error } = PatientJoiSchema.validate({ insurance_details: ['notanobjectid'] }, { abortEarly: false })
      expect(error).toBeDefined()
      expect(error.details[0].path).toEqual(['insurance_details', 0])
    })

    it('should reject invalid nested vitals', () => {
      const { error } = PatientJoiSchema.validate({
        vitals: [{ date: new Date(), time: 'not-a-time' }]
      }, { abortEarly: false })
      expect(error).toBeDefined()
      expect(error.details[0].path).toEqual(['vitals', 0, 'time'])
    })
  })
})
