#  Patient Controllers – Technical Documentation

## 1. **FetchPatientProfile**

**Endpoint**: `GET /api/patient/:patientId/profile`

### Description:
Retrieves the full profile of a patient, including optional insurance details (if present).

### Request Params:
- `patientId` (`String`) – MongoDB ObjectId of the patient.

### Behavior:
- Looks up the patient using the `patientId`.
- If `insurance_details` exists and is not empty, it is populated from the referenced collection.
- Returns a 404 if the patient is not found.
- Returns the patient document on success.

### Response:
- `200 OK`: Returns the full patient document (possibly with populated `insurance_details`).
- `404 Not Found`: Patient does not exist.
- `500 Internal Server Error`: Server/database failure.

---

## 2. **fetchConsultationsByPatientId**

**Endpoint**: `GET /api/patient/:patientId/consultations`

### Description:
Fetches all consultations for a given patient, sorted by the most recent. Enriches each consultation with doctor and employee details (name, specialization, profile picture, etc.).

### Request Params:
- `patientId` (`String`) – MongoDB ObjectId of the patient.

### Behavior:
- Finds all consultations where `patient_id` matches the `patientId`.
- If no consultations exist, returns dummy data.
- For found consultations:
  - Retrieves associated doctor and employee info for enrichment.
  - Populates internal fields (`created_by`, `diagnosis`, `prescription`, `bill_id`).
  - Manually maps doctor and employee details into each consultation object.

### Response:
- `200 OK`: Returns array of enriched consultation objects.
- `200 OK` with `{ dummy: true }`: If no consultations found, returns fallback dummy data.
- `500 Internal Server Error`: Server/database failure.

---

## 3. **sendFeedback**

**Endpoint**: `POST /api/patient/:patientId/consultation/:consultationId/feedback`

### Description:
Allows a patient to submit feedback (rating and optional comments) for a completed consultation. Also updates the doctor’s average rating accordingly.

### Request Params:
- `patientId` (`String`) – MongoDB ObjectId of the patient.
- `consultationId` (`String`) – MongoDB ObjectId of the consultation.

### Request Body:
```json
{
  "rating": Number (1-5),
  "comments": String (optional)
}
```

### Behavior:
- Validates rating (must be between 1 and 5).
- Finds the consultation using `consultationId`.
- Checks that the `patient_id` in the consultation matches the provided `patientId`.
- Stores feedback in the consultation document.
- Updates the doctor’s rating:
  - Recalculates average rating using `(previous total + new rating) / updated count`.
- Saves both consultation and doctor documents.

### Response:
- `200 OK`: Feedback successfully saved and doctor's rating updated.
- `400 Bad Request`: Invalid rating value.
- `403 Forbidden`: Patient ID does not match consultation.
- `404 Not Found`: Consultation not found.
- `500 Internal Server Error`: Server/database failure.

---

###  Authentication & Authorization:
- Controllers assume the patient ID in params is authorized. In a complete system, authorization middleware should enforce this.

###  Technologies:
- **Database**: MongoDB (via Mongoose ODM).
- **Language**: JavaScript (Node.js).
- **Framework**: Express.js.
