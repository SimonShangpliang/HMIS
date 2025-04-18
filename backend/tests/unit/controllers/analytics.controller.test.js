import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import mongoose from 'mongoose';
import moment from 'moment';
import { connectDB, disconnectDB } from '../../helpers/db.js';
import * as analyticsController from '../../../controllers/analytics.controller.js';

// Import all models needed for testing
import {Consultation, Feedback} from '../../../models/consultation.js';
import {Room} from '../../../models/facility.js';
import LogModels from '../../../models/logs.js';
import Medicine from '../../../models/inventory.js';
import BillModels from '../../../models/bill.js';
import {Doctor} from '../../../models/staff.js';
import Department from '../../../models/department.js';
import {PrescriptionEntry, Prescription} from '../../../models/consultation.js';
import Employee from '../../../models/employee.js';
import Patient from '../../../models/patient.js';
import Diagnosis from '../../../models/diagnosis.js';

// Destructure models from LogModels and BillModels
const {MedicineInventoryLog, BedLog} = LogModels;
const {Bill, BillItem} = BillModels;

// Mock Express response and request objects
const mockResponse = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

const mockRequest = (data = {}) => ({
  body: data.body || {},
  params: data.params || {},
  query: data.query || {}
});

// Setup before all tests
beforeAll(async () => {
  await connectDB();
});

// Cleanup after all tests
afterAll(async () => {
  await disconnectDB();
});

// Reset data before each test
beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Medicine Management Tests
describe('Medicine Management Functions', () => {
  describe('addMedicine', () => {
    it('should add a new medicine successfully', async () => {
      // Mock the implementation to avoid validation errors
      const saveMock = vi.spyOn(Medicine.prototype, 'save').mockResolvedValueOnce({
        med_name: 'Paracetamol',
        effectiveness: 'medium', // Using a likely valid enum value
        dosage_form: 'pill', // Using a likely valid enum value
        manufacturer: 'ABC Pharma',
        available: true,
        inventory: { quantity: 100 } // Using an object structure for inventory
      });
      
      const req = mockRequest({
        body: {
          med_name: 'Paracetamol',
          effectiveness: 'medium',
          dosage_form: 'pill',
          manufacturer: 'ABC Pharma',
          available: true,
          inventory: { quantity: 100 }
        }
      });
      const res = mockResponse();
      
      await analyticsController.addMedicine(req, res);
      
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Medicine added successfully'
        })
      );
      
      saveMock.mockRestore();
    });
    
    it('should handle errors when adding medicine', async () => {
      const saveMock = vi.spyOn(Medicine.prototype, 'save').mockImplementationOnce(() => {
        throw new Error('Database error');
      });
      
      const req = mockRequest({
        body: {
          med_name: 'Ibuprofen'
        }
      });
      const res = mockResponse();
      
      await analyticsController.addMedicine(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Failed to add medicine'
        })
      );
      
      saveMock.mockRestore();
    });
  });
  
  describe('addInventoryLog', () => {
    it('should add a new inventory log successfully', async () => {
      // Mock the implementation to avoid validation errors
      const saveMock = vi.spyOn(MedicineInventoryLog.prototype, 'save').mockResolvedValueOnce({
        med_id: 1,
        quantity: 50,
        total_cost: 5000,
        order_date: new Date(),
        supplier: 'ABC Supplier',
        status: 'ordered' // Using a likely valid enum value
      });
      
      const req = mockRequest({
        body: {
          med_id: 1,
          quantity: 50,
          total_cost: 5000,
          order_date: new Date(),
          supplier: 'ABC Supplier',
          status: 'ordered'
        }
      });
      const res = mockResponse();
      
      await analyticsController.addInventoryLog(req, res);
      
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Inventory log added successfully'
        })
      );
      
      saveMock.mockRestore();
    });
    
    it('should handle errors when adding inventory log', async () => {
      const saveMock = vi.spyOn(MedicineInventoryLog.prototype, 'save').mockImplementationOnce(() => {
        throw new Error('Database error');
      });
      
      const req = mockRequest({
        body: {
          med_id: 1,
          quantity: 50
        }
      });
      const res = mockResponse();
      
      await analyticsController.addInventoryLog(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Failed to add inventory log'
        })
      );
      
      saveMock.mockRestore();
    });
  });
  
  describe('getMedicines', () => {
    it('should return formatted list of medicines', async () => {
      // Add test medicines to the database using mocks to avoid validation errors
      const findMock = vi.spyOn(Medicine, 'find').mockResolvedValueOnce([
        { _id: 101, med_name: 'Paracetamol' },
        { _id: 102, med_name: 'Amoxicillin' }
      ]);
      
      const req = mockRequest();
      const res = mockResponse();
      
      await analyticsController.getMedicines(req, res);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: '101',
            name: 'Paracetamol'
          }),
          expect.objectContaining({
            id: '102',
            name: 'Amoxicillin'
          })
        ])
      );
      
      findMock.mockRestore();
    });
    
    it('should handle errors when fetching medicines', async () => {
      const findMock = vi.spyOn(Medicine, 'find').mockImplementationOnce(() => {
        throw new Error('Database error');
      });
      
      const req = mockRequest();
      const res = mockResponse();
      
      await analyticsController.getMedicines(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Server error'
        })
      );
      
      findMock.mockRestore();
    });
  });
});

// Billing Tests
describe('Billing Functions', () => {
  describe('createBill', () => {
    it('should create a new bill successfully', async () => {
      // Using Number for patient_id instead of ObjectId
      const saveMock = vi.spyOn(Bill.prototype, 'save').mockResolvedValueOnce({
        patient_id: 12345, // Using Number instead of ObjectId
        generation_date: new Date(),
        total_amount: 1000,
        remaining_amount: 1000,
        payment_status: 'pending',
        items: []
      });
      
      const req = mockRequest({ 
        body: {
          patient_id: 12345,
          generation_date: new Date(),
          total_amount: 1000,
          remaining_amount: 1000,
          payment_status: 'pending',
          items: []
        } 
      });
      const res = mockResponse();
      
      await analyticsController.createBill(req, res);
      
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Bill created successfully'
        })
      );
      
      saveMock.mockRestore();
    });
    
    it('should handle errors when creating bill', async () => {
      const saveMock = vi.spyOn(Bill.prototype, 'save').mockImplementationOnce(() => {
        throw new Error('Database error');
      });
      
      const req = mockRequest({
        body: {
          patient_id: 12345,
          total_amount: 1000
        }
      });
      const res = mockResponse();
      
      await analyticsController.createBill(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Server error'
        })
      );
      
      saveMock.mockRestore();
    });
  });
  
  describe('addItemToBill', () => {
    it('should add item to an existing bill', async () => {
      // Create mocked bill with proper ID type
      const mockBill = {
        _id: new mongoose.Types.ObjectId(),
        patient_id: 12345, // Number instead of ObjectId
        generation_date: new Date(),
        total_amount: 1000,
        remaining_amount: 1000,
        payment_status: 'pending',
        items: [],
        save: vi.fn().mockResolvedValueOnce({ items: [{ item_type: 'consultation' }] })
      };

      // Mock finding the bill
      const findByIdMock = vi.spyOn(Bill, 'findById').mockResolvedValueOnce(mockBill);
      
      // Mock creating a new BillItem
      const saveBillItemMock = vi.spyOn(BillItem.prototype, 'save').mockResolvedValueOnce({
        item_type: 'consultation',
        item_description: 'Doctor visit',
        item_amount: 500,
        quantity: 1
      });
      
      const req = mockRequest({
        params: { billId: mockBill._id.toString() },
        body: {
          item_type: 'consultation',
          item_description: 'Doctor visit',
          item_amount: 500,
          quantity: 1
        }
      });
      const res = mockResponse();
      
      await analyticsController.addItemToBill(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Item added to bill'
        })
      );
      
      findByIdMock.mockRestore();
      saveBillItemMock.mockRestore();
    });
    
    it('should return 404 if bill not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const findByIdMock = vi.spyOn(Bill, 'findById').mockResolvedValueOnce(null);
      
      const req = mockRequest({
        params: { billId: nonExistentId.toString() },
        body: { item_type: 'consultation' }
      });
      const res = mockResponse();
      
      await analyticsController.addItemToBill(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Bill not found'
        })
      );
      
      findByIdMock.mockRestore();
    });
  });
});

// Prescription Tests
describe('Prescription Functions', () => {
  describe('createPrescription', () => {
    it('should create a new prescription successfully', async () => {
      const saveMock = vi.spyOn(Prescription.prototype, 'save').mockResolvedValueOnce({
        patient_id: 12345, // Number instead of ObjectId
        doctor_id: 54321, // Number instead of ObjectId
        prescriptionDate: new Date(),
        entries: []
      });
      
      const req = mockRequest({ 
        body: {
          patient_id: 12345,
          doctor_id: 54321,
          prescriptionDate: new Date(),
          entries: []
        } 
      });
      const res = mockResponse();
      
      await analyticsController.createPrescription(req, res);
      
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Prescription created successfully'
        })
      );
      
      saveMock.mockRestore();
    });
    
    it('should handle errors when creating prescription', async () => {
      const saveMock = vi.spyOn(Prescription.prototype, 'save').mockImplementationOnce(() => {
        throw new Error('Database error');
      });
      
      const req = mockRequest({
        body: {
          patient_id: 12345
        }
      });
      const res = mockResponse();
      
      await analyticsController.createPrescription(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Server error'
        })
      );
      
      saveMock.mockRestore();
    });
  });
  
  describe('addPrescriptionEntry', () => {
    it('should add a prescription entry successfully', async () => {
      const saveMock = vi.spyOn(PrescriptionEntry.prototype, 'save').mockResolvedValueOnce({
        prescription_id: 123,
        medicine_id: 101,
        dosage: '10mg',
        frequency: 'twice daily',
        duration: '7 days',
        quantity: 14
      });
      
      const req = mockRequest({ 
        body: {
          prescription_id: 123,
          medicine_id: 101,
          dosage: '10mg',
          frequency: 'twice daily',
          duration: '7 days',
          quantity: 14
        } 
      });
      const res = mockResponse();
      
      await analyticsController.addPrescriptionEntry(req, res);
      
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Prescription entry added successfully'
        })
      );
      
      saveMock.mockRestore();
    });
    
    it('should handle errors when adding prescription entry', async () => {
      const saveMock = vi.spyOn(PrescriptionEntry.prototype, 'save').mockImplementationOnce(() => {
        throw new Error('Database error');
      });
      
      const req = mockRequest({
        body: {
          prescription_id: 123,
          medicine_id: 101
        }
      });
      const res = mockResponse();
      
      await analyticsController.addPrescriptionEntry(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Server error'
        })
      );
      
      saveMock.mockRestore();
    });
  });
});

// Feedback and Rating Tests
describe('Feedback and Rating Functions', () => {
  describe('addRatingAndReview', () => {
    it('should add feedback to a consultation', async () => {
      // Create a mock consultation with proper types
      const mockConsultation = {
        _id: new mongoose.Types.ObjectId(),
        patient_id: 12345, // Number instead of ObjectId
        doctor_id: 54321, // Number instead of ObjectId
        booked_date_time: new Date(),
        status: 'completed',
        feedback: undefined,
        save: vi.fn().mockResolvedValueOnce({
          feedback: { rating: 4, comments: 'Great service' }
        })
      };

      // Mock finding the consultation
      const findByIdMock = vi.spyOn(Consultation, 'findById').mockResolvedValueOnce(mockConsultation);
      
      // Mock saving the feedback
      const saveFeedbackMock = vi.spyOn(Feedback.prototype, 'save').mockResolvedValueOnce({
        dept_id: 'DEPT001',
        rating: 4,
        comments: 'Great service'
      });
      
      const req = mockRequest({
        params: { consultationId: mockConsultation._id.toString() },
        body: {
          dept_id: 'DEPT001',
          rating: 4,
          comments: 'Great service'
        }
      });
      const res = mockResponse();
      
      await analyticsController.addRatingAndReview(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Feedback added successfully'
        })
      );
      
      findByIdMock.mockRestore();
      saveFeedbackMock.mockRestore();
    });
    
    it('should return 404 if consultation not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const findByIdMock = vi.spyOn(Consultation, 'findById').mockResolvedValueOnce(null);
      
      const req = mockRequest({
        params: { consultationId: nonExistentId.toString() },
        body: {
          dept_id: 'DEPT001',
          rating: 4,
          comments: 'Great service'
        }
      });
      const res = mockResponse();
      
      await analyticsController.addRatingAndReview(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Consultation not found'
        })
      );
      
      findByIdMock.mockRestore();
    });
  });
  
  describe('calculateDepartmentRating', () => {
    it('should calculate average rating for a department', async () => {
      const departmentId = 'DEPT001';
      
      // Mock finding consultations
      const findMock = vi.spyOn(Consultation, 'find').mockResolvedValueOnce([
        { feedback: { rating: 4 } },
        { feedback: { rating: 5 } }
      ]);
      
      const req = mockRequest({
        params: { departmentId }
      });
      const res = mockResponse();
      
      await analyticsController.calculateDepartmentRating(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          departmentRating: 4.5 // Average of 4 and 5
        })
      );
      
      findMock.mockRestore();
    });
    
    it('should return 0 if no consultations with feedback exist', async () => {
      const departmentId = 'DEPT001';
      const findMock = vi.spyOn(Consultation, 'find').mockResolvedValueOnce([]);
      
      const req = mockRequest({
        params: { departmentId }
      });
      const res = mockResponse();
      
      await analyticsController.calculateDepartmentRating(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          departmentRating: 0,
          consultationlen: 0
        })
      );
      
      findMock.mockRestore();
    });
  });
  
  describe('getAllFeedbacks', () => {
    it('should retrieve all feedbacks', async () => {
      // Mock finding feedbacks
      const findMock = vi.spyOn(Feedback, 'find').mockResolvedValueOnce([
        {
          dept_id: 'DEPT001',
          rating: 4,
          comments: 'Good service',
          created_at: new Date()
        },
        {
          dept_id: 'DEPT002',
          rating: 5,
          comments: 'Excellent',
          created_at: new Date()
        }
      ]);
      
      const req = mockRequest();
      const res = mockResponse();
      
      await analyticsController.getAllFeedbacks(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          totalFeedbacks: 2,
          feedbacks: expect.arrayContaining([
            expect.objectContaining({
              rating: 4,
              comments: 'Good service'
            }),
            expect.objectContaining({
              rating: 5,
              comments: 'Excellent'
            })
          ])
        })
      );
      
      findMock.mockRestore();
    });
    
    it('should return empty array if no feedbacks exist', async () => {
      const findMock = vi.spyOn(Feedback, 'find').mockResolvedValueOnce([]);
      
      const req = mockRequest();
      const res = mockResponse();
      
      await analyticsController.getAllFeedbacks(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'No feedbacks found',
          feedbacks: []
        })
      );
      
      findMock.mockRestore();
    });
  });
  
  describe('calculateOverallRating', () => {
    it('should calculate the overall rating correctly', async () => {
      // Mock finding feedbacks
      const findMock = vi.spyOn(Feedback, 'find').mockResolvedValueOnce([
        { rating: 3 },
        { rating: 4 },
        { rating: 5 }
      ]);
      
      const req = mockRequest();
      const res = mockResponse();
      
      await analyticsController.calculateOverallRating(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          overallRating: 4, // Average of 3, 4, and 5
          totalFeedbacks: 3
        })
      );
      
      findMock.mockRestore();
    });
    
    it('should return 0 if no feedbacks with ratings exist', async () => {
      const findMock = vi.spyOn(Feedback, 'find').mockResolvedValueOnce([]);
      
      const req = mockRequest();
      const res = mockResponse();
      
      await analyticsController.calculateOverallRating(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          overallRating: 0,
          totalFeedbacks: 0
        })
      );
      
      findMock.mockRestore();
    });
  });
  
  describe('getRatingDistribution', () => {
    it('should calculate rating distribution correctly', async () => {
      // Mock aggregation result
      const aggregateMock = vi.spyOn(Consultation, 'aggregate').mockResolvedValueOnce([
        { "1": 1, "2": 2, "3": 1, "5": 1 }
      ]);
      
      const req = mockRequest();
      const res = mockResponse();
      
      await analyticsController.getRatingDistribution(req, res);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          ratingDistribution: expect.objectContaining({
            "1": 1,
            "2": 2,
            "3": 1,
            "5": 1
          })
        })
      );
      
      aggregateMock.mockRestore();
    });
    
    it('should handle errors when fetching rating distribution', async () => {
      const aggregateMock = vi.spyOn(Consultation, 'aggregate').mockImplementationOnce(() => {
        throw new Error('Aggregation error');
      });
      
      const req = mockRequest();
      const res = mockResponse();
      
      await analyticsController.getRatingDistribution(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Failed to fetch rating distribution'
        })
      );
      
      aggregateMock.mockRestore();
    });
  });
  
  describe('getFeedbacksByRating', () => {
    it('should return feedbacks filtered by rating', async () => {
      // Mock finding consultations
      const findMock = vi.spyOn(Consultation, 'find').mockResolvedValueOnce([
        { 
          feedback: { comments: 'Very good' },
          createdAt: new Date()
        },
        { 
          feedback: { comments: 'Good experience' },
          createdAt: new Date()
        }
      ]);
      
      const req = mockRequest({
        params: { rating: '4' }
      });
      const res = mockResponse();
      
      await analyticsController.getFeedbacksByRating(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          rating: 4,
          totalComments: 2,
          comments: expect.arrayContaining([
            expect.objectContaining({
              comments: 'Very good'
            }),
            expect.objectContaining({
              comments: 'Good experience'
            })
          ])
        })
      );
      
      findMock.mockRestore();
    });
    
    it('should validate rating parameter', async () => {
      const req = mockRequest({
        params: { rating: 'invalid' }
      });
      const res = mockResponse();
      
      await analyticsController.getFeedbacksByRating(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid rating. Rating must be a number between 1 and 5.'
        })
      );
    });
  });
});

// Facility Tests
describe('Facility Functions', () => {
  describe('getFacilityStatistics', () => {
    it('should calculate facility statistics correctly', async () => {
      // Mock rooms with valid room_type
      const findMock = vi.spyOn(Room, 'find').mockResolvedValueOnce([
        {
          room_number: 101,
          floor: 1,
          room_type: 'private', // Use valid enum value
          beds: [
            { bed_number: 1, bed_type: 'standard' },
            { bed_number: 2, bed_type: 'standard' }
          ]
        },
        {
          room_number: 201,
          floor: 2,
          room_type: 'icu', // Use valid enum value
          beds: [
            { bed_number: 1, bed_type: 'deluxe' }
          ]
        }
      ]);
      
      const req = mockRequest();
      const res = mockResponse();
      
      await analyticsController.getFacilityStatistics(req, res);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          totalRooms: 2,
          totalBeds: 3 // 2 beds in first room + 1 bed in second room
        })
      );
      
      findMock.mockRestore();
    });
    
    it('should handle errors when fetching facility statistics', async () => {
      const findMock = vi.spyOn(Room, 'find').mockImplementationOnce(() => {
        throw new Error('Database error');
      });
      
      const req = mockRequest();
      const res = mockResponse();
      
      await analyticsController.getFacilityStatistics(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Error fetching facility statistics'
        })
      );
      
      findMock.mockRestore();
    });
  });
  
  describe('getBedOccupancyTrends', () => {
    // Fix for the getBedOccupancyTrends test
    it('should return bed occupancy trends based on period', async () => {
        const startDate = new Date('2025-01-01');
        const endDate = new Date('2025-01-31');
        
        // Mock with chainable methods
        const findMock = vi.spyOn(BedLog, 'find').mockReturnValueOnce({
        sort: vi.fn().mockResolvedValueOnce([
            {
            bed_id: 101,
            room_id: 201,
            patient_id: 12345,
            status: 'occupied',
            bed_type: 'deluxe',
            time: new Date('2025-01-05')
            },
            {
            bed_id: 102,
            room_id: 202,
            patient_id: 12346,
            status: 'vacated',
            bed_type: 'deluxe',
            time: new Date('2025-01-10')
            }
        ])
        });
        
        const req = mockRequest({
        params: { period: 'weekly' },
        body: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            bedType: 'all'
        }
        });
        const res = mockResponse();
        
        await analyticsController.getBedOccupancyTrends(req, res);
        
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
            period: 'weekly',
            bedType: 'all',
            startDate: moment(startDate).format("YYYY-MM-DD"),
            endDate: moment(endDate).format("YYYY-MM-DD")
        })
        );
        
        findMock.mockRestore();
    });
      
    it('should validate date format', async () => {
      const req = mockRequest({
        params: { period: 'weekly' },
        body: {
          startDate: 'invalid-date',
          endDate: 'invalid-date'
        }
      });
      const res = mockResponse();
      
      await analyticsController.getBedOccupancyTrends(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid date format provided.'
        })
      );
    });
    
    it('should validate period parameter', async () => {
      const req = mockRequest({
        params: { period: 'invalid' },
        body: {
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString()
        }
      });
      const res = mockResponse();
      
      await analyticsController.getBedOccupancyTrends(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid period. Valid options are weekly or monthly.'
        })
      );
    });
  });
});

// Financial Analytics Tests
describe('Financial Analytics Functions', () => {
  describe('getFinanceTrends', () => {
    it('should calculate finance trends correctly', async () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');
      
      // Mock aggregation result
      const aggregateMock = vi.spyOn(Bill, 'aggregate').mockResolvedValueOnce([
        { "_id": { year: 2025, month: 1 }, totalAmount: 3000 }
      ]);
      
      const req = mockRequest({
        body: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      });
      const res = mockResponse();
      
      await analyticsController.getFinanceTrends(req, res);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          monthly: expect.arrayContaining([
            expect.objectContaining({
              label: expect.stringContaining('Jan 2025'),
              amount: 3000
            })
          ])
        })
      );
      
      aggregateMock.mockRestore();
    });
    
    it('should handle errors when calculating finance trends', async () => {
      const aggregateMock = vi.spyOn(Bill, 'aggregate').mockImplementationOnce(() => {
        throw new Error('Aggregation error');
      });
      
      const req = mockRequest({
        body: {
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString()
        }
      });
      const res = mockResponse();
      
      await analyticsController.getFinanceTrends(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Server error'
        })
      );
      
      aggregateMock.mockRestore();
    });
  });
});

// Doctor Performance Tests
describe('Doctor Performance Functions', () => {
  describe('getDoctorQuadrantData', () => {
    it('should categorize doctors into quadrants correctly', async () => {
      // Mock aggregation result with proper structure
      const aggregateMock = vi.spyOn(Consultation, 'aggregate').mockResolvedValueOnce([
        {
          doctorId: 101,
          doctorName: 'Dr. Smith',
          department_id: 'DEPT001',
          departmentName: 'Cardiology',
          rating: 4.5,
          consultationCount: 3
        },
        {
          doctorId: 102,
          doctorName: 'Dr. Jones',
          department_id: 'DEPT002',
          departmentName: 'Neurology',
          rating: 3.2,
          consultationCount: 1
        }
      ]);
      
      const req = mockRequest({
        body: {
          ratingThreshold: 4.0,
          consultationThreshold: 2
        }
      });
      const res = mockResponse();
      
      await analyticsController.getDoctorQuadrantData(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          highConsHighRating: expect.arrayContaining([
            expect.objectContaining({
              DOCTOR: 'Dr. Smith',
              DEPARTMENT: 'Cardiology',
              CONSULTATIONS: 3
            })
          ]),
          lowConsLowRating: expect.arrayContaining([
            expect.objectContaining({
              DOCTOR: 'Dr. Jones',
              DEPARTMENT: 'Neurology',
              CONSULTATIONS: 1
            })
          ])
        })
      );
      
      aggregateMock.mockRestore();
    });
    
    it('should handle errors when categorizing doctor data', async () => {
      const aggregateMock = vi.spyOn(Consultation, 'aggregate').mockImplementationOnce(() => {
        throw new Error('Aggregation error');
      });
      
      const req = mockRequest({
        body: {
          ratingThreshold: 4.0,
          consultationThreshold: 2
        }
      });
      const res = mockResponse();
      
      await analyticsController.getDoctorQuadrantData(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Failed to retrieve doctor performance data'
        })
      );
      
      aggregateMock.mockRestore();
    });
  });
  
  describe('getDoctorWorkingTrends', () => {
    it('should calculate doctor working trends correctly', async () => {
      // Mock finding employee and doctor
      const findOneEmployeeMock = vi.spyOn(Employee, 'findOne').mockResolvedValueOnce({
        _id: 123,
        name: 'Dr. Smith',
        role: 'doctor',
        email: 'drsmith@example.com'
      });
      
      const findOneDoctorMock = vi.spyOn(Doctor, 'findOne').mockResolvedValueOnce({
        _id: 456,
        employee_id: 123,
        specialization: 'Cardiology'
      });
      
      // Mock aggregation results for monthly and weekly data
      const aggregateMock = vi.spyOn(Consultation, 'aggregate')
        .mockResolvedValueOnce([{ _id: { year: 2025, month: 1 }, count: 3 }]) // Monthly agg
        .mockResolvedValueOnce([{ _id: { year: 2025, week: 1 }, count: 3 }]); // Weekly agg
      
      const req = mockRequest({
        query: {
          doctorName: 'Dr. Smith',
          startDate: '2025-01-01',
          endDate: '2025-01-31'
        }
      });
      const res = mockResponse();
      
      await analyticsController.getDoctorWorkingTrends(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          monthly: expect.arrayContaining([
            expect.objectContaining({
              label: expect.stringContaining('Jan 2025'),
              count: 3
            })
          ])
        })
      );
      
      findOneEmployeeMock.mockRestore();
      findOneDoctorMock.mockRestore();
      aggregateMock.mockRestore();
    });
    
    it('should handle missing parameters', async () => {
      const req = mockRequest({
        query: {
          doctorName: 'Dr. Smith'
          // Missing startDate and endDate
        }
      });
      const res = mockResponse();
      
      await analyticsController.getDoctorWorkingTrends(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Missing parameters'
        })
      );
    });
    
    it('should handle doctor not found', async () => {
      const findOneEmployeeMock = vi.spyOn(Employee, 'findOne').mockResolvedValueOnce(null);
      
      const req = mockRequest({
        query: {
          doctorName: 'Dr. Nonexistent',
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString()
        }
      });
      const res = mockResponse();
      
      await analyticsController.getDoctorWorkingTrends(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Doctor not found in employee records'
        })
      );
      
      findOneEmployeeMock.mockRestore();
    });
  });
});

// Dashboard KPIs Test
describe('Dashboard KPI Functions', () => {
  describe('getDashboardKPIs', () => {
    it('should calculate dashboard KPIs correctly', async () => {
      // Mock current date
      const now = new Date('2025-04-16T14:23:00');
      vi.useFakeTimers();
      vi.setSystemTime(now);
      
      // Mock document counts and aggregation results
      const countDocumentsMock = vi.spyOn(Consultation, 'countDocuments')
        .mockResolvedValueOnce(2) // Current month patients
        .mockResolvedValueOnce(1); // Last month patients
      
      const aggregateMock = vi.spyOn(Bill, 'aggregate')
        .mockResolvedValueOnce([{ _id: null, total: 200000 }]) // Current month revenue
        .mockResolvedValueOnce([{ _id: null, total: 100000 }]); // Last month revenue
      
      const findFeedbackMock = vi.spyOn(Feedback, 'find')
        .mockResolvedValueOnce([{ rating: 4 }, { rating: 5 }]) // Current month feedbacks
        .mockResolvedValueOnce([{ rating: 3 }]); // Last month feedbacks
      
      const req = mockRequest();
      const res = mockResponse();
      
      await analyticsController.getDashboardKPIs(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          totalPatients: expect.objectContaining({
            value: 2,
            trend: 'up'
          }),
          revenue: expect.objectContaining({
            value: expect.stringMatching(/2.0L/),
            trend: 'up'
          }),
          satisfaction: expect.objectContaining({
            value: expect.stringMatching(/4.5\/5.0/),
            trend: 'up'
          })
        })
      );
      
      vi.useRealTimers();
      countDocumentsMock.mockRestore();
      aggregateMock.mockRestore();
      findFeedbackMock.mockRestore();
    });
    
    it('should handle errors when calculating dashboard KPIs', async () => {
      const countDocsMock = vi.spyOn(Consultation, 'countDocuments').mockImplementationOnce(() => {
        throw new Error('Database error');
      });
      
      const req = mockRequest();
      const res = mockResponse();
      
      await analyticsController.getDashboardKPIs(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Error fetching dashboard KPIs'
        })
      );
      
      countDocsMock.mockRestore();
    });
  });
});
