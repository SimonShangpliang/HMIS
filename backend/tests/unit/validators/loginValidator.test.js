// tests/unit/validators/loginValidator.test.js
import { describe, it, expect } from 'vitest';
import { LoginJoiSchema } from '../../../validators/loginValidator.js';

describe('Unit Tests: Login Validator Schema', () => {
  describe('LoginJoiSchema', () => {
    it('should validate correct credentials', () => {
      const validInput = {
        email: 'test@example.com',
        password: 'validPassword123'
      };
      const { error } = LoginJoiSchema.validate(validInput);
      expect(error).toBeUndefined();
    });

    describe('Email Validation', () => {
      it('should reject missing email', () => {
        const input = { password: 'password123' };
        const { error } = LoginJoiSchema.validate(input);
        expect(error.details[0].message).toMatch(/email/);
      });

      it('should reject invalid email format', () => {
        const input = {
          email: 'invalid-email',
          password: 'password123'
        };
        const { error } = LoginJoiSchema.validate(input);
        expect(error.details[0].message).toMatch(/email/);
      });
    });

    describe('Password Validation', () => {
      it('should reject missing password', () => {
        const input = { email: 'test@example.com' };
        const { error } = LoginJoiSchema.validate(input);
        expect(error.details[0].message).toMatch(/password/);
      });

      it('should reject passwords shorter than 6 characters', () => {
        const input = {
          email: 'test@example.com',
          password: 'short'
        };
        const { error } = LoginJoiSchema.validate(input);
        expect(error.details[0].message).toMatch(/password/);
      });
    });
  });
});
