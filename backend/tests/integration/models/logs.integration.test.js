import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import mongoose from 'mongoose'
import logs from '../../../models/logs.js'
import { connectDB, disconnectDB } from '../../helpers/db.js'

const { LoginLog, BedLog, MedicineInventoryLog, FinanceLog } = logs

describe('Integration Tests: Logs Models', () => {
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
  it('should create and retrieve a LoginLog', async () => {
    const created = await LoginLog.create({ user_id: 1, task: 'login' })
    const found = await LoginLog.findById(created._id)
    expect(found).toBeDefined()
    expect(found.user_id).toBe(1)
    expect(found.task).toBe('login')
    expect(found.access_time).toBeInstanceOf(Date)
  })

  // -------- BedLog --------
  it('should create and retrieve a BedLog', async () => {
    const bedId = new mongoose.Types.ObjectId()
    const created = await BedLog.create({
      bed_id: bedId,
      bed_type: 'general',
      status: 'vacated',
      patient_id: 2
    })
    const found = await BedLog.findById(created._id)
    expect(found).toBeDefined()
    expect(found.bed_id.toString()).toBe(bedId.toString())
    expect(found.bed_type).toBe('general')
    expect(found.status).toBe('vacated')
    expect(found.patient_id).toBe(2)
    expect(found.time).toBeInstanceOf(Date)
  })

  // -------- MedicineInventoryLog --------
  it('should create and retrieve a MedicineInventoryLog', async () => {
    const orderDate = new Date()
    const created = await MedicineInventoryLog.create({
      med_id: 3,
      quantity: 20,
      total_cost: 200,
      order_date: orderDate,
      supplier: 'SupplierY',
      status: 'received'
    })
    const found = await MedicineInventoryLog.findById(created._id)
    expect(found).toBeDefined()
    expect(found.med_id).toBe(3)
    expect(found.quantity).toBe(20)
    expect(found.total_cost).toBe(200)
    expect(found.order_date.toISOString()).toBe(orderDate.toISOString())
    expect(found.supplier).toBe('SupplierY')
    expect(found.status).toBe('received')
  })

  // -------- FinanceLog --------
  it('should create and retrieve a FinanceLog', async () => {
    const created = await FinanceLog.create({
      user_id: 10,
      transaction_type: 'expense',
      amount: 300,
      description: 'Office supplies',
      allowance: 30,
      basic_salary: 0,
      deduction: 10,
      net_salary: 280
    })
    const found = await FinanceLog.findById(created._id)
    expect(found).toBeDefined()
    expect(found.user_id).toBe(10)
    expect(found.transaction_type).toBe('expense')
    expect(found.amount).toBe(300)
    expect(found.description).toBe('Office supplies')
    expect(found.allowance).toBe(30)
    expect(found.basic_salary).toBe(0)
    expect(found.deduction).toBe(10)
    expect(found.net_salary).toBe(280)
    expect(found.date).toBeInstanceOf(Date)
  })
})
