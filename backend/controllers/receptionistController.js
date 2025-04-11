import Patient from '../models/patient.js';
import bcrypt from 'bcrypt';
// const {BedLog} = require('../models/logs.js'); // Ensure the correct path to the BedLog model
import  BedLog  from '../models/logs.js'; // Ensure the correct path to the BedLog model    
import Bill from '../models/bill.js'; // Ensure the correct path to the Bill model
// import mongoose from 'mongoose';

// Controller for new patient registration
export const registerNewPatient = async (req, res) => {
    try {
        const {
            patientName,
            aadharId,
            dob,
            gender,
            bloodGroup,
            email,
            height,
            weight,
            address,
            emergencyNumber,
            mobile,
            password
        } = req.body;

        // // Validate required fields
        // if (height || !aadharId || !dob || !gender || !email || !mobile || !password) {
        //     return res.status(400).json({ message: 'All gay fields must be filled.' });
        // }

        const requiredFields = {
            patientName,
            aadharId,
            dob,
            gender,
            email,
            mobile,
            password
        };

        const emptyFields = Object.keys(requiredFields).filter(field => !requiredFields[field]);

        if (emptyFields.length > 0) {
            return res.status(400).json({ 
                message: `The following fields are missing: ${emptyFields.join(', ')}` 
            });
        }

        // Check if email or Aadhar ID already exists
        const existingPatient = await Patient.findOne({ $or: [{ email }, { aadhar_number: aadharId }] });
        if (existingPatient) {
            return res.status(400).json({ message: 'Email or Aadhar ID already exists.' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new patient instance
        const newPatient = new Patient({
            patient_username: email,
            password: hashedPassword,
            name: patientName,
            phone_number: mobile,
            emergency_contact: emergencyNumber,
            email,
            date_of_birth: dob,
            aadhar_number: aadharId,
            gender: gender.toLowerCase(),
            address,
            patient_info: {
                blood_group: bloodGroup,
                height,
                weight
            }
        });

        // Save the patient to the database
        const savedPatient = await newPatient.save();

        res.status(201).json({
            message: 'Patient registered successfully.',
            patient: savedPatient
        });
    } catch (error) {
        console.error('Error registering patient:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Controller for fetching all patients
export const getAllPatients = async (req, res) => {
    try {
        const patients = await Patient.find({}, {
            password: 0 // Exclude password field from results
        });
        
        res.status(200).json({
            count: patients.length,
            patients: patients
        });
    } catch (error) {
        console.error('Error fetching patients:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};



// Controller for fetching all bed information
export const getAllBedInfo = async (req, res) => {
    try {
        // BedLog.
        const bedLogs = await BedLog.BedLog.find().populate('bed_number').populate('patient_id');
        res.status(200).json(bedLogs);
    } catch (error) {
        console.error('Error fetching bed information:', error);
        console.log('BedLog model:', BedLog);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Controller for bed assignment
export const assignBed = async (req, res) => {
    try {
        const { patient_id, bed_number, bed_type } = req.body;

        // Validate required fields
        if (!patient_id || !bed_number || !bed_type) {
            return res.status(400).json({ message: 'Patient ID, Bed Number, and Bed Type are required fields' });
        }

        // Check if patient exists
        const patient = await Patient.findById(patient_id);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        // Check if bed is already occupied
        const existingAssignment = await BedLog.BedLog.findOne({
            bed_number: bed_number,
            status: "occupied"
        });

        if (existingAssignment) {
            return res.status(400).json({ message: 'Bed is already occupied' });
        }

        // Create new bed assignment
        const newAssignment = new BedLog.BedLog({
            patient_id,
            bed_number,
            bed_type,
            status: "occupied",
            time: new Date()
        });

        const savedAssignment = await newAssignment.save();

        res.status(201).json({
            message: 'Bed assigned successfully',
            assignment: savedAssignment
        });
    } catch (error) {
        console.error('Error assigning bed:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Controller for discharging patient from bed
export const dischargeBed = async (req, res) => {
    try {
        const { assignment_id } = req.body;

        // Validate required fields
        if (!assignment_id) {
            return res.status(400).json({ message: 'Assignment ID is required' });
        }

        // Find the assignment
        const assignment = await BedLog.BedLog.findById(assignment_id);
        
        if (!assignment) {
            return res.status(404).json({ message: 'Bed assignment not found' });
        }

        if (assignment.status === "vacated") {
            return res.status(400).json({ message: 'Patient already discharged from this bed' });
        }

        // Update the status to vacated and set current time
        assignment.status = "vacated";
        assignment.time = new Date();
        const updatedAssignment = await assignment.save();

        res.status(200).json({
            message: 'Patient discharged successfully',
            assignment: updatedAssignment
        });
    } catch (error) {
        console.error('Error discharging patient:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Controller for adding new bills
export const addBill = async (req, res) => {
    try {
        const {
            patient_id,
            generation_date,
            total_amount,
            payment_status,
            services
        } = req.body;

        // Validate required fields
        if (!patient_id || !total_amount || !payment_status) {
            return res.status(400).json({
                message: 'Patient ID, total amount, and payment status are required fields'
            });
        }

        // Create a new bill instance
        const newBill = new Bill({
            patient_id,
            generation_date: generation_date || new Date(),
            total_amount,
            payment_status,
            items: services.map(service => ({
                item_type: service.item_type,
                item_description: service.item_description,
                price: service.price,
                consult_id: service.consult_id,
                report_id: service.report_id,
                prescription_id: service.prescription_id,
                room_id: service.room_id
            }))
        });

        // Save the bill to the database
        const savedBill = await newBill.save();

        res.status(201).json({
            message: 'Bill created successfully',
            bill: savedBill
        });
    } catch (error) {
        console.error('Error adding bill:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


// module.exports = {
//     registerNewPatient
// };




