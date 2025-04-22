import express from "express";
import multer from "multer";
import {
  searchEquipment,
  searchPatientInfoAndTest,
  uploadReport,
} from "../controllers/pathologist.controller.js";
import { uploadReport as uploadReportMiddleware } from "../middleware/multer.js";

const router = express.Router();

// Routes
router.get("/searchBy", searchEquipment);
router.get("/searchById", searchPatientInfoAndTest);
router.post(
  "/uploadReport",
  uploadReportMiddleware.single("reportFile"),
  uploadReport
);

export default router;
