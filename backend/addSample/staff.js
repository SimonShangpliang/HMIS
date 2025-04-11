import express from 'express';
import { Doctor, Nurse, Pharmacist, Receptionist, Admin, Pathologist, Driver } from '../models/staff.js';
import Employee from '../models/employee.js'; // Assuming you have an Employee model
import {Lab, Department} from '../models/department.js'; // Assuming you have a Department model
import {Room} from '../models/facility.js'; // Assuming you have a Room model
import {Bed} from '../models/facility.js'; // Assuming you have a Bed model
import {Ambulance} from '../models/facility.js'; // Assuming you have an Ambulance model
// import Lab from '../models/lab.js'; // Assuming you have a Lab model

const router = express.Router();

// Route to add dummy data for all staff types
router.post('/generate', async (req, res) => {
  try {
    // Add departments first (to reference in staff)
    const departments = await addDummyDepartments();
    
    // Add rooms, beds, ambulances, labs (to reference in staff)
    const rooms = await addDummyRooms();
    const beds = await addDummyBeds(rooms);
    const ambulances = await addDummyAmbulances();
    const labs = await addDummyLabs();
    
    // Add employees first (as they're referenced by all staff)
    const employees = await addDummyEmployees();
    
    // Add different types of staff
    const doctors = await addDummyDoctors(employees, departments);
    const nurses = await addDummyNurses(employees, departments, rooms, beds, ambulances);
    const pharmacists = await addDummyPharmacists(employees);
    const receptionists = await addDummyReceptionists(employees, departments);
    const admins = await addDummyAdmins(employees);
    const pathologists = await addDummyPathologists(employees, labs);
    const drivers = await addDummyDrivers(employees);
    
    res.status(200).json({
      message: 'Dummy data added successfully',
      counts: {
        departments: departments.length,
        rooms: rooms.length,
        beds: beds.length,
        ambulances: ambulances.length,
        labs: labs.length,
        employees: employees.length,
        doctors: doctors.length,
        nurses: nurses.length,
        pharmacists: pharmacists.length,
        receptionists: receptionists.length,
        admins: admins.length,
        pathologists: pathologists.length,
        drivers: drivers.length
      }
    });
  } catch (error) {
    console.error('Error adding dummy data:', error);
    res.status(500).json({ message: 'Error adding dummy data', error: error.message });
  }
});

// Helper function to add dummy departments
async function addDummyDepartments() {
  var departments = await Department.find({});
  if (departments.length > 0) {
    return departments;
  }
  console.log("No departments found. Please add departments first.");
  return null;
}

// Helper function to add dummy rooms
async function addDummyRooms() {
  var rooms = await Room.find({}).lean();
  if (rooms.length > 0) {
    return rooms;
  }
  console.log("No room found. Please add room first.");
  return null;
}

// Helper function to add dummy beds
async function addDummyBeds(rooms) {
  var beds = await Bed.find({}).lean();
  if (beds.length > 0) {
    return beds;
  }
  
  console.log("No bed found. Please add bed first.");
  return null;
}

// Helper function to add dummy ambulances
async function addDummyAmbulances() {
  var ambulances = await Ambulance.find({}).lean();
  if (ambulances.length > 0) {
    return ambulances;
  }
  console.log("No amb found. Please add amb first.");
  return null;
}

// Helper function to add dummy laboratories
async function addDummyLabs() {
  var labs = await Lab.find({}).lean();
  if (labs.length > 0) {
    return labs;
  }
  console.log("No lab found. Please add lab first.");
  return null;
}

// Helper function to add dummy employees (base data for all staff)
async function addDummyEmployees() {
  var employees = await Employee.find({}).lean();
  if (employees.length > 0) {
    return employees;
  }
  
  console.log("No emp found. Please add emp first.");
  return null;
}

// Helper function to add dummy doctors
async function addDummyDoctors(employees, departments) {
  const doctorData = [];
  const doctorEmployees = employees.filter(emp => emp.role === 'doctor');
  const specializations = ['Cardiologist', 'Neurologist', 'Orthopedic Surgeon', 'Dermatologist', 'ENT Specialist'];
  const qualifications = ['MD', 'MBBS, MD', 'MBBS, MS', 'MBBS, DNB', 'MBBS, DM'];
  
  for (let i = 0; i < doctorEmployees.length; i++) {
    const deptIndex = i % departments.length;
    
    doctorData.push({
      employee_id: doctorEmployees[i]._id,
      department_id: departments[deptIndex]._id,
      specialization: specializations[i % specializations.length],
      qualification: qualifications[i % qualifications.length],
      experience: 2 + (i * 2), // Years of experience
      room_num: 100 + i,
      rating: 3.5 + (Math.random() * 1.5),
      num_ratings: 10 + (i * 5)
    });
  }
  console.log(doctorData);
  await Doctor.deleteMany({}); // Clear existing data
  return await Doctor.create(doctorData);
}

// Helper function to add dummy nurses
async function addDummyNurses(employees, departments, rooms, beds, ambulances) {
  const nurseData = [];
  const nurseEmployees = employees.filter(emp => emp.role === 'nurse');
  const locations = ["ward", "icu", "ot", "emergency"];
  
  for (let i = 0; i < nurseEmployees.length; i++) {
    const deptIndex = i % departments.length;
    const roomIndex = i % rooms.length;
    const bedIndex = i % beds.length;
    const ambIndex = i % ambulances.length;
    
    nurseData.push({
      employee_id: nurseEmployees[i]._id,
      assigned_dept: departments[deptIndex]._id,
      location: locations[i % locations.length],
      assigned_room: i % 3 === 0 ? rooms[roomIndex]._id : null,
      assigned_bed: i % 4 === 0 ? beds[bedIndex]._id : null,
      assigned_amb: i % 5 === 0 ? ambulances[ambIndex]._id : null
    });
  }
  
  await Nurse.deleteMany({}); // Clear existing data
  return await Nurse.create(nurseData);
}

// Helper function to add dummy pharmacists
async function addDummyPharmacists(employees) {
  const pharmacistData = [];
  const pharmacistEmployees = employees.filter(emp => emp.role === 'pharmacist');
  
  for (const employee of pharmacistEmployees) {
    pharmacistData.push({
      employee_id: employee._id
    });
  }
  
  await Pharmacist.deleteMany({}); // Clear existing data
  return await Pharmacist.insertMany(pharmacistData);
}

// Helper function to add dummy receptionists
async function addDummyReceptionists(employees, departments) {
  const receptionistData = [];
  const receptionistEmployees = employees.filter(emp => emp.role === 'receptionist');
  
  for (let i = 0; i < receptionistEmployees.length; i++) {
    const deptIndex = i % departments.length;
    
    receptionistData.push({
      employee_id: receptionistEmployees[i]._id,
      assigned_dept: departments[deptIndex]._id
    });
  }
  
  await Receptionist.deleteMany({}); // Clear existing data
  return await Receptionist.insertMany(receptionistData);
}

// Helper function to add dummy admins
async function addDummyAdmins(employees) {
  const adminData = [];
  const adminEmployees = employees.filter(emp => emp.role === 'admin');
  
  for (const employee of adminEmployees) {
    adminData.push({
      employee_id: employee._id
    });
  }
  
  await Admin.deleteMany({}); // Clear existing data
  return await Admin.insertMany(adminData);
}

// Helper function to add dummy pathologists
async function addDummyPathologists(employees, labs) {
  const pathologistData = [];
  const pathologistEmployees = employees.filter(emp => emp.role === 'pathologist');
  
  for (let i = 0; i < pathologistEmployees.length; i++) {
    const labIndex = i % labs.length;
    
    pathologistData.push({
      employee_id: pathologistEmployees[i]._id,
      lab_id: labs[labIndex]._id
    });
  }
  
  await Pathologist.deleteMany({}); // Clear existing data
  return await Pathologist.insertMany(pathologistData);
}

// Helper function to add dummy drivers
async function addDummyDrivers(employees) {
  const driverData = [];
  const driverEmployees = employees.filter(emp => emp.role === 'driver');
  
  for (const employee of driverEmployees) {
    driverData.push({
      employee_id: employee._id
    });
  }
  
  await Driver.deleteMany({}); // Clear existing data
  return await Driver.insertMany(driverData);
}

// Route to clear all dummy data
router.delete('/clear-dummy-data', async (req, res) => {
  try {
    await Employee.deleteMany({});
    await Doctor.deleteMany({});
    await Nurse.deleteMany({});
    await Pharmacist.deleteMany({});
    await Receptionist.deleteMany({});
    await Admin.deleteMany({});
    await Pathologist.deleteMany({});
    await Driver.deleteMany({});
    await Department.deleteMany({});
    await Room.deleteMany({});
    await Bed.deleteMany({});
    await Ambulance.deleteMany({});
    await Lab.deleteMany({});
    
    res.status(200).json({ message: 'All dummy data cleared successfully' });
  } catch (error) {
    console.error('Error clearing dummy data:', error);
    res.status(500).json({ message: 'Error clearing dummy data', error: error.message });
  }
});

export default router;