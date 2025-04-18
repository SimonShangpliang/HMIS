import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import mongoose from 'mongoose'
import logs from '../../../models/logs.js'
import { connectDB, disconnectDB } from '../../helpers/db.js'

const { LoginLog, BedLog, MedicineInventoryLog, FinanceLog } = logs

describe('Unit Tests: Logs Models', () => {
  beforeAll(async () => {
    await connectDB()
  })

  afterAll(async () => {
    await disconnectDB()
  })

  beforeEach(async () => {
    await Promise.all([
      LoginLog.deleteMany({}),
      BedLog.deleteMany({}),
      MedicineInventoryLog.deleteMany({}),
      FinanceLog.deleteMany({})
    ])
  })

  // -------- LoginLog --------
  describe('LoginLog Model', () => {
    it('should create a LoginLog with valid fields', async () => {
      const log = new LoginLog({ user_id: 1, task: 'login' })
      const saved = await log.save()
      expect(saved._id).toBeDefined()
      expect(saved.user_id).toBe(1)
      expect(saved.task).toBe('login')
      expect(saved.access_time).toBeInstanceOf(Date)
    })

    it('should reject invalid task values', async () => {
      const log = new LoginLog({ user_id: 1, task: 'invalid_task' })
      await expect(log.save()).rejects.toThrow()
    })

    it('should allow missing access_time and set default', async () => {
      const log = new LoginLog({ user_id: 2, task: 'logout' })
      await log.validate()
      expect(log.access_time).toBeInstanceOf(Date)
    })
  })

  // -------- BedLog --------
  describe('BedLog Model', () => {
    it('should create a BedLog with valid fields', async () => {
      const bedId = new mongoose.Types.ObjectId()
      const log = new BedLog({
        bed_id: bedId,
        bed_type: 'private',
        status: 'occupied',
        patient_id: 123
      })
      const saved = await log.save()
      expect(saved._id).toBeDefined()
      expect(saved.bed_id.toString()).toBe(bedId.toString())
      expect(saved.bed_type).toBe('private')
      expect(saved.status).toBe('occupied')
      expect(saved.patient_id).toBe(123)
      expect(saved.time).toBeInstanceOf(Date)
    })

    it('should reject invalid bed_type and status', async () => {
      const bedId = new mongoose.Types.ObjectId()
      const log = new BedLog({
        bed_id: bedId,
        bed_type: 'invalid_type',
        status: 'invalid_status',
        patient_id: 123
      })
      await expect(log.save()).rejects.toThrow()
    })
  })

  // -------- MedicineInventoryLog --------
  describe('MedicineInventoryLog Model', () => {
    it('should create a MedicineInventoryLog with valid fields', async () => {
      const orderDate = new Date()
      const log = new MedicineInventoryLog({
        med_id: 10,
        quantity: 50,
        total_cost: 500,
        order_date: orderDate,
        supplier: 'SupplierX',
        status: 'ordered'
      })
      const saved = await log.save()
      expect(saved._id).toBeDefined()
      expect(saved.med_id).toBe(10)
      expect(saved.quantity).toBe(50)
      expect(saved.total_cost).toBe(500)
      expect(saved.order_date.toISOString()).toBe(orderDate.toISOString())
      expect(saved.supplier).toBe('SupplierX')
      expect(saved.status).toBe('ordered')
    })

    it('should reject invalid status', async () => {
      const log = new MedicineInventoryLog({
        med_id: 10,
        quantity: 50,
        total_cost: 500,
        order_date: new Date(),
        supplier: 'SupplierX',
        status: 'invalid_status'
      })
      await expect(log.save()).rejects.toThrow()
    })
  })

  // -------- FinanceLog --------
  describe('FinanceLog Model', () => {
    it('should create a FinanceLog with valid fields', async () => {
      const log = new FinanceLog({
        user_id: 5,
        transaction_type: 'income',
        amount: 1000,
        description: 'Salary',
        allowance: 100,
        basic_salary: 800,
        deduction: 50,
        net_salary: 850
      })
      const saved = await log.save()
      expect(saved._id).toBeDefined()
      expect(saved.user_id).toBe(5)
      expect(saved.transaction_type).toBe('income')
      expect(saved.amount).toBe(1000)
      expect(saved.description).toBe('Salary')
      expect(saved.allowance).toBe(100)
      expect(saved.basic_salary).toBe(800)
      expect(saved.deduction).toBe(50)
      expect(saved.net_salary).toBe(850)
      expect(saved.date).toBeInstanceOf(Date)
    })

    it('should reject invalid transaction_type', async () => {
      const log = new FinanceLog({
        user_id: 5,
        transaction_type: 'invalid_type',
        amount: 1000
      })
      await expect(log.save()).rejects.toThrow()
    })

    it('should set default date if missing', async () => {
      const log = new FinanceLog({
        user_id: 6,
        transaction_type: 'expense',
        amount: 500
      })
      await log.validate()
      expect(log.date).toBeInstanceOf(Date)
    })
  })
})
