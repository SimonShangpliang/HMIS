// tests/integration/models/bill.integration.test.js
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../../helpers/db.js';
import BillModels from '../../../models/bill.js';
import express from 'express';
import supertest from 'supertest';

const { Bill, BillItem } = BillModels;

let app;
let server;
let port;

// Setup and teardown
beforeAll(async () => {
  await connectDB();
  
  // Setup Express app for testing
  app = express();
  app.use(express.json());
  
  // Simple bill routes for testing
  app.post('/bills', async (req, res) => {
    try {
      const bill = new Bill(req.body);
      const savedBill = await bill.save();
      res.status(201).json(savedBill);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  
  app.get('/bills/patient/:patientId', async (req, res) => {
    try {
      const bills = await Bill.find({ patient_id: req.params.patientId });
      res.json(bills);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  app.patch('/bills/:id/payment', async (req, res) => {
    try {
      const { amount, payment_method } = req.body;
      const bill = await Bill.findById(req.params.id);
      
      if (!bill) {
        return res.status(404).json({ error: 'Bill not found' });
      }
      
      // Add payment
      bill.payments.push({
        amount,
        payment_date: new Date(),
        status: 'success',
        payment_method
      });
      
      // Update remaining amount
      bill.remaining_amount -= amount;
      
      // Update payment status
      if (bill.remaining_amount <= 0) {
        bill.payment_status = 'paid';
      } else {
        bill.payment_status = 'partially_paid';
      }
      
      const updatedBill = await bill.save();
      res.json(updatedBill);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  
  // Start the server
  server = app.listen(0);
  port = server.address().port;
});

afterAll(async () => {
  await disconnectDB();
  server.close();
});

beforeEach(async () => {
  await Bill.deleteMany({});
});

describe('Bill API Integration', () => {
  // Test creating a bill via API
  it('should create a bill via API', async () => {
    const billData = {
      patient_id: 12345,
      generation_date: new Date(),
      total_amount: 1500,
      remaining_amount: 1500,
      payment_status: 'pending',
      items: [
        {
          item_type: 'consultation',
          item_description: 'Doctor consultation',
          item_amount: 500,
          quantity: 1
        }
      ]
    };
    
    const response = await supertest(app)
      .post('/bills')
      .send(billData);
    
    expect(response.status).toBe(201);
    expect(response.body.patient_id).toBe(12345);
    expect(response.body.items).toHaveLength(1);
  });
  
  // Test retrieving patient bills
  it('should retrieve bills for a specific patient', async () => {
    // Create test bills
    await new Bill({
      patient_id: 12345,
      generation_date: new Date(),
      total_amount: 1500,
      remaining_amount: 1500,
      payment_status: 'pending'
    }).save();
    
    await new Bill({
      patient_id: 12345,
      generation_date: new Date(),
      total_amount: 2000,
      remaining_amount: 2000,
      payment_status: 'pending'
    }).save();
    
    const response = await supertest(app).get('/bills/patient/12345');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0].patient_id).toBe(12345);
    expect(response.body[1].patient_id).toBe(12345);
  });
  
  // Test adding a payment to a bill
  it('should add a payment to a bill and update status', async () => {
    // Create a test bill
    const bill = await new Bill({
      patient_id: 12345,
      generation_date: new Date(),
      total_amount: 1500,
      remaining_amount: 1500,
      payment_status: 'pending'
    }).save();
    
    const paymentData = {
      amount: 1500,  // Full payment
      payment_method: 'cash'
    };
    
    const response = await supertest(app)
      .patch(`/bills/${bill._id}/payment`)
      .send(paymentData);
    
    expect(response.status).toBe(200);
    expect(response.body.remaining_amount).toBe(0);
    expect(response.body.payment_status).toBe('paid');
    expect(response.body.payments).toHaveLength(1);
    expect(response.body.payments[0].amount).toBe(1500);
  });
  
  // Test partial payment
  it('should handle partial payment correctly', async () => {
    // Create a test bill
    const bill = await new Bill({
      patient_id: 12345,
      generation_date: new Date(),
      total_amount: 1500,
      remaining_amount: 1500,
      payment_status: 'pending'
    }).save();
    
    const paymentData = {
      amount: 500,  // Partial payment
      payment_method: 'card'
    };
    
    const response = await supertest(app)
      .patch(`/bills/${bill._id}/payment`)
      .send(paymentData);
    
    expect(response.status).toBe(200);
    expect(response.body.remaining_amount).toBe(1000);
    expect(response.body.payment_status).toBe('partially_paid');
    expect(response.body.payments[0].amount).toBe(500);
  });
  
  // Test invalid bill ID
  it('should return 404 for non-existent bill', async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    
    const paymentData = {
      amount: 500,
      payment_method: 'cash'
    };
    
    const response = await supertest(app)
      .patch(`/bills/${nonExistentId}/payment`)
      .send(paymentData);
    
    expect(response.status).toBe(404);
  });
});
