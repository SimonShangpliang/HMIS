import { describe, it, expect } from 'vitest';
import mongoose from 'mongoose';
import { Ambulance, Bed, Room, DailyOccupancy } from '../../../models/facility.js';

// Valid references
const validDriverId = new mongoose.Types.ObjectId();
const validNurseId = 1001;
const validPatientId = 2001;
const validDeptId = new mongoose.Types.ObjectId();

describe('Facility Models - Unit', () => {
  describe('Ambulance Model', () => {
    it('should validate status enum', async () => {
      const ambulance = new Ambulance({
        vehicle_number: 'AMB-001',
        status: 'invalid-status',
        driver: validDriverId,
        nurse_id: validNurseId
      });
      await expect(ambulance.validate()).rejects.toThrow(/enum/);
    });

    it('should accept valid status', async () => {
      const ambulance = new Ambulance({
        vehicle_number: 'AMB-002',
        status: 'active',
        driver: validDriverId,
        nurse_id: validNurseId
      });
      await expect(ambulance.validate()).resolves.toBeUndefined();
    });
  });

  describe('Bed Model', () => {
    it('should validate bed status', async () => {
      const bed = new Bed({
        bed_number: 101,
        status: 'invalid-status',
        nurse_id: validNurseId
      });
      await expect(bed.validate()).rejects.toThrow(/enum/);
    });

    it('should accept valid bed data', () => {
      const bed = new Bed({
        bed_number: 102,
        status: 'vacant',
        nurse_id: validNurseId
      });
      expect(bed.bed_number).toBe(102);
    });
  });

  describe('Room Model', () => {
    it('should validate room type', async () => {
      const room = new Room({
        room_number: 201,
        room_type: 'invalid-type',
        bed_count: 2,
        dept_id: validDeptId
      });
      await expect(room.validate()).rejects.toThrow(/enum/);
    });

    it('should store embedded beds', () => {
      const room = new Room({
        room_number: 202,
        room_type: 'private',
        bed_count: 1,
        dept_id: validDeptId,
        beds: [{
          bed_number: 1,
          status: 'occupied',
          nurse_id: validNurseId
        }]
      });
      expect(room.beds).toHaveLength(1);
    });
  });

  describe('DailyOccupancy Model', () => {
    it('should require date field', async () => {
      const occupancy = new DailyOccupancy({});
      await expect(occupancy.validate()).rejects.toThrow(/required/);
    });

    it('should accept valid occupancy data', () => {
      const occupancy = new DailyOccupancy({
        date: new Date(),
        occupiedBeds: [new mongoose.Types.ObjectId()]
      });
      expect(occupancy.occupiedBeds).toHaveLength(1);
    });
  });
});
