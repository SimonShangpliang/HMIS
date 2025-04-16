import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

let mongoServer

export const connectDB = async () => {
  // Close any existing connections
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close()
  }
  
  mongoServer = await MongoMemoryServer.create()
  const uri = mongoServer.getUri()
  
  // Configure Mongoose with only supported options
  await mongoose.connect(uri, {
    autoIndex: true  // This option is still supported
  })
  
  return mongoServer
}

export const disconnectDB = async () => {
  await mongoose.disconnect()
  if (mongoServer) {
    await mongoServer.stop()
  }
}

export const syncIndexes = async () => {
  await mongoose.connection.syncIndexes()
}
