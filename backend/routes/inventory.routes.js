import express from 'express';
import { searchInventory } from '../controllers/commonPagesController.js';

const router = express.Router();

// Route to search inventory
router.get('/search', searchInventory);

export default router;