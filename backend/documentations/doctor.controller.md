# 📘 Doctor API Documentation

This documentation provides an overview of the API functions available to doctors for managing appointments, patient consultations, diagnoses, remarks, and prescriptions.

---

## 📁 Endpoints

### 1. 🔍 Fetch Doctor Appointments

**Endpoint:**  
`GET /api/doctor/appointments`

**Description:**  
Retrieves all scheduled, ongoing, and completed appointments for the authenticated doctor.

**Authentication:**  
Requires doctor authentication token.

**Success Response:**
```json
[
  {
    "id": "6574839c2d8f9a3456abcdef",
    "patientName": "John Smith",
    "timeSlot": "10:00 AM - 10:30 AM",
    "isDone": false
  },
  {
    "id": "6574839c2d8f9a3456abcdeg",
    "patientName": "Jane Doe",
    "timeSlot": "11:00 AM - 11:30 AM",
    "isDone": true
  }
]
```

**Failure Responses:**
- `400 Bad Request`: If doctor ID is missing in token.
- `404 Not Found`: If no appointments are found.
- `500 Internal Server Error`: On server failure.

---

### 2. 📝 Update Appointment Status

**Endpoint:**  
`PUT /api/doctor/appointments`

**Description:**  
Updates the status of a specific appointment to either 'ongoing' or 'completed'.

**Authentication:**  
Requires doctor authentication token.

**Request Body:**

| Field  | Type    | Required | Description                                     |
| ------ | ------- | -------- | ----------------------------------------------- |
| id     | string  | ✅ Yes   | The ID of the consultation/appointment          |
| isDone | boolean | ✅ Yes   | True if completed, false if ongoing             |

**Example Request:**
```json
{
  "id": "6574839c2d8f9a3456abcdef",
  "isDone": true
}
```

**Success Response:**
```json
{
  "message": "Appointment status updated successfully"
}
```

**Failure Responses:**
- `400 Bad Request`: If doctor ID is missing in token or invalid/missing fields.
- `404 Not Found`: If consultation not found for this doctor.
- `500 Internal Server Error`: On server failure.

---

### 3. 📋 Fetch Patient Consultations

**Endpoint:**  
`GET /api/doctor/patients/:patientId/consultations`

**Description:**  
Retrieves all consultations for a specific patient.

**Authentication:**  
Requires doctor authentication token.

**URL Parameters:**

| Parameter | Type   | Required | Description       |
| --------- | ------ | -------- | ----------------- |
| patientId | number | ✅ Yes   | Patient ID number |

**Success Response:**
```json
[
  {
    "_id": "6574839c2d8f9a3456abcdef",
    "patient_id": 10013,
    "doctor_id": {
      "name": "Dr. Jane Smith",
      "specialization": "Cardiologist"
    },
    "booked_date_time": "2025-04-15T10:00:00.000Z",
    "status": "completed",
    "diagnosis": ["645f9a8b1234567890abcdef"],
    "remark": "Patient showing good recovery",
    "prescription": ["645f9a8b1234567890abcdff"]
  }
]
```

**Failure Responses:**
- `400 Bad Request`: If doctor ID is missing in token or patient ID is missing.
- `404 Not Found`: If no consultations found for this patient.
- `500 Internal Server Error`: On server failure.

---

### 4. 📊 Fetch Patient Progress (Vitals)

**Endpoint:**  
`GET /api/doctor/patients/:patientId/progress`

**Description:**  
Retrieves vital signs history for a specific patient. Doctor must have at least one consultation with the patient to access this data.

**Authentication:**  
Requires doctor authentication token.

**URL Parameters:**

| Parameter | Type   | Required | Description       |
| --------- | ------ | -------- | ----------------- |
| patientId | number | ✅ Yes   | Patient ID number |

**Success Response:**
```json
{
  "success": true,
  "patientName": "John Smith",
  "data": [
    {
      "date": "April 15, 2025",
      "time": "10:30 AM",
      "bloodPressure": 120,
      "bodyTemp": 98.6,
      "pulseRate": 72,
      "breathingRate": 16
    },
    {
      "date": "April 14, 2025",
      "time": "09:45 AM",
      "bloodPressure": 118,
      "bodyTemp": 98.4,
      "pulseRate": 70,
      "breathingRate": 15
    }
  ]
}
```

**Failure Responses:**
- `400 Bad Request`: If doctor ID is missing in token or patient ID is missing.
- `403 Forbidden`: If doctor has no consultations with this patient.
- `404 Not Found`: If patient not found.
- `500 Internal Server Error`: On server failure.

---

### 5. 🔍 Add Diagnosis

**Endpoint:**  
`POST /api/doctor/consultations/:consultationId/diagnosis`

**Description:**  
Adds one or more diagnoses to a specific consultation.

**Authentication:**  
Requires doctor authentication token.

**URL Parameters:**

| Parameter     | Type   | Required | Description            |
| ------------- | ------ | -------- | ---------------------- |
| consultationId| string | ✅ Yes   | Consultation ID        |

**Request Body:**

| Field     | Type     | Required | Description                              |
| --------- | -------- | -------- | ---------------------------------------- |
| diagnosis | string[] | ✅ Yes   | Array of diagnosis names                 |

**Example Request:**
```json
{
  "diagnosis": ["Hypertension", "Type 2 Diabetes"]
}
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "_id": "6574839c2d8f9a3456abcdef",
    "patient_id": 10013,
    "doctor_id": "5f8d0c1b1234567890abcdef",
    "status": "completed",
    "diagnosis": ["645f9a8b1234567890abcdef", "645f9a8b1234567890abcdee"],
    "remark": "Patient needs to control blood sugar"
  }
}
```

**Failure Responses:**
- `400 Bad Request`: If required fields are missing or invalid.
- `404 Not Found`: If consultation not found or doctor not authorized.
- `500 Internal Server Error`: On server failure.

---

### 6. 📝 Add Remarks

**Endpoint:**  
`POST /api/doctor/consultations/:consultationId/remarks`

**Description:**  
Adds remarks to a specific consultation.

**Authentication:**  
Requires doctor authentication token.

**URL Parameters:**

| Parameter     | Type   | Required | Description            |
| ------------- | ------ | -------- | ---------------------- |
| consultationId| string | ✅ Yes   | Consultation ID        |

**Request Body:**

| Field  | Type   | Required | Description         |
| ------ | ------ | -------- | ------------------- |
| remark | string | ✅ Yes   | Doctor's remarks    |

**Example Request:**
```json
{
  "remark": "Patient showing signs of improvement. Continue with current medication."
}
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "_id": "6574839c2d8f9a3456abcdef",
    "patient_id": 10013,
    "doctor_id": "5f8d0c1b1234567890abcdef",
    "status": "completed",
    "diagnosis": ["645f9a8b1234567890abcdef"],
    "remark": "Patient showing signs of improvement. Continue with current medication."
  }
}
```

**Failure Responses:**
- `400 Bad Request`: If doctor ID is missing in token or required fields are missing.
- `404 Not Found`: If consultation not found or doctor not authorized.
- `500 Internal Server Error`: On server failure.

---

### 7. 💊 Add Prescription

**Endpoint:**  
`POST /api/doctor/consultations/:consultationId/prescription`

**Description:**  
Adds a new prescription to a specific consultation.

**Authentication:**  
Requires doctor authentication token.

**URL Parameters:**

| Parameter     | Type   | Required | Description            |
| ------------- | ------ | -------- | ---------------------- |
| consultationId| string | ✅ Yes   | Consultation ID        |

**Request Body:**

| Field           | Type   | Required | Description                            |
| --------------- | ------ | -------- | -------------------------------------- |
| prescriptionData| object | ✅ Yes   | Object containing prescription details |
| ↳ entries      | array  | ✅ Yes   | Array of prescription entries          |

**Example Request:**
```json
{
  "prescriptionData": {
    "entries": [
      {
        "medicine": "Amoxicillin",
        "dosage": "500mg",
        "frequency": "3 times per day",
        "duration": "7 days"
      },
      {
        "medicine": "Ibuprofen",
        "dosage": "400mg",
        "frequency": "As needed",
        "duration": "5 days"
      }
    ]
  }
}
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "_id": "6574839c2d8f9a3456abcdef",
    "patient_id": 10013,
    "doctor_id": "5f8d0c1b1234567890abcdef",
    "status": "completed",
    "diagnosis": ["645f9a8b1234567890abcdef"],
    "remark": "Patient needs antibiotics",
    "prescription": ["645f9a8b1234567890abcdff"]
  }
}
```

**Failure Responses:**
- `400 Bad Request`: If doctor ID is missing in token or required fields are missing.
- `404 Not Found`: If consultation not found or doctor not authorized.
- `500 Internal Server Error`: On server failure.

---

### 8. 🔄 Update Diagnosis

**Endpoint:**  
`PUT /api/doctor/consultations/:consultationId/diagnosis/:diagnosisId`

**Description:**  
Updates a specific diagnosis for a consultation.

**Authentication:**  
Requires doctor authentication token.

**URL Parameters:**

| Parameter     | Type   | Required | Description            |
| ------------- | ------ | -------- | ---------------------- |
| consultationId| string | ✅ Yes   | Consultation ID        |
| diagnosisId   | string | ✅ Yes   | Diagnosis ID           |

**Request Body:**

| Field     | Type   | Required | Description            |
| --------- | ------ | -------- | ---------------------- |
| diagnosis | string | ✅ Yes   | Updated diagnosis name |

**Example Request:**
```json
{
  "diagnosis": "Hypertension Stage 2"
}
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "_id": "6574839c2d8f9a3456abcdef",
    "patient_id": 10013,
    "doctor_id": "5f8d0c1b1234567890abcdef",
    "diagnosis": ["645f9a8b1234567890abcdef"],
    "remark": "Patient needs blood pressure medication"
  }
}
```

**Failure Responses:**
- `400 Bad Request`: If doctor ID is missing in token or required fields are missing.
- `404 Not Found`: If consultation/diagnosis not found or doctor not authorized.
- `500 Internal Server Error`: On server failure.

---

### 9. 🔄 Update All Diagnoses

**Endpoint:**  
`PUT /api/doctor/consultations/:consultationId/diagnosis`

**Description:**  
Replaces all diagnoses for a consultation with new ones.

**Authentication:**  
Requires doctor authentication token.

**URL Parameters:**

| Parameter     | Type   | Required | Description            |
| ------------- | ------ | -------- | ---------------------- |
| consultationId| string | ✅ Yes   | Consultation ID        |

**Request Body:**

| Field     | Type     | Required | Description                    |
| --------- | -------- | -------- | ------------------------------ |
| diagnosis | string[] | ✅ Yes   | Array of new diagnosis names   |

**Example Request:**
```json
{
  "diagnosis": ["Acute Sinusitis", "Upper Respiratory Infection"]
}
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "_id": "6574839c2d8f9a3456abcdef",
    "diagnosis": ["645f9a8b1234567890abcdee", "645f9a8b1234567890abcdef"]
  }
}
```

**Failure Responses:**
- `400 Bad Request`: If doctor ID is missing in token or required fields are missing.
- `404 Not Found`: If consultation not found or doctor not authorized.
- `500 Internal Server Error`: On server failure.

---

### 10. 🔄 Update Remarks

**Endpoint:**  
`PUT /api/doctor/consultations/:consultationId/remarks`

**Description:**  
Updates remarks for a specific consultation.

**Authentication:**  
Requires doctor authentication token.

**URL Parameters:**

| Parameter     | Type   | Required | Description            |
| ------------- | ------ | -------- | ---------------------- |
| consultationId| string | ✅ Yes   | Consultation ID        |

**Request Body:**

| Field  | Type   | Required | Description            |
| ------ | ------ | -------- | ---------------------- |
| remark | string | ✅ Yes   | Updated doctor remarks |

**Example Request:**
```json
{
  "remark": "Patient improving. Reduce medication dosage."
}
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "_id": "6574839c2d8f9a3456abcdef",
    "patient_id": 10013,
    "doctor_id": "5f8d0c1b1234567890abcdef",
    "status": "completed",
    "diagnosis": ["645f9a8b1234567890abcdef"],
    "remark": "Patient improving. Reduce medication dosage."
  }
}
```

**Failure Responses:**
- `400 Bad Request`: If doctor ID is missing in token or required fields are missing.
- `404 Not Found`: If consultation not found or doctor not authorized.
- `500 Internal Server Error`: On server failure.

---

### 11. 🔄 Update Prescription

**Endpoint:**  
`PUT /api/doctor/consultations/:consultationId/prescription/:prescriptionId`

**Description:**  
Updates a specific prescription for a consultation.

**Authentication:**  
Requires doctor authentication token.

**URL Parameters:**

| Parameter     | Type   | Required | Description            |
| ------------- | ------ | -------- | ---------------------- |
| consultationId| string | ✅ Yes   | Consultation ID        |
| prescriptionId| string | ✅ Yes   | Prescription ID        |

**Request Body:**

| Field           | Type   | Required | Description                            |
| --------------- | ------ | -------- | -------------------------------------- |
| prescriptionData| object | ✅ Yes   | Object containing prescription details |
| ↳ entries      | array  | ✅ Yes   | Array of prescription entries          |

**Example Request:**
```json
{
  "prescriptionData": {
    "entries": [
      {
        "medicine": "Amoxicillin",
        "dosage": "250mg",
        "frequency": "2 times per day",
        "duration": "5 days"
      }
    ]
  }
}
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "_id": "6574839c2d8f9a3456abcdef",
    "patient_id": 10013,
    "doctor_id": "5f8d0c1b1234567890abcdef",
    "status": "completed",
    "diagnosis": ["645f9a8b1234567890abcdef"],
    "prescription": ["645f9a8b1234567890abcdff"]
  }
}
```

**Failure Responses:**
- `400 Bad Request`: If doctor ID is missing in token or required fields are missing.
- `404 Not Found`: If consultation/prescription not found or doctor not authorized.
- `500 Internal Server Error`: On server failure.

---

### 12. 🔄 Update All Prescriptions

**Endpoint:**  
`PUT /api/doctor/consultations/:consultationId/prescription`

**Description:**  
Replaces all prescriptions for a consultation with a new one.

**Authentication:**  
Requires doctor authentication token.

**URL Parameters:**

| Parameter     | Type   | Required | Description            |
| ------------- | ------ | -------- | ---------------------- |
| consultationId| string | ✅ Yes   | Consultation ID        |

**Request Body:**

| Field           | Type   | Required | Description                            |
| --------------- | ------ | -------- | -------------------------------------- |
| prescriptionData| object | ✅ Yes   | Object containing prescription details |
| ↳ entries      | array  | ✅ Yes   | Array of prescription entries          |

**Example Request:**
```json
{
  "prescriptionData": {
    "entries": [
      {
        "medicine": "Cetirizine",
        "dosage": "10mg",
        "frequency": "Once daily",
        "duration": "14 days"
      },
      {
        "medicine": "Montelukast",
        "dosage": "10mg",
        "frequency": "Once daily at bedtime",
        "duration": "30 days"
      }
    ]
  }
}
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "_id": "6574839c2d8f9a3456abcdef",
    "patient_id": 10013,
    "doctor_id": "5f8d0c1b1234567890abcdef",
    "status": "completed",
    "diagnosis": ["645f9a8b1234567890abcdef"],
    "prescription": ["645f9a8b1234567890abcdgg"]
  }
}
```

**Failure Responses:**
- `400 Bad Request`: If doctor ID is missing in token or required fields are missing.
- `404 Not Found`: If consultation not found or doctor not authorized.
- `500 Internal Server Error`: On server failure.

---

## ⚙️ Technologies Used

- Node.js
- Express.js
- MongoDB with Mongoose

---

## 📁 Folder Structure (Relevant)
```bash
/models
  ├── consultation.js
  ├── diagnosis.js
  └── patient.js

/controllers
  └── doctor.controller.js

/routes
  └── doctor.routes.js

/middleware
  └── authMiddleware.js
```

---

## 🛠️ Developer Notes

- All routes are protected with authentication middleware
- Doctor ID is extracted from the authentication token
- Prescriptions follow a nested structure with entries for each medicine
- Diagnoses are stored as separate documents linked to consultations
- Status for appointments can be "scheduled", "ongoing", or "completed"
- Prescriptions have a status of "pending" when created or updated
- Time slots are formatted as "HH:MM AM/PM - HH:MM AM/PM" for readability
- Doctors can only access patients they have consultations with
- Only doctors who created a consultation can modify its data