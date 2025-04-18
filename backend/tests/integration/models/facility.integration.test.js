import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose, { syncIndexes } from 'mongoose';
import { Ambulance, Bed, Room, DailyOccupancy } from '../../../models/facility.js';
import { connectDB, disconnectDB } from '../../helpers/db.js';

describe('Facility Models - Integration', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await disconnectDB();
  });

  beforeEach(async () => {
    await Ambulance.deleteMany({});
    await Bed.deleteMany({});
    await Room.deleteMany({});
    await DailyOccupancy.deleteMany({});
  });

  it('should create and retrieve ambulance', async () => {
    const ambulance = await Ambulance.create({
      vehicle_number: 'AMB-101',
      status: 'active',
      driver: new mongoose.Types.ObjectId(),
      nurse_id: 1001
    });
    
    const found = await Ambulance.findById(ambulance._id);
    expect(found.vehicle_number).toBe('AMB-101');
  });

  it('should manage room with embedded beds', async () => {
    const room = await Room.create({
      room_number: 301,
      room_type: 'semi_private',
      bed_count: 2,
      dept_id: new mongoose.Types.ObjectId(),
      beds: [{
        bed_number: 1,
        status: 'vacant',
        nurse_id: 1002
      }]
    });

    expect(room.beds[0].status).toBe('vacant');
    expect(room.bed_count).toBe(2);
  });

  it('should enforce unique dates for daily occupancy', async () => {
    const date = new Date('2025-04-17');
    await DailyOccupancy.create({ date });
    syncIndexes();
    syncIndexes();
    
    await expect(DailyOccupancy.create({ date }))
      .rejects.toThrow(/duplicate key/);
  });

  it('should update bed status', async () => {
    const bed = await Bed.create({
      bed_number: 401,
      status: 'vacant',
      nurse_id: 1003
    });
    
    bed.status = 'occupied';
    const updated = await bed.save();
    expect(updated.status).toBe('occupied');
  });

  it('should track occupied beds', async () => {
    const bed = await Bed.create({
      bed_number: 501,
      status: 'occupied',
      nurse_id: 1004
    });

    const occupancy = await DailyOccupancy.create({
      date: new Date(),
      occupiedBeds: [bed._id]
    });

    expect(occupancy.occupiedBeds[0].toString())
      .toBe(bed._id.toString());
  });
});
