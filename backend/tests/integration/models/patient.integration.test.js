// tests/integration/models/patient.integration.test.js
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import Patient from '../../../models/patient.js';
import { connectDB, disconnectDB, syncIndexes } from '../../helpers/db.js';

describe('Patient Model - Integration Tests', () => {
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

  it('should perform complete CRUD operations', async () => {
    // CREATE
    const newPatient = new Patient({
      name: 'CRUD Test',
      email: 'crud@example.com',
      aadhar_number: '123456789022',
      phone_number: '9876543221',
      gender: 'male',
      date_of_birth: new Date('1990-01-01'),
      address: '123 Test Street'
    });
    const savedPatient = await newPatient.save();
    expect(savedPatient._id).toBeDefined();
    
    // READ
    const foundPatient = await Patient.findById(savedPatient._id);
    expect(foundPatient).not.toBeNull();
    expect(foundPatient.name).toBe('CRUD Test');
    
    // UPDATE
    foundPatient.name = 'Updated Name';
    const updatedPatient = await foundPatient.save();
    expect(updatedPatient.name).toBe('Updated Name');
    
    // DELETE
    await Patient.findByIdAndDelete(savedPatient._id);
    const deletedPatient = await Patient.findById(savedPatient._id);
    expect(deletedPatient).toBeNull();
  });

  it('should handle updating embedded patient_info', async () => {
    // Create patient with initial info
    const patient = new Patient({
      name: 'Embedded Doc Test',
      email: 'embedded@example.com',
      aadhar_number: '123456789023',
      phone_number: '9876543222',
      gender: 'female',
      patient_info: {
        age: 25,
        height: 165,
        weight: 60,
        bloodGrp: 'A+',
      }
    });
    await patient.save();

    // Update embedded document
    const foundPatient = await Patient.findOne({ email: 'embedded@example.com' });
    foundPatient.patient_info.weight = 62; // Patient gained weight
    foundPatient.patient_info.bloodGrp = 'A-'; // Corrected blood group
    await foundPatient.save();

    // Verify update
    const updatedPatient = await Patient.findOne({ email: 'embedded@example.com' });
    expect(updatedPatient.patient_info.weight).toBe(62);
    expect(updatedPatient.patient_info.bloodGrp).toBe('A-');
  });

  it('should add new vitals to existing patient', async () => {
    // Create patient
    const patient = new Patient({
      name: 'Vitals Update Test',
      email: 'vitals-update@example.com',
      aadhar_number: '123456789024',
      phone_number: '9876543223',
      gender: 'male',
      vitals: [{
        date: new Date('2025-04-01'),
        time: '09:00',
        bloodPressure: 120,
        bodyTemp: 98.6,
        pulseRate: 70,
        breathingRate: 14
      }]
    });
    await patient.save();

    // Add new vitals
    const foundPatient = await Patient.findOne({ email: 'vitals-update@example.com' });
    foundPatient.vitals.push({
      date: new Date('2025-04-02'),
      time: '10:00',
      bloodPressure: 122,
      bodyTemp: 98.8,
      pulseRate: 72,
      breathingRate: 15
    });
    await foundPatient.save();

    // Verify update
    const updatedPatient = await Patient.findOne({ email: 'vitals-update@example.com' });
    expect(updatedPatient.vitals).toHaveLength(2);
    expect(updatedPatient.vitals[1].bloodPressure).toBe(122);
  });

  it('should query patients by various criteria', async () => {
    // Create test data
    await Patient.create([
      {
        name: 'John Smith',
        email: 'john@example.com',
        aadhar_number: '123456789025',
        phone_number: '9876543224',
        gender: 'male',
        date_of_birth: new Date('1980-05-15'),
        patient_info: { age: 45, bloodGrp: 'O+' }
      },
      {
        name: 'Mary Johnson',
        email: 'mary@example.com',
        aadhar_number: '123456789026',
        phone_number: '9876543225',
        gender: 'female',
        date_of_birth: new Date('1990-10-20'),
        patient_info: { age: 35, bloodGrp: 'B+' }
      },
      {
        name: 'Robert Williams',
        email: 'robert@example.com',
        aadhar_number: '123456789027',
        phone_number: '9876543226',
        gender: 'male',
        date_of_birth: new Date('1975-12-05'),
        patient_info: { age: 50, bloodGrp: 'A-' }
      }
    ]);

    // Query by gender
    const malePatients = await Patient.find({ gender: 'male' });
    expect(malePatients).toHaveLength(2);

    // Query by age range
    const middleAgedPatients = await Patient.find({ 
      'patient_info.age': { $gte: 40, $lte: 50 } 
    });
    expect(middleAgedPatients).toHaveLength(2);

    // Query by blood group
    const oPositivePatients = await Patient.find({ 'patient_info.bloodGrp': 'O+' });
    expect(oPositivePatients).toHaveLength(1);
    expect(oPositivePatients[0].name).toBe('John Smith');
  });

  it('should allow adding insurance references', async () => {
    // Create a patient
    const patient = new Patient({
      name: 'Insurance Test',
      email: 'insurance@example.com',
      aadhar_number: '123456789028',
      phone_number: '9876543227',
      gender: 'female'
    });
    await patient.save();

    // Add insurance references (mock ObjectIds)
    const insuranceId1 = new mongoose.Types.ObjectId();
    const insuranceId2 = new mongoose.Types.ObjectId();
    
    patient.insurance_details = [insuranceId1, insuranceId2];
    await patient.save();

    // Verify
    const updatedPatient = await Patient.findOne({ email: 'insurance@example.com' });
    expect(updatedPatient.insurance_details).toHaveLength(2);
    expect(updatedPatient.insurance_details[0].toString()).toBe(insuranceId1.toString());
  });

  it('should maintain createdAt and updatedAt timestamps', async () => {
    // Create patient
    const patient = new Patient({
      name: 'Timestamp Test',
      email: 'timestamp@example.com',
      aadhar_number: '123456789029',
      phone_number: '9876543228',
      gender: 'male'
    });
    const saved = await patient.save();
    
    expect(saved.createdAt).toBeInstanceOf(Date);
    expect(saved.updatedAt).toBeInstanceOf(Date);
    
    // Verify timestamps are updated on changes
    const before = saved.updatedAt;
    
    // Wait briefly to ensure timestamp would change
    await new Promise(resolve => setTimeout(resolve, 10));
    
    saved.name = 'Updated Timestamp';
    const updated = await saved.save();
    
    expect(updated.updatedAt.getTime()).toBeGreaterThan(before.getTime());
    expect(updated.createdAt.getTime()).toBe(saved.createdAt.getTime());
  });
});
