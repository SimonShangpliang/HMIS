import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { MedicineJoiSchema, InventoryItemJoiSchema } from '../../../validators/medicineValidator.js'
import { connectDB, disconnectDB } from '../../helpers/db.js'

const now = new Date('2025-04-17T21:03:00Z')
const future = new Date(now.getTime() + 24 * 3600 * 1000)
const past = new Date(now.getTime() - 24 * 3600 * 1000)

describe('Medicine Validator Schemas', () => {
  beforeAll(async () => {
    await connectDB()
  })

  afterAll(async () => {
    await disconnectDB()
  })

  // --- InventoryItemJoiSchema ---
  describe('InventoryItemJoiSchema', () => {
    it('should validate a complete valid inventory item', () => {
      const item = {
        quantity: 10,
        batch_no: 'BN-123',
        expiry_date: future,
        manufacturing_date: past,
        unit_price: 50,
        supplier: 'HealthCorp'
      }
      const { error } = InventoryItemJoiSchema.validate(item, { abortEarly: false })
      expect(error).toBeUndefined()
    })

    it('should require all required fields', () => {
      const { error } = InventoryItemJoiSchema.validate({}, { abortEarly: false })
      expect(error).toBeDefined()
      const missing = error.details.map(d => d.path[0])
      expect(missing).toEqual(expect.arrayContaining([
        'quantity', 'batch_no', 'expiry_date', 'manufacturing_date', 'unit_price', 'supplier'
      ]))
    })

    it('should reject negative quantity', () => {
      const item = {
        quantity: -1,
        batch_no: 'B',
        expiry_date: future,
        manufacturing_date: past,
        unit_price: 10,
        supplier: 'ACME'
      }
      const { error } = InventoryItemJoiSchema.validate(item, { abortEarly: false })
      expect(error).toBeDefined()
      expect(error.details[0].path).toContain('quantity')
    })

    it('should reject expiry_date in the past', () => {
      const item = {
        quantity: 5,
        batch_no: 'B',
        expiry_date: past,
        manufacturing_date: past,
        unit_price: 10,
        supplier: 'ACME'
      }
      const { error } = InventoryItemJoiSchema.validate(item, { abortEarly: false })
      expect(error).toBeDefined()
      expect(error.details[0].message).toMatch(/Expiry date must be in the future/)
    })

    it('should reject manufacturing_date in the future', () => {
      const item = {
        quantity: 5,
        batch_no: 'B',
        expiry_date: future,
        manufacturing_date: future,
        unit_price: 10,
        supplier: 'ACME'
      }
      const { error } = InventoryItemJoiSchema.validate(item, { abortEarly: false })
      expect(error).toBeDefined()
      expect(error.details[0].message).toMatch(/Manufacturing date must be in the past/)
    })

    it('should reject missing or short supplier', () => {
      const item = {
        quantity: 5,
        batch_no: 'B',
        expiry_date: future,
        manufacturing_date: past,
        unit_price: 10,
        supplier: 'A'
      }
      const { error } = InventoryItemJoiSchema.validate(item, { abortEarly: false })
      expect(error).toBeDefined()
      expect(error.details[0].path).toContain('supplier')
    })
  })

  // --- MedicineJoiSchema ---
  describe('MedicineJoiSchema', () => {
    it('should validate a complete valid medicine object', () => {
      const medicine = {
        _id: 1,
        med_name: 'Paracetamol',
        effectiveness: 'high',
        dosage_form: 'tablet',
        manufacturer: 'Pharma Inc',
        available: true,
        inventory: [
          {
            quantity: 100,
            batch_no: 'BN-001',
            expiry_date: future,
            manufacturing_date: past,
            unit_price: 2,
            supplier: 'SupplierX'
          }
        ]
      }
      const { error } = MedicineJoiSchema.validate(medicine, { abortEarly: false })
      expect(error).toBeUndefined()
    })

    it('should allow minimal medicine object', () => {
      const { error } = MedicineJoiSchema.validate({}, { abortEarly: false })
      expect(error).toBeUndefined()
    })

    it('should reject invalid effectiveness', () => {
      const { error } = MedicineJoiSchema.validate({ effectiveness: 'super' }, { abortEarly: false })
      expect(error).toBeDefined()
      expect(error.details[0].path).toContain('effectiveness')
    })

    it('should reject invalid dosage_form', () => {
      const { error } = MedicineJoiSchema.validate({ dosage_form: 'pill' }, { abortEarly: false })
      expect(error).toBeDefined()
      expect(error.details[0].path).toContain('dosage_form')
    })

    it('should reject inventory with invalid items', () => {
      const medicine = {
        med_name: 'Ibuprofen',
        inventory: [
          {
            quantity: -1,
            batch_no: '',
            expiry_date: past,
            manufacturing_date: future,
            unit_price: -5,
            supplier: ''
          }
        ]
      }
      const { error } = MedicineJoiSchema.validate(medicine, { abortEarly: false })
      expect(error).toBeDefined()
      // Should report errors for nested inventory fields
      const paths = error.details.map(d => d.path.join('.'))
      expect(paths.some(p => p.startsWith('inventory.0'))).toBe(true)
    })
  })
})
