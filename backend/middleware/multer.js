import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

// Profile pictures storage configuration
const profileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "profile_pics",
    format: async (req, file) => "png", // Convert all images to PNG
    public_id: (req, file) => file.originalname.split(".")[0],
  },
});

// Test reports storage configuration
const reportStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "test_reports",
    allowed_formats: ["pdf", "doc", "docx", "jpg", "jpeg", "png"],
    resource_type: (req, file) => {
      const ext = file.originalname.split(".").pop().toLowerCase();
      return ["pdf", "doc", "docx"].includes(ext) ? "raw" : "auto";
    },
    public_id: (req, file) => {
      // Generate a unique ID using timestamp
      const timestamp = Date.now();
      const ext = file.originalname.split(".").pop().toLowerCase();
      return `report-${timestamp}`;
    },
  },
});

// Default export for backwards compatibility
const upload = multer({ storage: profileStorage });
export default upload;

// Additional configurations
export const uploadReport = multer({
  storage: reportStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Unsupported file format. Please upload PDF, DOC, DOCX, JPG, JPEG, or PNG."
        )
      );
    }
  },
});
