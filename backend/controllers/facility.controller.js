import { Ambulance } from '../models/facility.js';
import { Driver } from '../models/staff.js';
import { Nurse } from '../models/staff.js';

export const addAmbulance = async (req, res) => {
    try {
        // console.log(req.body);
        const { vehicle_number, driver, status, nurse_id } = req.body;


        // Find the driver object by driverId and get its ObjectId
        const existingAmbulance = await Ambulance.findOne({ vehicle_number:vehicle_number });
        if (existingAmbulance) {
            return res.status(409).json({ message: 'Ambulance with this vehicle number already exists' });
        }
        const driverObject = await Driver.findOne({ employee_id: driver }); 
        if (!driverObject) {
            return res.status(404).json({ message: 'Driver not found' });
        }
        const existingNurse = await Nurse.findOne({employee_id: nurse_id});
        if (!existingNurse) {
            return res.status(404).json({ message: 'Nurse not found. Please provide a valid nurse ID.' });
        }

        // Create the ambulance with the driver's ObjectId
        const newAmbulance = new Ambulance({
            vehicle_number: vehicle_number,
            driver: driverObject._id, // Assign ObjectId
            status: status,
            nurse_id: nurse_id
        });

        await newAmbulance.save();
        res.status(201).json({ message: 'Ambulance added successfully', ambulance: newAmbulance });
    } catch (error) {
        res.status(500).json({ message: 'Error adding ambulance', error });
    }
};

export const getAmbulanceByVehicleNumber = async (req, res) => {
    try {
        const { vehicle_number } = req.params;
        const ambulance = await Ambulance.findOne({ vehicle_number });
        if (!ambulance) {
            return res.status(404).json({ message: 'Ambulance not found' });
        }
        res.status(200).json(ambulance);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving ambulance', error });
    }
};

export const decommissionAmbulance = async (req, res) => {
    try {
        const { vehicle_number } = req.body;
        // console.log(req.body);
        const ambulance = await Ambulance.findOneAndDelete({ vehicle_number });
        if (!ambulance) {
            return res.status(404).json({ message: 'Ambulance not found' });
        }

        res.status(200).json({ message: 'Ambulance decommissioned successfully', ambulance });
    } catch (error) {
        res.status(500).json({ message: 'Error decommissioning ambulance', error });
    }
};

export const getAllAmbulances = async (req, res) => {
    try {
        const ambulances = await Ambulance.find().populate('driver');
        res.status(200).json(ambulances);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving ambulances', error });
    }
}

