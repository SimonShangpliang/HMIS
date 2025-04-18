import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import Medicine from '../../../models/inventory.js';
import { connectDB, disconnectDB } from '../../helpers/db.js';

describe('Medicine Model - Integration', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await disconnectDB();
  });

  beforeEach(async () => {
    await Medicine.deleteMany({});
    const counterCollection = mongoose.connection.collection('medicine_id_counters');
    await counterCollection.findOneAndUpdate(
      { _id: 'medicine_id_counter' },
      { $set: { seq: 9999 } },
      { upsert: true, returnDocument: 'after' }
    );
  });

  it('should auto-increment IDs starting from 10000', async () => {
    const med1 = await Medicine.create({ med_name: 'Med1' });
    const med2 = await Medicine.create({ med_name: 'Med2' });
    expect(med1._id).toBe(10000);
    expect(med2._id).toBe(10001);
  });

  it('should save complete medicine data', async () => {
    const medData = {
      med_name: 'Amoxicillin',
      effectiveness: 'high',
      dosage_form: 'capsule',
      manufacturer: 'Drugs Inc',
      available: true,
      order_status: 'ordered',
      inventory: [{
        quantity: 500,
        batch_no: 'BATCH-2025',
        expiry_date: new Date('2026-06-30'),
        manufacturing_date: new Date('2025-01-15'),
        unit_price: 8.75,
        supplier: 'Global Pharma'
      }]
    };

    const med = await Medicine.create(medData);
    const found = await Medicine.findById(med._id);
    
    expect(found.med_name).toBe('Amoxicillin');
    expect(found.inventory[0].quantity).toBe(500);
    expect(found.available).toBe(true);
  });

  it('should update medicine status', async () => {
    const med = await Medicine.create({
      med_name: 'Omeprazole',
      order_status: 'requested'
    });
    
    med.order_status = 'cancelled';
    const updated = await med.save();
    expect(updated.order_status).toBe('cancelled');
  });

  it('should delete medicine', async () => {
    const med = await Medicine.create({ med_name: 'ToDelete' });
    await Medicine.findByIdAndDelete(med._id);
    const found = await Medicine.findById(med._id);
    expect(found).toBeNull();
  });

  it('should reject invalid inventory data', async () => {
    await expect(Medicine.create({
      med_name: 'InvalidMed',
      inventory: [{
        quantity: 'not-a-number', // Invalid type
        batch_no: 'BATCH-001'
      }]
    })).rejects.toThrow();
  });
});
