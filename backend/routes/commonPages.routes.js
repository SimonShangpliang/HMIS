import express from "express";
import {findPayrollById, getPatientCalendar,getDoctorCalendar, fetchProfile, updateProfile} from "../controllers/commonPagesController.js";

const router = express.Router();

router.get("/findPayroll",findPayrollById );
router.get("/getPatientCalendar", getPatientCalendar);
router.get("/getDoctorCalendar",getDoctorCalendar );
router.get('/profile/:userType/:id', fetchProfile);
router.put('/profile/:userType/:id', updateProfile);

export default router;
