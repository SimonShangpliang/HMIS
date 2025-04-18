// tests/unit/models/diagnosis.test.js
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { connectDB, disconnectDB, syncIndexes } from '../../helpers/db.js'
import Diagnosis from '../../../models/diagnosis.js'

describe('Diagnosis Model', () => {
  // Setup database connection
  beforeAll(async () => {
    await connectDB()
    Diagnosis.init()
  })

  // Disconnect after tests
  afterAll(async () => {
    await disconnectDB()
  })

  // Clear database before each test
  beforeEach(async () => {
    await Diagnosis.deleteMany({})
  })

  it('should create a new diagnosis successfully', async () => {
    const diagnosisData = {
      name: 'Hypertension'
    }
    
    const diagnosis = new Diagnosis(diagnosisData)
    const savedDiagnosis = await diagnosis.save()
    
    expect(savedDiagnosis._id).toBeDefined()
    expect(savedDiagnosis.name).toBe('Hypertension')
  })
    
  it('should find a diagnosis by name', async () => {
    const diagnosisData = {
      name: 'Asthma'
    }
    
    await new Diagnosis(diagnosisData).save()
    
    const foundDiagnosis = await Diagnosis.findOne({ name: 'Asthma' })
    
    expect(foundDiagnosis).toBeDefined()
    expect(foundDiagnosis.name).toBe('Asthma')
  })
  
  it('should update a diagnosis name', async () => {
    const diagnosis = new Diagnosis({
      name: 'Bronchitis'
    })
    
    const savedDiagnosis = await diagnosis.save()
    
    savedDiagnosis.name = 'Chronic Bronchitis'
    await savedDiagnosis.save()
    
    const updatedDiagnosis = await Diagnosis.findById(savedDiagnosis._id)
    expect(updatedDiagnosis.name).toBe('Chronic Bronchitis')
  })
  
  it('should delete a diagnosis', async () => {
    const diagnosis = new Diagnosis({
      name: 'Influenza'
    })
    
    const savedDiagnosis = await diagnosis.save()
    await Diagnosis.findByIdAndDelete(savedDiagnosis._id)
    
    const deletedDiagnosis = await Diagnosis.findById(savedDiagnosis._id)
    expect(deletedDiagnosis).toBeNull()
  })
  
  it('should retrieve all diagnoses', async () => {
    // Create multiple diagnoses
    await Promise.all([
      new Diagnosis({ name: 'Migraine' }).save(),
      new Diagnosis({ name: 'Pneumonia' }).save(),
      new Diagnosis({ name: 'Arthritis' }).save()
    ])
    
    const diagnoses = await Diagnosis.find({})
    expect(diagnoses).toHaveLength(3)
    expect(diagnoses.map(d => d.name)).toContain('Migraine')
    expect(diagnoses.map(d => d.name)).toContain('Pneumonia')
    expect(diagnoses.map(d => d.name)).toContain('Arthritis')
  })
  
  it('should consider case when evaluating uniqueness', async () => {
    // MongoDB's unique index is case-sensitive by default
    const diagnosis1 = new Diagnosis({
      name: 'Anemia'
    })
    
    await diagnosis1.save()
    
    const diagnosis2 = new Diagnosis({
      name: 'anemia' // Different case
    })
    
    // This should succeed unless case-insensitive index is configured
    await expect(diagnosis2.save()).resolves.toBeDefined()
  })
  
  it('should allow diagnosis with empty name', async () => {
    // Since there's no validation for required fields in the schema
    const diagnosis = new Diagnosis({
      name: ''
    })
    
    const savedDiagnosis = await diagnosis.save()
    expect(savedDiagnosis._id).toBeDefined()
    expect(savedDiagnosis.name).toBe('')
  })
  
  it('should create a diagnosis with missing name field', async () => {
    const diagnosis = new Diagnosis({})
    
    const savedDiagnosis = await diagnosis.save()
    expect(savedDiagnosis._id).toBeDefined()
    expect(savedDiagnosis.name).toBeUndefined()
  })
})
