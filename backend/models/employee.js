import mongoose from 'mongoose';
import seq from 'mongoose-sequence';
const AutoIncrement = seq(mongoose);
const { Schema } = mongoose;

const BankDetailsSchema = new Schema({
  bank_name: String,
  account_number: Number,
  ifsc_code: String,
  branch_name: String,
  balance: Number
});

const EmployeeSchema = new Schema({
  _id : {type:Number},
  name: String,
  email: { type: String, unique: true },
  password: String,
  profile_pic: String,
  role: { 
    type: String, 
    enum: ["doctor", "nurse", "pharmacist", "receptionist", "admin", "pathologist", "driver"] 
  },
  dept_id: { type: mongoose.Types.ObjectId, ref: 'Department' },
  phone_number: String,
  emergency_contact: String,
  
  bloodGrp: { 
    type: String, 
    enum: ["A+", "B+", "AB+", "O+", "A-", "B-", "AB-", "O-"] 
  },

  address: String,
  date_of_birth: Date,
  aadhar_number: { type: String, unique: true },
  date_of_joining: Date,
  gender: { type: String, enum: ["Male", "Female"] },
  salary: Number,
  bank_details: BankDetailsSchema, // Embedded document
}, { timestamps: true , _id:false });

EmployeeSchema.plugin(AutoIncrement, { inc_field: '_id',id: 'employee_id_counter',  start_seq: 10000, increment_by: 1 });

const Employee = mongoose.model('Employee', EmployeeSchema);
export default Employee;