import mongoose from 'mongoose';
const { Schema } = mongoose;

const LabSchema = new Schema({
  lab_name: String
});

const DepartmentSchema = new Schema({
  dept_id:{ type: String, unique: true},
  dept_name: String,
  labs: [LabSchema] // Embedded array of labs
}, { timestamps:true});

const Department = mongoose.model('Department', DepartmentSchema);
export default Department; 