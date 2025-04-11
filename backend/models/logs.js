import mongoose from 'mongoose';
const { Schema } = mongoose;

const LoginLogSchema = new Schema({
  user_id: { type: Number, ref: 'Employee' },
  access_time: { type: Date, default: Date.now },
  task: { type: String, enum: ["login", "logout"] }
});

const BedLogSchema = new Schema({
  bed_id: { type: Schema.Types.ObjectId, ref: 'Bed' },
  bed_type: { type: String, enum: ["private", "general", "semi_private"] },
  status: { type: String, enum: ["occupied", "vacated"] },
  time: { type: Date, default: Date.now },
  patient_id: { type: Number, ref: 'Patient' }
});

const MedicineInventoryLogSchema = new Schema({
  med_id: { type: Number, ref: 'Medicine' },
  quantity: Number,
  total_cost: Number,
  order_date: Date,
  supplier: String,
  status: { type: String, enum: ["ordered", "received", "cancelled"] }
});

//Boilerplate for FinanceLogs
const FinanceLogs = new Schema({
    user_id: { type: Number, ref: 'Employee' },
    transaction_type: { type: String, enum: ["income", "expense"] },
    amount: Number,
    date: { type: Date, default: Date.now },
    description: String,
    allowance: Number,
    basic_salary: Number,
    deduction: Number,
    net_salary: Number
});

const LoginLog = mongoose.model('LoginLog', LoginLogSchema);
const BedLog = mongoose.model('BedLog', BedLogSchema);
const MedicineInventoryLog = mongoose.model('MedicineInventoryLog', MedicineInventoryLogSchema);

const FinanceLog = mongoose.model('FinanceLog', FinanceLogs);
export default { LoginLog, BedLog, MedicineInventoryLog, FinanceLog};