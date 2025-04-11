import express from 'express';
import {Lab,Department} from '../models/department.js';
import { faker } from '@faker-js/faker';

const router = express.Router();

// GET all departments
router.get('/', async (req, res) => {
  try {
    const departments = await Department.find({});
    res.status(200).json(departments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST add a single department
router.post('/', async (req, res) => {
  try {
    const department = new Department(req.body);
    const savedDepartment = await department.save();
    res.status(201).json(savedDepartment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

function generateLab(){
  
}

// Generate a random department with labs
async function generateDepartment() {
  // Department names by specialties
  const departmentNames = [
    "Cardiology", "Neurology", "Orthopedics", "Pediatrics", 
    "Oncology", "Dermatology", "Ophthalmology", "Psychiatry",
    "Radiology", "Surgery", "Urology", "Endocrinology",
    "Gastroenterology", "Hematology", "Immunology", "Nephrology"
  ];
  
  // Generate unique department ID with format DEPT-XXXX
  const deptId = `DEPT-${faker.string.alphanumeric(4).toUpperCase()}`;
  
  // Generate between 1-5 labs for the department
  const labCount = Math.floor(Math.random() * 5) + 1;
  const labs = [];
  
  const labTypes = [
    "Research", "Diagnostic", "Testing", "Analysis", 
    "Imaging", "Pathology", "Clinical", "Reference"
  ];
  
  for (let i = 0; i < labCount; i++) {
    // Create lab names like "Cardiology Research Lab", "Cardiac Diagnostic Lab"
    const selectedDept = departmentNames[Math.floor(Math.random() * departmentNames.length)];
    const selectedType = labTypes[Math.floor(Math.random() * labTypes.length)];
    
    labs.push({
      lab_name: `${selectedDept} ${selectedType} Lab ${i + 1}`
    });
  }

  for (const lab of labs) {
    const newLab = new Lab(lab);
    await newLab.save();
  }

  return {
    dept_id: deptId,
    dept_name: departmentNames[Math.floor(Math.random() * departmentNames.length)],
    labs: labs
  };
}

// POST generate and add dummy departments
router.post('/generate/:count', async (req, res) => {
  try {
    const count = parseInt(req.params.count) || 10;
    const departments = [];

    for (let i = 0; i < count; i++) {
      const department = new Department(await generateDepartment());
      const savedDepartment = await department.save();
      departments.push(savedDepartment);
    }

    res.status(201).json({
      message: `Successfully generated ${departments.length} departments`,
      count: departments.length
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE all departments (useful for testing)
router.delete('/all', async (req, res) => {
  try {
    await Department.deleteMany({});
    res.status(200).json({ message: 'All departments deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;