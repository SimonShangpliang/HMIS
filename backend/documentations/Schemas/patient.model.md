# Mongoose Schema Documentation: Patient System

## PatientInfo Schema

The `PatientInfo` schema represents medical and physical characteristics of a patient.

### Fields

| Field | Type | Description | Constraints |
|-------|------|-------------|------------|
| `age` | Number | Patient's age | None |
| `height` | Number | Patient's height | None |
| `weight` | Number | Patient's weight | None |
| `bloodGrp` | String | Blood group | Enum: "A+", "B+", "AB+", "O+", "A-", "B-", "AB-", "O-" |
| `familyHistory` | String | Medical history of family members | None |
| `bedNo` | Number | Assigned bed number | None |
| `roomNo` | Number | Assigned room number | None |
| `other` | String | Additional medical information | None |
| `createdAt` | Date | Auto-generated timestamp | Added by timestamps option |
| `updatedAt` | Date | Auto-updated timestamp | Added by timestamps option |

### Options
- `timestamps: true`: Automatically adds and manages `createdAt` and `updatedAt` fields

## Vitals Schema

The `Vitals` schema records patient vital signs measurements over time.

### Fields

| Field | Type | Description | Constraints |
|-------|------|-------------|------------|
| `date` | Date | Date of measurement | None |
| `time` | String | Time of measurement | None |
| `bloodPressure` | Number | Blood pressure reading | None |
| `bodyTemp` | Number | Body temperature | None |
| `pulseRate` | Number | Heart rate | None |
| `breathingRate` | Number | Respiratory rate | None |
| `createdAt` | Date | Auto-generated timestamp | Added by timestamps option |
| `updatedAt` | Date | Auto-updated timestamp | Added by timestamps option |

### Options
- `timestamps: true`: Automatically adds and manages `createdAt` and `updatedAt` fields

## Patient Schema

The main `Patient` schema represents registered patients in the medical facility.

### Fields

| Field | Type | Description | Constraints                   |
|-------|------|-------------|-------------------------------|
| `_id` | Number | Auto-incremented patient ID | None                          |
| `password` | String | Authentication password | None                          |
| `name` | String | Full name of patient | None                          |
| `profile_pic` | String | URL or path to profile picture | None                          |
| `phone_number` | String | Contact phone number | None                          |
| `emergency_contact` | String | Emergency contact number | None                          |
| `email` | String | Email address | Unique: true                  |
| `date_of_birth` | Date | Birth date | None                          |
| `aadhar_number` | String | Unique government ID | Unique: true                  |
| `gender` | String | Gender | Enum: "Male", "Female"        |
| `address` | String | Residential address | None                          |
| `patient_info` | Object | Medical characteristics | Embedded PatientInfo document |
| `vitals` | Array | History of vital signs | Embedded Vitals documents     |
| `insurance_details` | Array | Associated insurance policies | References 'Insurance' model  |
| `createdAt` | Date | Auto-generated timestamp | Added by timestamps option    |
| `updatedAt` | Date | Auto-updated timestamp | Added by timestamps option    |

### Options
- `timestamps: true`: Automatically adds and manages `createdAt` and `updatedAt` fields
- `_id: false`: Disables automatic generation of MongoDB ObjectId
- Uses AutoIncrement plugin for `_id` field starting at 10000

### Relationships
- Embeds a single `PatientInfo` document
- Embeds multiple `Vitals` documents in the `vitals` array
- References multiple `Insurance` models through `insurance_details` array

## Model
- `Patient`: Mongoose model for patients

## Usage Examples

```javascript
// Creating a new patient
const newPatient = new Patient({
  name: "Fidel Castro",
  password: hashedPassword, // Should be properly hashed
  phone_number: "9876543210",
  emergency_contact: "9876543211",
  email: "rahul.sharma@example.com",
  date_of_birth: new Date('1985-07-22'),
  aadhar_number: "1234-5678-9012",
  gender: "Male",
  address: "123 Residential Colony, Mumbai",
  patient_info: {
    age: 40,
    height: 175,
    weight: 75,
    bloodGrp: "B+",
    familyHistory: "Father had hypertension, Mother had diabetes"
  }
});

await newPatient.save();

// Adding vitals record
await Patient.updateOne(
  { _id: 10001 },
  { 
    $push: { 
      vitals: {
        date: new Date(),
        time: "10:30",
        bloodPressure: 120,
        bodyTemp: 98.6,
        pulseRate: 72,
        breathingRate: 16
      }
    }
  }
);

// Updating patient information
await Patient.updateOne(
  { _id: 10001 },
  { 
    $set: { 
      "patient_info.weight": 73,
      "patient_info.bedNo": 12,
      "patient_info.roomNo": 105
    }
  }
);

// Adding insurance reference
await Patient.updateOne(
  { _id: 10001 },
  { $push: { insurance_details: insuranceId } }
);

// Finding patients by age range
const seniorPatients = await Patient.find({
  "patient_info.age": { $gt: 65 }
}).sort({ name: 1 });

// Finding patients with recent vital readings outside normal range
const patientsWithHighBP = await Patient.find({
  vitals: {
    $elemMatch: {
      bloodPressure: { $gt: 140 },
      date: { $gte: new Date(new Date().setDate(new Date().getDate() - 7)) }
    }
  }
});
```

## Notes
- Patient IDs are auto-incremented starting from 10000
- The schema stores both personal identification and medical information
- Vital signs are tracked over time as an array of measurements
- The system supports linking patients to insurance providers
- Patient information includes current room and bed assignments when hospitalized
- Email and Aadhar number fields have unique constraints to prevent duplicate registration