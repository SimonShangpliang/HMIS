# 📘 Receptionist API Documentation 
This documentation provides an overview of the API functions related to patient registration, bed management, billing, and retrieving patient or bed information

---

## 📁 Endpoints

---

### 1. 🏥 Register New Patient

#### **Endpoint:**
`POST /api/reception/register-patient`

#### **Description:**
Registers a new patient in the system.

#### **Request Body:**

| Parameter       | Type   | Required | Description                        |
| --------------- | ------ | -------- | ---------------------------------- |
| patientName     | string | ✅ Yes    | Full name of the patient           |
| aadharId        | string | ✅ Yes    | Unique Aadhar ID of the patient    |
| dob             | Date   | ✅ Yes    | Date of birth (format: YYYY-MM-DD) |
| gender          | string | ✅ Yes    | Gender of the patient              |
| bloodGroup      | string | ❌ No     | Blood group of the patient         |
| email           | string | ✅ Yes    | Email address                      |
| height          | number | ❌ No     | Height in cm                       |
| weight          | number | ❌ No     | Weight in kg                       |
| address         | string | ❌ No     | Residential address                |
| emergencyNumber | string | ❌ No     | Emergency contact number           |
| mobile          | string | ✅ Yes    | Mobile phone number                |
| password        | string | ✅ Yes    | Password for patient login         |

#### **Success Response:**

```json
{
    "message": "Patient registered successfully.",
    "patient": {
        "password": "$2b$10$XQEZecW.HT9hIJ6hZLFz3.My/V7S3PXZP2DDnl/.9Kv5IO4USAPtO",
        "name": "John Doe",
        "phone_number": "1234567890",
        "emergency_contact": "9876543210",
        "email": "johny.doe@example.com",
        "date_of_birth": "1990-01-01T00:00:00.000Z",
        "aadhar_number": "123ed3o89012",
        "gender": "male",
        "address": "123 Main Street",
        "patient_info": {
            "height": 180,
            "weight": 75,
            "_id": "67f975fe66528047bf567979",
            "createdAt": "2025-04-11T20:05:18.263Z",
            "updatedAt": "2025-04-11T20:05:18.263Z"
        },
        "insurance_details": [],
        "vitals": [],
        "createdAt": "2025-04-11T20:05:18.264Z",
        "updatedAt": "2025-04-11T20:05:18.264Z",
        "_id": 10047,
        "__v": 0
    }
}
```

#### **Failure Response:**

- `400 Bad Request`: Missing required fields.
- `500 Internal Server Error`: Failed to register the patient.

#### **Technical Details:**

- **Dependencies:** `Patient` model, `bcrypt` for password hashing.
- **Functionality:**
  - Extracts required fields from `req.body`.
  - Validates required fields and checks for missing values.
  - Checks if the email or Aadhar ID already exists in the database using MongoDB's `$or` operator.
  - Hashes the password using `bcrypt` before saving.
  - Creates a new `Patient` document and saves it to the database.
  - Returns the saved patient details on success.

---

### 2. 🛏️ Get All Bed Information

#### **Endpoint:**
`GET /api/reception/beds`

#### **Description:**
Fetches information about all beds, including their availability and assigned patients.

#### **Success Response:**

```json
[
    
    {
        "_id": "67f35d6dd819e6a1af54a8b8",
        "bed_id": null,
        "bed_type": "private",
        "status": "occupied",
        "time": "2025-04-07T05:06:53.480Z",
        "patient_id": {
            "_id": 10000,
            "patient_username": "chester.buckridge@gmail.com",
            "password": "gYUIgYtI",
            "name": "Chester Buckridge",
            "profile_pic": "https://avatars.githubusercontent.com/u/54660940",
            "phone_number": "1234567890",
            "emergency_contact": "(449) 692-7496 x76858",
            "email": "chester.buckridge@gmail.com",
            "date_of_birth": "1955-07-11T08:51:08.238Z",
            "aadhar_number": "365874311153",
            "gender": "male",
            "address": "5050 Bramley Close, Wisozkshire, Michigan - 09312",
            "patient_info": {
                "age": 70,
                "height": 193,
                "weight": 56,
                "bloodGrp": "O+",
                "familyHistory": "No significant history",
                "bedNo": 76,
                "roomNo": 146,
                "other": "",
                "_id": "67f2aaa82a6dd80eafe72a18",
                "createdAt": "2025-04-06T16:24:08.917Z",
                "updatedAt": "2025-04-06T16:24:08.917Z"
            },
            "vitals": [
                {
                    "date": "2025-03-15T22:35:16.047Z",
                    "time": "4:05",
                    "bloodPressure": 137,
                    "bodyTemp": 36.8,
                    "pulseRate": 95,
                    "breathingRate": 12,
                    "_id": "67f2aaa82a6dd80eafe72a19",
                    "createdAt": "2025-04-06T16:24:08.918Z",
                    "updatedAt": "2025-04-06T16:24:08.918Z"
                },
              
            ],
            "insurance_details": [],
            "createdAt": "2025-04-06T16:24:08.919Z",
            "updatedAt": "2025-04-10T20:36:30.136Z",
            "__v": 0
        },
        "__v": 0
    }
  ...
   
]
```

#### **Failure Response:**

- `500 Internal Server Error`: Failed to fetch bed information.

#### **Technical Details:**

- **Dependencies:** `BedLog` model.
- **Functionality:**
  - Uses MongoDB's `find()` method to retrieve all bed logs.
  - Populates related fields (`bed_id`, `patient_id`) using Mongoose's `populate()` method.
  - Returns a list of all beds with their current status and associated patient details.

---

### 3. 🛏️ Assign Bed to Patient

#### **Endpoint:**
`POST /api/reception/assign-bed`

#### **Description:**
Assigns a bed to a patient based on availability.

#### **Request Body:**

| Parameter   | Type   | Required | Description                              |
|-------------|--------|----------|------------------------------------------|
| patient_id  | number | ✅ Yes   | Unique ID of the patient                 |
| bed_number  | number | ✅ Yes   | Unique number identifying the bed        |
| bed_type    | string | ✅ Yes   | Type of bed (e.g., private, semi-private, general) |

#### **Success Response:**

```json
{
    "message": "Bed assigned successfully",
    "assignment": {
        "bed_type": "private",
        "status": "occupied",
        "time": "2025-04-11T21:22:59.132Z",
        "patient_id": 10004,
        "_id": "67f98833d62d9e3d8864c9c7",
        "__v": 0
    }
}
```

#### **Failure Response:**

- `400 Bad Request`: Missing required fields.
- `404 Not Found`: Patient or bed not found.
- `500 Internal Server Error`: Failed to assign bed.

#### **Technical Details:**

- **Dependencies:** `Patient` and `BedLog` models.
- **Functionality:**
  - Validates required fields in the request body.
  - Checks if the specified patient exists in the database using `findById()`.
  - Ensures that the requested bed is not already occupied by querying the `BedLog` collection with a status filter.
  - Creates a new bed assignment record in the database with status set to `"occupied"`.
  - Saves the assignment and returns it upon success.

---

### 4. 🛏️ Discharge Patient from Bed

#### **Endpoint:**
`POST /api/reception/discharge-bed`

#### **Description:**
Discharges a patient from their assigned bed.

#### **Request Body:**

| Parameter       | Type   | Required  | Description                  |
|-----------------|--------|-----------|------------------------------|
| assignment_id   | string | ✅ Yes    | Unique ID of the bed assignment |

#### **Success Response:**

```json
{
    "message": "Patient discharged successfully",
    "assignment": {
        "_id": "67f98833d62d9e3d8864c9c7",
        "bed_type": "private",
        "status": "vacated",
        "time": "2025-04-11T21:25:46.719Z",
        "patient_id": 10004,
        "__v": 0
    }
}
```

#### **Failure Response:**

- `400 Bad Request`: Missing required fields.
- `404 Not Found`: Assignment not found.
- `500 Internal Server Error`: Failed to discharge patient.

#### **Technical Details:**

- **Dependencies:** `BedLog` model.
- **Functionality:**
  - Validates that `assignment_id` is provided in the request body.
  - Fetches the bed assignment record using MongoDB's `findById()`.
  - Checks if the assignment is already marked as `"vacated"`.
  - Updates the status to `"vacated"` and sets a timestamp for discharge.
  - Saves changes and returns updated assignment details.

---

### 5. 💵 Add Bill for Patient

#### **Endpoint:**
`POST /api/reception/add-bill`

#### **Description:**
Generates a bill for a patient based on services provided.

#### **Request Body:**

| Parameter       | Type     | Required  | Description                             |
|-----------------|----------|-----------|-----------------------------------------|
| patient_id      | Number   | ✅ Yes    | Unique ID of the patient                |
| generation_date | datetime | ❌ No     | Date when the bill is generated         |
| total_amount    | number   | ✅ Yes    | Total amount for services rendered      |
| payment_status  | string   | ✅ Yes    | "paid", "pending", "partially_paid"                           |
| services        | array    | ❌ No     | List of services provided               |


#### **Success Response:**

```json
{
    "message": "Bill created successfully",
    "bill": {
        "patient_id": 10007,
        "generation_date": "2025-04-12T00:00:00.000Z",
        "total_amount": 20000,
        "payment_status": "paid",
        "items": [],
        "_id": "67f98a2cf2919da47eb0b5ae",
        "payments": [],
        "createdAt": "2025-04-11T21:31:24.991Z",
        "updatedAt": "2025-04-11T21:31:24.991Z",
        "__v": 0
    }
}
```

#### **Failure Response:**

- `400 Bad Request`: Missing required fields.
- `500 Internal Server Error`: Failed to create bill.

#### **Technical Details:**

- **Dependencies:** `Bill` model.
- **Functionality:**
  - Validates required fields in the request body.
  - Creates a new bill document with details about services and total amount.
  - Saves the bill record into MongoDB using Mongoose's `.save()` method.
  - Returns bill details upon success.

---

### 6. 📄 Get All Patients Information

#### **Endpoint:**
`GET /api/reception/patients`

#### **Description:**
Fetches details of all registered patients.

#### **Success Response:**

```json
{
   {
    "count": 43,
    "patients": [
        {
            "_id": 10000,
            "patient_username": "chester.buckridge@gmail.com",
            "name": "Chester Buckridge",
            "profile_pic": "https://avatars.githubusercontent.com/u/54660940",
            "phone_number": "1234567890",
            "emergency_contact": "(449) 692-7496 x76858",
            "email": "chester.buckridge@gmail.com",
            "date_of_birth": "1955-07-11T08:51:08.238Z",
            "aadhar_number": "365874311153",
            "gender": "male",
            "address": "5050 Bramley Close, Wisozkshire, Michigan - 09312",
            "patient_info": {
                "age": 70,
                "height": 193,
                "weight": 56,
                "bloodGrp": "O+",
                "familyHistory": "No significant history",
                "bedNo": 76,
                "roomNo": 146,
                "other": "",
                "_id": "67f2aaa82a6dd80eafe72a18",
                "createdAt": "2025-04-06T16:24:08.917Z",
                "updatedAt": "2025-04-06T16:24:08.917Z"
            },
            "vitals": [
                {
                    "date": "2025-03-15T22:35:16.047Z",
                    "time": "4:05",
                    "bloodPressure": 137,
                    "bodyTemp": 36.8,
                    "pulseRate": 95,
                    "breathingRate": 12,
                    "_id": "67f2aaa82a6dd80eafe72a19",
                    "createdAt": "2025-04-06T16:24:08.918Z",
                    "updatedAt": "2025-04-06T16:24:08.918Z"
                },
                {
                    "date": "2025-04-01T05:49:30.047Z",
                    "time": "11:19",
                    "bloodPressure": 139,
                    "bodyTemp": 36,
                    "pulseRate": 84,
                    "breathingRate": 14,
                    "_id": "67f2aaa82a6dd80eafe72a1a",
                    "createdAt": "2025-04-06T16:24:08.918Z",
                    "updatedAt": "2025-04-06T16:24:08.918Z"
                },
                {
                    "date": "2025-04-04T18:48:59.279Z",
                    "time": "0:18",
                    "bloodPressure": 137,
                    "bodyTemp": 36.8,
                    "pulseRate": 86,
                    "breathingRate": 15,
                    "_id": "67f2aaa82a6dd80eafe72a1b",
                    "createdAt": "2025-04-06T16:24:08.918Z",
                    "updatedAt": "2025-04-06T16:24:08.918Z"
                },
                {
                    "date": "2025-03-20T22:31:38.859Z",
                    "time": "4:01",
                    "bloodPressure": 134,
                    "bodyTemp": 36.4,
                    "pulseRate": 93,
                    "breathingRate": 16,
                    "_id": "67f2aaa82a6dd80eafe72a1c",
                    "createdAt": "2025-04-06T16:24:08.919Z",
                    "updatedAt": "2025-04-06T16:24:08.919Z"
                }
            ],
            "insurance_details": [],
            "createdAt": "2025-04-06T16:24:08.919Z",
            "updatedAt": "2025-04-10T20:36:30.136Z",
            "__v": 0
        },
        ...
    ]
}
}
```

#### **Failure Response:**

- `500 Internal Server Error`: Failed to fetch patients.

#### **Technical Details:**

- **Dependencies:** `Patient` model.
- **Functionality:**
  - Queries all patients from MongoDB using Mongoose's `.find()` method, excluding sensitive fields like passwords.
  - Returns an array of patients along with their total count.

/*TODO:Change Bed functions*/