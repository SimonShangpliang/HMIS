// tests/unit/controllers/commonPagesController.test.js
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { connectDB, disconnectDB, syncIndexes } from '../../helpers/db.js';
import * as commonPagesController from '../../../controllers/commonPagesController.js';
import mongoose from 'mongoose';

// Models used by the controller
import Patient from '../../../models/patient.js';
import Employee from '../../../models/employee.js';
import { Doctor, Nurse, Pathologist, Receptionist, Pharmacist, Admin, Driver } from '../../../models/staff.js';
import Medicine from '../../../models/inventory.js';
import Equipment from '../../../models/equipment.js';

// Create mock response object
const mockResponse = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

// Mock cloudinary properly
vi.mock('cloudinary', () => {
    return {
      v2: {
        config: vi.fn(),
        uploader: {
          upload: vi.fn().mockResolvedValue({ secure_url: 'https://test-image.jpg' })
        }
      }
    };
});

describe('Common Pages Controller Tests', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    // Clean database collections before each test
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });

  describe('fetchProfile function', () => {
    it('should return 404 when user is not found', async () => {
      const req = {
        params: {
          userType: 'patient',
          id: '99999' // Non-existent ID
        }
      };
      const res = mockResponse();

      await commonPagesController.fetchProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'User not found'
      }));
    });

    it('should handle server errors correctly', async () => {
      // Create a test patient first
      const patientId = 12345;
      const testPatient = new Patient({
        _id: patientId,
        name: 'Test Patient',
        email: 'test@example.com'
      });
      
      await testPatient.save();
      await syncIndexes(Patient);

      // Mock a server error by spying on Patient.findById
      const originalFindById = Patient.findById;
      Patient.findById = vi.fn().mockImplementation(() => {
        throw new Error('Database error');
      });

      const req = {
        params: {
          userType: 'patient',
          id: patientId.toString()
        }
      };
      const res = mockResponse();

      await commonPagesController.fetchProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Error fetching profile'
      }));

      // Restore original function
      Patient.findById = originalFindById;
    });
  });

  describe('updateProfile function', () => {
    it('should return 404 when user to update is not found', async () => {
      const req = {
        params: {
          userType: 'patient',
          id: '99999' // Non-existent ID
        },
        body: {
          name: 'Updated Name'
        }
      };
      const res = mockResponse();

      await commonPagesController.updateProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'User not found'
      }));
    });

    it('should handle server errors during update', async () => {
      // Create test patient first
      const patientId = 12345;
      const testPatient = new Patient({
        _id: patientId,
        name: 'Test Name',
        email: 'test@example.com'
      });
      
      await testPatient.save();
      await syncIndexes(Patient);

      // Mock an error in Patient.findByIdAndUpdate
      const originalFindByIdAndUpdate = Patient.findByIdAndUpdate;
      Patient.findByIdAndUpdate = vi.fn().mockImplementation(() => {
        throw new Error('Database error');
      });

      const req = {
        params: {
          userType: 'patient',
          id: patientId.toString()
        },
        body: {
          name: 'Updated Name'
        }
      };
      const res = mockResponse();

      await commonPagesController.updateProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Error updating profile'
      }));

      // Restore the original function
      Patient.findByIdAndUpdate = originalFindByIdAndUpdate;
    });
  });

  describe('searchInventory function', () => {
    beforeEach(async () => {
      // Create test medicines with exact fields that match the controller's query
      const medicines = [
        {
          _id: 1001,
          med_name: 'Aspirin',
          manufacturer: 'Pharma Co',
          available: true,
          inventory: [{ quantity: 100, expiry_date: new Date('2026-01-01') }],
          order_status: 'ordered'
        },
        {
          _id: 1002,
          med_name: 'Paracetamol',
          manufacturer: 'Med Labs',
          available: true,
          inventory: [{ quantity: 50, expiry_date: new Date('2026-02-01') }],
          order_status: 'ordered'
        },
        {
          _id: 1003,
          med_name: 'Ibuprofen',
          manufacturer: 'Pharma Co',
          available: false,
          inventory: [{ quantity: 0, expiry_date: new Date('2025-12-01') }],
          order_status: 'ordered'
        },
        {
          _id: 1004,
          med_name: 'Antibiotics',
          manufacturer: 'BioMed',
          available: true,
          inventory: [{ quantity: 75, expiry_date: new Date('2024-03-01') }], // Expired medicine
          order_status: 'requested'
        }
      ];

      for (const med of medicines) {
        await new Medicine(med).save();
      }
      await syncIndexes(Medicine);
      
      // Verify medicines were saved
      const count = await Medicine.countDocuments();
      expect(count).toBe(4);

      // Create test equipment
      const equipment = [
        {
          _id: 2001,
          equipment_name: 'X-Ray Machine',
          quantity: 2,
          installation_date: new Date('2022-01-01'),
          last_service_date: new Date('2023-01-01'),
          next_service_date: new Date('2025-01-01'), // Future date
          order_status: 'ordered'
        },
        {
          _id: 2002,
          equipment_name: 'MRI Scanner',
          quantity: 1,
          installation_date: new Date('2022-02-01'),
          last_service_date: new Date('2023-02-01'),
          next_service_date: new Date('2023-12-01'), // Overdue date
          order_status: 'ordered'
        },
        {
          _id: 2003,
          equipment_name: 'ECG Machine',
          quantity: 3,
          installation_date: new Date('2022-03-01'),
          last_service_date: new Date('2023-03-01'),
          next_service_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // Due soon
          order_status: 'requested'
        }
      ];

      for (const equip of equipment) {
        await new Equipment(equip).save();
      }
      await syncIndexes(Equipment);
      
      // Verify equipment was saved
      const equipCount = await Equipment.countDocuments();
      expect(equipCount).toBe(3);
    });

    it('should search medicines with admin role', async () => {
      const req = {
        query: {
          searchQuery: 'Pharma',
          type: 'medicine',
          role: 'admin',
          page: 1,
          limit: 10
        }
      };
      const res = mockResponse();

      await commonPagesController.searchInventory(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      
      expect(response.items.length).toBeGreaterThan(0);
      // At least find Aspirin and Ibuprofen with "Pharma Co" manufacturer
      const pharmaItems = response.items.filter(item => 
        item.manufacturer && item.manufacturer.includes('Pharma')
      );
      expect(pharmaItems.length).toBeGreaterThan(0);
    });

    it('should search equipment with admin role', async () => {
      const req = {
        query: {
          searchQuery: 'Machine',
          type: 'equipment',
          role: 'admin',
          page: 1,
          limit: 10
        }
      };
      const res = mockResponse();

      await commonPagesController.searchInventory(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      
      expect(response.items.length).toBeGreaterThan(0);
      // Should find items with "Machine" in the name
      const machineItems = response.items.filter(item => 
        item.name && item.name.includes('Machine')
      );
      expect(machineItems.length).toBeGreaterThan(0);
    });

    it('should filter by pending requests for admin in pending view mode', async () => {
      const req = {
        query: {
          type: 'medicine',
          role: 'admin',
          viewMode: 'pending',
          page: 1,
          limit: 10
        }
      };
      const res = mockResponse();

      await commonPagesController.searchInventory(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      
      // Should only find medicines with order_status = 'requested'
      expect(response.items.length).toBeGreaterThan(0);
      const antibioticsItem = response.items.find(item => item.name === 'Antibiotics');
      expect(antibioticsItem).toBeDefined();
    });

    it('should limit non-admin users to only see ordered items', async () => {
      const req = {
        query: {
          type: 'medicine',
          role: 'user', // Non-admin role
          page: 1,
          limit: 10
        }
      };
      const res = mockResponse();

      await commonPagesController.searchInventory(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      
      // Should not include 'Antibiotics' which has order_status = 'requested'
      const antibioticsItem = response.items.find(item => item.name === 'Antibiotics');
      expect(antibioticsItem).toBeUndefined();
      
      // Should include at least one ordered medicine
      expect(response.items.length).toBeGreaterThan(0);
    });

    it('should calculate expired quantity correctly', async () => {
      // First verify our test data has the expired medicine
      const antibiotics = await Medicine.findOne({ med_name: 'Antibiotics' });
      expect(antibiotics).not.toBeNull();
      expect(antibiotics.inventory[0].expiry_date).toBeDefined();
      
      // Make sure the expiry date is in the past
      const expiryDate = new Date(antibiotics.inventory[0].expiry_date);
      const now = new Date();
      expect(expiryDate < now).toBe(true);

      const req = {
        query: {
          searchQuery: 'Antibiotics',
          type: 'medicine',
          role: 'admin',
          viewMode: 'pending', // Need to set this to find requested items
          page: 1,
          limit: 10
        }
      };
      const res = mockResponse();

      await commonPagesController.searchInventory(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      
      expect(response.items.length).toBeGreaterThan(0);
      const antibioticsItem = response.items.find(item => item.name === 'Antibiotics');
      expect(antibioticsItem).toBeDefined();
      expect(antibioticsItem.expired_quantity).toBe(75); // Should be counted as expired
    });

    it('should handle pagination correctly', async () => {
      const req = {
        query: {
          type: 'medicine',
          role: 'admin',
          page: 1,
          limit: 2 // Only get 2 items per page
        }
      };
      const res = mockResponse();

      await commonPagesController.searchInventory(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      
      expect(response.items.length).toBe(2); // Should only get 2 items
      expect(response.page).toBe(1);
      expect(response.hasNextPage).toBe(true); // More than 2 medicines total
      expect(response.hasPrevPage).toBe(false); // First page
    });

    it('should handle server errors during search', async () => {
      // Mock an error in Medicine.find
      const originalFind = Medicine.find;
      Medicine.find = vi.fn().mockImplementation(() => {
        throw new Error('Database error');
      });

      const req = {
        query: {
          type: 'medicine',
          role: 'admin'
        }
      };
      const res = mockResponse();

      await commonPagesController.searchInventory(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Error searching inventory'
      }));

      // Restore the original function
      Medicine.find = originalFind;
    });
  });

  describe('uploadEmployeePhoto function', () => {
    it('should return error when no image is uploaded', async () => {
      const req = {
        params: {
          employeeId: '1001'
        },
        // No file
        file: null
      };
      const res = mockResponse();

      await commonPagesController.uploadEmployeePhoto(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'No image uploaded'
      }));
    });

    it('should return 404 when employee is not found', async () => {
      const req = {
        params: {
          employeeId: '9999' // Non-existent ID
        },
        file: {
          path: 'https://new-image.jpg'
        }
      };
      const res = mockResponse();

      await commonPagesController.uploadEmployeePhoto(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Employee not found'
      }));
    });
  });
});
