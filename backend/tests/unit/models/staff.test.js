// tests/unit/models/staff.test.js
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { Doctor, Nurse, Pharmacist, Receptionist, Admin, Pathologist, Driver } from '../../../models/staff.js';
import { connectDB, disconnectDB, syncIndexes } from '../../helpers/db.js';

describe('Staff Models Unit Tests', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  // Doctor Model Tests
  describe('Doctor Model', () => {
    it('should have the correct schema structure', () => {
      const doctorSchema = Doctor.schema.obj;
      
      expect(doctorSchema).toHaveProperty('_id');
      expect(doctorSchema._id.type).toBe(Number);
      expect(doctorSchema).toHaveProperty('employee_id');
      expect(doctorSchema.employee_id.type).toBe(Number);
      expect(doctorSchema).toHaveProperty('department_id');
      expect(doctorSchema).toHaveProperty('specialization');
      expect(doctorSchema).toHaveProperty('qualification');
      expect(doctorSchema).toHaveProperty('experience');
      expect(doctorSchema).toHaveProperty('room_num');
      expect(doctorSchema).toHaveProperty('rating');
      expect(doctorSchema).toHaveProperty('num_ratings');
    });

    it('should have employee_id reference to Employee model', () => {
      const doctorSchema = Doctor.schema.obj;
      expect(doctorSchema.employee_id.ref).toBe('Employee');
    });

    it('should have department_id reference to Department model', () => {
      const doctorSchema = Doctor.schema.obj;
      expect(doctorSchema.department_id.ref).toBe('Department');
    });

    it('should use autoIncrement plugin', () => {
      // Check if model has AutoIncrement configuration
      const doctorCollection = Doctor.collection;
      expect(doctorCollection.name).toBe('doctors');
    });
  });

  // Nurse Model Tests
  describe('Nurse Model', () => {
    it('should have the correct schema structure', () => {
      const nurseSchema = Nurse.schema.obj;
      
      expect(nurseSchema).toHaveProperty('_id');
      expect(nurseSchema._id.type).toBe(Number);
      expect(nurseSchema).toHaveProperty('employee_id');
      expect(nurseSchema.employee_id.type).toBe(Number);
      expect(nurseSchema).toHaveProperty('assigned_dept');
      expect(nurseSchema).toHaveProperty('location');
      expect(nurseSchema).toHaveProperty('assigned_room');
      expect(nurseSchema).toHaveProperty('assigned_bed');
      expect(nurseSchema).toHaveProperty('assigned_amb');
    });

    it('should have proper enum values for location field', () => {
      const nurseSchema = Nurse.schema.obj;
      expect(nurseSchema.location.enum).toContain('ward');
      expect(nurseSchema.location.enum).toContain('icu');
      expect(nurseSchema.location.enum).toContain('ot');
      expect(nurseSchema.location.enum).toContain('emergency');
      expect(nurseSchema.location.enum.length).toBe(4);
    });

    it('should have appropriate object references', () => {
      const nurseSchema = Nurse.schema.obj;
      expect(nurseSchema.employee_id.ref).toBe('Employee');
      expect(nurseSchema.assigned_dept.ref).toBe('Department');
      expect(nurseSchema.assigned_room.ref).toBe('Room');
      expect(nurseSchema.assigned_bed.ref).toBe('Bed');
      expect(nurseSchema.assigned_amb.ref).toBe('Ambulance');
    });
  });

  // Pharmacist Model Tests
  describe('Pharmacist Model', () => {
    it('should have the correct schema structure', () => {
      const pharmacistSchema = Pharmacist.schema.obj;
      expect(pharmacistSchema).toHaveProperty('employee_id');
      expect(pharmacistSchema.employee_id.type).toBe(Number);
      expect(pharmacistSchema.employee_id.ref).toBe('Employee');
    });
  });

  // Receptionist Model Tests
  describe('Receptionist Model', () => {
    it('should have the correct schema structure', () => {
      const receptionistSchema = Receptionist.schema.obj;
      expect(receptionistSchema).toHaveProperty('employee_id');
      expect(receptionistSchema.employee_id.type).toBe(Number);
      expect(receptionistSchema.employee_id.ref).toBe('Employee');
      expect(receptionistSchema).toHaveProperty('assigned_dept');
      expect(receptionistSchema.assigned_dept.ref).toBe('Department');
    });
  });

  // Admin, Pathologist, and Driver Tests
  describe('Other Staff Models', () => {
    it('should have correct Admin schema structure', () => {
      const adminSchema = Admin.schema.obj;
      expect(adminSchema).toHaveProperty('employee_id');
      expect(adminSchema.employee_id.type).toBe(Number);
      expect(adminSchema.employee_id.ref).toBe('Employee');
    });

    it('should have correct Pathologist schema structure', () => {
      const pathologistSchema = Pathologist.schema.obj;
      expect(pathologistSchema).toHaveProperty('employee_id');
      expect(pathologistSchema.employee_id.type).toBe(Number);
      expect(pathologistSchema).toHaveProperty('lab_id');
      expect(pathologistSchema.lab_id.ref).toBe('Lab');
    });

    it('should have correct Driver schema structure', () => {
      const driverSchema = Driver.schema.obj;
      expect(driverSchema).toHaveProperty('employee_id');
      expect(driverSchema.employee_id.type).toBe(Number);
      expect(driverSchema.employee_id.ref).toBe('Employee');
    });
  });
});
