# 📘 Admin API Documentation

  

This documentation provides an overview of the API functions related to payroll management, employee operations, inventory updates, and staff management.

  

## 📁 Endpoints

  

## 1. 📄 Generate Payslip

  

### Endpoint:  

`POST /api/admin/generate-payslip`

### Example-usage
`/api/admin/generate-payslip`

### Description:  

Generates a payslip in PDF format for an employee based on the provided salary details.


### Request Body:
  

| Parameter      | Type   | Required | Description                       |

| -------------- | ------ | -------- | --------------------------------- |

| employee_id    | number | ✅ Yes   | Unique ID of the employee         |

| basic_salary   | number | ✅ Yes   | Basic salary of the employee      |

| allowance      | number | ✅ Yes   | Allowances for the employee       |

| deduction      | number | ✅ Yes   | Deductions from the salary        |

| net_salary     | number | ✅ Yes   | Net salary after deductions       |

| month_year     | string | ✅ Yes   | Month and year for the payslip    |

  

### Success Response:

  

```json
{
    "message": "Payslip generated successfully",
    "filePath": "payslips/payslip_12345_1744397892911.pdf"
}
```

  

### Failure Response:

  

- `500 Internal Server Error`: On failure to generate the payslip.

### Technical Details

  -  Dependencies: pdfkit, fs
  -  Functionality

        - Extracts salary details from req.body.
        - Creates a new PDF document using pdfkit.
        - Generates a unique file path for the payslip.
        - Writes salary details to the PDF.
        - Finalizes the PDF and saves it to the file system.
        - Sends a JSON response with the file path.  

---

  

## 2. 🔍 Search Employees

  

### Endpoint:  

`GET /api/admin/search-employees`

### Example-usage
`/api/admin/search-employees?searchKey=10001`


### Description:  

Searches for employees based on their name or ID.

  

### Query Parameters:

  

| Parameter  | Type          | Required | Description                           |

| ---------- | -----------   | -------- | ------------------------------------- |

| searchKey  | string/number | ✅ Yes   | Employee name (partial) or ID (exact) |

  

### Success Response:

  

```json

{
    "employees": [
        {
            "_id": 10001,
            "name": "rtegwr",
            "email": "newemail@example.com",
            "password": "yH9rnlA_",
            "profile_pic": "",
            "role": "nurse",
            "dept_id": null,
            "phone_number": "1234567890",
            "address": "New Address",
            "date_of_birth": "1970-08-14T18:53:37.353Z",
            "date_of_joining": "2021-11-15T17:01:36.164Z",
            "gender": "female",
            "salary": 58423,
            "bank_details": {
                "bank_name": "HDFC Bank",
                "account_number": 6895899173,
                "ifsc_code": "HDFC2216624",
                "branch_name": "Fort Augustaworth",
                "_id": "67f2b3706ebc94e2de0380ff"
            },
            "createdAt": "2025-04-06T17:01:36.169Z",
            "updatedAt": "2025-04-07T05:16:35.712Z",
            "__v": 0
        }
    ]
}

```

  

### Failure Response:

- `500 Internal Server Error`: On failure to search employees.

### Technical Details:

- **Dependencies:** `Employee` model
    
- **Functionality:**
    
    - Extracts `searchKey` from `req.query`.
        
    - Converts `searchKey` to an integer if possible.
        
    - Searches for employees by name (case-insensitive) or ID.
        
    - Uses MongoDB's `$regex` for name search and `$or` operator for combined search.
        
    - Returns a list of matching employees.


---

  

### 3. 🏥 Update Inventory

  

### Endpoint:  

`POST /api/admin/update-inventory`


### Example-usage
`/api/admin/update-inventory`



### Description: 

Updates or adds inventory details for medicines.

  

**Request Body:**

  

| Parameter          | Type     | Required | Description                                |

| ------------------ | -------- | -------- | ------------------------------------------ |

| medicineId         | number   | ✅ Yes   | Unique ID of the medicine                 |

| med_name           | string   | ✅ Yes   | Name of the medicine                      |

| effectiveness      | string   | ✅ Yes   | Effectiveness description                 |

| dosage_form        | string   | ✅ Yes   | Dosage form (e.g., tablet, syrup)         |

| manufacturer       | string   | ✅ Yes   | Manufacturer's name                       |

| available          | boolean  | ✅ Yes   | Availability status                       |

| batch_no           | string   | ✅ Yes   | Batch number                              |

| quantity           | number   | ✅ Yes   | Quantity of the batch                     |

| expiry_date        | datde    | ✅ Yes   | Expiry date of the batch                  |

| manufacturing_date | date     | ✅ Yes   | Manufacturing date of the batch           |

| unit_price         | number   | ✅ Yes   | Unit price of the medicine                |

| supplier           | string   | ✅ Yes   | Supplier details                          |

  

**Success Response:**

  

```json
{
    "message": "Inventory updated successfully",
    "medicine": {
        "_id": 10021,
        "med_name": "Dhyey",
        "effectiveness": "high",
        "dosage_form": "tablet",
        "manufacturer": "XYZ Pharma",
        "available": true,
        "inventory": [
            {
                "quantity": 50,
                "batch_no": "B12345",
                "expiry_date": "2024-12-31T00:00:00.000Z",
                "manufacturing_date": "2023-01-01T00:00:00.000Z",
                "unit_price": 10.5,
                "supplier": "ABC Pharma"
            },
            {
                "quantity": 100,
                "batch_no": "BATCH001",
                "expiry_date": "2026-04-01T00:00:00.000Z",
                "manufacturing_date": "2025-01-01T00:00:00.000Z",
                "unit_price": 10,
                "supplier": "Supplier A"
            }
        ],
        "createdAt": "2025-04-10T19:12:43.848Z",
        "updatedAt": "2025-04-11T19:21:49.565Z",
        "__v": 1
    }
}

```

  

### Failure Response:

  

- `500 Internal Server Error`: On failure to update inventory.


### Technical details:
  - **Dependencies:** `Medicine` model
    
- **Functionality:**
    
    - Extracts medicine details from `req.body`.
        
    - Checks if the medicine exists by ID.
        
    - If not, creates a new medicine document with the provided details.
        
    - If the medicine exists, checks for an existing batch by batch number.
        
    - Updates or adds a new batch to the medicine's inventory.
        
    - Saves the updated medicine document.
        
    - Returns the updated medicine details.

---

  

### 4. 👨‍💼 Add Staff



### Endpoint:

`POST /api/admin/add-staff`

### Example Usage


### Description:

Adds a new staff member to the system and assigns them to their respective role schema.

###  Request Body:


```markdown
| Parameter       | Type   | Required | Description                              |
|-----------------|--------|----------|------------------------------------------|
| name            | string | ✅ Yes   | Name of the staff member                |
| email           | string | ✅ Yes   | Email address of the staff member       |
| password        | string | ✅ Yes   | Password for staff login                |
| profile_pic     | string | ❌ No    | Profile picture URL                     |
| role            | string | ✅ Yes   | Role of the staff (e.g., doctor, nurse) |
| dept_id         | string | ❌ No    | Department ID (required for certain roles) |
| phone_number    | string | ✅ Yes   | Contact number of the staff             |
| emergency_phone | string | ❌ No    | Emergency contact number                |
| address         | string | ✅ Yes   | Residential address                     |
| date_of_birth   | date   | ✅ Yes   | Date of birth (format: YYYY-MM-DD)      |
| date_of_joining | date   | ✅ Yes   | Joining date (format: YYYY-MM-DD)       |
| gender          | string | ✅ Yes   | Gender of the staff                     |
| blood_group     | string | ❌ No    | Blood group                             |
| salary          | number | ✅ Yes   | Salary of the staff                     |
| aadhar_id       | string | ✅ Yes   | Aadhar ID                               |
| bank_details    | object | ✅ Yes   | Bank details (account number, IFSC code) |
```

### Role-Specific Parameters:

**Doctor:**

- `specialization` (string): Specialization area.
    
- `qualification` (string): Educational qualifications.
    
- `experience` (number): Years of experience.
    
- `room_num` (string): Assigned room number.
    

**Nurse:**

- `assigned_dept` (string): Assigned department.
    
- `location` (string): Location details.
    
- `assigned_room` (string): Assigned room number.
    
- `assigned_bed` (string): Assigned bed number.
    
- `assigned_amb` (string): Assigned ambulance ID.
    

**Pathologist:**

- `lab_id` (string): Assigned lab ID.
    

### Success Response:

```json
{
  "message": "Staff added successfully",
  "employee": {
    "_id": "<generated_employee_id>",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "password123",
    "profile_pic": "profile.jpg",
    "role": "receptionist",
    "dept_id": "DEPT001",
    "phone_number": "1234567890",
    "emergency_phone": "9876543210",
    "address": "123 Main St",
    "date_of_birth": "1990-01-01",
    "date_of_joining": "2025-04-01",
    "gender": "Male",
    "blood_group": "A+",
    "salary": 100000,
    "aadhar_id": "123456789012",
    "bank_details": {
      "account_number": "1234567890",
      "ifsc_code": "ABCD0000001"
    },
    "__v": 0
  }
}

```
### Failure Response:

- `400 Bad Request`: Invalid role specified.
    
- `500 Internal Server Error`: Failed to add staff.
    

### Technical Details
- **Dependencies:** `Employee` model, various staff models (`Doctor`, `Nurse`, etc.)
    
- **Functionality:**
    
    - Extracts staff details from `req.body`.
        
    - Creates a new `Employee` document with the provided details.
        
    - Saves the employee to the database.
        
    - Based on the role, creates a corresponding staff document with additional role-specific details.
        
    - Returns the newly created employee document.



##  💵 Update Salary

### Endpoint:

`POST /api/admin/update-salary`

### Description:

Updates the salary of an existing employee in the system.

### Request Body:

```markdown
| Parameter    | Type   | Required | Description                  |
|--------------|--------|----------|------------------------------|
| employee_id  | number | ✅ Yes   | Unique ID of the employee    |
| new_salary   | number | ✅ Yes   | New salary to be updated     |
```

### Success Response:

```json
{
    "message": "Salary updated successfully",
    "employee": {
        "_id": 10006,
        "name": "Chris McDermott",
        "email": "chris_mcdermott35@yahoo.com",
        "password": "huKoFChh",
        "profile_pic": "https://avatars.githubusercontent.com/u/68645255",
        "role": "driver",
        "dept_id": null,
        "phone_number": "1-202-280-4523",
        "address": "88521 Willow Street, Maidastead, Nevada - 73765",
        "date_of_birth": "1982-02-17T20:42:40.114Z",
        "date_of_joining": "2009-10-08T17:01:37.249Z",
        "gender": "male",
        "salary": 60000,
        "bank_details": {
            "bank_name": "Yes Bank",
            "account_number": 6728680262,
            "ifsc_code": "YESB1670264",
            "branch_name": "Rettafort",
            "_id": "67f2b3716ebc94e2de038113"
        },
        "createdAt": "2025-04-06T17:01:37.251Z",
        "updatedAt": "2025-04-11T19:44:54.227Z",
        "__v": 0
    }
}
```

### Failure Responses:

- **`404 Not Found:`**

- **`500 Internal Server Error:`**
    

### Technical Details
- **Dependencies:** `Employee` model
    
- **Functionality:**
    
    - Extracts `employee_id` and `new_salary` from `req.body`.
        
    - Finds the employee by ID.
        
    - Updates the employee's salary.
        
    - Saves the updated employee document.
        
    - Returns the updated employee details.
        

**General Notes:**

- **Error Handling:** Each function includes try-catch blocks to handle errors, logging them to the console and sending appropriate error responses.
    
- **MongoDB Operations:** Functions use MongoDB's `find`, `findById`, `save`, and `create` methods for database operations.
    
- **File System Operations:** `generatePayslip` uses `fs` to write the PDF to the file system.
    
- **Express.js:** The functions are designed to work within an Express.js route handler, responding with JSON data or error messages.
    
- **Security:** Basic security measures like checking for the existence of `res` and `res.status` are implemented to prevent crashes due to undefined objects.