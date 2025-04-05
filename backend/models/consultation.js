// models/consultation.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const PrescriptionEntrySchema = new Schema({
  medicine_id: { type: Schema.Types.ObjectId, ref: 'Medicine' },
  dosage: String,
  frequency: String,
  duration: String,
  quantity: Number,
  dispensed_qty: { type: Number, default: 0 }
});

const PrescriptionSchema = new Schema({
  prescriptionDate: Date,
  status: { 
    type: String, 
    enum: ["pending", "dispensed", "partially_dispensed", "cancelled"] 
  },
  entries: [PrescriptionEntrySchema] // Embedded array
});

const ReportSchema = new Schema({
  status: { type: String, enum: ["pending", "completed"] },
  reportText: String,
  createdBy: Schema.Types.ObjectId, // Doctor or staff ID
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const ConsultationSchema = new Schema({
  patient_id: { type: Schema.Types.ObjectId, ref: 'Patient' },
  doctor_id: { type: Schema.Types.ObjectId, ref: 'Doctor' },
  dept_id: { type: Schema.Types.ObjectId, ref: 'Department' },
  appointment_date: Date,
  start_time: String,
  status: { 
    type: String, 
    enum: ["scheduled", "completed", "cancelled"] 
  },
  reason: String,
  created_by: { type: Schema.Types.ObjectId, ref: 'Receptionist' },
  actual_start_datetime: Date,
  remark: String,
  diagnosis: [{ type: String, ref: 'Diagnosis' }], // Array of diagnosis IDs
  prescription: PrescriptionSchema, // Embedded document
  reports: [ReportSchema], // Array of embedded documents
  bill_id: { type: Schema.Types.ObjectId, ref: 'Bill' },
  recordedAt: Date
}, { timestamps: true });

// Add a feedback subdocument schema
const FeedbackSchema = new Schema({
  dept_id: { type: Schema.Types.ObjectId, ref: 'Department' },
  rating: { type: Number, enum: [1, 2, 3, 4, 5] },
  comments: String,
  created_at: { type: Date, default: Date.now }
});

// Add feedback to consultation schema
ConsultationSchema.add({
  feedback: FeedbackSchema
});

const Consultation = mongoose.model('Consultation', ConsultationSchema);
const Feedback = mongoose.model('Feedback', FeedbackSchema);
export { Consultation,Feedback };