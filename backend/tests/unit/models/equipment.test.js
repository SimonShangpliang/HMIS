import { describe, it, expect } from 'vitest';
import Equipment from '../../../models/equipment.js';

describe('Equipment Model - Unit', () => {
  it('should validate order_status enum values', async () => {
    const equipment = new Equipment({
      equipment_name: 'X-Ray Machine',
      order_status: 'invalid-status'
    });
    await expect(equipment.validate()).rejects.toThrow(/`invalid-status` is not a valid enum/);
  });

  it('should accept valid enum values for order_status', async () => {
    const validStatuses = ['requested', 'ordered', 'cancelled'];
    for (const status of validStatuses) {
      const equipment = new Equipment({
        equipment_name: 'MRI',
        order_status: status
      });
      await expect(equipment.validate()).resolves.toBeUndefined();
    }
  });

  it('should handle auto-increment configuration', () => {
    const equipment = new Equipment({ equipment_name: 'Ventilator' });
    expect(equipment._id).toBeUndefined();
  });

  it('should accept and store all fields', () => {
    const now = new Date();
    const equipment = new Equipment({
      equipment_name: 'Defibrillator',
      owner_id: '507f1f77bcf86cd799439011',
      quantity: 5,
      order_status: 'ordered',
      installation_date: now,
      last_service_date: now,
      next_service_date: now
    });
    expect(equipment.equipment_name).toBe('Defibrillator');
    expect(equipment.quantity).toBe(5);
    expect(equipment.order_status).toBe('ordered');
  });
});
