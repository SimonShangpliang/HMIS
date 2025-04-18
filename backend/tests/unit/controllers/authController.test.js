// tests/unit/controllers/authController.test.js
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { login, logout, refreshToken, forgotPassword, resetPassword } from '../../../controllers/authController.js';
import Patient from '../../../models/patient.js';
import Employee from '../../../models/employee.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import redisClient from '../../../config/redisClient.js';
import nodemailer from 'nodemailer';
import { connectDB, disconnectDB, syncIndexes } from '../../helpers/db.js';
import dotenv from 'dotenv';

dotenv.config();

// We need to mock external services that we can't easily test
vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn().mockReturnValue({
      sendMail: vi.fn().mockResolvedValue({ response: 'Email sent' })
    })
  }
}));

// For Redis, we'll create a mock but maintain the interface
vi.mock('../../../config/redisClient.js', () => ({
  default: {
    setEx: vi.fn().mockResolvedValue('OK'),
    get: vi.fn(),
    del: vi.fn().mockResolvedValue(1)
  }
}));

describe('Auth Controller', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    // Clear collections between tests
    await Patient.deleteMany({});
    await Employee.deleteMany({});
    await syncIndexes();
    
    // Reset all mocks
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should login a patient with valid credentials', async () => {
      // Create a test patient
      const hashedPassword = await bcrypt.hash('password123', 10);
      const patient = new Patient({
        name: 'Test Patient',
        email: 'patient@test.com',
        password: hashedPassword,
        phone: '1234567890',
        dob: new Date('1990-01-01'),
        gender: 'male',
        address: 'Test Address',
        blood_group: 'A+',
      });
      await patient.save();
      await syncIndexes();

      const req = {
        body: {
          email: 'patient@test.com',
          password: 'password123',
          userType: 'patient'
        }
      };
      
      const res = {
        cookie: vi.fn(),
        json: vi.fn(),
        status: vi.fn().mockReturnThis()
      };

      await login(req, res);

      expect(res.cookie).toHaveBeenCalledWith(
        'refreshToken',
        expect.any(String),
        expect.objectContaining({
          httpOnly: true,
          secure: false,
          sameSite: 'Lax'
        })
      );
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          accessToken: expect.any(String),
          role: 'patient',
          user: expect.objectContaining({
            email: 'patient@test.com'
          })
        })
      );
    });

    it('should login an employee with valid credentials', async () => {
      // Create a test employee
      const hashedPassword = await bcrypt.hash('password123', 10);
      const employee = new Employee({
        name: 'Test Employee',
        email: 'employee@test.com',
        password: hashedPassword,
        role: 'admin',
        phone: '1234567890',
        address: 'Test Address',
        department: 'IT',
        position: 'Manager',
      });
      await employee.save();
      await syncIndexes();

      const req = {
        body: {
          email: 'employee@test.com',
          password: 'password123',
          userType: 'employee'
        }
      };
      
      const res = {
        cookie: vi.fn(),
        json: vi.fn(),
        status: vi.fn().mockReturnThis()
      };

      await login(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          accessToken: expect.any(String),
          role: 'admin'
        })
      );
    });

    it('should return 400 for non-existent user', async () => {
      const req = {
        body: {
          email: 'nonexistent@test.com',
          password: 'password',
          userType: 'patient'
        }
      };
      
      const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis()
      };

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    });

    it('should return 400 for incorrect password', async () => {
      // Create a test patient
      const hashedPassword = await bcrypt.hash('password123', 10);
      const patient = new Patient({
        name: 'Test Patient',
        email: 'patient@test.com',
        password: hashedPassword,
        phone: '1234567890',
        dob: new Date('1990-01-01'),
        gender: 'male',
        address: 'Test Address',
        blood_group: 'A+',
      });
      await patient.save();
      await syncIndexes();

      const req = {
        body: {
          email: 'patient@test.com',
          password: 'wrongpassword',
          userType: 'patient'
        }
      };
      
      const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis()
      };

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    });

    it('should handle server errors during login', async () => {
      // Setup a mock to throw an error
      const findOneMock = vi.spyOn(Patient, 'findOne').mockImplementation(() => {
        throw new Error('Database error');
      });

      const req = {
        body: {
          email: 'patient@test.com',
          password: 'password123',
          userType: 'patient'
        }
      };
      
      const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis()
      };

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });

      // Restore the original implementation
      findOneMock.mockRestore();
    });
  });

  describe('logout', () => {
    it('should clear refresh token cookie and return success message', async () => {
      const req = {};
      const res = {
        clearCookie: vi.fn(),
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };

      logout(req, res);

      expect(res.clearCookie).toHaveBeenCalledWith('refreshToken');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Logged out successfully' });
    });

    it('should handle errors during logout', async () => {
      const req = {};
      const res = {
        clearCookie: vi.fn().mockImplementation(() => {
          throw new Error('Cookie error');
        }),
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };

      logout(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to logout' });
    });
  });

  describe('refreshToken', () => {
    it('should issue a new access token with valid refresh token', async () => {
      // Create a valid refresh token
      const validToken = jwt.sign({ id: 'user123' }, process.env.JWT_REFRESH_SECRET, { expiresIn: '24h' });
      
      const req = {
        cookies: {
          refreshToken: validToken
        }
      };
      
      const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis()
      };

      refreshToken(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          accessToken: expect.any(String)
        })
      );
    });

    it('should return 401 if no refresh token provided', async () => {
      const req = {
        cookies: {}
      };
      
      const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis()
      };

      refreshToken(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'No refresh token' });
    });

    it('should return 403 if refresh token is invalid', async () => {
      const req = {
        cookies: {
          refreshToken: 'invalid-token'
        }
      };
      
      const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis()
      };

      refreshToken(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid refresh token' });
    });
  });

  describe('forgotPassword', () => {
    it('should send a reset link for a patient', async () => {
      // Create a test patient
      const patient = new Patient({
        name: 'Test Patient',
        email: 'patient@test.com',
        password: await bcrypt.hash('password123', 10),
        phone: '1234567890',
        dob: new Date('1990-01-01'),
        gender: 'male',
        address: 'Test Address',
        blood_group: 'A+',
      });
      await patient.save();
      await syncIndexes();

      const req = {
        body: {
          email: 'patient@test.com',
          userType: 'patient'
        }
      };
      
      const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis()
      };

      await forgotPassword(req, res);

      expect(redisClient.setEx).toHaveBeenCalledWith(
        expect.stringContaining('reset:'),
        900,
        expect.stringContaining('patient@test.com')
      );
      expect(nodemailer.createTransport().sendMail).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: 'Reset link sent to your email.' });
    });

    it('should send a reset link for an employee', async () => {
      // Create a test employee
      const employee = new Employee({
        name: 'Test Employee',
        email: 'employee@test.com',
        password: await bcrypt.hash('password123', 10),
        role: 'admin',
        phone: '1234567890',
        address: 'Test Address',
        department: 'IT',
        position: 'Manager',
      });
      await employee.save();
      await syncIndexes();

      const req = {
        body: {
          email: 'employee@test.com',
          userType: 'employee'
        }
      };
      
      const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis()
      };

      await forgotPassword(req, res);

      expect(redisClient.setEx).toHaveBeenCalledWith(
        expect.stringContaining('reset:'),
        900,
        expect.stringContaining('employee@test.com')
      );
      expect(res.json).toHaveBeenCalledWith({ message: 'Reset link sent to your email.' });
    });

    it('should return 404 for non-existing user', async () => {
      const req = {
        body: {
          email: 'nonexisting@test.com',
          userType: 'patient'
        }
      };
      
      const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis()
      };

      await forgotPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('should handle server errors during forgot password', async () => {
      // Setup a mock to throw an error
      const findOneMock = vi.spyOn(Patient, 'findOne').mockImplementation(() => {
        throw new Error('Database error');
      });

      const req = {
        body: {
          email: 'patient@test.com',
          userType: 'patient'
        }
      };
      
      const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis()
      };

      await forgotPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Something went wrong.' });

      // Restore the original implementation
      findOneMock.mockRestore();
    });
  });

  describe('resetPassword', () => {
    it('should reset password for a patient with valid token', async () => {
      // Create a test patient
      const patient = new Patient({
        name: 'Test Patient',
        email: 'patient@test.com',
        password: await bcrypt.hash('oldpassword', 10),
        phone: '1234567890',
        dob: new Date('1990-01-01'),
        gender: 'male',
        address: 'Test Address',
        blood_group: 'A+',
      });
      await patient.save();
      await syncIndexes();

      // Mock Redis to return token data
      redisClient.get.mockResolvedValueOnce(JSON.stringify({
        email: 'patient@test.com',
        userType: 'patient'
      }));

      const req = {
        params: {
          token: 'valid-reset-token'
        },
        body: {
          password: 'newpassword'
        }
      };
      
      const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis()
      };

      await resetPassword(req, res);

      expect(redisClient.get).toHaveBeenCalledWith('reset:valid-reset-token');
      expect(redisClient.del).toHaveBeenCalledWith('reset:valid-reset-token');
      expect(res.json).toHaveBeenCalledWith({ message: 'Password has been reset.' });

      // Verify password was updated (optional additional check)
      const updatedPatient = await Patient.findOne({ email: 'patient@test.com' });
      const passwordMatch = await bcrypt.compare('newpassword', updatedPatient.password);
      expect(passwordMatch).toBe(true);
    });

    it('should reset password for an employee with valid token', async () => {
      // Create a test employee
      const employee = new Employee({
        name: 'Test Employee',
        email: 'employee@test.com',
        password: await bcrypt.hash('oldpassword', 10),
        role: 'admin',
        phone: '1234567890',
        address: 'Test Address',
        department: 'IT',
        position: 'Manager',
      });
      await employee.save();
      await syncIndexes();

      // Mock Redis to return token data
      redisClient.get.mockResolvedValueOnce(JSON.stringify({
        email: 'employee@test.com',
        userType: 'employee'
      }));

      const req = {
        params: {
          token: 'valid-reset-token'
        },
        body: {
          password: 'newpassword'
        }
      };
      
      const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis()
      };

      await resetPassword(req, res);

      expect(res.json).toHaveBeenCalledWith({ message: 'Password has been reset.' });
    });

    it('should return 400 for invalid or expired token', async () => {
      // Mock Redis to return null (expired/invalid token)
      redisClient.get.mockResolvedValueOnce(null);

      const req = {
        params: {
          token: 'invalid-token'
        },
        body: {
          password: 'newpassword'
        }
      };
      
      const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis()
      };

      await resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid or expired token.' });
    });

    it('should return 404 if user no longer exists', async () => {
      // Mock Redis to return token data for non-existent user
      redisClient.get.mockResolvedValueOnce(JSON.stringify({
        email: 'deleted@test.com',
        userType: 'patient'
      }));

      const req = {
        params: {
          token: 'valid-token'
        },
        body: {
          password: 'newpassword'
        }
      };
      
      const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis()
      };

      await resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found.' });
    });

    it('should handle server errors during password reset', async () => {
      // Mock Redis to return token data
      redisClient.get.mockResolvedValueOnce(JSON.stringify({
        email: 'patient@test.com',
        userType: 'patient'
      }));

      // Setup a mock to throw an error
      const findOneMock = vi.spyOn(Patient, 'findOne').mockImplementation(() => {
        throw new Error('Database error');
      });

      const req = {
        params: {
          token: 'valid-token'
        },
        body: {
          password: 'newpassword'
        }
      };
      
      const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis()
      };

      await resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Something went wrong.' });

      // Restore the original implementation
      findOneMock.mockRestore();
    });
  });
});
