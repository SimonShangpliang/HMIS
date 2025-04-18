import { describe, it, expect } from 'vitest'
import { MedicineJoiSchema } from '../../../validators/medicineValidator.js'

const now = new Date('2025-04-17T21:03:00Z')
const future = new Date(now.getTime() + 24 * 3600 * 1000)
const past = new Date(now.getTime() - 24 * 3600 * 1000)

describe('Integration: MedicineJoiSchema Validator', () => {
  it('should accept a valid medicine payload', () => {
    const payload = {
      med_name: 'Aspirin',
      effectiveness: 'medium',
      dosage_form: 'tablet',
      manufacturer: 'Medico',
      available: false,
      inventory: [
        {
          quantity: 50,
          batch_no: 'BATCH-2025',
          expiry_date: future,
          manufacturing_date: past,
          unit_price: 1.5,
          supplier: 'SupplierY'
        }
      ]
    }
    const { error, value } = MedicineJoiSchema.validate(payload, { abortEarly: false })
    expect(error).toBeUndefined()
    expect(value.med_name).toBe('Aspirin')
    expect(value.inventory).toHaveLength(1)
  })

  it('should reject payload with invalid inventory item', () => {
    const payload = {
      med_name: 'Ibuprofen',
      inventory: [
        {
          quantity: -5,
          batch_no: '',
          expiry_date: past,
          manufacturing_date: future,
          unit_price: -10,
          supplier: ''
        }
      ]
    }
    const { error } = MedicineJoiSchema.validate(payload, { abortEarly: false })
    expect(error).toBeDefined()
    // Should report errors for nested inventory fields
    const paths = error.details.map(d => d.path.join('.'))
    expect(paths.some(p => p.startsWith('inventory.0'))).toBe(true)
  })

  it('should accept medicine with no inventory', () => {
    const payload = {
      med_name: 'Cetirizine',
      effectiveness: 'low'
    }
    const { error } = MedicineJoiSchema.validate(payload, { abortEarly: false })
    expect(error).toBeUndefined()
  })

  it('should reject invalid effectiveness and dosage_form', () => {
    const payload = {
      effectiveness: 'superb',
      dosage_form: 'powder'
    }
    const { error } = MedicineJoiSchema.validate(payload, { abortEarly: false })
    expect(error).toBeDefined()
    const fields = error.details.map(d => d.path[0])
    expect(fields).toEqual(expect.arrayContaining(['effectiveness', 'dosage_form']))
  })

  it('should reject inventory if not an array', () => {
    const payload = {
      med_name: 'Test',
      inventory: 'not-an-array'
    }
    const { error } = MedicineJoiSchema.validate(payload, { abortEarly: false })
    expect(error).toBeDefined()
    expect(error.details[0].path).toContain('inventory')
  })
})
