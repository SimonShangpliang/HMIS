import express from 'express';

const router = express.Router();
import {downloadController} from '../controllers/publicDataController.js';
// TODO: Add routes for public data
router.get('/zip', downloadController.downloadZip);

export default router;
