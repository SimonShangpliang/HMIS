// routes/gemini.js
import express from 'express';
import { getGeminiResponse } from '../controllers/geminiController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/gemini
// router.post('/',authenticateUser, getGeminiResponse);
router.post('/', getGeminiResponse);

export default router;
