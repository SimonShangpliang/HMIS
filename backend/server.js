import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import testRoutes from "./routes/testRoutes.js";
import employeeRoutes from './routes/employee.routes.js';
import patientRoutes from './routes/patient.routes.js';
import doctorRoutes from './routes/doctor.routes.js';
import nurseRoutes from './routes/nurse.routes.js';
import pathologistRoutes from './routes/pathologist.routes.js';
import pharmacistRoutes from './routes/pharmacy.routes.js';
import adminRoutes from './routes/admin.routes.js';
import receptionistRoutes from './routes/receptionist.routes.js';
import inventoryRoutes from './routes/inventory.routes.js';
import appointmentRoutes from './routes/appointment.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import billingRoutes from './routes/billing.routes.js';
import facilityRoutes from './routes/facility.routes.js';
import schedule from 'node-schedule';
import { updateDailyOccupancy } from './controllers/analytics.controller.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Connect to MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.error(err));

app.get("/", (req, res) => {
    res.send("Backend is running with ES Modules");
});

app.get("/test",(req, res) => {
    res.send("Frontend Connected to Backend");
})

// Schedule the job to run at midnight every day
schedule.scheduleJob('0 0 * * *', async () => {
    console.log('Running daily occupancy update...');
    await updateDailyOccupancy();
});

//routes
app.use("/api/tests", testRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/nurses', nurseRoutes);
app.use('/api/pathologists', pathologistRoutes);
app.use('/api/pharmaciSst', pharmacistRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reception', receptionistRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/facility', facilityRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));