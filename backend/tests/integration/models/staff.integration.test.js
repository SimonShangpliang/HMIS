// tests/integration/models/staff.integration.test.js
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { Doctor, Nurse, Pharmacist, Receptionist, Admin, Pathologist, Driver } from '../../../models/staff.js';
import { connectDB, disconnectDB, syncIndexes } from '../../helpers/db.js';

// Mock IDs for testing
const mockEmployeeId = 12345;
const mockDepartmentId = new mongoose.Types.ObjectId();
const mockRoomId = new mongoose.Types.ObjectId();
const mockBedId = new mongoose.Types.ObjectId();
const mockAmbulanceId = new mongoose.Types.ObjectId();
const mockLabId = new mongoose.Types.ObjectId();

describe('Staff Models Integration Tests', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    // Clean up collections before each test
    await Doctor.deleteMany({});
    await Nurse.deleteMany({});
    await Pharmacist.deleteMany({});
    await Receptionist.deleteMany({});
    await Admin.deleteMany({});
    await Pathologist.deleteMany({});
    await Driver.deleteMany({});
    await syncIndexes(); // Ensure auto-increment is reset/synced
  });

  // Auto-increment tests
  describe('Auto-increment functionality', () => {
    it('should auto-increment Doctor _id field', async () => {
      const doctor1 = new Doctor({
        employee_id: mockEmployeeId,
        department_id: mockDepartmentId,
        specialization: 'Cardiology',
        qualification: 'MD',
        experience: 5,
        room_num: 101
      });

      const doctor2 = new Doctor({
        employee_id: mockEmployeeId + 1,
        department_id: mockDepartmentId,
        specialization: 'Neurology',
        qualification: 'MD',
        experience: 7,
        room_num: 102
      });

      await doctor1.save();
      await doctor2.save();

      expect(doctor1._id).toBeDefined();
      expect(doctor2._id).toBeDefined();
      expect(doctor2._id).toBeGreaterThan(doctor1._id);
      // Should start at 10000 as defined in the schema
      expect(doctor1._id).toBeGreaterThanOrEqual(10000);
    });

    it('should auto-increment Nurse _id field', async () => {
      const nurse1 = new Nurse({
        employee_id: mockEmployeeId,
        assigned_dept: mockDepartmentId,
        location: 'ward'
      });

      const nurse2 = new Nurse({
        employee_id: mockEmployeeId + 1,
        assigned_dept: mockDepartmentId,
        location: 'icu'
      });

      await nurse1.save();
      await nurse2.save();

      expect(nurse1._id).toBeDefined();
      expect(nurse2._id).toBeDefined();
      expect(nurse2._id).toBeGreaterThan(nurse1._id);
      // Should start at 10000 as defined in the schema
      expect(nurse1._id).toBeGreaterThanOrEqual(10000);
    });
  });

  // Doctor CRUD operations
  describe('Doctor CRUD operations', () => {
    it('should create and retrieve a doctor', async () => {
      const doctorData = {
        employee_id: mockEmployeeId,
        department_id: mockDepartmentId,
        specialization: 'Cardiology',
        qualification: 'MD',
        experience: 5,
        room_num: 101,
        rating: 4.5,
        num_ratings: 10
      };

      const doctor = new Doctor(doctorData);
      await doctor.save();
      
      const foundDoctor = await Doctor.findOne({ employee_id: mockEmployeeId });
      
      expect(foundDoctor).toBeDefined();
      expect(foundDoctor.specialization).toBe('Cardiology');
      expect(foundDoctor.qualification).toBe('MD');
      expect(foundDoctor.rating).toBe(4.5);
      expect(foundDoctor._id).toBeDefined();
    });

    it('should update a doctor', async () => {
      const doctor = new Doctor({
        employee_id: mockEmployeeId,
        department_id: mockDepartmentId,
        specialization: 'Cardiology',
        qualification: 'MD',
        experience: 5,
        room_num: 101,
        rating: 4.5,
        num_ratings: 10
      });

      await doctor.save();
      
      // Update the doctor
      await Doctor.updateOne(
        { employee_id: mockEmployeeId },
        { 
          $set: { 
            rating: 4.8, 
            num_ratings: 15,
            experience: 6
          } 
        }
      );
      
      const updatedDoctor = await Doctor.findOne({ employee_id: mockEmployeeId });
      
      expect(updatedDoctor.rating).toBe(4.8);
      expect(updatedDoctor.num_ratings).toBe(15);
      expect(updatedDoctor.experience).toBe(6);
    });

    it('should delete a doctor', async () => {
      const doctor = new Doctor({
        employee_id: mockEmployeeId,
        department_id: mockDepartmentId,
        specialization: 'Cardiology',
        qualification: 'MD',
        experience: 5,
        room_num: 101
      });

      await doctor.save();
      
      await Doctor.deleteOne({ employee_id: mockEmployeeId });
      
      const foundDoctor = await Doctor.findOne({ employee_id: mockEmployeeId });
      
      expect(foundDoctor).toBeNull();
    });
  });

  // Nurse CRUD operations
  describe('Nurse CRUD operations', () => {
    it('should create and retrieve a nurse with all fields', async () => {
      const nurseData = {
        employee_id: mockEmployeeId,
        assigned_dept: mockDepartmentId,
        location: 'ward',
        assigned_room: mockRoomId,
        assigned_bed: mockBedId,
        assigned_amb: mockAmbulanceId
      };

      const nurse = new Nurse(nurseData);
      await nurse.save();
      
      const foundNurse = await Nurse.findOne({ employee_id: mockEmployeeId });
      
      expect(foundNurse).toBeDefined();
      expect(foundNurse.location).toBe('ward');
      expect(foundNurse.assigned_dept.toString()).toBe(mockDepartmentId.toString());
      expect(foundNurse.assigned_room.toString()).toBe(mockRoomId.toString());
      expect(foundNurse.assigned_bed.toString()).toBe(mockBedId.toString());
      expect(foundNurse.assigned_amb.toString()).toBe(mockAmbulanceId.toString());
    });

    it('should reject invalid location enum values', async () => {
      const nurse = new Nurse({
        employee_id: mockEmployeeId,
        assigned_dept: mockDepartmentId,
        location: 'invalid_location', // Not in enum
      });

      await expect(nurse.validate()).rejects.toThrow();
    });

    it('should update a nurse location', async () => {
      const nurse = new Nurse({
        employee_id: mockEmployeeId,
        assigned_dept: mockDepartmentId,
        location: 'ward'
      });

      await nurse.save();
      
      // Update the nurse
      await Nurse.updateOne(
        { employee_id: mockEmployeeId },
        { $set: { location: 'icu' } }
      );
      
      const updatedNurse = await Nurse.findOne({ employee_id: mockEmployeeId });
      
      expect(updatedNurse.location).toBe('icu');
    });
  });

  // Other staff models CRUD tests
  describe('Other staff models CRUD operations', () => {
    it('should create and retrieve a pharmacist', async () => {
      const pharmacist = new Pharmacist({
        employee_id: mockEmployeeId
      });

      await pharmacist.save();
      
      const foundPharmacist = await Pharmacist.findOne({ employee_id: mockEmployeeId });
      
      expect(foundPharmacist).toBeDefined();
      expect(foundPharmacist.employee_id).toBe(mockEmployeeId);
    });
    
    it('should create and retrieve a receptionist', async () => {
      const receptionist = new Receptionist({
        employee_id: mockEmployeeId,
        assigned_dept: mockDepartmentId
      });

      await receptionist.save();
      
      const foundReceptionist = await Receptionist.findOne({ employee_id: mockEmployeeId });
      
      expect(foundReceptionist).toBeDefined();
      expect(foundReceptionist.employee_id).toBe(mockEmployeeId);
      expect(foundReceptionist.assigned_dept.toString()).toBe(mockDepartmentId.toString());
    });
    
    it('should create and retrieve an admin', async () => {
      const admin = new Admin({
        employee_id: mockEmployeeId
      });

      await admin.save();
      
      const foundAdmin = await Admin.findOne({ employee_id: mockEmployeeId });
      
      expect(foundAdmin).toBeDefined();
      expect(foundAdmin.employee_id).toBe(mockEmployeeId);
    });
    
    it('should create and retrieve a pathologist', async () => {
      const pathologist = new Pathologist({
        employee_id: mockEmployeeId,
        lab_id: mockLabId
      });

      await pathologist.save();
      
      const foundPathologist = await Pathologist.findOne({ employee_id: mockEmployeeId });
      
      expect(foundPathologist).toBeDefined();
      expect(foundPathologist.employee_id).toBe(mockEmployeeId);
      expect(foundPathologist.lab_id.toString()).toBe(mockLabId.toString());
    });
    
    it('should create and retrieve a driver', async () => {
      const driver = new Driver({
        employee_id: mockEmployeeId
      });

      await driver.save();
      
      const foundDriver = await Driver.findOne({ employee_id: mockEmployeeId });
      
      expect(foundDriver).toBeDefined();
      expect(foundDriver.employee_id).toBe(mockEmployeeId);
    });

    it('should handle bulk creation of different staff types', async () => {
      // Create one of each staff type
      await Promise.all([
        new Doctor({
          employee_id: 10001,
          department_id: mockDepartmentId,
          specialization: 'Pediatrics'
        }).save(),
        new Nurse({
          employee_id: 10002,
          assigned_dept: mockDepartmentId,
          location: 'emergency'
        }).save(),
        new Pharmacist({
          employee_id: 10003
        }).save(),
        new Receptionist({
          employee_id: 10004,
          assigned_dept: mockDepartmentId
        }).save(),
        new Admin({
          employee_id: 10005
        }).save(),
        new Pathologist({
          employee_id: 10006,
          lab_id: mockLabId
        }).save(),
        new Driver({
          employee_id: 10007
        }).save()
      ]);

      // Verify all were created
      const doctorCount = await Doctor.countDocuments();
      const nurseCount = await Nurse.countDocuments();
      const pharmacistCount = await Pharmacist.countDocuments();
      const receptionistCount = await Receptionist.countDocuments();
      const adminCount = await Admin.countDocuments();
      const pathologistCount = await Pathologist.countDocuments();
      const driverCount = await Driver.countDocuments();

      expect(doctorCount).toBe(1);
      expect(nurseCount).toBe(1);
      expect(pharmacistCount).toBe(1);
      expect(receptionistCount).toBe(1);
      expect(adminCount).toBe(1);
      expect(pathologistCount).toBe(1);
      expect(driverCount).toBe(1);
    });
  });

  // Test invalid reference IDs
  describe('Reference validation', () => {
    it('should enforce ObjectId type for department_id in Doctor model', async () => {
      const doctorWithInvalidDeptId = new Doctor({
        employee_id: mockEmployeeId,
        department_id: 'invalid-id', // Should be ObjectId
        specialization: 'Cardiology'
      });

      await expect(doctorWithInvalidDeptId.validate()).rejects.toThrow();
    });

    it('should enforce ObjectId type for lab_id in Pathologist model', async () => {
      const pathologistWithInvalidLabId = new Pathologist({
        employee_id: mockEmployeeId,
        lab_id: 'invalid-id' // Should be ObjectId
      });

      await expect(pathologistWithInvalidLabId.validate()).rejects.toThrow();
    });
  });
});
