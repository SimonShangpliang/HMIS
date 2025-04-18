import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import testRoutes from "./routes/testRoutes.js";
import employeeRoutes from "./routes/employee.routes.js";
import geminiRoutes from "./routes/gemini.routes.js";

import patientRoutes from "./routes/patient.routes.js";
import doctorRoutes from "./routes/doctor.routes.js";
import nurseRoutes from "./routes/nurse.routes.js";
import pathologistRoutes from "./routes/pathologist.routes.js";
import pharmacistRoutes from "./routes/pharmacy.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import receptionistRoutes from "./routes/receptionist.routes.js";
import inventoryRoutes from "./routes/inventory.routes.js";
import appointmentRoutes from "./routes/appointment.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import billingRoutes from "./routes/billing.routes.js";
import facilityRoutes from "./routes/facility.routes.js";
import authRoutes from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
import publicRoutes from "./routes/public.routes.js";
import commonPageRoutes from "./routes/commonPages.routes.js";
import consultationRoutes from "./routes/consultation.routes.js";
import cron from "node-cron";
import initializeDailyOccupancy from "./controllers/analytics.controller.js";
import insuranceRoutes from "./routes/insurance.routes.js";
dotenv.config();
const app = express();
app.use(cookieParser()); // This enables req.cookies
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Connect to MongoDB
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error(err));

app.get("/", (req, res) => {
  res.send("Backend is running with ES Modules");
});


app.get("/test", (req, res) => {
 
    res.send("Frontend Connected to Backend");
});

cron.schedule("0 0 * * *", async () => {
  console.log("Running daily occupancy initializer at midnight...");
  await initializeDailyOccupancy();
});

// Global hospital bank account
global.hospitalBankAccount = {
  bank_name: "Global Health Bank",
  account_number: 1234567890,
  ifsc_code: "GHBL0001234",
  branch_name: "Main Branch",
  balance: 5000, // Default balance
};

app.use(express.urlencoded({ extended: true }));
app.use(express.static("dist"));

//routes
app.use("/api/tests", testRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/consultations", consultationRoutes);
app.use("/api/nurses", nurseRoutes);
app.use("/api/pathologists", pathologistRoutes);
app.use("/api/pharmacists", pharmacistRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reception", receptionistRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/facility", facilityRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/public-data", publicRoutes);
app.use("/api/common", commonPageRoutes);
app.use("/api/insurance", insuranceRoutes);
app.use("/api/gemini", geminiRoutes);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "/dist/index.html"));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
