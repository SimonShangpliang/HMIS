import mongoose from 'mongoose';
import dotenv from 'dotenv';
import './workers/notificationWorker.js';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hmis')
  .then(() => console.log('MongoDB connected for worker process'))
  .catch(err => console.error('MongoDB connection error:', err));

console.log('Notification worker process started');