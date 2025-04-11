// models/consultation.js
import mongoose from 'mongoose';
import seq from 'mongoose-sequence';
const AutoIncrement = seq(mongoose);
const { Schema } = mongoose;

const PrescriptionEntrySchema = new Schema({
  medicine_id: { type: Number, ref: 'Medicine' },
  dosage: String,
  frequency: String,
  duration: String,
  quantity: Number,
  dispensed_qty: { type: Number, default: 0 }
});

const PrescriptionSchema = new Schema({
  _id: {type:Number}, // Auto-incremented field
  prescriptionDate: Date,
  status: { 
    type: String, 
    enum: ["pending", "dispensed", "partially_dispensed", "cancelled"] 
  },
  entries: [PrescriptionEntrySchema] // Embedded array
},{_id: false});

const ReportSchema = new Schema({
  status: { type: String, enum: ["pending", "completed"] },
  reportText: String,
  title: { type: String, required: true },
  description: { type: String },
  createdBy: Schema.Types.ObjectId, // Doctor or staff ID
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});


const ConsultationSchema = new Schema({
  patient_id: { type: Number, ref: 'Patient' },
  doctor_id: { type:Number, ref: 'Doctor' },
  booked_date_time: Date,
  status: {
    type: String, 
    enum: ["scheduled","ongoing","completed", "cancelled"]
  },
  reason: String, //symptoms
  created_by: { type: Schema.Types.ObjectId, ref: 'Receptionist' },
  appointment_type: {type: String, enum: ["regular", "follow-up", "emergency","consultation"]},
  actual_start_datetime: Date,
  remark: String,
  diagnosis: [{ type: String, ref: 'Diagnosis' }], // Array of diagnosis IDs
  prescription: [{ type: Number, ref: 'Prescription' }],
  reports: [ReportSchema], // Array of embedded documents
  bill_id: { type: Schema.Types.ObjectId, ref: 'Bill' },
  recordedAt: Date
}, { timestamps: true });

// Add a feedback subdocument schema
const FeedbackSchema = new Schema({
  rating: { type: Number, enum: [1, 2, 3, 4, 5] },
  comments: String,
  created_at: { type: Date, default: Date.now }
});

// Add feedback to consultation schema
ConsultationSchema.add({
  feedback: FeedbackSchema
});

PrescriptionSchema.plugin(AutoIncrement, { inc_field: '_id',id: 'prescription_id_counter',  start_seq: 10000, increment_by: 1 });
const Prescription = mongoose.model('Prescription', PrescriptionSchema);
const Consultation = mongoose.model('Consultation', ConsultationSchema);
const Feedback = mongoose.model('Feedback', FeedbackSchema);
const Report = mongoose.model('Report', ReportSchema);
export {Consultation, Prescription,Feedback,Report};