# Common Pages Controller Documentation

## Overview
The `commonPagesController.js` file contains backend logic for handling common functionalities across the application, such as fetching calendar events, managing payrolls, updating profiles, searching inventory, and uploading employee photos.

## Routes

### 1. **Find Payroll**
- **Route**: `GET /api/common/findPayroll`
- **Controller**: `findPayrollById`
- **Description**: Fetches payroll details for a specific employee or all employees.
- **Query Parameters**:
  - `employeeId` (optional): The ID of the employee.
- **Response**:
  - Returns an array of payroll records, including details like basic salary, allowance, deduction, and net salary.
- **Error Handling**:
  - Returns `500` for server errors.

---

### 2. **Fetch Profile**
- **Route**: `GET /api/common/profile/:userType/:id`
- **Controller**: `fetchProfile`
- **Description**: Fetches the profile details of a user based on their type and ID.
- **Path Parameters**:
  - `userType` (required): The type of user (e.g., doctor, nurse, patient).
  - `id` (required): The ID of the user.
- **Response**:
  - Returns the user's profile details, including role-specific information.
- **Error Handling**:
  - Returns `404` if the user is not found.
  - Returns `500` for server errors.

---

### 3. **Update Profile**
- **Route**: `PUT /api/common/profile/:userType/:id`
- **Controller**: `updateProfile`
- **Description**: Updates the profile details of a user based on their type and ID.
- **Path Parameters**:
  - `userType` (required): The type of user (e.g., doctor, nurse, patient).
  - `id` (required): The ID of the user.
- **Request Body**:
  - Contains the fields to update (e.g., `name`, `phone_number`, `address`).
- **Validation**:
  - Allows updating only updatable fields such as `name`, `phone_number`, `address`, and `profile_pic`.
  - Sensitive fields like `email`, `password`, `role`, and `salary` are protected and cannot be updated.
  - Bank details can only update specific fields like `bank_name`, `ifsc_code`, and `branch_name`.
- **Response**:
  - Returns the updated profile details.
- **Error Handling**:
  - Returns `404` if the user is not found.
  - Returns `500` for server errors.

---

### 4. **Get Doctor Calendar**
- **Route**: `GET /api/common/calendar/doctor`
- **Controller**: `getDoctorCalendar`
- **Description**: Fetches consultations for a specific doctor within a given date range.
- **Query Parameters**:
  - `doctorId` (required): The ID of the doctor.
  - `startDate` (optional): Start date for filtering consultations.
  - `endDate` (optional): End date for filtering consultations.
- **Response**:
  - Returns an array of calendar events with details like title, start time, end time, and status.
- **Error Handling**:
  - Returns `400` if `doctorId` is missing.
  - Returns `500` for server errors.

---

### 5. **Get Patient Calendar**
- **Route**: `GET /api/common/calendar/patient`
- **Controller**: `getPatientCalendar`
- **Description**: Fetches consultations for a specific patient within a given date range.
- **Query Parameters**:
  - `patientId` (required): The ID of the patient.
  - `startDate` (optional): Start date for filtering consultations.
  - `endDate` (optional): End date for filtering consultations.
- **Response**:
  - Returns an array of calendar events with details like title, start time, end time, and doctor information.
- **Error Handling**:
  - Returns `400` if `patientId` is missing.
  - Returns `500` for server errors.

---

### 6. **Search Inventory**
- **Route**: `GET /api/inventory/search`
- **Controller**: `searchInventory`
- **Description**: Searches for medicines or equipment in the inventory based on a query.
- **Query Parameters**:
  - `searchQuery` (optional): The search term.
  - `page` (optional): The page number for pagination (default: 1).
  - `limit` (optional): The number of items per page (default: 10).
  - `type` (optional): The type of inventory (`medicine` or `equipment`, default: `medicine`).
  - `role` (optional): The role of the user (`admin` or `user`, default: `user`).
  - `viewMode` (optional): The view mode (`inventory` or `pending`, default: `inventory`).
- **Response**:
  - Returns a paginated list of inventory items with details like name, quantity, and status.
  - Includes metadata such as total items, total pages, and pagination flags.
- **Error Handling**:
  - Returns `500` for server errors.

---

### 7. **Upload Employee Photo**
- **Route**: `POST /api/common/upload-photo/:employeeId`
- **Controller**: `uploadEmployeePhoto`
- **Description**: Uploads a profile picture for an employee and updates their profile.
- **Path Parameters**:
  - `employeeId` (required): The ID of the employee.
- **Request Body**:
  - Contains the image file to upload (`profile_pic`).
- **Response**:
  - Returns the URL of the uploaded profile picture.
- **Error Handling**:
  - Returns `400` if no file is uploaded.
  - Returns `404` if the employee is not found.
  - Returns `500` for server errors.

---

## Helper Functions
### 1. **calculateExpiredQuantity**
- **Description**: Calculates the quantity of expired medicines in the inventory.
- **Parameters**:
  - `inventory`: The inventory object containing `expiry_date` and `quantity`.
- **Returns**: The quantity of expired medicines.

### 2. **calculateServiceStatus**
- **Description**: Determines the service status of equipment based on the next service date.
- **Parameters**:
  - `nextServiceDate`: The next scheduled service date.
- **Returns**:
  - `Overdue`: If the service date has passed.
  - `Due Soon`: If the service is due within 30 days.
  - `OK`: If the service is not due soon.

---

## Error Handling
- All controllers return appropriate HTTP status codes (`400`, `404`, `500`) and error messages for invalid requests or server errors.

## Dependencies
- **Models**:
  - `Consultation`: For managing consultations.
  - `Payroll`: For managing payroll records.
  - `Employee`: For managing employee profiles.
  - `Patient`: For managing patient profiles.
  - `Medicine`: For managing medicine inventory.
  - `Equipment`: For managing equipment inventory.
- **Middleware**:
  - `multer`: For handling file uploads.
- **Cloudinary**: For uploading and managing profile pictures.

## Example Usage
### Fetching Doctor Calendar
```javascript
GET /api/common/calendar/doctor?doctorId=123&startDate=2023-10-01&endDate=2023-10-31
```

### Searching Inventory
```javascript
GET /api/inventory/search?searchQuery=Paracetamol&page=1&limit=10&type=medicine&role=admin&viewMode=inventory
```

### Updating Profile
```javascript
PUT /api/common/profile/doctor/123
{
  "name": "Dr. John Doe",
  "phone_number": "1234567890",
  "address": "123 Main Street"
}
```
