import express from 'express';

const router = express.Router();

// TODO: Add routes for nurse
import {searchPatientInfo} from '../controllers/nurse.controller.js';
router.get('/searchQuery',searchPatientInfo); 

export default router;