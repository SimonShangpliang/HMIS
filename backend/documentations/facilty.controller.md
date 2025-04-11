# 📘 Facility API Documentation

This documentation outlines the API functions related to ambulance management in a healthcare facility. It provides details on endpoints for adding ambulances, retrieving ambulance details, and decommissioning ambulances.

---

## 📁 Endpoints

### 1. 🚑 Add Ambulance

#### **Endpoint:**
`POST /api/facility/ambulance`

#### **Description:**
Adds a new ambulance to the system with details about the vehicle, driver, and nurse assigned.

#### **Request Body:**

| Parameter      | Type   | Required | Description                            |
| -------------- | ------ | -------- | -------------------------------------- |
| vehicle_number | string | ✅ Yes    | Unique identifier for the ambulance    |
| driver         | number | ✅ Yes    | Employee ID of the assigned driver     |
| status         | string | ✅ Yes    | Status of the ambulance (e.g., active) |
| nurse_id       | number | ✅ Yes    | Employee ID of the assigned nurse      |

#### **Success Response:**

```json
{
    "message": "Ambulance added successfully",
    "ambulance": {
        "vehicle_number": "AMB-KOTUU",
        "driver": "67f573f03f2bb7f8097c4128",
        "status": "inactive",
        "nurse_id": 10007,
        "_id": "67f97d4c66528047bf5679e5",
        "__v": 0
    }
}
```

#### **Failure Responses:**

- `409 Conflict`: Ambulance with this vehicle number already exists.
- `404 Not Found`: Driver or nurse not found.
- `500 Internal Server Error`: Error adding ambulance.

---

### 2. 🔍 Get Ambulance by Vehicle Number

#### **Endpoint:**
`GET /api/facility/ambulance/:vehicle_number`

#### **Description:**
Retrieves details of an ambulance based on its vehicle number.

#### **Example Usage**
/api/facility/ambulance/AMB-BASSS
#### **Success Response:**

```json
{
    "_id": "67f7b747d8cb00d9b1dde7b0",
    "vehicle_number": "AMB-BASSS",
    "driver": "67f573f03f2bb7f8097c4128",
    "status": "active",
    "nurse_id": 10007,
    "__v": 0
}
```

#### **Failure Responses:**

- `404 Not Found`: Ambulance not found.
- `500 Internal Server Error`: Error retrieving ambulance.

---

### 3. 🛑 Decommission Ambulance

#### **Endpoint:**
`PATCH /api/facility/ambulance/:vehicle_number/decommission`

#### **Description:**
Updates the status of an ambulance to inactive, effectively decommissioning it.

#### **Example Usage**

#### **Success Response:**

```json
{
    "message": "Ambulance decommissioned successfully",
    "ambulance": {
        "_id": "67f7b747d8cb00d9b1dde7b0",
        "vehicle_number": "AMB-BASSS",
        "driver": "67f573f03f2bb7f8097c4128",
        "status": "inactive",
        "nurse_id": 10007,
        "__v": 0
    }
}
```

#### **Failure Responses:**

- `404 Not Found`: Ambulance not found.
- `500 Internal Server Error`: Error decommissioning ambulance.

---

## 🛠 Technical Details

### Dependencies:
- Models: `Ambulance`, `Driver`, `Nurse`
- Framework: Express.js
- Database: MongoDB

### Functionality:

1. **Add Ambulance**:
   - Validates input parameters.
   - Checks for existing ambulance with the same vehicle number.
   - Finds driver and nurse objects by their IDs.
   - Creates a new ambulance document and saves it to the database.

2. **Get Ambulance by Vehicle Number**:
   - Searches for an ambulance using its vehicle number.
   - Returns the ambulance details if found.

3. **Decommission Ambulance**:
   - Updates the status of an existing ambulance to inactive.
   - Saves the updated document to the database.

---

## 🔒 Error Handling

Each function includes robust error handling mechanisms:
- Validates request parameters.
- Handles missing or invalid data gracefully.
- Uses try-catch blocks to catch and log errors.
- Sends appropriate HTTP status codes and error messages in response.

