import Patient from '../models/patient.js';
import bcrypt from 'bcrypt';
// const {BedLog} = require('../models/logs.js'); // Ensure the correct path to the BedLog model
import  BedLog  from '../models/logs.js'; // Ensure the correct path to the BedLog model    
import Bill from '../models/bill.js'; // Ensure the correct path to the Bill model
// import mongoose from 'mongoose';
import crypto from 'crypto';
import { Room } from '../models/facility.js';
import { Nurse } from '../models/staff.js';
import Employee from '../models/employee.js';
import { sendPasswordEmail } from "../config/sendMail.js"; // adjust the path
import Insurances from '../models/insurance.js'; // Ensure the correct path to the Insurances model
// Controller for new patient registration
import { sendAssignmentEmail,sendDischargeEmail } from "../config/sendMail.js"; // adjust the path

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
        } = req.body;

        // // Validate required fields
        // if (height || !aadharId || !dob || !gender || !email || !mobile || !password) {
        //     return res.status(400).json({ message: 'All gay fields must be filled.' });
        // }

        // const requiredFields = {
        //     patientName,
        //     aadharId,
        //     dob,
        //     gender,
        //     email,
        //     mobile
        // };

        // const emptyFields = Object.keys(requiredFields).filter(field => !requiredFields[field]);

        // if (emptyFields.length > 0) {
        //     return res.status(400).json({ 
        //         message: `The following fields are missing: ${emptyFields.join(', ')}` 
        //     });
        // }

        // Check if email or Aadhar ID already exists
        const existingPatient = await Patient.findOne({ $or: [{ email }, { aadhar_number: aadharId }] });
        if (existingPatient) {
            return res.status(400).json({ message: 'Email or Aadhar ID already exists.' });
        }

        // Hash the password
        let PlainPassword=crypto.randomBytes(8).toString('base64').slice(0, 8);
        const hashedPassword = await bcrypt.hash(PlainPassword, 10);

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
                bloodGrp: bloodGroup,
                height,
                weight
            }
        });

        // Save the patient to the database
        const savedPatient = await newPatient.save();
        // Send email with password
        await sendPasswordEmail(email,PlainPassword,savedPatient._id);

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



export const getAllRooms = async (req, res) => {
    try {
      const rooms = await Room.find({}, 'room_number room_type');
      res.json(rooms);
    } catch (err) {
      console.error('Error fetching rooms:', err);
      res.status(500).json({ error: 'Failed to fetch rooms' });
    }
  };

  export const getAllBedInfo = async (req, res) => {
    try {
        const { room } = req.query;

        if (!room) {
            return res.status(400).json({ message: 'Room number is required in query.' });
        }

        // Step 1: Fetch room data
        const roomData = await Room.findOne({ room_number: room }).lean();
        if (!roomData) {
            return res.status(404).json({ message: 'Room not found.' });
        }

        // Step 2: Collect all nurse IDs and patient IDs from the room's beds
        const nurseIds = roomData.beds.filter(bed => bed.nurse_id != null).map(bed => bed.nurse_id);
        const patientIds = roomData.beds.filter(bed => bed.patient_id != null).map(bed => bed.patient_id);

        // Step 3: Fetch all nurses and patients in parallel using $in operator to minimize queries
        const [nurses, patients] = await Promise.all([
            Employee.find({ _id: { $in: nurseIds } }).lean(),
            Patient.find({ _id: { $in: patientIds } }).lean()
        ]);

        // Step 4: Create maps for quick lookup
        const nurseMap = new Map(nurses.map(nurse => [nurse._id.toString(), nurse.name]));
        const patientMap = new Map(patients.map(patient => [patient._id.toString(), patient.name]));

        // Step 5: Populate bed data
        const populatedBeds = roomData.beds.map(bed => {
            let nurse = null;
            let patient = null;

            if (bed.nurse_id != null && nurseMap.has(bed.nurse_id.toString())) {
                nurse = {
                    nurseId: bed.nurse_id,
                    name: nurseMap.get(bed.nurse_id.toString())
                };
            }

            if (bed.patient_id != null && patientMap.has(bed.patient_id.toString())) {
                patient = {
                    patientId: bed.patient_id,
                    name: patientMap.get(bed.patient_id.toString())
                };
            }

            return {
                bedNumber: bed.bed_number,
                status: bed.status,
                nurse,
                patient
            };
        });

        // Step 6: Return the room info along with populated bed data
        res.status(200).json({
            roomNumber: roomData.room_number,
            roomType: roomData.room_type,
            beds: populatedBeds
        });

    } catch (error) {
        console.error('Error fetching bed information:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};


// Controller for bed assignment
export const assignBed = async (req, res) => {
    const { room, bedId, patientId, nurseId } = req.body;
  
    if (!room || !bedId || !patientId || !nurseId ) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
        const patient = await Patient.findById(patientId);
        if (!patient) {
          return res.status(404).json({ error: 'Patient not found' });
        }
    
        const nurse = await Nurse.findById(nurseId);
        if (!nurse) {
          return res.status(404).json({ error: 'Nurse not found ' });
        }
      const roomDoc = await Room.findOne({ room_number: room });
      if (!roomDoc) return res.status(404).json({ error: 'Room not found' });
      console.log("All beds in the room:", roomDoc.beds);
      const bed = roomDoc.beds.find(b => b.bed_number === Number(bedId));
      if (!bed) return res.status(404).json({ error: 'Bed not found' });
      bed.status = 'occupied';
      bed.patient_id =patientId;
      bed.nurse_id = nurseId;
      const nurse_employee = await Employee.findOne({ _id:nurse.employee_id, role: 'nurse' });
     
      await sendAssignmentEmail({
        toEmail: patient.email,
        name: patient.name,
        bedNo:bed.bed_number,
        roomNumber: roomDoc.room_number,
        role: "Patient",
        id:patientId
    });
    await sendAssignmentEmail({
        toEmail: nurse_employee.email,
        name: nurse_employee.name,
        bedNo:bed.bed_number,
        roomNumber: roomDoc.room_number,
        role: "Nurse",
        id:nurseId
    });

    
    //   Update Patient document
    await Patient.findByIdAndUpdate(patientId, {
        'patient_info.bedNo': bed.bed_number,
        'patient_info.roomNo': roomDoc.room_number
    });
    await Nurse.findByIdAndUpdate(nurseId, {
        assigned_bed: bed._id,
        assigned_room: roomDoc._id
    });
    await roomDoc.save();

    // // Log the assignment in BedLog
    // const log = new BedLog({
    //     bed_id: bedId,
    //     bed_type: bedType,
    //     status: 'occupied',
    //     patient_id: patientId,
    //   });
  
    //   await log.save();

      res.status(200).json({ message: 'Bed assigned and logged successfully ' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  };

// Controller for discharging patient from bed
// POST /discharge-bed
export const dischargeBed = async (req, res) => {
    const { room, bedId, patientId, nurseId } = req.body;
    console.log("Discharge Bed Request:", req.body);
  
    if (!room || !bedId) {
      return res.status(400).json({ error: 'Missing room or bed ID' });
    }
  
    try {
        const patient = await Patient.findById(patientId);
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        const nurse = await Nurse.findById(nurseId);
        if (!nurse) {
            return res.status(404).json({ error: 'Nurse not found' });
        }
        const roomDoc = await Room.findOne({ room_number: room });
        if (!roomDoc) return res.status(404).json({ error: 'Room not found' });
  
      const bed = roomDoc.beds.find(b =>  b.bed_number === Number(bedId));
      if (!bed) return res.status(404).json({ error: 'Bed not found' });
  
      bed.status = 'vacant';
      bed.patient_id = null;
      bed.nurse_id = null;
      const nurse_employee = await Employee.findOne({ _id:nurse.employee_id, role: 'nurse' });

      await sendDischargeEmail({
        toEmail: patient.email,
        name: patient.name,
        bedNo:bed.bed_number,
        roomNumber: roomDoc.room_number,
        role: "Patient",
        id:patientId
      });
  
      await sendDischargeEmail({
        toEmail: nurse_employee.email,
        name: nurse_employee.name,
        bedNo:bed.bed_number,
        roomNumber: roomDoc.room_number,
        role: "Nurse",
        id:nurseId
      });

  
      
      // Clear the patient’s bed, room, and nurse
    
        await Patient.findByIdAndUpdate(patientId, {
            $unset: {
                'patient_info.bedNo': '',
                'patient_info.roomNo': ''
            }
        });
        
        await Nurse.findByIdAndUpdate(nurseId, {
            $unset: {
                assigned_bed: '',
                assigned_room: ''
            }
        });
        
        await roomDoc.save();

        // Log the discharge in BedLog
    // const log = new BedLog({
    //     bed_id: bedId,
    //     bed_type: bedType,
    //     status: 'vacated',
    //     patient_id: patientId,
    //   });
  
    //   await log.save();
      res.status(200).json({ message: 'Bed discharged and logged successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  };
  
// Function to apply insurance discount
const applyInsuranceDiscount = (totalAmount, insuranceDetails, date) => {
    if (!insuranceDetails) {
        return totalAmount; // No discount if insurance details are not provided or coverage percentage is missing
    }
    if (date > insuranceDetails.policy_end_date) {
        return totalAmount; // No discount if policy is expired
    }

    // Validate insurance_number and paid_amount
    const insuranceNumber = parseFloat(insuranceDetails.insurance_number) || 0;
    const paidAmount = parseFloat(insuranceDetails.paid_amount) || 0;

    const maxCoverage = Math.min((insuranceNumber * 100000) - paidAmount, totalAmount);
    insuranceDetails.paid_amount = paidAmount + maxCoverage;
    totalAmount -= maxCoverage;
    console.log('Discount applied. Remaining total amount:', totalAmount);
    return totalAmount;
};
// Controller for adding new bills
export const addBill = async (req, res) => {
    try {
        const {
            patient_id,
            generation_date,
            total_amount,
            payment_status,
            services, 
            insurance_provider
        } = req.body;
        // Example Postman query body for adding a new bill
       
        // Validate required fields
        if (!patient_id || !total_amount || !payment_status) {
            return res.status(400).json({
                message: 'Patient ID, total amount, and payment status are required fields'
            });
        }
        // Sample Postman query body for adding a new bill
      
        // return res.status(400).json({generation_date, total_amount, payment_status, services, insurance_provider});
        // Fetch insurance details if insurance_provider is provided
        let insuranceDetails = null;
        if (insurance_provider) {
            insuranceDetails = await Insurances.findOne({
                insurance_provider: insurance_provider,
                'patients.patient_id': patient_id
            }, {
                'patients.$': 1 // Fetch only the matching patient object from the patients array
            });

            if (!insuranceDetails || insuranceDetails.patients.length === 0) {
            return res.status(404).json({ message: 'Insurance provider or patient not found' });
            }

            insuranceDetails = insuranceDetails.patients[0]; // Extract the matching patient object
        }
        let datee = generation_date; 
        let tot = applyInsuranceDiscount(total_amount, insuranceDetails, datee);
        // Create a new bill instance
        // Validate and format generation_date
        if(!insuranceDetails){
           return res.status(400).json({ message: 'Insurance details are required' });
        }
        // const formattedDate = new Date(datee);
        // if (isNaN(formattedDate)) {
        //     return res.status(400).json({ message: 'Invalid generation_date format' });
        // }

        // Validate total_amount
        if (isNaN(tot) || tot < 0) {
            return res.status(400).json({ message: 'Invalid total_amount value' });
        }

        // Validate item_type against allowed enum values
        const allowedItemTypes = ['consultation', 'medication', 'surgery', 'diagnostic'];
        const validatedItems = services.map(service => {
            // if (!allowedItemTypes.includes(service.item_type)) {
            //     throw new Error(`Invalid item_type: ${service.item_type}`);
            // }
            return {
                item_type: service.item_type,
                item_description: service.item_description,
                price: service.price,
                consult_id: service.consult_id,
                report_id: service.report_id,
                prescription_id: service.prescription_id,
                room_id: service.room_id
            };
        });

        const newBill = new Bill.Bill({
            patient_id,
            generation_date: datee,
            total_amount: tot,
            payment_status,
            items: validatedItems
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

export const fetchPatientInsurance = async (req, res) => {
    try {
        const { patient_id } = req.body;
        
        if (!patient_id) {
            return res.status(400).json({ message: 'Patient ID is required' });
        }

        // Fetch insurances where the patient_id matches
        const insurances = await Insurances.find({
            'patients.patient_id': patient_id
        }).populate('patients.patient_id');

        res.status(200).json({
            count: insurances.length,
            insurances: insurances
        });
    } catch (error) {
        console.error('Error fetching insurance data:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};


// module.exports = {
//     registerNewPatient
// };




