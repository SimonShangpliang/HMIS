import express from "express";
import multer from "multer";
import path from "path";
import {
  searchEquipment,
  searchPatientInfoAndTest,
  uploadReport,
} from "../controllers/pathologist.controller.js";

const router = express.Router();

// Ensure uploads directory exists
import fs from "fs";
const uploadDir = "uploads/test-results";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer setup for test result file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "report-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedFileTypes = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedFileTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Unsupported file format. Please upload PDF, DOC, DOCX, JPG, JPEG, or PNG."
      )
    );
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter,
});

// Equipment routes
router.get("/searchBy", searchEquipment);

// Patient and test routes
router.get("/searchById", searchPatientInfoAndTest);
router.post("/uploadReport", upload.single("reportFile"), uploadReport);

export default router;
