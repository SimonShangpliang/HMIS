// tests/unit/models/patient.test.js
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import Patient from '../../../models/patient.js';
import { connectDB, disconnectDB, syncIndexes } from '../../helpers/db.js';

describe('Patient Model - Unit Tests', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    await Patient.deleteMany({});
    await syncIndexes();
  });

  it('should create a valid patient with minimum required fields', async () => {
    const patientData = {
      name: 'John Doe',
      email: 'john@example.com',
      aadhar_number: '123456789012',
      phone_number: '9876543210',
      gender: 'male'
    };

    const patient = new Patient(patientData);
    const savedPatient = await patient.save();

    expect(savedPatient._id).toBeDefined();
    expect(savedPatient._id).toBeGreaterThanOrEqual(10000);
    expect(savedPatient.name).toBe(patientData.name);
    expect(savedPatient.email).toBe(patientData.email);
    expect(savedPatient.aadhar_number).toBe(patientData.aadhar_number);
  });

  it('should validate gender enum values', async () => {
    const patientWithInvalidGender = new Patient({
      name: 'Jane Doe',
      email: 'jane@example.com',
      aadhar_number: '123456789013',
      phone_number: '9876543211',
      gender: 'invalid-gender' // Invalid enum value
    });

    await expect(patientWithInvalidGender.save()).rejects.toThrow();
  });

  it('should enforce unique email constraint', async () => {
    // Create first patient
    const firstPatient = new Patient({
      name: 'First Patient',
      email: 'duplicate@example.com',
      aadhar_number: '123456789014',
      phone_number: '9876543212',
      gender: 'male'
    });
    await firstPatient.save();

    // Create second patient with same email
    const secondPatient = new Patient({
      name: 'Second Patient',
      email: 'duplicate@example.com', // Same email
      aadhar_number: '123456789015',
      phone_number: '9876543213',
      gender: 'female'
    });

    await expect(secondPatient.save()).rejects.toThrow();
  });

  it('should enforce unique aadhar number constraint', async () => {
    // Create first patient
    const firstPatient = new Patient({
      name: 'First Patient',
      email: 'first@example.com',
      aadhar_number: '123456789016',
      phone_number: '9876543214',
      gender: 'male'
    });
    await firstPatient.save();

    // Create second patient with same aadhar
    const secondPatient = new Patient({
      name: 'Second Patient',
      email: 'second@example.com',
      aadhar_number: '123456789016', // Same aadhar
      phone_number: '9876543215',
      gender: 'female'
    });

    await expect(secondPatient.save()).rejects.toThrow();
  });

  it('should validate patient_info fields', async () => {
    const patientWithInfo = new Patient({
      name: 'Patient With Info',
      email: 'info@example.com',
      aadhar_number: '123456789017',
      phone_number: '9876543216',
      gender: 'male',
      patient_info: {
        age: 30,
        height: 175,
        weight: 70,
        bloodGrp: 'O+', // Valid enum value
        familyHistory: 'No significant history'
      }
    });

    const savedPatient = await patientWithInfo.save();
    expect(savedPatient.patient_info.bloodGrp).toBe('O+');
    expect(savedPatient.patient_info.age).toBe(30);
  });

  it('should reject invalid blood group in patient_info', async () => {
    const patientWithInvalidBloodGroup = new Patient({
      name: 'Invalid Blood Group',
      email: 'blood@example.com',
      aadhar_number: '123456789018',
      phone_number: '9876543217',
      gender: 'female',
      patient_info: {
        bloodGrp: 'Z-' // Invalid blood group
      }
    });

    await expect(patientWithInvalidBloodGroup.save()).rejects.toThrow();
  });

  it('should add vital signs to patient record', async () => {
    const patient = new Patient({
      name: 'Vitals Patient',
      email: 'vitals@example.com',
      aadhar_number: '123456789019',
      phone_number: '9876543218',
      gender: 'male',
      vitals: [{
        date: new Date(),
        time: '14:30',
        bloodPressure: 120,
        bodyTemp: 98.6,
        pulseRate: 72,
        breathingRate: 16
      }]
    });

    const savedPatient = await patient.save();
    expect(savedPatient.vitals).toHaveLength(1);
    expect(savedPatient.vitals[0].bloodPressure).toBe(120);
  });

  it('should auto-increment patient IDs', async () => {
    // Create first patient
    const firstPatient = new Patient({
      name: 'Auto ID Test 1',
      email: 'auto1@example.com',
      aadhar_number: '123456789020',
      phone_number: '9876543219',
      gender: 'male'
    });
    const savedFirst = await firstPatient.save();
    const firstId = savedFirst._id;

    // Create second patient
    const secondPatient = new Patient({
      name: 'Auto ID Test 2',
      email: 'auto2@example.com',
      aadhar_number: '123456789021',
      phone_number: '9876543220',
      gender: 'female'
    });
    const savedSecond = await secondPatient.save();
    const secondId = savedSecond._id;

    // Verify auto-increment
    expect(secondId).toBe(firstId + 1);
  });
});
