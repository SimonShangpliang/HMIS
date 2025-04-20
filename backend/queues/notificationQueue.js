import { Queue } from 'bullmq';
import dotenv from 'dotenv';

dotenv.config();

// Create the notification queue with proper Redis connection
const notificationQueue = new Queue('notification-email', {
  connection: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    username: 'default',
    password: process.env.REDIS_PASSWORD,
    // These options are important to prevent the blocking error
    enableReadyCheck: false,
    maxRetriesPerRequest: null
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: 100,
    removeOnFail: 200
  }
});

export default notificationQueue;