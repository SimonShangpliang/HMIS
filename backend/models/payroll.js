import mongoose from 'mongoose';
const { Schema } = mongoose;

const PayrollSchema = new Schema({
  employee_id: { type: Number, ref: 'Employee' },
  basic_salary: Number,
  payment_proof: String,
  allowance: Number,
  deduction: Number,
  net_salary: Number,
  month_year: Date,
  payment_status: { 
    type: String, 
    enum: ["paid", "pending", "partially_paid"] 
  },
  generation_date: Date,
  remaining_payment: Number
}, { timestamps: true });

const Payroll = mongoose.model('Payroll', PayrollSchema);
export default Payroll;
