import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import mongoose from 'mongoose'
import Payroll from '../../../models/payroll.js'
import { connectDB, disconnectDB } from '../../helpers/db.js'

describe('Unit Tests: Payroll Model', () => {
  beforeAll(async () => {
    await connectDB()
  })

  afterAll(async () => {
    await disconnectDB()
  })

  beforeEach(async () => {
    await Payroll.deleteMany({})
  })

  it('should create a Payroll with valid fields', async () => {
    const payrollData = {
      employee_id: 1,
      basic_salary: 50000,
      payment_proof: 'proof123.jpg',
      allowance: 5000,
      deduction: 2000,
      net_salary: 53000,
      month_year: new Date('2024-04-01'),
      payment_status: 'paid',
      generation_date: new Date('2024-04-15')
    }

    const payroll = new Payroll(payrollData)
    const saved = await payroll.save()

    expect(saved._id).toBeDefined()
    expect(saved.employee_id).toBe(1)
    expect(saved.basic_salary).toBe(50000)
    expect(saved.payment_proof).toBe('proof123.jpg')
    expect(saved.allowance).toBe(5000)
    expect(saved.deduction).toBe(2000)
    expect(saved.net_salary).toBe(53000)
    expect(saved.month_year.toISOString()).toBe(new Date('2024-04-01').toISOString())
    expect(saved.payment_status).toBe('paid')
    expect(saved.generation_date.toISOString()).toBe(new Date('2024-04-15').toISOString())
    expect(saved.createdAt).toBeInstanceOf(Date)
    expect(saved.updatedAt).toBeInstanceOf(Date)
  })

  it('should reject invalid payment_status values', async () => {
    const payroll = new Payroll({
      employee_id: 2,
      payment_status: 'invalid_status'
    })
    await expect(payroll.save()).rejects.toThrow()
  })

  it('should allow missing optional fields', async () => {
    const payroll = new Payroll({
      employee_id: 3,
      payment_status: 'pending'
    })
    await payroll.validate()
    expect(payroll.basic_salary).toBeUndefined()
    expect(payroll.payment_proof).toBeUndefined()
    expect(payroll.allowance).toBeUndefined()
    expect(payroll.deduction).toBeUndefined()
    expect(payroll.net_salary).toBeUndefined()
    expect(payroll.month_year).toBeUndefined()
    expect(payroll.generation_date).toBeUndefined()
  })

  it('should allow updating a Payroll document', async () => {
    const payroll = new Payroll({
      employee_id: 4,
      payment_status: 'pending'
    })
    const saved = await payroll.save()

    saved.payment_status = 'paid'
    saved.net_salary = 45000
    const updated = await saved.save()

    expect(updated.payment_status).toBe('paid')
    expect(updated.net_salary).toBe(45000)
  })

  it('should coerce types where possible', async () => {
    const payroll = new Payroll({
      employee_id: '5', // string instead of number
      payment_status: 'paid'
    })
    const saved = await payroll.save()
    expect(typeof saved.employee_id).toBe('number')
    expect(saved.employee_id).toBe(5)
  })
})
