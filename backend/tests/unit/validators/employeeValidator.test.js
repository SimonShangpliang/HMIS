import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { EmployeeJoiSchema, BankDetailsJoiSchema } from '../../../validators/employeeValidator.js'
import { connectDB, disconnectDB } from '../../helpers/db.js'

describe('Employee Validator Schemas', () => {
  beforeAll(async () => {
    await connectDB()
  })

  afterAll(async () => {
    await disconnectDB()
  })

  // --- BankDetailsJoiSchema ---
  describe('BankDetailsJoiSchema', () => {
    it('should validate a complete valid bank details object', () => {
      const bankDetails = {
        bank_name: 'HDFC Bank',
        account_number: 12345678901,
        ifsc_code: 'HDFC0123456',
        branch_name: 'Main Branch',
        balance: 50000
      }
      const { error } = BankDetailsJoiSchema.validate(bankDetails, { abortEarly: false })
      expect(error).toBeUndefined()
    })

    it('should allow empty bank details object', () => {
      const { error } = BankDetailsJoiSchema.validate({}, { abortEarly: false })
      expect(error).toBeUndefined()
    })

    it('should reject invalid IFSC code format', () => {
      const bankDetails = {
        bank_name: 'HDFC Bank',
        account_number: 12345678901,
        ifsc_code: 'INVALID123', // Invalid format
        branch_name: 'Main Branch'
      }
      const { error } = BankDetailsJoiSchema.validate(bankDetails, { abortEarly: false })
      expect(error).toBeDefined()
      expect(error.details[0].message).toMatch(/Invalid IFSC code format/)
    })

    it('should reject negative balance', () => {
      const bankDetails = {
        bank_name: 'HDFC Bank',
        balance: -100
      }
      const { error } = BankDetailsJoiSchema.validate(bankDetails, { abortEarly: false })
      expect(error).toBeDefined()
      expect(error.details[0].path).toContain('balance')
    })

    it('should reject non-integer account number', () => {
      const bankDetails = {
        account_number: 'ABC12345'
      }
      const { error } = BankDetailsJoiSchema.validate(bankDetails, { abortEarly: false })
      expect(error).toBeDefined()
      expect(error.details[0].path).toContain('account_number')
    })
  })

  // --- EmployeeJoiSchema ---
  describe('EmployeeJoiSchema', () => {
    it('should validate a complete valid employee object', () => {
      const employee = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        profile_pic: 'https://example.com/profile.jpg',
        role: 'doctor',
        dept_id: '507f1f77bcf86cd799439011',
        phone_number: '9876543210',
        address: '123 Main St, City',
        date_of_birth: new Date('1990-01-01'),
        date_of_joining: new Date('2020-01-01'),
        gender: 'male',
        salary: 50000,
        bank_details: {
          bank_name: 'HDFC Bank',
          account_number: 12345678901,
          ifsc_code: 'HDFC0123456',
          branch_name: 'Main Branch',
          balance: 50000
        }
      }
      const { error } = EmployeeJoiSchema.validate(employee, { abortEarly: false })
      expect(error).toBeUndefined()
    })

    it('should validate a minimal valid employee object', () => {
      const { error } = EmployeeJoiSchema.validate({}, { abortEarly: false })
      expect(error).toBeUndefined()
    })

    it('should reject name shorter than 3 characters', () => {
      const employee = {
        name: 'Jo'
      }
      const { error } = EmployeeJoiSchema.validate(employee, { abortEarly: false })
      expect(error).toBeDefined()
      expect(error.details[0].path).toContain('name')
    })

    it('should reject invalid email format', () => {
      const employee = {
        email: 'not-an-email'
      }
      const { error } = EmployeeJoiSchema.validate(employee, { abortEarly: false })
      expect(error).toBeDefined()
      expect(error.details[0].path).toContain('email')
    })

    it('should reject password shorter than 6 characters', () => {
      const employee = {
        password: '12345'
      }
      const { error } = EmployeeJoiSchema.validate(employee, { abortEarly: false })
      expect(error).toBeDefined()
      expect(error.details[0].path).toContain('password')
    })

    it('should reject invalid profile_pic URL', () => {
      const employee = {
        profile_pic: 'not-a-url'
      }
      const { error } = EmployeeJoiSchema.validate(employee, { abortEarly: false })
      expect(error).toBeDefined()
      expect(error.details[0].path).toContain('profile_pic')
    })

    it('should allow empty profile_pic', () => {
      const employee = {
        profile_pic: ''
      }
      const { error } = EmployeeJoiSchema.validate(employee, { abortEarly: false })
      expect(error).toBeUndefined()
    })

    it('should reject invalid role', () => {
      const employee = {
        role: 'manager' // Not in allowed roles
      }
      const { error } = EmployeeJoiSchema.validate(employee, { abortEarly: false })
      expect(error).toBeDefined()
      expect(error.details[0].path).toContain('role')
    })

    it('should validate all allowed roles', () => {
      const roles = ['doctor', 'nurse', 'pharmacist', 'receptionist', 'admin', 'pathologist', 'driver']
      
      for (const role of roles) {
        const { error } = EmployeeJoiSchema.validate({ role }, { abortEarly: false })
        expect(error).toBeUndefined()
      }
    })

    it('should reject invalid dept_id format', () => {
      const employee = {
        dept_id: 'not-an-objectid'
      }
      const { error } = EmployeeJoiSchema.validate(employee, { abortEarly: false })
      expect(error).toBeDefined()
      expect(error.details[0].message).toMatch(/dept_id must be a valid ObjectId/)
    })

    it('should reject invalid phone_number format', () => {
      const employee = {
        phone_number: '123456' // Not 10 digits
      }
      const { error } = EmployeeJoiSchema.validate(employee, { abortEarly: false })
      expect(error).toBeDefined()
      expect(error.details[0].message).toMatch(/Phone number must be 10 digits/)
    })

    it('should reject future date_of_birth', () => {
      const future = new Date()
      future.setFullYear(future.getFullYear() + 1)
      
      const employee = {
        date_of_birth: future
      }
      const { error } = EmployeeJoiSchema.validate(employee, { abortEarly: false })
      expect(error).toBeDefined()
      expect(error.details[0].message).toMatch(/Date of birth must be in the past/)
    })

    it('should reject negative salary', () => {
      const employee = {
        salary: -1000
      }
      const { error } = EmployeeJoiSchema.validate(employee, { abortEarly: false })
      expect(error).toBeDefined()
      expect(error.details[0].path).toContain('salary')
    })

    it('should reject invalid gender', () => {
      const employee = {
        gender: 'other' // Not in allowed values
      }
      const { error } = EmployeeJoiSchema.validate(employee, { abortEarly: false })
      expect(error).toBeDefined()
      expect(error.details[0].path).toContain('gender')
    })

    it('should validate nested bank_details', () => {
      const employee = {
        name: 'Jane Doe',
        bank_details: {
          bank_name: 'ICICI Bank',
          account_number: 98765432101,
          ifsc_code: 'INVALID' // Invalid IFSC
        }
      }
      const { error } = EmployeeJoiSchema.validate(employee, { abortEarly: false })
      expect(error).toBeDefined()
      expect(error.details[0].path).toContain('bank_details')
      expect(error.details[0].path).toContain('ifsc_code')
    })
  })
})
