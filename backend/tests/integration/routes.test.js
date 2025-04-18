// tests/integration/routes.test.js
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import supertest from 'supertest';
import express from 'express';
import { connectDB, disconnectDB, syncIndexes } from '../helpers/db.js';

// Import all route files
import adminRoutes from '../../routes/admin.routes.js';
import analyticsRoutes from '../../routes/analytics.routes.js';
import authRoutes from '../../routes/auth.routes.js';
import billingRoutes from '../../routes/billing.routes.js';
import commonPagesRoutes from '../../routes/commonPages.routes.js';
import consultationRoutes from '../../routes/consultation.routes.js';
import doctorRoutes from '../../routes/doctor.routes.js';
import employeeRoutes from '../../routes/employee.routes.js';
import facilityRoutes from '../../routes/facility.routes.js';
import insuranceRoutes from '../../routes/insurance.routes.js';
import inventoryRoutes from '../../routes/inventory.routes.js';
import nurseRoutes from '../../routes/nurse.routes.js';
import pathologistRoutes from '../../routes/pathologist.routes.js';
import patientRoutes from '../../routes/patient.routes.js';
import pharmacyRoutes from '../../routes/pharmacy.routes.js';
import publicRoutes from '../../routes/public.routes.js';
import receptionistRoutes from '../../routes/receptionist.routes.js';
import geminiRoutes from '../../routes/gemini.routes.js';

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

// Mock multer
vi.mock('multer', () => {
  const multerMock = vi.fn().mockReturnValue({
    single: vi.fn().mockReturnValue((req, res, next) => {
      req.file = {
        fieldname: 'profile_pic',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test image data'),
        size: 12345,
        path: '/uploads/test.jpg'
      };
      next();
    })
  });
  
  multerMock.diskStorage = vi.fn(() => ({
    destination: vi.fn(),
    filename: vi.fn()
  }));
  
  return {
    default: multerMock
  };
});

// Mock pdfkit
vi.mock('pdfkit', () => {
  const mockPdfKit = vi.fn().mockImplementation(() => ({
    on: vi.fn().mockImplementation((event, callback) => {
      if (event === 'end') setTimeout(callback, 0);
      return mockPdfKit.mockReturnThis();
    }),
    fontSize: vi.fn().mockReturnThis(),
    text: vi.fn().mockReturnThis(),
    moveDown: vi.fn().mockReturnThis(),
    end: vi.fn()
  }));
  return { default: mockPdfKit };
});

// Mock nodemailer
vi.mock('nodemailer', () => ({
  createTransport: vi.fn().mockReturnValue({
    sendMail: vi.fn().mockResolvedValue({ response: 'Email sent' })
  })
}));

// Mock authenticateUser middleware
vi.mock('../middleware/authMiddleware.js', () => ({
  authenticateUser: (req, res, next) => next()
}));

// Set up Express app
let app;
let request;

beforeAll(async () => {
  await connectDB();
  
  app = express();
  app.use(express.json());
  
  // Mount all routes
  app.use('/api/admin', adminRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/billing', billingRoutes);
  app.use('/api/common', commonPagesRoutes);
  app.use('/api/consultations', consultationRoutes);
  app.use('/api/doctors', doctorRoutes);
  app.use('/api/employees', employeeRoutes);
  app.use('/api/facility', facilityRoutes);
  app.use('/api/gemini', geminiRoutes);
  app.use('/api/insurance', insuranceRoutes);
  app.use('/api/inventory', inventoryRoutes);
  app.use('/api/nurses', nurseRoutes);
  app.use('/api/pathologists', pathologistRoutes);
  app.use('/api/patients', patientRoutes);
  app.use('/api/pharmacists', pharmacyRoutes);
  app.use('/api/public-data', publicRoutes);
  app.use('/api/reception', receptionistRoutes);
  
  request = supertest(app);
  
  // Set up global hospital bank account for tests
  global.hospitalBankAccount = {
    bank_name: "Test Health Bank",
    account_number: 1234567890,
    ifsc_code: "TESTHB0001234",
    branch_name: "Test Branch",
    balance: 10000
  };
});

afterAll(async () => {
  await disconnectDB();
});

// Admin Routes Tests
describe('Admin Routes', () => {
  it('GET /search-employees - should respond', async () => {
    const response = await request.get('/api/admin/search-employees');
    expect(response.status).not.toBe(404);
  });

  it('POST /update-inventory - should respond', async () => {
    const response = await request.post('/api/admin/update-inventory')
      .send({ 
        inventoryType: 'medicine',
        med_name: 'Test Medicine',
        batch_no: 'B123',
        quantity: 10,
        unit_price: 100,
        expiry_date: '2026-01-01',
        manufacturing_date: '2025-01-01',
        supplier: 'Test Supplier'
      });
    expect(response.status).not.toBe(404);
  });

  it('POST /add-staff - should respond', async () => {
    const response = await request.post('/api/admin/add-staff')
      .field('name', 'Test Staff')
      .field('email', 'test@example.com')
      .field('role', 'doctor')
      .attach('profile_pic', Buffer.from('test image'), 'test.jpg');
    expect(response.status).not.toBe(404);
  });

  it('POST /process-payroll - should respond', async () => {
    const response = await request.post('/api/admin/process-payroll')
      .send({ employee_ids: ['1'] });
    expect(response.status).not.toBe(404);
  });

  it('GET /get-departments - should respond', async () => {
    const response = await request.get('/api/admin/get-departments');
    expect(response.status).not.toBe(404);
  });
  
  it('POST /gemini - should respond', async () => {
    const response = await request.post('/api/admin/gemini')
      .send({ message: 'Test message' });
    expect(response.status).not.toBe(404);
  });
});

// Analytics Routes Tests
describe('Analytics Routes', () => {
  it('POST /feedback/add/:consultationId - should respond', async () => {
    const response = await request.post('/api/analytics/feedback/add/1')
      .send({ rating: 5, review: 'Excellent service' });
    expect(response.status).not.toBe(404);
  });

  it('GET /feedback/department-rating/:departmentId - should respond', async () => {
    const response = await request.get('/api/analytics/feedback/department-rating/1');
    expect(response.status).not.toBe(404);
  });

  it('GET /feedback/all - should respond', async () => {
    const response = await request.get('/api/analytics/feedback/all');
    expect(response.status).not.toBe(404);
  });

  it('POST /medicine-add - should respond', async () => {
    const response = await request.post('/api/analytics/medicine-add')
      .send({ med_name: 'Test Medicine' });
    expect(response.status).not.toBe(404);
  });

  it('POST /medicine-trends - should respond', async () => {
    const response = await request.post('/api/analytics/medicine-trends')
      .send({ period: 'monthly' });
    expect(response.status).not.toBe(404);
  });

  it('POST /occupied-beds/:period - should respond', async () => {
    const response = await request.post('/api/analytics/occupied-beds/monthly');
    expect(response.status).not.toBe(404);
  });

  it('GET /facility-stats - should respond', async () => {
    const response = await request.get('/api/analytics/facility-stats');
    expect(response.status).not.toBe(404);
  });

  it('POST /doc-performance - should respond', async () => {
    const response = await request.post('/api/analytics/doc-performance')
      .send({ period: 'monthly' });
    expect(response.status).not.toBe(404);
  });

  it('POST /finance-trends - should respond', async () => {
    const response = await request.post('/api/analytics/finance-trends')
      .send({ period: 'monthly' });
    expect(response.status).not.toBe(404);
  });

  it('GET /dashboard/kpis - should respond', async () => {
    const response = await request.get('/api/analytics/dashboard/kpis');
    expect(response.status).not.toBe(404);
  });
});

// Auth Routes Tests
describe('Auth Routes', () => {
  it('POST /reset-password/:token - should respond', async () => {
    const response = await request.post('/api/auth/reset-password/test-token')
      .send({ password: 'newpassword123' });
    expect(response.status).not.toBe(404);
  });

  it('POST /login - should respond', async () => {
    const response = await request.post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });
    expect(response.status).not.toBe(404);
  });

  it('POST /refresh - should respond', async () => {
    const response = await request.post('/api/auth/refresh');
    expect(response.status).not.toBe(404);
  });

  it('POST /logout - should respond', async () => {
    const response = await request.post('/api/auth/logout');
    expect(response.status).not.toBe(404);
  });
});

// Billing Routes Tests
describe('Billing Routes', () => {
  it('GET /patient/:patientId - should respond', async () => {
    const response = await request.get('/api/billing/patient/1');
    expect(response.status).not.toBe(404);
  });

  it('GET /:billId - should respond', async () => {
    const response = await request.get('/api/billing/1');
    expect(response.status).not.toBe(404);
  });

  it('GET /:billId/payments - should respond', async () => {
    const response = await request.get('/api/billing/1/payments');
    expect(response.status).not.toBe(404);
  });

  it('POST /:billId/payments - should respond', async () => {
    const response = await request.post('/api/billing/1/payments')
      .send({ amount: 500, payment_method: 'cash' });
    expect(response.status).not.toBe(404);
  });

  it('POST / - should respond', async () => {
    const response = await request.post('/api/billing')
      .send({ patient_id: 1, total_amount: 1000 });
    expect(response.status).not.toBe(404);
  });
});

// Common Pages Routes Tests
describe('Common Pages Routes', () => {
  it('GET /findPayroll - should respond', async () => {
    const response = await request.get('/api/common/findPayroll')
      .query({ employee_id: '1' });
    expect(response.status).not.toBe(404);
  });

  it('GET /calendar/doctor - should respond', async () => {
    const response = await request.get('/api/common/calendar/doctor')
      .query({ doctor_id: '1' });
    expect(response.status).not.toBe(404);
  });
});

// Consultation Routes Tests
describe('Consultation Routes', () => {
  it('PUT /reschedule/:consultationId - should respond', async () => {
    const response = await request.put('/api/consultations/reschedule/1')
      .send({ appointment_date: new Date().toISOString() });
    expect(response.status).not.toBe(404);
  });

  it('GET /:consultationId/diagnosis - should respond', async () => {
    const response = await request.get('/api/consultations/1/diagnosis');
    expect(response.status).not.toBe(404);
  });
});

// Doctor Routes Tests
describe('Doctor Routes', () => {
  it('GET /appointments - should respond', async () => {
    const response = await request.get('/api/doctors/appointments')
      .query({ doctor_id: '1' });
    expect(response.status).not.toBe(404);
  });

  it('PUT /appointments - should respond', async () => {
    const response = await request.put('/api/doctors/appointments')
      .send({ appointment_id: 1, status: 'confirmed' });
    expect(response.status).not.toBe(404);
  });

  it('POST /updateConsultations/:consultationId/adddiagnosis - should respond', async () => {
    const response = await request.post('/api/doctors/updateConsultations/1/adddiagnosis')
      .send({ diagnosis: 'Hypertension', severity: 'Moderate' });
    expect(response.status).not.toBe(404);
  });
});

// Employee Routes Tests
describe('Employee Routes', () => {
  it('POST /send - should respond', async () => {
    const response = await request.post('/api/employees/send')
      .send({ recipient: 'admin@example.com', message: 'Test message' });
    expect(response.status).not.toBe(404);
  });

  it('GET / - should respond', async () => {
    const response = await request.get('/api/employees');
    expect(response.status).not.toBe(404);
  });
});

// Facility Routes Tests
describe('Facility Routes', () => {
  it('GET /ambulances - should respond', async () => {
    const response = await request.get('/api/facility/ambulances');
    expect(response.status).not.toBe(404);
  });
});

// Insurance Routes Tests
describe('Insurance Routes', () => {
  it('GET /insurance-providers - should respond', async () => {
    const response = await request.get('/api/insurance/insurance-providers');
    expect(response.status).not.toBe(404);
  });
});

// Inventory Routes Tests
describe('Inventory Routes', () => {
  it('GET /search - should respond', async () => {
    const response = await request.get('/api/inventory/search')
      .query({ searchText: 'test' });
    expect(response.status).not.toBe(404);
  });
});

// Nurse Routes Tests
describe('Nurse Routes', () => {
  it('GET /searchQuery - should respond', async () => {
    const response = await request.get('/api/nurses/searchQuery')
      .query({ search: 'test' });
    expect(response.status).not.toBe(404);
  });

  it('POST /patients/:patientId/vitals - should respond', async () => {
    const response = await request.post('/api/nurses/patients/1/vitals')
      .send({
        bloodPressure: 120,
        bodyTemp: 98.6,
        pulseRate: 72,
        breathingRate: 16
      });
    expect(response.status).not.toBe(404);
  });
});

// Pathologist Routes Tests
describe('Pathologist Routes', () => {
  it('GET /searchBy - should respond', async () => {
    const response = await request.get('/api/pathologists/searchBy')
      .query({ searchText: 'test' });
    expect(response.status).not.toBe(404);
  });
});

// Patient Routes Tests
describe('Patient Routes', () => {
  it('POST /register - should respond', async () => {
    const response = await request.post('/api/patients/register')
      .send({
        name: 'Test Patient',
        email: 'patient@example.com',
        password: 'password123'
      });
    expect(response.status).not.toBe(404);
  });
});

// Pharmacy Routes Tests
describe('Pharmacy Routes', () => {
  it('GET /prescriptions - should respond', async () => {
    const response = await request.get('/api/pharmacists/prescriptions')
      .query({ patientId: '1' });
    expect(response.status).not.toBe(404);
  });
});

// Public Routes Tests
describe('Public Routes', () => {
  it('GET /download - should respond', async () => {
    const response = await request.get('/api/public-data/download');
    expect(response.status).not.toBe(404);
  });

  it('GET /get-diagonses - should respond', async () => {
    const response = await request.get('/api/public-data/get-diagonses');
    expect(response.status).not.toBe(404);
  });
});

// Receptionist Routes Tests
describe('Receptionist Routes', () => {
  it('POST /register-patient - should respond', async () => {
    const response = await request.post('/api/reception/register-patient')
      .send({
        name: 'Test Patient',
        email: 'patient@example.com'
      });
    expect(response.status).not.toBe(404);
  });

  it('GET /beds - should respond', async () => {
    const response = await request.get('/api/reception/beds');
    expect(response.status).not.toBe(404);
  });

  it('POST /assign-bed - should respond', async () => {
    const response = await request.post('/api/reception/assign-bed')
      .send({ patient_id: 1, bed_id: 1 });
    expect(response.status).not.toBe(404);
  });
});
