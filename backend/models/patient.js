// models/patient.js
import mongoose from 'mongoose';
import seq from 'mongoose-sequence';
const AutoIncrement = seq(mongoose);
const { Schema } = mongoose;

const PatientInfoSchema = new Schema({
  age: Number,
  height: Number,
  weight: Number,
  bloodGrp: { 
    type: String, 
    enum: ["A+", "B+", "AB+", "O+", "A-", "B-", "AB-", "O-"] 
  },
  familyHistory: String,
  bedNo: Number,
  roomNo: Number,
  other: String
}, { timestamps: true });

const VitalsSchema = new Schema({
  date: Date,
  time: String,
  bloodPressure: Number,
  bodyTemp: Number,
  pulseRate: Number,
  breathingRate: Number
}, { timestamps: true });
  
const PatientSchema = new Schema({
  _id: {type: Number }, // Auto-incremented field
  password: String,
  name: String,
  profile_pic: String,
  phone_number: String,
  emergency_contact: String,
  email: { type: String, unique: true },
  date_of_birth: Date,
  aadhar_number: { type: String, unique: true },
  gender: {type: String, enum:["Male","Female"]},
  address: String,
  patient_info: PatientInfoSchema, // Embedded document
  vitals: [VitalsSchema], // Array of embedded documents
  insurance_details: [{ type: Schema.Types.ObjectId, ref: 'Insurance' }]
}, { timestamps: true , _id:false });

PatientSchema.plugin(AutoIncrement, { inc_field: '_id',id: 'patient_id_counter', start_seq: 10000, increment_by: 1 });

const Patient = mongoose.model('Patient', PatientSchema);
export default Patient;
