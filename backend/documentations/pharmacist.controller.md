# 📘 Pharmacist API Documentation

This documentation provides an overview of the API functions available to pharmacists for managing prescriptions, checking medication availability, and dispensing medicines to patients.

---

## 📁 Endpoints

### 1. 🔍 Search Patient Prescriptions

**Endpoint:**  
`GET /api/pharmacist/prescriptions`

**Description:**  
Searches for a patient's prescription details by their ID. Optionally can dispense medications if the query parameter is set.

**Authentication:**  
Requires pharmacist authentication token.

**Query Parameters:**

| Parameter  | Type    | Required | Description                                      |
| ---------- | ------- | -------- | ------------------------------------------------ |
| searchById | string  | ✅ Yes   | The patient ID to search for                     |
| dispense   | boolean | ❌ No    | Set to 'true' to dispense medicines immediately  |

**Success Response:**
```json
{
  "patient": {
    "_id": 10025,
    "name": "John Smith",
    "age": 45,
    "gender": "Male",
    "contact_number": "+1-555-2345",
    "address": "123 Main St, New York"
  },
  "prescribed_medicines": [
    {
      "medicine_name": "Amoxicillin",
      "dosage_form": "tablet",
      "manufacturer": "MedPharm",
      "available": true,
      "dosage": "500mg",
      "frequency": "3 times daily",
      "duration": "7 days",
      "quantity": 21,
      "dispensed_qty": 21,
      "prescription_status": "dispensed",
      "prescription_date": "2025-04-14T09:30:00.000Z",
      "valid_batches": [
        {
          "batch_no": "AMX20250301",
          "expiry_date": "2026-03-01T00:00:00.000Z",
          "quantity": 150,
          "unit_price": 1.25,
          "supplier": "MedSupplies Inc"
        }
      ],
      "dispensed_from": [
        {
          "batch_no": "AMX20250301",
          "taken": 21
        }
      ]
    },
    {
      "medicine_name": "Paracetamol",
      "dosage_form": "tablet",
      "manufacturer": "PharmaCo",
      "available": true,
      "dosage": "500mg",
      "frequency": "as needed",
      "duration": "5 days",
      "quantity": 10,
      "dispensed_qty": 10,
      "prescription_status": "dispensed",
      "prescription_date": "2025-04-14T09:30:00.000Z",
      "valid_batches": [
        {
          "batch_no": "PCM20250215",
          "expiry_date": "2027-02-15T00:00:00.000Z",
          "quantity": 200,
          "unit_price": 0.50,
          "supplier": "MedSupplies Inc"
        }
      ],
      "dispensed_from": [
        {
          "batch_no": "PCM20250215",
          "taken": 10
        }
      ]
    }
  ],
  "consultation": {
    "date": "2025-04-14T09:00:00.000Z",
    "doctorId": "5f8d0c1b1234567890abcdef",
    "reason": "Respiratory infection",
    "status": "completed"
  }
}
```

**Empty Prescription Response:**
```json
{
  "patient": {
    "_id": 10025,
    "name": "John Smith",
    "age": 45,
    "gender": "Male",
    "contact_number": "+1-555-2345",
    "address": "123 Main St, New York"
  },
  "prescribed_medicines": [],
  "consultation": {
    "date": "2025-04-14T09:00:00.000Z",
    "doctorId": "5f8d0c1b1234567890abcdef",
    "reason": "Follow-up checkup",
    "status": "completed"
  },
  "message": "No prescriptions found for this consultation."
}
```

**No Consultation Response:**
```json
{
  "patient": {
    "_id": 10025,
    "name": "John Smith",
    "age": 45,
    "gender": "Male",
    "contact_number": "+1-555-2345",
    "address": "123 Main St, New York"
  },
  "prescribed_medicines": [],
  "consultation": null,
  "message": "No consultations found for this patient."
}
```

**Failure Responses:**
- `400 Bad Request`: If search query parameter is missing.
- `404 Not Found`: If patient not found.
- `500 Internal Server Error`: On server failure.

**Notes:**
- When `dispense=true`, the system will:
  1. Check for valid medication batches (not expired and with available quantity)
  2. Update inventory by reducing quantities from appropriate batches
  3. Update the prescription status to "dispensed", "partially_dispensed", or keep as "pending"
  4. Record which batches were used for dispensing

- Medication availability is determined by:
  1. Medicine exists in inventory
  2. Has valid batches (not expired)
  3. Has sufficient quantity to fulfill prescription

- The response includes detailed batch information including expiry dates and available quantities to help pharmacists make informed dispensing decisions.

---

## ⚙️ Prescription Status Definitions

| Status              | Description                                           |
| ------------------- | ----------------------------------------------------- |
| pending             | Prescription created by doctor, not yet dispensed     |
| partially_dispensed | Some medications dispensed, others pending            |
| dispensed           | All medications in the prescription fully dispensed   |

---

## ⚙️ Technologies Used

- Node.js
- Express.js
- MongoDB with Mongoose

---

## 📁 Folder Structure (Relevant)
```bash
/models
  ├── consultation.js (contains Prescription model)
  ├── inventory.js (contains Medicine model)
  └── patient.js

/controllers
  └── pharmacist.controller.js

/routes
  └── pharmacy.routes.js

/middleware
  └── authMiddleware.js
```

---

## 🛠️ Developer Notes

- All routes are protected with authentication middleware
- Prescriptions may contain multiple medicines
- Each medicine in inventory contains batch information with expiry dates
- The system always prioritizes dispensing from batches expiring soonest
- When dispensing, the system checks for availability and updates inventory in real-time
- Patient identification is required for searching prescriptions
- The API returns both patient and prescription information in a single call
- The most recent consultation and prescriptions are returned by default
- If a prescription is partially dispensed, the system will track how much of each medicine has been dispensed
- Batch tracking ensures proper inventory management and expiry date control