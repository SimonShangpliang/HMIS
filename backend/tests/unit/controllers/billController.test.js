// tests/unit/controllers/billController.test.js
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import supertest from 'supertest';
import mongoose from 'mongoose';
import express from 'express';
import { connectDB, disconnectDB, syncIndexes } from '../../helpers/db.js';
import * as billController from '../../../controllers/billController.js';
import models from '../../../models/bill.js';
import { MongoMemoryServer } from 'mongodb-memory-server';

const { Bill } = models;

describe('Bill Controller Tests', () => {
  let mongoServer;
  let app;
  let request;
  let testPatientId = 12345;
  let testBillId;
  let initialBill;

  // Set up Express app for integration tests
  app = express();
  app.use(express.json());
  app.get('/api/bills/patient/:patientId', billController.getBillsByPatientId);
  app.get('/api/bills/patient/:patientId/detailed', billController.getAllDetailedBillsByPatientId);
  app.get('/api/bills/:billId', billController.getBillDetails);
  app.get('/api/bills/:billId/payments', billController.getPaymentsByBillId);
  app.post('/api/bills/:billId/payments', billController.addPayment);
  app.post('/api/bills/:billId/items', billController.addBillingItem);
  app.post('/api/bills/:billId/items/batch', billController.addBillingItems);
  app.post('/api/bills', billController.createBill);
  
  request = supertest(app);

  // Setup hospital bank account global variable that's used in the controller
  global.hospitalBankAccount = {
    bank_name: "Test Health Bank",
    account_number: 1234567890,
    ifsc_code: "TESTHB0001234",
    branch_name: "Test Branch",
    balance: 5000
  };

  beforeAll(async () => {
    // Create in-memory MongoDB instance and connect
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await connectDB(mongoUri);
    
    // Create an initial test bill
    initialBill = new Bill({
      patient_id: testPatientId,
      generation_date: new Date(),
      total_amount: 1000,
      remaining_amount: 1000,
      payment_status: "pending",
      items: [{
        item_type: "consultation",
        item_description: "Initial consultation",
        item_amount: 500,
        quantity: 1
      }, {
        item_type: "test",
        item_description: "Blood test",
        item_amount: 500,
        quantity: 1
      }],
      payments: []
    });
    
    await initialBill.save();
    await syncIndexes();
    testBillId = initialBill._id.toString();
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await disconnectDB();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Reset hospital bank account balance before each test
    global.hospitalBankAccount.balance = 5000;
  });

  describe('getBillsByPatientId', () => {
    it('should return all bills for a valid patient ID', async () => {
      // Arrange
      const patientId = testPatientId;
      const req = { params: { patientId } };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };

      // Act
      await billController.getBillsByPatientId(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.arrayContaining([
            expect.objectContaining({
              bill_id: expect.any(mongoose.Types.ObjectId),
              total_amount: 1000,
              payment_status: "pending"
            })
          ])
        })
      );
    });

    it('should return 400 if patient ID is missing', async () => {
      // Arrange
      const req = { params: {} };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };

      // Act
      await billController.getBillsByPatientId(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Patient ID is required"
        })
      );
    });

    it('should return empty array for patient with no bills', async () => {
      // Arrange
      const patientId = 99999; // Non-existent patient
      const req = { params: { patientId } };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };

      // Act
      await billController.getBillsByPatientId(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: []
        })
      );
    });

    // Integration test
    it('GET /api/bills/patient/:patientId should return bills', async () => {
      const response = await request
        .get(`/api/bills/patient/${testPatientId}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('getAllDetailedBillsByPatientId', () => {
    it('should return 400 if patient ID is missing', async () => {
      // Arrange
      const req = { params: {} };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };

      // Act
      await billController.getAllDetailedBillsByPatientId(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Patient ID is required"
        })
      );
    });
  });

  describe('getBillDetails', () => {
    it('should return 400 if bill ID is missing', async () => {
      // Arrange
      const req = { params: {} };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };

      // Act
      await billController.getBillDetails(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Bill ID is required"
        })
      );
    });

    it('should return 404 if bill is not found', async () => {
      // Arrange
      const billId = new mongoose.Types.ObjectId(); // Non-existent bill ID
      const req = { params: { billId } };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };

      // Act
      await billController.getBillDetails(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Bill not found"
        })
      );
    });
  });

  describe('getPaymentsByBillId', () => {
    it('should return payments for a valid bill ID', async () => {
      // Arrange
      const billId = testBillId;
      const req = { params: { billId } };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };

      // Act
      await billController.getPaymentsByBillId(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.any(Array)
        })
      );
    });

    it('should return 400 if bill ID is missing', async () => {
      // Arrange
      const req = { params: {} };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };

      // Act
      await billController.getPaymentsByBillId(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Bill ID is required"
        })
      );
    });

    // Integration test
    it('GET /api/bills/:billId/payments should return payments', async () => {
      const response = await request
        .get(`/api/bills/${testBillId}/payments`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('addPayment', () => {
    it('should add a payment to a bill', async () => {
      // Arrange
      const billId = testBillId;
      const paymentData = {
        amount: 500,
        payment_method: "cash"
      };
      const req = { params: { billId }, body: paymentData };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };

      const initialBalance = global.hospitalBankAccount.balance;

      // Act
      await billController.addPayment(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Payment added successfully",
          data: expect.objectContaining({
            payment: expect.objectContaining({
              amount: 500,
              payment_method: "cash"
            }),
            bill: expect.objectContaining({
              payment_status: "partially_paid",
              remaining_amount: 500 // 1000 - 500
            })
          })
        })
      );
      
      // Verify hospital bank account balance was updated
      expect(global.hospitalBankAccount.balance).toBe(initialBalance + 500);
    });

    it('should return 400 if bill ID is missing', async () => {
      // Arrange
      const req = { params: {}, body: { amount: 500, payment_method: "cash" } };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };

      // Act
      await billController.addPayment(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Bill ID is required"
        })
      );
    });

    it('should return 400 if payment data is incomplete', async () => {
      // Arrange
      const billId = testBillId;
      const req = { params: { billId }, body: {} };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };

      // Act
      await billController.addPayment(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Payment amount and method are required"
        })
      );
    });

    // Integration test
    it('POST /api/bills/:billId/payments should add a payment', async () => {
      const response = await request
        .post(`/api/bills/${testBillId}/payments`)
        .send({
          amount: 200,
          payment_method: "card",
          transaction_id: "tx12345"
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.payment).toHaveProperty('amount', 200);
      expect(response.body.data.bill).toHaveProperty('payment_status', 'partially_paid');
      expect(response.body.data.bill.remaining_amount).toBe(300); // 500 - 200 (from previous test)
    });
  });

  describe('addBillingItem', () => {
    it('should add a billing item to a bill', async () => {
      // Arrange
      const billId = testBillId;
      const itemData = {
        item_type: "medication",
        item_description: "Antibiotics",
        item_amount: 200,
        quantity: 2
      };
      const req = { params: { billId }, body: itemData };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };

      // Act
      await billController.addBillingItem(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Billing item added successfully",
          data: expect.objectContaining({
            item: expect.objectContaining({
              item_type: "medication",
              item_amount: 200,
              quantity: 2
            }),
            bill: expect.objectContaining({
              total_amount: 1400, // 1000 + (200 * 2)
              remaining_amount: 700 // 300 + 400 (from previous payment tests)
            })
          })
        })
      );
    });

    it('should return 400 if bill ID is missing', async () => {
      // Arrange
      const req = { params: {}, body: { 
        item_type: "test", 
        item_description: "X-ray", 
        item_amount: 300 
      }};
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };

      // Act
      await billController.addBillingItem(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Bill ID is required"
        })
      );
    });

    it('should return 400 if item data is incomplete', async () => {
      // Arrange
      const billId = testBillId;
      const req = { params: { billId }, body: {} };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };

      // Act
      await billController.addBillingItem(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Item type, amount, and description are required"
        })
      );
    });

    // Integration test
    it('POST /api/bills/:billId/items should add a billing item', async () => {
      const response = await request
        .post(`/api/bills/${testBillId}/items`)
        .send({
          item_type: "procedure",
          item_description: "Minor surgery",
          item_amount: 800,
          quantity: 1
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.item).toHaveProperty('item_type', 'procedure');
      expect(response.body.data.bill).toHaveProperty('total_amount', 2200); // 1400 + 800
      expect(response.body.data.bill.remaining_amount).toBe(1500); // 700 + 800
    });
  });

  describe('addBillingItems', () => {
    it('should add multiple billing items to a bill', async () => {
      // Arrange
      const billId = testBillId;
      const items = [
        {
          item_type: "medication",
          item_description: "Pain medication",
          item_amount: 150,
          quantity: 1
        },
        {
          item_type: "test",
          item_description: "MRI",
          item_amount: 1200,
          quantity: 1
        }
      ];
      const req = { params: { billId }, body: { items } };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };

      // Act
      await billController.addBillingItems(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "2 billing item(s) added successfully",
          data: expect.objectContaining({
            addedItems: expect.arrayContaining([
              expect.objectContaining({
                item_type: "medication",
                item_amount: 150
              }),
              expect.objectContaining({
                item_type: "test",
                item_amount: 1200
              })
            ]),
            bill: expect.objectContaining({
              total_amount: 3550, // 2200 + 150 + 1200
              remaining_amount: 2850 // 1500 + 150 + 1200
            })
          })
        })
      );
    });

    it('should return 400 if bill ID is missing', async () => {
      // Arrange
      const req = { params: {}, body: { items: [] } };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };

      // Act
      await billController.addBillingItems(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Bill ID is required"
        })
      );
    });

    it('should return 400 if items array is empty', async () => {
      // Arrange
      const billId = testBillId;
      const req = { params: { billId }, body: { items: [] } };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };

      // Act
      await billController.addBillingItems(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Items array is required and must not be empty"
        })
      );
    });
  });

  describe('createBill', () => {
    it('should create a new bill', async () => {
      // Arrange
      const billData = {
        patient_id: 54321,
        items: [
          {
            item_type: "consultation",
            item_description: "Specialist consultation",
            item_amount: 800,
            quantity: 1
          }
        ]
      };
      const req = { body: billData };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };

      // Act
      await billController.createBill(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Bill created successfully",
          data: expect.objectContaining({
            patient_id: 54321,
            total_amount: 800,
            payment_status: "pending"
          })
        })
      );
    });

    it('should return 400 if patient ID is missing', async () => {
      // Arrange
      const req = { body: { items: [] } };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };

      // Act
      await billController.createBill(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Patient ID is required"
        })
      );
    });

    // Integration test
    it('POST /api/bills should create a new bill', async () => {
      const response = await request
        .post('/api/bills')
        .send({
          patient_id: 98765,
          items: [
            {
              item_type: "medication",
              item_description: "Prescription drugs",
              item_amount: 350,
              quantity: 1
            },
            {
              item_type: "consultation",
              item_description: "Follow-up consultation",
              item_amount: 400,
              quantity: 1
            }
          ]
        });
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('patient_id', 98765);
      expect(response.body.data).toHaveProperty('total_amount', 750);
      expect(response.body.data).toHaveProperty('payment_status', 'pending');
    });
  });
});
