import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import mongoose from 'mongoose'
import Payroll from '../../../models/payroll.js'
import { connectDB, disconnectDB } from '../../helpers/db.js'

describe('Integration Tests: Payroll Model', () => {
  beforeAll(async () => {
    await connectDB()
  })

  afterAll(async () => {
    await disconnectDB()
  })

  beforeEach(async () => {
    await Payroll.deleteMany({})
  })

  it('should create and retrieve a Payroll document', async () => {
    const payrollData = {
      employee_id: 10,
      basic_salary: 60000,
      payment_proof: 'proof456.jpg',
      allowance: 6000,
      deduction: 3000,
      net_salary: 63000,
      month_year: new Date('2024-05-01'),
      payment_status: 'partially_paid',
      generation_date: new Date('2024-05-10')
    }

    const created = await Payroll.create(payrollData)
    const found = await Payroll.findById(created._id)

    expect(found).toBeDefined()
    expect(found.employee_id).toBe(10)
    expect(found.basic_salary).toBe(60000)
    expect(found.payment_proof).toBe('proof456.jpg')
    expect(found.allowance).toBe(6000)
    expect(found.deduction).toBe(3000)
    expect(found.net_salary).toBe(63000)
    expect(found.month_year.toISOString()).toBe(new Date('2024-05-01').toISOString())
    expect(found.payment_status).toBe('partially_paid')
    expect(found.generation_date.toISOString()).toBe(new Date('2024-05-10').toISOString())
    expect(found.createdAt).toBeInstanceOf(Date)
    expect(found.updatedAt).toBeInstanceOf(Date)
  })

  it('should update a Payroll document', async () => {
    const payroll = await Payroll.create({
      employee_id: 20,
      payment_status: 'pending'
    })

    payroll.payment_status = 'paid'
    payroll.net_salary = 70000
    const updated = await payroll.save()

    expect(updated.payment_status).toBe('paid')
    expect(updated.net_salary).toBe(70000)
  })

  it('should delete a Payroll document', async () => {
    const payroll = await Payroll.create({
      employee_id: 30,
      payment_status: 'paid'
    })

    await Payroll.findByIdAndDelete(payroll._id)
    const found = await Payroll.findById(payroll._id)
    expect(found).toBeNull()
  })

  it('should find Payroll documents by payment_status', async () => {
    await Payroll.create([
      { employee_id: 40, payment_status: 'paid' },
      { employee_id: 41, payment_status: 'pending' },
      { employee_id: 42, payment_status: 'partially_paid' }
    ])

    const paidPayrolls = await Payroll.find({ payment_status: 'paid' })
    expect(paidPayrolls).toHaveLength(1)
    expect(paidPayrolls[0].employee_id).toBe(40)
  })
})
