import { describe, it, expect } from 'vitest'
import { EmployeeJoiSchema } from '../../../validators/employeeValidator.js'

describe('Integration: EmployeeJoiSchema Validator', () => {
  it('should accept a valid employee payload', () => {
    const payload = {
      name: 'Dr. Smith',
      email: 'smith@hospital.com',
      password: 'secure123',
      role: 'doctor',
      dept_id: '507f1f77bcf86cd799439011',
      phone_number: '9876543210',
      date_of_birth: '1985-03-15',
      date_of_joining: '2020-06-01',
      gender: 'male',
      salary: 75000,
      bank_details: {
        bank_name: 'SBI',
        account_number: 12345678901,
        ifsc_code: 'SBIN0123456',
        branch_name: 'Medical Campus Branch'
      }
    }
    const { error, value } = EmployeeJoiSchema.validate(payload, { abortEarly: false })
    expect(error).toBeUndefined()
    expect(value.name).toBe('Dr. Smith')
  })

  it('should reject payload with multiple validation errors', () => {
    const payload = {
      name: 'Jo', // Too short
      email: 'not-an-email',
      role: 'manager', // Invalid role
      phone_number: '12345', // Not 10 digits
      date_of_birth: new Date('2030-01-01'), // Future date
      gender: 'other', // Invalid gender
      salary: -5000, // Negative salary
      bank_details: {
        ifsc_code: 'INVALID' // Invalid IFSC
      }
    }
    const { error } = EmployeeJoiSchema.validate(payload, { abortEarly: false })
    expect(error).toBeDefined()
    
    const errorFields = error.details.map(d => d.path[0])
    expect(errorFields).toEqual(
      expect.arrayContaining(['name', 'email', 'role', 'phone_number', 'date_of_birth', 'gender', 'salary'])
    )
    
    // Check for nested bank_details.ifsc_code error
    const nestedErrors = error.details.filter(d => d.path.length > 1)
    expect(nestedErrors.length).toBeGreaterThan(0)
    expect(nestedErrors[0].path).toContain('ifsc_code')
  })

  it('should accept minimal employee data', () => {
    const payload = {
      name: 'Nurse Johnson',
      role: 'nurse'
    }
    const { error } = EmployeeJoiSchema.validate(payload, { abortEarly: false })
    expect(error).toBeUndefined()
  })

  it('should accept valid ObjectId for dept_id', () => {
    const payload = {
      dept_id: '507f1f77bcf86cd799439011' // Valid ObjectId format
    }
    const { error } = EmployeeJoiSchema.validate(payload, { abortEarly: false })
    expect(error).toBeUndefined()
  })

  it('should reject invalid ObjectId for dept_id', () => {
    const payload = {
      dept_id: 'invalid-id'
    }
    const { error } = EmployeeJoiSchema.validate(payload, { abortEarly: false })
    expect(error).toBeDefined()
    expect(error.details[0].message).toMatch(/dept_id must be a valid ObjectId/)
  })

  it('should accept employee with empty bank_details', () => {
    const payload = {
      name: 'Admin User',
      role: 'admin',
      bank_details: {}
    }
    const { error } = EmployeeJoiSchema.validate(payload, { abortEarly: false })
    expect(error).toBeUndefined()
  })

  it('should validate all allowed roles', () => {
    const roles = ['doctor', 'nurse', 'pharmacist', 'receptionist', 'admin', 'pathologist', 'driver']
    
    for (const role of roles) {
      const { error } = EmployeeJoiSchema.validate({ role }, { abortEarly: false })
      expect(error).toBeUndefined()
    }
  })
})
