import { describe, it, expect } from 'vitest';
import Employee from '../../../models/employee.js';

describe('Employee Model - Unit', () => {
  it('should validate role enum values', async () => {
    const employee = new Employee({
      name: 'John Doe',
      role: 'invalid-role'
    });
    await expect(employee.validate()).rejects.toThrow(/`invalid-role` is not a valid enum/);
  });

  it('should validate blood group enum values', async () => {
    const employee = new Employee({
      name: 'Jane Smith',
      bloodGrp: 'XYZ+'
    });
    await expect(employee.validate()).rejects.toThrow(/`XYZ\+` is not a valid enum/);
  });

  it('should validate gender enum values', async () => {
    const employee = new Employee({
      name: 'Alex Johnson',
      gender: 'unknown'
    });
    await expect(employee.validate()).rejects.toThrow(/`unknown` is not a valid enum/);
  });

  it('should handle auto-increment configuration', () => {
    const employee = new Employee({ name: 'Auto Inc Test' });
    expect(employee._id).toBeUndefined(); // Auto-increment occurs on save
  });

  it('should accept valid embedded bank details', () => {
    const employee = new Employee({
      name: 'Bank Test',
      bank_details: {
        bank_name: 'Test Bank',
        account_number: 1234567890,
        ifsc_code: 'TEST0001',
        branch_name: 'Main Branch',
        balance: 10000
      }
    });
    expect(employee.bank_details.bank_name).toBe('Test Bank');
    expect(employee.bank_details.account_number).toBe(1234567890);
  });
});
