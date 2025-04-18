import { describe, it, expect } from 'vitest';
import Notification from '../../../models/notification.js';

describe('Notification Model - Unit', () => {
  it('should set default values for futureSchedules', () => {
    const doc = new Notification({
      senderEmail: 'test@example.com',
      receiverEmail: 'recipient@example.com',
      content: 'Test content',
      date: new Date(),
      time: '10:00',
      future: true,
      futureSchedules: [{}]
    });

    expect(doc.futureSchedules[0].priority).toBe(0);
    expect(doc.futureSchedules[0].status).toBe('pending');
  });

  it('should validate futureSchedules status enum', async () => {
    const doc = new Notification({
      senderEmail: 'test@example.com',
      receiverEmail: 'recipient@example.com',
      content: 'Test content',
      date: new Date(),
      time: '10:00',
      future: true,
      futureSchedules: [{
        status: 'invalid-status'
      }]
    });

    await expect(doc.validate()).rejects.toThrow();
  });

  it('should handle optional fields gracefully', () => {
    const doc = new Notification({
      senderEmail: 'test@example.com',
      receiverEmail: 'recipient@example.com',
      content: 'Test content',
      date: new Date(),
      time: '10:00'
    });
    
    expect(doc.future).toBeUndefined();
    expect(doc.recurring).toBeUndefined();
    expect(doc.futureSchedules).toHaveLength(0);
  });
});
