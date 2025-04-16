import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import Department from '../../../models/department.js'
import { connectDB, disconnectDB } from '../../helpers/db.js'
import mongoose from 'mongoose'

beforeAll(async () => {
  await connectDB()
})

afterAll(async () => {
  await disconnectDB()
})

// Clear the database between tests
beforeEach(async () => {
  const collections = mongoose.connection.collections
  for (const key in collections) {
    const collection = collections[key]
    await collection.deleteMany({})
  }
})

describe('Department Model', () => {
  // Test creating a basic department
  it('should create a new department successfully', async () => {
    const departmentData = {
      dept_id: 'DEPT001',
      dept_name: 'Cardiology'
    }
    
    const department = new Department(departmentData)
    const savedDepartment = await department.save()
    
    expect(savedDepartment._id).toBeDefined()
    expect(savedDepartment.dept_id).toBe('DEPT001')
    expect(savedDepartment.dept_name).toBe('Cardiology')
    expect(savedDepartment.labs).toHaveLength(0)
    expect(savedDepartment.createdAt).toBeDefined()
    expect(savedDepartment.updatedAt).toBeDefined()
  })
  
  // Test creating a department with labs
  it('should create a department with embedded labs', async () => {
    const departmentData = {
      dept_id: 'DEPT002',
      dept_name: 'Pathology',
      labs: [
        { lab_name: 'Blood Testing Lab' },
        { lab_name: 'Microbiology Lab' }
      ]
    }
    
    const department = new Department(departmentData)
    const savedDepartment = await department.save()
    
    expect(savedDepartment.labs).toHaveLength(2)
    expect(savedDepartment.labs[0].lab_name).toBe('Blood Testing Lab')
    expect(savedDepartment.labs[1].lab_name).toBe('Microbiology Lab')
  })
  
    // For the specific duplicate test, modify it to ensure indexes:
    it('should not allow duplicate dept_id values', async () => {
    const department1 = new Department({
      dept_id: 'DEPT003',
      dept_name: 'Neurology'
    })
    
    await department1.save()
    
    await Department.createIndexes()
    
    const department2 = new Department({
      dept_id: 'DEPT003', // Same dept_id
      dept_name: 'Different Department'
    })
    
    await expect(department2.save()).rejects.toThrow()
  })
    
  // Test updating a department
  it('should update a department successfully', async () => {
    const department = new Department({
      dept_id: 'DEPT004',
      dept_name: 'Radiology'
    })
    
    const savedDepartment = await department.save()
    
    savedDepartment.dept_name = 'Updated Radiology'
    const updatedDepartment = await savedDepartment.save()
    
    expect(updatedDepartment.dept_name).toBe('Updated Radiology')
    expect(updatedDepartment.updatedAt.getTime()).toBeGreaterThanOrEqual(savedDepartment.updatedAt.getTime())
  })
  
  // Test adding a lab to a department
  it('should add a lab to an existing department', async () => {
    const department = new Department({
      dept_id: 'DEPT005',
      dept_name: 'Oncology'
    })
    
    const savedDepartment = await department.save()
    
    savedDepartment.labs.push({ lab_name: 'Cancer Research Lab' })
    const updatedDepartment = await savedDepartment.save()
    
    expect(updatedDepartment.labs).toHaveLength(1)
    expect(updatedDepartment.labs[0].lab_name).toBe('Cancer Research Lab')
  })
  
  // Test removing a lab
  it('should remove a lab from a department', async () => {
    const department = new Department({
      dept_id: 'DEPT006',
      dept_name: 'Pediatrics',
      labs: [
        { lab_name: 'Child Development Lab' },
        { lab_name: 'Pediatric Testing Lab' }
      ]
    })
    
    const savedDepartment = await department.save()
    savedDepartment.labs.pull(savedDepartment.labs[0]._id)
    
    const updatedDepartment = await savedDepartment.save()
    
    expect(updatedDepartment.labs).toHaveLength(1)
    expect(updatedDepartment.labs[0].lab_name).toBe('Pediatric Testing Lab')
  })
  
  // Test finding a department
  it('should find a department by dept_id', async () => {
    const department = new Department({
      dept_id: 'DEPT007',
      dept_name: 'Orthopedics'
    })
    
    await department.save()
    
    const foundDepartment = await Department.findOne({ dept_id: 'DEPT007' })
    
    expect(foundDepartment).toBeDefined()
    expect(foundDepartment.dept_name).toBe('Orthopedics')
  })
  
  // Test deleting a department
  it('should delete a department', async () => {
    const department = new Department({
      dept_id: 'DEPT008',
      dept_name: 'Psychiatry'
    })
    
    const savedDepartment = await department.save()
    await Department.findByIdAndDelete(savedDepartment._id)
    
    const foundDepartment = await Department.findOne({ dept_id: 'DEPT008' })
    expect(foundDepartment).toBeNull()
  })
  
  // Test validation for non-required fields
  it('should create a department even with missing non-required fields', async () => {
    const department = new Department({
      dept_id: 'DEPT009'
      // No dept_name provided
    })
    
    const savedDepartment = await department.save()
    expect(savedDepartment._id).toBeDefined()
    expect(savedDepartment.dept_id).toBe('DEPT009')
    expect(savedDepartment.dept_name).toBeUndefined()
  })
  
  // Test updating labs
  it('should update an existing lab in a department', async () => {
    const department = new Department({
      dept_id: 'DEPT010',
      dept_name: 'Dermatology',
      labs: [{ lab_name: 'Skin Testing Lab' }]
    })
    
    const savedDepartment = await department.save()
    
    savedDepartment.labs[0].lab_name = 'Updated Skin Testing Lab'
    const updatedDepartment = await savedDepartment.save()
    
    expect(updatedDepartment.labs[0].lab_name).toBe('Updated Skin Testing Lab')
  })
  
  // Test querying for departments with specific labs
  it('should find departments with specific labs', async () => {
    const department1 = new Department({
      dept_id: 'DEPT011',
      dept_name: 'Cardiology',
      labs: [{ lab_name: 'ECG Lab' }]
    })
    
    const department2 = new Department({
      dept_id: 'DEPT012',
      dept_name: 'Pulmonology',
      labs: [{ lab_name: 'Lung Function Lab' }]
    })
    
    await department1.save()
    await department2.save()
    
    const departments = await Department.find({ 'labs.lab_name': 'ECG Lab' })
    
    expect(departments).toHaveLength(1)
    expect(departments[0].dept_name).toBe('Cardiology')
  })
  
  // Test retrieving all departments
  it('should retrieve all departments', async () => {
    // Create multiple departments
    await new Department({
      dept_id: 'DEPT013',
      dept_name: 'Emergency'
    }).save()
    
    await new Department({
      dept_id: 'DEPT014',
      dept_name: 'Surgery'
    }).save()
    
    const departments = await Department.find({})
    expect(departments).toHaveLength(2)
    expect(departments.map(d => d.dept_name)).toContain('Emergency')
    expect(departments.map(d => d.dept_name)).toContain('Surgery')
  })
})
