// tests/integration/validators/loginValidator.integration.test.js
import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { LoginJoiSchema } from '../../../validators/loginValidator.js';

// Corrected mock controller
const mockAuthController = {
  login: vi.fn((req, res) => {
    res.status(200).json({ token: 'mock-token' });
  })
};

const createTestServer = () => {
  const app = express();
  app.use(express.json());
  
  app.post('/login', 
    (req, res, next) => {
      const { error } = LoginJoiSchema.validate(req.body);
      if (error) return res.status(400).json({ errors: error.details });
      next();
    },
    (req, res) => mockAuthController.login(req, res)
  );

  return app;
};

describe('Integration Tests: Login Validation', () => {
  let app;
  
  beforeAll(() => {
    app = createTestServer();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should return 400 for missing email', async () => {
    const response = await request(app)
      .post('/login')
      .send({ password: 'password123' });
      
    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.stringMatching(/email/)
        })
      ])
    );
  });

  it('should return 400 for invalid email format', async () => {
    const response = await request(app)
      .post('/login')
      .send({
        email: 'invalid-email',
        password: 'password123'
      });
      
    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.stringMatching(/email/)
        })
      ])
    );
  });

  it('should pass validation for correct credentials', async () => {
    const response = await request(app)
      .post('/login')
      .send({
        email: 'valid@example.com',
        password: 'correctPassword'
      });
      
    expect(response.status).toBe(200);
    expect(response.body.token).toBe('mock-token');
    expect(mockAuthController.login).toHaveBeenCalled();
  });
});
