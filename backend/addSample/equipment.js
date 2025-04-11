import express from 'express';
import Equipment from '../models/equipment.js';
import {Department} from '../models/department.js'; // Assuming you have a Department model

const router = express.Router();

// Route to add dummy equipment data
router.post('/generate', async (req, res) => {
  try {
    // First make sure departments exist to reference
    const departments = await getDepartments();
    
    if (departments.length === 0) {
      return res.status(400).json({ 
        message: 'No departments found. Please add departments first.' 
      });
    }
    
    // Add dummy equipment data
    const equipment = await addDummyEquipment(departments);
    
    res.status(200).json({
      message: 'Dummy equipment data added successfully',
      count: equipment.length,
      equipment: equipment
    });
  } catch (error) {
    console.error('Error adding dummy equipment data:', error);
    res.status(500).json({ 
      message: 'Error adding dummy equipment data', 
      error: error.message 
    });
  }
});

// Helper function to get departments
async function getDepartments() {
  try {
    return await Department.find({});
  } catch (error) {
    console.error('Error fetching departments:', error);
    return [];
  }
}

// Helper function to add dummy equipment
async function addDummyEquipment(departments) {
  // Sample equipment data
  const equipmentTypes = [
    { name: 'X-Ray Machine', quantity: [1, 2] },
    { name: 'MRI Scanner', quantity: [1, 1] },
    { name: 'CT Scanner', quantity: [1, 1] },
    { name: 'Ultrasound Machine', quantity: [1, 3] },
    { name: 'ECG Machine', quantity: [2, 5] },
    { name: 'Defibrillator', quantity: [2, 5] },
    { name: 'Patient Monitor', quantity: [5, 10] },
    { name: 'Ventilator', quantity: [2, 5] },
    { name: 'Anesthesia Machine', quantity: [1, 3] },
    { name: 'Blood Pressure Monitor', quantity: [5, 10] },
    { name: 'Surgical Table', quantity: [1, 3] },
    { name: 'Surgical Light', quantity: [2, 4] },
    { name: 'Hospital Bed', quantity: [10, 20] },
    { name: 'Wheelchair', quantity: [5, 15] },
    { name: 'Infusion Pump', quantity: [5, 10] },
    { name: 'Nebulizer', quantity: [5, 10] },
    { name: 'Oxygen Concentrator', quantity: [3, 8] },
    { name: 'Dialysis Machine', quantity: [1, 2] },
    { name: 'Sterilizer', quantity: [1, 3] },
    { name: 'Microscope', quantity: [2, 5] }
  ];

  const equipmentData = [];
  
  // Generate current date for reference
  const currentDate = new Date();
  
  // Create some equipment for each department
  for (const department of departments) {
    // Randomly select 3-6 equipment types for this department
    const numEquipmentTypes = Math.floor(Math.random() * 4) + 3;
    const shuffled = [...equipmentTypes].sort(() => 0.5 - Math.random());
    const selectedEquipment = shuffled.slice(0, numEquipmentTypes);
    
    // Add each selected equipment type
    for (const equipment of selectedEquipment) {
      // Random quantity within the specified range
      const quantity = Math.floor(Math.random() * 
        (equipment.quantity[1] - equipment.quantity[0] + 1)) + 
        equipment.quantity[0];
      
      // Generate random dates for installation and service
      const installationYear = 2018 + Math.floor(Math.random() * 5);
      const installationMonth = Math.floor(Math.random() * 12);
      const installationDay = Math.floor(Math.random() * 28) + 1;
      const installationDate = new Date(installationYear, installationMonth, installationDay);
      
      // Last service date: random date between installation and now
      const installTime = installationDate.getTime();
      const currentTime = currentDate.getTime();
      const lastServiceTime = installTime + Math.random() * (currentTime - installTime);
      const lastServiceDate = new Date(lastServiceTime);
      
      // Next service date: 3-6 months after last service
      const nextServiceDate = new Date(lastServiceDate);
      nextServiceDate.setMonth(nextServiceDate.getMonth() + Math.floor(Math.random() * 4) + 3);
      
      // If next service date is in the past, set it to future
      if (nextServiceDate < currentDate) {
        nextServiceDate.setMonth(currentDate.getMonth() + Math.floor(Math.random() * 3) + 1);
      }
      
      equipmentData.push({
        equipment_name: equipment.name,
        owner_id: department._id,
        quantity: quantity,
        installation_date: installationDate,
        last_service_date: lastServiceDate,
        next_service_date: nextServiceDate
      });
    }
  }
  
  // Clear existing equipment data
  await Equipment.deleteMany({});
  
  // Insert new equipment data
  return await Equipment.create(equipmentData);
}

// Route to clear all equipment data
router.delete('/', async (req, res) => {
  try {
    await Equipment.deleteMany({});
    
    res.status(200).json({ message: 'All equipment data cleared successfully' });
  } catch (error) {
    console.error('Error clearing equipment data:', error);
    res.status(500).json({ 
      message: 'Error clearing equipment data', 
      error: error.message 
    });
  }
});

// Route to get all equipment data
router.get('/', async (req, res) => {
  try {
    const equipment = await Equipment.find({}).populate('owner_id');
    
    res.status(200).json({
      count: equipment.length,
      equipment: equipment
    });
  } catch (error) {
    console.error('Error fetching equipment data:', error);
    res.status(500).json({ 
      message: 'Error fetching equipment data', 
      error: error.message 
    });
  }
});

export default router;