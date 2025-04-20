# Consultation Controller – Technical Documentation

## Overview
The `consultation.controller.js` file manages all operations related to consultations, including booking, rescheduling, fetching, updating, and handling related entities like prescriptions, bills, and diagnoses.

---

## Dependencies
- **Models**:
  - `Consultation`: Represents the consultation schema.
  - `Prescription`: Handles prescription details.
  - `Patient`: Represents patient information.
  - `Doctor`: Represents doctor information.
  - `Receptionist`: Represents receptionist information.
  - `Bill`: Handles billing details.
  - `Medicine`: Represents medicine inventory.
- **Utilities**:
  - `appointmentEmail`: Sends email notifications for appointments.
  - `updateAppointmentEmail`: Sends email updates for rescheduled appointments.

---

## Endpoints

### 1. **Book a New Consultation**
- **Route**: `POST /api/consultations/book`
- **Description**: Books a new consultation for a patient with a doctor.
- **Input Validation**:
  - `booked_date_time` must be in the future.
  - `patient_id`, `doctor_id`, and `created_by` must exist in the database.
- **Request Body**:
  ```json
  {
    "patient_id": "12345",
    "doctor_id": "67890",
    "booked_date_time": "2025-04-07T10:00:00Z",
    "reason": "Fever and cough",
    "created_by": "10001",
    "appointment_type": "regular",
    "status": "scheduled"
  }
  ```
- **Response**:
  - `201 Created`: Consultation booked successfully.
  - `400 Bad Request`: Invalid booking date or missing fields.
  - `404 Not Found`: Patient, doctor, or receptionist not found.
- **Error Handling**:
  - Returns appropriate error messages for invalid inputs or missing entities.

---

### 2. **Reschedule a Consultation**
- **Route**: `PUT /api/consultations/reschedule/:consultationId`
- **Description**: Reschedules an existing consultation to a new date and time.
- **Input Validation**:
  - `new_booked_date_time` must be in the future.
- **Request Body**:
  ```json
  {
    "new_booked_date_time": "2025-04-08T11:00:00Z"
  }
  ```
- **Response**:
  - `200 OK`: Consultation rescheduled successfully.
  - `400 Bad Request`: Invalid reschedule date.
  - `404 Not Found`: Consultation not found.
- **Error Handling**:
  - Ensures the new date is not in the past.

---

### 3. **Fetch Consultation by ID**
- **Route**: `GET /api/consultations/:consultationId/view`
- **Description**: Retrieves detailed information about a specific consultation.
- **Response**:
  - `200 OK`: Returns consultation details.
  - `404 Not Found`: Consultation not found.
- **Populated Fields**:
  - `diagnosis`
  - `prescription` (with medicine details)
  - `reports`

---

### 4. **Fetch Bill by Consultation ID**
- **Route**: `GET /api/consultations/:consultationId/bill`
- **Description**: Retrieves the bill associated with a specific consultation.
- **Response**:
  - `200 OK`: Returns bill details.
  - `404 Not Found`: Bill not found.
- **Dummy Data**:
  - Returns a dummy bill if no valid bill is found.

---

### 5. **Fetch Prescription by Consultation ID**
- **Route**: `GET /api/consultations/:consultationId/prescription`
- **Description**: Retrieves the prescription associated with a specific consultation.
- **Response**:
  - `200 OK`: Returns prescription details.
  - `404 Not Found`: Prescription not found.
- **Populated Fields**:
  - `entries.medicine_id` (medicine name).

---

### 6. **Fetch Diagnosis by Consultation ID**
- **Route**: `GET /api/consultations/:consultationId/diagnosis`
- **Description**: Retrieves the diagnosis associated with a specific consultation.
- **Response**:
  - `200 OK`: Returns diagnosis details.
  - `404 Not Found`: Diagnosis not found.

---

### 7. **Update Consultation**
- **Route**: `PUT /api/consultations/update/:consultationId`
- **Description**: Updates the details of an existing consultation.
- **Input Validation**:
  - `booked_date_time` must be in the future if provided.
- **Request Body**:
  ```json
  {
    "doctor_id": "67890",
    "booked_date_time": "2025-04-08T10:00:00Z",
    "reason": "Follow-up",
    "appointment_type": "follow-up",
    "status": "scheduled",
    "bill_id": "123456"
  }
  ```
- **Response**:
  - `200 OK`: Consultation updated successfully.
  - `400 Bad Request`: Invalid update data.
  - `404 Not Found`: Consultation not found.

---

### 8. **Fetch Requested Consultations**
- **Route**: `GET /api/consultations/requested`
- **Description**: Retrieves all consultations with the status `requested`.
- **Response**:
  - `200 OK`: Returns a list of requested consultations.

---

### 9. **Update Request Status**
- **Route**: `PUT /api/consultations/:consultationId/status`
- **Description**: Updates the status of a consultation request.
- **Input Validation**:
  - `status` must be one of `scheduled` or `cancelled`.
- **Request Body**:
  ```json
  {
    "status": "scheduled"
  }
  ```
- **Response**:
  - `200 OK`: Status updated successfully.
  - `400 Bad Request`: Invalid status.
  - `404 Not Found`: Consultation not found.

---

## Notes
- **Error Handling**:
  - All endpoints return appropriate error messages for invalid inputs or server errors.
- **Populations**:
  - Many endpoints use Mongoose's `populate` method to enrich consultation data with related entities like `doctor`, `patient`, `prescription`, and `diagnosis`.
- **Dummy Data**:
  - Some endpoints return dummy data if the requested consultation or related entities are not found. This is for testing purposes and should be removed in production.
- **Email Notifications**:
  - `appointmentEmail` and `updateAppointmentEmail` are used to notify patients about new or updated consultations.

---
