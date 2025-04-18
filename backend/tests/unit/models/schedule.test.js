// tests/unit/models/schedule.test.js
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { DoctorSchedule, DoctorBusy } from '../../../models/schedule.js';
import { connectDB, disconnectDB, syncIndexes } from '../../helpers/db.js';

describe('DoctorSchedule Model', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  it('should create a valid doctor schedule', async () => {
    const scheduleData = {
      doctor_id: 123,
      day_of_week: 'monday',
      start_time: '09:00',
      end_time: '17:00',
      slot_duration_minutes: 30,
      max_appointments_per_slot: 2,
      is_active: true
    };

    const schedule = new DoctorSchedule(scheduleData);
    await syncIndexes();
    const savedSchedule = await schedule.save();

    expect(savedSchedule._id).toBeDefined();
    expect(savedSchedule.doctor_id).toBe(123);
    expect(savedSchedule.day_of_week).toBe('monday');
    expect(savedSchedule.start_time).toBe('09:00');
    expect(savedSchedule.end_time).toBe('17:00');
    expect(savedSchedule.slot_duration_minutes).toBe(30);
    expect(savedSchedule.max_appointments_per_slot).toBe(2);
    expect(savedSchedule.is_active).toBe(true);
  });

  it('should enforce day_of_week enum validation', async () => {
    const invalidSchedule = new DoctorSchedule({
      doctor_id: 123,
      day_of_week: 'invalid_day', // Invalid value
      start_time: '09:00',
      end_time: '17:00',
      slot_duration_minutes: 30
    });

    await expect(invalidSchedule.save()).rejects.toThrow();
  });

  it('should use default value for max_appointments_per_slot', async () => {
    const scheduleWithDefaults = new DoctorSchedule({
      doctor_id: 456,
      day_of_week: 'tuesday',
      start_time: '10:00',
      end_time: '18:00',
      slot_duration_minutes: 45
      // max_appointments_per_slot not provided, should use default
    });

    await syncIndexes();
    const savedSchedule = await scheduleWithDefaults.save();
    expect(savedSchedule.max_appointments_per_slot).toBe(1); // Default value
  });

  it('should use default value for is_active', async () => {
    const scheduleWithDefaults = new DoctorSchedule({
      doctor_id: 789,
      day_of_week: 'wednesday',
      start_time: '08:00',
      end_time: '16:00',
      slot_duration_minutes: 60
      // is_active not provided, should use default
    });

    await syncIndexes();
    const savedSchedule = await scheduleWithDefaults.save();
    expect(savedSchedule.is_active).toBe(true); // Default value
  });

  it('should update a doctor schedule', async () => {
    // Create a schedule
    const schedule = await DoctorSchedule.create({
      doctor_id: 102,
      day_of_week: 'friday',
      start_time: '09:00',
      end_time: '17:00',
      slot_duration_minutes: 30
    });

    // Update the schedule
    await DoctorSchedule.findByIdAndUpdate(
      schedule._id,
      { start_time: '10:00', end_time: '18:00' }
    );

    // Find the updated schedule
    const updatedSchedule = await DoctorSchedule.findById(schedule._id);
    expect(updatedSchedule.start_time).toBe('10:00');
    expect(updatedSchedule.end_time).toBe('18:00');
  });

  it('should delete a doctor schedule', async () => {
    // Create a schedule
    const schedule = await DoctorSchedule.create({
      doctor_id: 103,
      day_of_week: 'saturday',
      start_time: '09:00',
      end_time: '13:00',
      slot_duration_minutes: 30
    });

    // Delete the schedule
    await DoctorSchedule.findByIdAndDelete(schedule._id);

    // Try to find the deleted schedule
    const deletedSchedule = await DoctorSchedule.findById(schedule._id);
    expect(deletedSchedule).toBeNull();
  });
});

describe('DoctorBusy Model', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  it('should create a valid doctor busy record', async () => {
    const busyData = {
      doctor_id: 123,
      exception_type: 'meeting',
      start_datetime: new Date('2025-04-20T10:00:00Z'),
      end_datetime: new Date('2025-04-20T11:30:00Z')
    };

    const busy = new DoctorBusy(busyData);
    await syncIndexes();
    const savedBusy = await busy.save();

    expect(savedBusy._id).toBeDefined();
    expect(savedBusy.doctor_id).toBe(123);
    expect(savedBusy.exception_type).toBe('meeting');
    expect(savedBusy.start_datetime.toISOString()).toBe(new Date('2025-04-20T10:00:00Z').toISOString());
    expect(savedBusy.end_datetime.toISOString()).toBe(new Date('2025-04-20T11:30:00Z').toISOString());
    expect(savedBusy.createdAt).toBeDefined();
    expect(savedBusy.updatedAt).toBeDefined();
  });

  it('should enforce exception_type enum validation', async () => {
    const invalidBusy = new DoctorBusy({
      doctor_id: 123,
      exception_type: 'invalid_type', // Invalid value
      start_datetime: new Date('2025-04-21T10:00:00Z'),
      end_datetime: new Date('2025-04-21T11:30:00Z')
    });

    await expect(invalidBusy.save()).rejects.toThrow();
  });

  it('should set timestamps automatically', async () => {
    const busy = await DoctorBusy.create({
      doctor_id: 456,
      exception_type: 'surgery',
      start_datetime: new Date('2025-04-22T08:00:00Z'),
      end_datetime: new Date('2025-04-22T12:00:00Z')
    });

    expect(busy.createdAt).toBeDefined();
    expect(busy.updatedAt).toBeDefined();
    expect(busy.createdAt instanceof Date).toBe(true);
    expect(busy.updatedAt instanceof Date).toBe(true);
  });

  it('should update a doctor busy record', async () => {
    // Create a busy record
    const busy = await DoctorBusy.create({
      doctor_id: 102,
      exception_type: 'meeting',
      start_datetime: new Date('2025-04-25T10:00:00Z'),
      end_datetime: new Date('2025-04-25T11:00:00Z')
    });

    // Update the busy record
    const newEndTime = new Date('2025-04-25T11:30:00Z');
    await DoctorBusy.findByIdAndUpdate(
      busy._id,
      { end_datetime: newEndTime }
    );

    // Find the updated busy record
    const updatedBusy = await DoctorBusy.findById(busy._id);
    expect(updatedBusy.end_datetime.toISOString()).toBe(newEndTime.toISOString());
  });

  it('should delete a doctor busy record', async () => {
    // Create a busy record
    const busy = await DoctorBusy.create({
      doctor_id: 103,
      exception_type: 'other',
      start_datetime: new Date('2025-04-26T14:00:00Z'),
      end_datetime: new Date('2025-04-26T15:00:00Z')
    });

    // Delete the busy record
    await DoctorBusy.findByIdAndDelete(busy._id);

    // Try to find the deleted record
    const deletedBusy = await DoctorBusy.findById(busy._id);
    expect(deletedBusy).toBeNull();
  });
});
