import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import Equipment from '../../../models/equipment.js';
import { connectDB, disconnectDB } from '../../helpers/db.js';

describe('Equipment Model - Integration', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await disconnectDB();
  });

  beforeEach(async () => {
    await Equipment.deleteMany({});
    const counterCollection = mongoose.connection.collection('equipment_id_counters');
    await counterCollection.findOneAndUpdate(
      { _id: 'equipment_id_counter' },
      { $set: { seq: 9999 } },
      { upsert: true, returnDocument: 'after' }
    );
  });

  it('should auto-increment IDs starting from 10000', async () => {
    const eq1 = await Equipment.create({
      equipment_name: 'ECG Machine',
      order_status: 'requested'
    });
    const eq2 = await Equipment.create({
      equipment_name: 'Ultrasound',
      order_status: 'ordered'
    });
    expect(eq1._id).toBe(10000);
    expect(eq2._id).toBe(10001);
  });

  it('should save and retrieve all fields', async () => {
    const now = new Date();
    const eqData = {
      equipment_name: 'Defibrillator',
      owner_id: new mongoose.Types.ObjectId(),
      quantity: 5,
      order_status: 'ordered',
      installation_date: now,
      last_service_date: now,
      next_service_date: now
    };
    const eq = await Equipment.create(eqData);
    const found = await Equipment.findById(eq._id);
    
    expect(found.equipment_name).toBe('Defibrillator');
    expect(found.quantity).toBe(5);
    expect(found.installation_date.getTime()).toBe(now.getTime());
  });

  it('should update equipment quantity', async () => {
    const eq = await Equipment.create({
      equipment_name: 'Ventilator',
      order_status: 'requested',
      quantity: 3
    });
    eq.quantity = 0;
    const updated = await eq.save();
    expect(updated.quantity).toBe(0);
  });

  it('should delete equipment', async () => {
    const eq = await Equipment.create({
      equipment_name: 'Infusion Pump',
      order_status: 'ordered'
    });
    await Equipment.findByIdAndDelete(eq._id);
    const found = await Equipment.findById(eq._id);
    expect(found).toBeNull();
  });

  it('should reject invalid order_status', async () => {
    await expect(Equipment.create({
      equipment_name: 'X-Ray',
      order_status: 'invalid-status'
    })).rejects.toThrow();
  });
});
