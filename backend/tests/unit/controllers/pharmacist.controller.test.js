// tests/unit/controllers/pharmacist.controller.test.js

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest'
import { connectDB, disconnectDB, syncIndexes } from '../../helpers/db.js'
import {
  searchPatientPrescriptions,
  updatePrescriptionEntry
} from '../../../controllers/pharmacist.controller.js'
import mongoose from 'mongoose'
import Medicine from '../../../models/inventory.js'
import Patient from '../../../models/patient.js'
import { Consultation, Prescription } from '../../../models/consultation.js'

// Setup and teardown
beforeAll(async () => {
  await connectDB()
  await syncIndexes()
})

afterAll(async () => {
  await disconnectDB()
})

beforeEach(async () => {
  // Reset global hospital account
  global.hospitalBankAccount = {
    balance: 100000
  }
})

afterEach(async () => {
  // Clean up database after each test
  const collections = mongoose.connection.collections
  for (const key in collections) {
    await collections[key].deleteMany({})
  }
  
  // Clear all mocks
  vi.clearAllMocks()
})

describe('Pharmacist Controller', () => {
  describe('searchPatientPrescriptions()', () => {
    it('should return 400 if searchById is not provided', async () => {
      const req = { query: {} }
      const res = {
        statusCode: null,
        responseData: null,
        status(code) {
          this.statusCode = code
          return this
        },
        json(data) {
          this.responseData = data
          return this
        }
      }

      await searchPatientPrescriptions(req, res)
      
      expect(res.statusCode).toBe(400)
      expect(res.responseData.message).toBe('Search query is required.')
    })

    it('should return 404 if patient is not found', async () => {
      // Use a numeric ID for patient as per the schema
      const nonExistentId = 99999
      
      // Mock Patient.findById to return null (findById doesn't have a populate method in real MongoDB)
      vi.spyOn(Patient, 'findById').mockImplementationOnce(() => ({
        populate: vi.fn().mockResolvedValueOnce(null)
      }))
      
      const req = { query: { searchById: nonExistentId } }
      const res = {
        statusCode: null,
        responseData: null,
        status(code) {
          this.statusCode = code
          return this
        },
        json(data) {
          this.responseData = data
          return this
        }
      }

      await searchPatientPrescriptions(req, res)
      
      expect(res.statusCode).toBe(404)
      expect(res.responseData.message).toBe('Patient not found.')
    })

    it('should return empty prescriptions if patient has no consultations', async () => {
      // Create a test patient matching the schema
      const patient = {
        _id: 10001,
        name: 'Test Patient',
        email: 'patient@test.com',
        phone_number: '1234567890',
        aadhar_number: '123456789012',
        gender: 'male',
        date_of_birth: new Date('1990-01-01'),
        patient_info: {
          age: 35,
          height: 175,
          weight: 70,
          bloodGrp: 'O+',
        }
      }
      
      // Mock Patient.findById with proper chaining
      vi.spyOn(Patient, 'findById').mockImplementationOnce(() => ({
        populate: vi.fn().mockResolvedValueOnce(patient)
      }))
      
      // Mock Consultation.findOne with proper chaining
      vi.spyOn(Consultation, 'findOne').mockImplementationOnce(() => ({
        sort: vi.fn().mockResolvedValueOnce(null)
      }))
      
      const req = { query: { searchById: 10001 } }
      const res = {
        statusCode: null,
        responseData: null,
        status(code) {
          this.statusCode = code
          return this
        },
        json(data) {
          this.responseData = data
          return this
        }
      }

      await searchPatientPrescriptions(req, res)
      
      expect(res.statusCode).toBe(200)
      expect(res.responseData.patient).toEqual(patient)
      expect(res.responseData.prescriptions).toEqual([])
    })

    it('should return patient prescriptions with no dispensing', async () => {
      // Create test data following schema structure
      const patientId = 10002
      const patient = {
        _id: patientId,
        name: 'John Doe',
        email: 'john@test.com',
        phone_number: '9876543210',
        aadhar_number: '987654321098',
        gender: 'male',
        date_of_birth: new Date('1980-05-15'),
        patient_info: {
          age: 45,
          height: 180,
          weight: 75,
          bloodGrp: 'A+',
        }
      }
      
      const now = new Date()
      const medicine = {
        _id: 10001,
        med_name: 'Paracetamol',
        dosage_form: 'tablet',
        manufacturer: 'TestPharma',
        available: true,
        inventory: [
          {
            batch_no: 'BATCH001',
            expiry_date: new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()),
            quantity: 100,
            unit_price: 5,
            supplier: 'Supplier Inc'
          }
        ],
        save: vi.fn().mockResolvedValue(true)
      }
      
      const prescriptionId = new mongoose.Types.ObjectId()
      const prescriptionEntry = {
        medicine_id: medicine._id,
        dosage: '500mg',
        frequency: 'twice daily',
        duration: '5 days',
        quantity: 10,
        dispensed_qty: 0
      }
      
      const prescription = {
        _id: prescriptionId,
        prescriptionDate: new Date(),
        status: 'pending',
        entries: [prescriptionEntry],
        toObject: vi.fn().mockReturnThis(),
        save: vi.fn().mockResolvedValue(true)
      }
      
      const consultation = {
        _id: new mongoose.Types.ObjectId(),
        patient_id: patientId,
        actual_start_datetime: new Date(),
        prescription: [prescriptionId]
      }
      
      // Mock Patient.findById
      vi.spyOn(Patient, 'findById').mockImplementationOnce(() => ({
        populate: vi.fn().mockResolvedValueOnce(patient)
      }))
      
      // Mock Consultation.findOne with proper chaining
      // This returns the consultation object directly after sort is called
      vi.spyOn(Consultation, 'findOne').mockImplementationOnce(() => ({
        sort: vi.fn().mockResolvedValueOnce(consultation)
      }))
      
      // Mock Prescription.find with proper chaining
      vi.spyOn(Prescription, 'find').mockImplementationOnce(() => ({
        sort: vi.fn().mockReturnThis(),
        populate: vi.fn().mockResolvedValueOnce([{
          ...prescription,
          entries: [{
            ...prescriptionEntry,
            medicine_id: medicine
          }]
        }])
      }))
      
      const req = { query: { searchById: patientId } }
      const res = {
        statusCode: null,
        responseData: null,
        status(code) {
          this.statusCode = code
          return this
        },
        json(data) {
          this.responseData = data
          return this
        }
      }
    
      await searchPatientPrescriptions(req, res)
      
      expect(res.statusCode).toBe(200)
      expect(res.responseData.patient).toEqual(patient)
      expect(res.responseData.prescriptions.length).toBe(1)
      expect(res.responseData.prescriptions[0].status).toBe('pending')
      expect(res.responseData.lastConsultation).toEqual(consultation)
    })

    it('should dispense medications when dispense=true', async () => {
      // Create test data following schema structure
      const patientId = 10003
      const patient = {
        _id: patientId,
        name: 'Jane Smith',
        email: 'jane@test.com',
        phone_number: '5555555555',
        aadhar_number: '555555555555',
        gender: 'female',
        date_of_birth: new Date('1990-10-20'),
        patient_info: {
          age: 35,
          height: 165,
          weight: 60,
          bloodGrp: 'B+',
        }
      }
      
      const now = new Date()
      const medicine = {
        _id: 10002,
        med_name: 'Amoxicillin',
        dosage_form: 'capsule',
        manufacturer: 'TestPharma',
        available: true,
        inventory: [
          {
            batch_no: 'BATCH002',
            expiry_date: new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()),
            quantity: 50,
            unit_price: 10,
            supplier: 'Supplier Inc'
          }
        ],
        save: vi.fn().mockResolvedValue(true)
      }
      
      const prescriptionId = new mongoose.Types.ObjectId()
      const prescriptionEntry = {
        medicine_id: medicine._id,
        dosage: '250mg',
        frequency: 'thrice daily',
        duration: '7 days',
        quantity: 21,
        dispensed_qty: 0
      }
      
      const prescription = {
        _id: prescriptionId,
        prescriptionDate: new Date(),
        status: 'pending',
        entries: [prescriptionEntry],
        toObject: vi.fn().mockReturnThis(),
        markModified: vi.fn(),
        save: vi.fn().mockResolvedValue(true)
      }
      
      const consultation = {
        _id: new mongoose.Types.ObjectId(),
        patient_id: patientId,
        actual_start_datetime: new Date(),
        prescription: [prescriptionId]
      }
      
      // Mock Patient.findById
      vi.spyOn(Patient, 'findById').mockImplementationOnce(() => ({
        populate: vi.fn().mockResolvedValueOnce(patient)
      }))
      
      // Mock Consultation.findOne with proper chaining
      // This returns the consultation object directly after sort is called
      vi.spyOn(Consultation, 'findOne').mockImplementationOnce(() => ({
        sort: vi.fn().mockResolvedValueOnce(consultation)
      }))
      
      // Mock Prescription.find with proper chaining
      vi.spyOn(Prescription, 'find').mockImplementationOnce(() => ({
        sort: vi.fn().mockReturnThis(),
        populate: vi.fn().mockResolvedValueOnce([{
          ...prescription,
          entries: [{
            ...prescriptionEntry,
            medicine_id: medicine
          }]
        }])
      }))
      
      // Mock Medicine.findById separately for dispense flow
      vi.spyOn(Medicine, 'findById').mockResolvedValueOnce(medicine)
      
      const req = { query: { searchById: patientId, dispense: 'true' } }
      const res = {
        statusCode: null,
        responseData: null,
        status(code) {
          this.statusCode = code
          return this
        },
        json(data) {
          this.responseData = data
          return this
        }
      }
    
      await searchPatientPrescriptions(req, res)
      
      expect(res.statusCode).toBe(200)
      expect(res.responseData.patient).toEqual(patient)
      expect(res.responseData.prescriptions.length).toBe(1)
      expect(medicine.save).toHaveBeenCalled()
      expect(prescription.save).toHaveBeenCalled()
    })
  })

  describe('updatePrescriptionEntry()', () => {
    it('should return 404 if prescription is not found', async () => {
      const prescriptionId = new mongoose.Types.ObjectId()
      const entryId = new mongoose.Types.ObjectId()
      
      // Mock Prescription.findById to return null
      vi.spyOn(Prescription, 'findById').mockResolvedValueOnce(null)
      
      const req = {
        params: { prescriptionId, entryId },
        body: { dispensed_qty: 5 }
      }
      
      const res = {
        statusCode: null,
        responseData: null,
        status(code) {
          this.statusCode = code
          return this
        },
        json(data) {
          this.responseData = data
          return this
        }
      }

      await updatePrescriptionEntry(req, res)
      
      expect(res.statusCode).toBe(404)
      expect(res.responseData.message).toBe('Prescription not found.')
    })

    it('should return 404 if prescription entry is not found', async () => {
      const prescriptionId = new mongoose.Types.ObjectId()
      const entryId = new mongoose.Types.ObjectId()
      const nonExistentEntryId = new mongoose.Types.ObjectId()
      
      // Create mock prescription with entries as an array
      const prescription = {
        _id: prescriptionId,
        entries: [
          { 
            _id: entryId, 
            medicine_id: 10001, 
            quantity: 10,
            dispensed_qty: 0
          }
        ],
        status: 'pending',
        markModified: vi.fn(),
        save: vi.fn().mockResolvedValue(true)
      }
      
      // Add id method to entries array to mimic Mongoose subdocument behavior
      // This implementation returns null for a non-existent ID
      prescription.entries.id = vi.fn(id => 
        prescription.entries.find(entry => 
          entry._id.toString() === id.toString()
        )
      );
      
      // Mock Prescription.findById
      vi.spyOn(Prescription, 'findById').mockResolvedValueOnce(prescription)
      
      const req = {
        params: { 
          prescriptionId, 
          entryId: nonExistentEntryId // Use a different ID that doesn't exist in the entries
        },
        body: { dispensed_qty: 5 }
      }
      
      const res = {
        statusCode: null,
        responseData: null,
        status(code) {
          this.statusCode = code
          return this
        },
        json(data) {
          this.responseData = data
          return this
        }
      }
    
      await updatePrescriptionEntry(req, res)
      
      expect(res.statusCode).toBe(404)
      expect(res.responseData.message).toBe('Prescription entry not found.')
    })

    it('should return 400 if dispensed_qty is invalid', async () => {
      const prescriptionId = new mongoose.Types.ObjectId()
      const entryId = new mongoose.Types.ObjectId()
      
      // Create mock prescription with entries as an array
      const prescription = {
        _id: prescriptionId,
        entries: [
          { 
            _id: entryId, 
            medicine_id: 10001, 
            quantity: 10,
            dispensed_qty: 0
          }
        ],
        status: 'pending',
        markModified: vi.fn(),
        save: vi.fn().mockResolvedValue(true)
      }
      
      // Add id method to entries array to mimic Mongoose subdocument behavior
      prescription.entries.id = vi.fn(id => 
        prescription.entries.find(entry => entry._id.toString() === id.toString())
      );
      
      // Mock Prescription.findById
      vi.spyOn(Prescription, 'findById').mockResolvedValueOnce(prescription)
      
      const req = {
        params: { prescriptionId, entryId },
        body: { dispensed_qty: -1 } // Invalid quantity
      }
      
      const res = {
        statusCode: null,
        responseData: null,
        status(code) {
          this.statusCode = code
          return this
        },
        json(data) {
          this.responseData = data
          return this
        }
      }
    
      await updatePrescriptionEntry(req, res)
      
      expect(res.statusCode).toBe(400)
      expect(res.responseData.message).toBe('Valid dispensed quantity is required.')
    })

    it('should return 400 if dispensed_qty exceeds prescribed quantity', async () => {
      const prescriptionId = new mongoose.Types.ObjectId()
      const entryId = new mongoose.Types.ObjectId()
      
      // Create mock prescription with entries as an array
      const prescription = {
        _id: prescriptionId,
        entries: [
          { 
            _id: entryId, 
            medicine_id: 10001, 
            quantity: 10,
            dispensed_qty: 0
          }
        ],
        status: 'pending',
        markModified: vi.fn(),
        save: vi.fn().mockResolvedValue(true)
      }
      
      // Add id method to entries array to mimic Mongoose subdocument behavior
      prescription.entries.id = vi.fn(id => 
        prescription.entries.find(entry => entry._id.toString() === id.toString())
      );
      
      // Mock Prescription.findById
      vi.spyOn(Prescription, 'findById').mockResolvedValueOnce(prescription)
      
      const req = {
        params: { prescriptionId, entryId },
        body: { dispensed_qty: 15 } // Exceeds prescribed quantity of 10
      }
      
      const res = {
        statusCode: null,
        responseData: null,
        status(code) {
          this.statusCode = code
          return this
        },
        json(data) {
          this.responseData = data
          return this
        }
      }
    
      await updatePrescriptionEntry(req, res)
      
      expect(res.statusCode).toBe(400)
      expect(res.responseData.message).toBe('Dispensed quantity cannot exceed prescribed quantity.')
    })

    it('should return 404 if medicine is not found', async () => {
      const prescriptionId = new mongoose.Types.ObjectId()
      const entryId = new mongoose.Types.ObjectId()
      const medicineId = 10003
      
      // Create mock prescription with entries as an array
      const prescription = {
        _id: prescriptionId,
        entries: [
          { 
            _id: entryId, 
            medicine_id: medicineId, 
            quantity: 10,
            dispensed_qty: 0
          }
        ],
        status: 'pending',
        markModified: vi.fn(),
        save: vi.fn().mockResolvedValue(true)
      }
      
      // Add id method to entries array to mimic Mongoose subdocument behavior
      prescription.entries.id = vi.fn(id => 
        prescription.entries.find(entry => entry._id.toString() === id.toString())
      );
      
      // Mock Prescription.findById
      vi.spyOn(Prescription, 'findById').mockResolvedValueOnce(prescription)
      
      // Mock Medicine.findById to return null
      vi.spyOn(Medicine, 'findById').mockResolvedValueOnce(null)
      
      const req = {
        params: { prescriptionId, entryId },
        body: { dispensed_qty: 5 }
      }
      
      const res = {
        statusCode: null,
        responseData: null,
        status(code) {
          this.statusCode = code
          return this
        },
        json(data) {
          this.responseData = data
          return this
        }
      }
    
      await updatePrescriptionEntry(req, res)
      
      expect(res.statusCode).toBe(404)
      expect(res.responseData.message).toBe('Medicine not found.')
    })

    it('should return 400 if insufficient stock is available', async () => {
      const prescriptionId = new mongoose.Types.ObjectId()
      const entryId = new mongoose.Types.ObjectId()
      const medicineId = 10004
      
      // Create mock prescription with entries as an array
      const prescription = {
        _id: prescriptionId,
        entries: [
          { 
            _id: entryId, 
            medicine_id: medicineId, 
            quantity: 20,
            dispensed_qty: 0
          }
        ],
        status: 'pending',
        markModified: vi.fn(),
        save: vi.fn().mockResolvedValue(true)
      }
      
      // Add id method to entries array to mimic Mongoose subdocument behavior
      prescription.entries.id = vi.fn(id => 
        prescription.entries.find(entry => entry._id.toString() === id.toString())
      );
      
      const now = new Date()
      const medicine = {
        _id: medicineId,
        med_name: 'Test Medicine',
        dosage_form: 'tablet',
        manufacturer: 'TestPharma',
        available: true,
        inventory: [
          {
            batch_no: 'BATCH003',
            expiry_date: new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()),
            quantity: 10, // Only 10 available but trying to dispense 15
            unit_price: 5,
            supplier: 'Supplier Inc'
          }
        ],
        save: vi.fn().mockResolvedValue(true)
      }
      
      // Mock Prescription.findById
      vi.spyOn(Prescription, 'findById').mockResolvedValueOnce(prescription)
      
      // Mock Medicine.findById
      vi.spyOn(Medicine, 'findById').mockResolvedValueOnce(medicine)
      
      const req = {
        params: { prescriptionId, entryId },
        body: { dispensed_qty: 15 }
      }
      
      const res = {
        statusCode: null,
        responseData: null,
        status(code) {
          this.statusCode = code
          return this
        },
        json(data) {
          this.responseData = data
          return this
        }
      }
    
      await updatePrescriptionEntry(req, res)
      
      expect(res.statusCode).toBe(400)
      expect(res.responseData.message).toContain('Insufficient stock available')
    })

    it('should successfully update dispensed quantity', async () => {
      const prescriptionId = new mongoose.Types.ObjectId()
      const entryId = new mongoose.Types.ObjectId()
      const medicineId = 10005
      
      // Create mock prescription with entries as an array that has an id method
      const prescription = {
        _id: prescriptionId,
        entries: [
          { 
            _id: entryId, 
            medicine_id: medicineId, 
            quantity: 20,
            dispensed_qty: 0
          },
          {
            _id: new mongoose.Types.ObjectId(),
            medicine_id: 10006,
            quantity: 10,
            dispensed_qty: 5
          }
        ],
        status: 'pending',
        markModified: vi.fn(),
        save: vi.fn().mockResolvedValue(true)
      }
      
      // Add id method to entries array to mimic Mongoose subdocument behavior
      prescription.entries.id = vi.fn(id => 
        prescription.entries.find(entry => entry._id.toString() === id.toString())
      );
      
      const now = new Date()
      const medicine = {
        _id: medicineId,
        med_name: 'Test Medicine',
        dosage_form: 'tablet',
        manufacturer: 'TestPharma',
        available: true,
        inventory: [
          {
            batch_no: 'BATCH004',
            expiry_date: new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()),
            quantity: 30,
            unit_price: 5,
            supplier: 'Supplier Inc'
          }
        ],
        save: vi.fn().mockResolvedValue(true)
      }
      
      // Mock Prescription.findById
      vi.spyOn(Prescription, 'findById').mockResolvedValueOnce(prescription)
      
      // Mock Medicine.findById
      vi.spyOn(Medicine, 'findById').mockResolvedValueOnce(medicine)
      
      const req = {
        params: { prescriptionId, entryId },
        body: { dispensed_qty: 15 }
      }
      
      const res = {
        statusCode: null,
        responseData: null,
        status(code) {
          this.statusCode = code
          return this
        },
        json(data) {
          this.responseData = data
          return this
        }
      }

      await updatePrescriptionEntry(req, res)
      
      expect(res.statusCode).toBe(200)
      expect(res.responseData.message).toBe('Dispensed quantity updated successfully.')
      expect(medicine.save).toHaveBeenCalled()
      expect(prescription.markModified).toHaveBeenCalledWith('entries')
      expect(prescription.save).toHaveBeenCalled()
      expect(prescription.entries[0].dispensed_qty).toBe(15)
      expect(prescription.status).toBe('partially_dispensed') // Since not all entries are fully dispensed
    })

    it('should set prescription status to fully dispensed when all entries are dispensed', async () => {
      const prescriptionId = new mongoose.Types.ObjectId();
      const entryId = new mongoose.Types.ObjectId();
      const medicineId = 10005;
      
      // Create mock prescription with entries as an array and add the id() method
      const prescription = {
        _id: prescriptionId,
        entries: [
          { 
            _id: entryId, 
            medicine_id: medicineId, 
            quantity: 20,
            dispensed_qty: 0
          },
          {
            _id: new mongoose.Types.ObjectId(),
            medicine_id: 10006,
            quantity: 10,
            dispensed_qty: 10 // This entry is already fully dispensed
          }
        ],
        status: 'partially_dispensed',
        markModified: vi.fn(),
        save: vi.fn().mockResolvedValue(true)
      };
      
      // Add Mongoose-like id() method to the entries array
      prescription.entries.id = vi.fn((id) => {
        return prescription.entries.find(entry => entry._id.toString() === id.toString());
      });
      
      const now = new Date();
      const medicine = {
        _id: medicineId,
        med_name: 'Test Medicine',
        dosage_form: 'tablet',
        manufacturer: 'TestPharma',
        available: true,
        inventory: [
          {
            batch_no: 'BATCH004',
            expiry_date: new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()),
            quantity: 30,
            unit_price: 5,
            supplier: 'Supplier Inc'
          }
        ],
        save: vi.fn().mockResolvedValue(true)
      };
      
      // Mock Prescription.findById
      vi.spyOn(Prescription, 'findById').mockResolvedValueOnce(prescription);
      
      // Mock Medicine.findById
      vi.spyOn(Medicine, 'findById').mockResolvedValueOnce(medicine);
      
      const req = {
        params: { prescriptionId, entryId },
        body: { dispensed_qty: 20 } // Fully dispense the first entry
      };
      
      const res = {
        statusCode: null,
        responseData: null,
        status(code) {
          this.statusCode = code;
          return this;
        },
        json(data) {
          this.responseData = data;
          return this;
        }
      };
    
      await updatePrescriptionEntry(req, res);
      
      expect(res.statusCode).toBe(200);
      expect(res.responseData.message).toBe('Dispensed quantity updated successfully.');
      expect(medicine.save).toHaveBeenCalled();
      expect(prescription.markModified).toHaveBeenCalledWith('entries');
      expect(prescription.save).toHaveBeenCalled();
      expect(prescription.entries[0].dispensed_qty).toBe(20);
      expect(prescription.status).toBe('dispensed'); // Now all entries are fully dispensed
    });
  })
})
