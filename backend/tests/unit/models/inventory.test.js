import { describe, it, expect } from 'vitest';
import Medicine from '../../../models/inventory.js';

describe('Medicine Model - Unit', () => {
  it('should validate effectiveness enum', async () => {
    const med = new Medicine({
      med_name: 'TestMed',
      effectiveness: 'invalid'
    });
    await expect(med.validate()).rejects.toThrow(/`invalid` is not a valid enum/);
  });

  it('should validate dosage_form enum', async () => {
    const med = new Medicine({
      med_name: 'TestMed',
      dosage_form: 'invalid-form'
    });
    await expect(med.validate()).rejects.toThrow(/`invalid-form` is not a valid enum/);
  });

  it('should validate order_status enum', async () => {
    const med = new Medicine({
      med_name: 'TestMed',
      order_status: 'invalid-status'
    });
    await expect(med.validate()).rejects.toThrow(/`invalid-status` is not a valid enum/);
  });

  it('should accept valid enums', async () => {
    const validMed = new Medicine({
      med_name: 'Paracetamol',
      effectiveness: 'high',
      dosage_form: 'tablet',
      order_status: 'requested'
    });
    await expect(validMed.validate()).resolves.toBeUndefined();
  });

  it('should handle inventory array', () => {
    const med = new Medicine({
      med_name: 'Aspirin',
      inventory: [{
        quantity: 100,
        batch_no: 'BATCH-001',
        expiry_date: new Date('2026-12-31'),
        manufacturing_date: new Date('2025-01-01'),
        unit_price: 5.99,
        supplier: 'PharmaCo'
      }]
    });
    expect(med.inventory).toHaveLength(1);
    expect(med.inventory[0].batch_no).toBe('BATCH-001');
  });

  it('should initialize auto-increment ID', () => {
    const med = new Medicine({ med_name: 'Ibuprofen' });
    expect(med._id).toBeUndefined();
  });
});
