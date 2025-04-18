import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import Employee from '../../../models/employee.js';
import { connectDB, disconnectDB } from '../../helpers/db.js';

describe('Employee Model - Integration', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await disconnectDB();
  });

  beforeEach(async () => {
    // 1. Clear all employee documents
    await Employee.deleteMany({});
    
    // 2. PROPERLY reset auto-increment counter
    const counterCollection = mongoose.connection.collection('employee_id_counters');
    await counterCollection.findOneAndUpdate(
      { _id: 'employee_id_counter' },
      { $set: { seq: 9999 } },
      { upsert: true, returnDocument: 'after' }
    );
  });

  it('should save complete employee data with embedded bank details', async () => {
    // FIRST TEST SHOULD GET ID 10000
    const empData = {
      name: 'John Doe',
      email: 'john.doe@hospital.com',
      aadhar_number: '1234-5678-9012',
      role: 'admin',
      bloodGrp: 'O+',
      gender: 'male',
      bank_details: {
        bank_name: 'Test Bank',
        account_number: 1234567890,
        ifsc_code: 'TEST0001',
        branch_name: 'Main Branch',
        balance: 10000
      }
    };

    const emp = await Employee.create(empData);
    expect(emp._id).toBe(10000); // Now this will pass
    expect(emp.bank_details.bank_name).toBe('Test Bank');
  });

  // Other tests remain the same as previous correction
});
