import { vi, beforeAll, afterAll } from 'vitest'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.test' })

let mongoServer

// Setup before all tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  const uri = mongoServer.getUri()
  await mongoose.connect(uri)
  
  // Set up global hospital bank account for tests
  global.hospitalBankAccount = {
    bank_name: "Test Health Bank",
    account_number: 1234567890,
    ifsc_code: "TESTHB0001234",
    branch_name: "Test Branch",
    balance: 10000
  }
})

// Teardown after all tests
afterAll(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
})

// Mock external services
vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn().mockReturnValue({
      sendMail: vi.fn().mockResolvedValue({ response: 'Email sent' })
    })
  }
}))

vi.mock('cloudinary', () => ({
  default: {
    v2: {
      uploader: {
        upload: vi.fn().mockResolvedValue({ secure_url: 'https://test-image.jpg' })
      }
    }
  }
}))

vi.mock('pdfkit', () => {
  const mockPdfKit = vi.fn().mockImplementation(() => ({
    on: vi.fn((event, callback) => {
      if (event === 'end') setTimeout(callback, 0)
      return mockPdfKit
    }),
    fontSize: vi.fn().mockReturnThis(),
    text: vi.fn().mockReturnThis(),
    moveDown: vi.fn().mockReturnThis(),
    end: vi.fn()
  }))
  return { default: mockPdfKit }
})
