import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import Notification from '../../../models/notification.js';
import { connectDB, disconnectDB } from '../../helpers/db.js';

describe('Notification Model - Integration', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    await Notification.deleteMany({});
  });

  it('should save a complete notification with future schedules', async () => {
    const testData = {
      senderEmail: 'system@hospital.com',
      receiverEmail: 'staff@hospital.com',
      content: 'Weekly Report',
      date: new Date(),
      time: '09:00',
      future: true,
      recurring: true,
      frequency: 'weekly',
      futureSchedules: [{
        scheduledDateTime: new Date(Date.now() + 86400000)
      }]
    };

    const doc = new Notification(testData);
    const savedNotif = await doc.save();

    expect(savedNotif.futureSchedules).toHaveLength(1);
    expect(savedNotif.futureSchedules[0].priority).toBe(0);
    expect(savedNotif.futureSchedules[0].status).toBe('pending');
    expect(savedNotif.createdAt).toBeInstanceOf(Date);
  });

  it('should update notification status', async () => {
    const doc = new Notification({
      senderEmail: 'doctor@hospital.com',
      receiverEmail: 'patient@example.com',
      content: 'Appointment Reminder',
      date: new Date(),
      time: '14:30'
    });
    
    const savedNotif = await doc.save();
    savedNotif.futureSchedules.push({
      scheduledDateTime: new Date(),
      status: 'sent'
    });
    
    const updatedNotif = await savedNotif.save();
    expect(updatedNotif.futureSchedules).toHaveLength(1);
    expect(updatedNotif.futureSchedules[0].status).toBe('sent');
  });

  it('should query notifications by receiver email', async () => {
    await Notification.create([
      {
        senderEmail: 'nurse@hospital.com',
        receiverEmail: 'patient@example.com',
        content: 'Test 1',
        date: new Date(),
        time: '10:00'
      },
      {
        senderEmail: 'admin@hospital.com',
        receiverEmail: 'staff@hospital.com',
        content: 'Test 2',
        date: new Date(),
        time: '11:00'
      }
    ]);

    const patientNotifications = await Notification.find({
      receiverEmail: 'patient@example.com'
    });
    
    expect(patientNotifications).toHaveLength(1);
    expect(patientNotifications[0].content).toBe('Test 1');
  });

  it('should handle future schedule priority ordering', async () => {
    const doc = new Notification({
      senderEmail: 'system@hospital.com',
      receiverEmail: 'admin@hospital.com',
      content: 'Priority Test',
      date: new Date(),
      time: '12:00',
      future: true,
      futureSchedules: [
        { scheduledDateTime: new Date(Date.now() + 86400000), priority: 2 },
        { scheduledDateTime: new Date(Date.now() + 172800000), priority: 1 }
      ]
    });

    const savedNotif = await doc.save();
    expect(savedNotif.futureSchedules[0].priority).toBe(2);
    expect(savedNotif.futureSchedules[1].priority).toBe(1);
  });
});
