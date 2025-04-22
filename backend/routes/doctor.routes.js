import express from "express";
import {
  fetchAppointments,
  updateAppointments,
  fetchPatientConsultations,
  fetchPatientProgress,
  addDiagnosis,
  addRemarks,
  addPrescription,
  updateAllDiagnosis,
  updateDiagnosisById,
  updateRemark,
  updateAllPrescription,
  updatePrescriptionById,
  fetchAllDiagnoses,
  downloadReport,
} from "../controllers/doctor.controller.js";
import { authenticateUser } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET routes
router.get("/appointments", fetchAppointments);
router.get("/consultations", fetchPatientConsultations);
router.get("/consultations/fetchAllDiagnoses", fetchAllDiagnoses);
router.get(
  "/consultations/:consultationId/reports/:reportId/download",
  downloadReport
);

// PUT routes
router.put("/appointments", updateAppointments);
router.put(
  "/updateConsultations/:consultationId/updatediagnosis/:diagnosisId",
  authenticateUser,
  updateDiagnosisById
);
router.put(
  "/updateConsultations/:consultationId/updatediagnosis",
  updateAllDiagnosis
);
router.put("/updateConsultations/:consultationId/remark", updateRemark);
router.put(
  "/updateConsultations/:consultationId/updateprescription/:prescriptionId",
  authenticateUser,
  updatePrescriptionById
);
router.put(
  "/updateConsultations/:consultationId/updateprescription",
  authenticateUser,
  updateAllPrescription
);

// POST routes
router.post(
  "/updateConsultations/:consultationId/adddiagnosis",
  authenticateUser,
  addDiagnosis
);
router.post(
  "/updateConsultations/:consultationId/addremarks",
  authenticateUser,
  addRemarks
);
router.post(
  "/updateConsultations/:consultationId/addprescriptions",
  addPrescription
);

// Patient progress route
router.get("/progress/:patientId", fetchPatientProgress);

export default router;
