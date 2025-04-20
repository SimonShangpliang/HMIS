import express from 'express';
import { 
  createNotification, 
  deleteNotification,
  getNotifications
} from '../controllers/notification.controller.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create a new notification (future/recurring optional)
router.post('/create', authenticateUser, createNotification);
router.delete('/:id', authenticateUser, deleteNotification);
router.get('/', authenticateUser, getNotifications);

export default router;