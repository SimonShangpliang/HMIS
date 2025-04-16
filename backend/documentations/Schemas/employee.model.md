# Mongoose Schema Documentation: Employee System

## BankDetails Schema

The `BankDetails` schema represents banking information for employee salary processing.

### Fields

| Field | Type | Description | Constraints |
|-------|------|-------------|------------|
| `bank_name` | String | Name of the bank | None |
| `account_number` | Number | Employee's bank account number | None |
| `ifsc_code` | String | Indian Financial System Code | None |
| `branch_name` | String | Bank branch name | None |
| `balance` | Number | Account balance | None |

## Employee Schema

The `Employee` schema represents staff members across various roles in the medical facility.

### Fields

| Field | Type | Description | Constraints                                                                             |
|-------|------|-------------|-----------------------------------------------------------------------------------------|
| `_id` | Number | Auto-incremented employee ID | None                                                                                    |
| `name` | String | Full name of employee | None                                                                                    |
| `email` | String | Email address | Unique: true                                                                            |
| `password` | String | Authentication password | None                                                                                    |
| `profile_pic` | String | URL or path to profile picture | None                                                                                    |
| `role` | String | Job role | Enum: "doctor", "nurse", "pharmacist", "receptionist", "admin", "pathologist", "driver" |
| `dept_id` | ObjectId | Department reference | References 'Department' model                                                           |
| `phone_number` | String | Contact phone number | None                                                                                    |
| `emergency_contact` | String | Emergency contact number | None                                                                                    |
| `bloodGrp` | String | Blood group | Enum: "A+", "B+", "AB+", "O+", "A-", "B-", "AB-", "O-"                                  |
| `address` | String | Residential address | None                                                                                    |
| `date_of_birth` | Date | Birth date | None                                                                                    |
| `aadhar_number` | String | Unique government ID | Unique: true                                                                            |
| `date_of_joining` | Date | Employment start date | None                                                                                    |
| `gender` | String | Gender | Enum: "Male", "Female"                                                                  |
| `salary` | Number | Monthly salary amount | None                                                                                    |
| `bank_details` | Object | Banking information | Embedded BankDetails document                                                           |
| `createdAt` | Date | Auto-generated timestamp | Added by timestamps option                                                              |
| `updatedAt` | Date | Auto-updated timestamp | Added by timestamps option                                                              |

### Options
- `timestamps: true`: Automatically adds and manages `createdAt` and `updatedAt` fields
- `_id: false`: Disables automatic generation of MongoDB ObjectId
- Uses AutoIncrement plugin for `_id` field starting at 10000

### Relationships
- References `Department` model through `dept_id`
- Embeds a single `BankDetails` document

## Model
- `Employee`: Mongoose model for employees

## Usage Examples

```javascript
// Creating a new employee
const newEmployee = new Employee({
  name: "Dr. Aisha Patel",
  email: "aisha.patel@hospital.com",
  password: hashedPassword, // Should be properly hashed
  role: "doctor",
  dept_id: cardiologyDeptId,
  phone_number: "9876543210",
  emergency_contact: "9876543211",
  bloodGrp: "O+",
  address: "123 Medical Avenue, Mumbai",
  date_of_birth: new Date('1985-06-15'),
  aadhar_number: "123456789012",
  date_of_joining: new Date('2020-03-10'),
  gender: "Female",
  salary: 120000,
  bank_details: {
    bank_name: "State Bank of India",
    account_number: 12345678901,
    ifsc_code: "SBIN0001234",
    branch_name: "Mumbai Main Branch",
    balance: 250000
  }
});

await newEmployee.save();

// Finding an employee by ID
const employee = await Employee.findById(10001);

// Finding employees by role
const doctors = await Employee.find({ role: "doctor" })
  .populate('dept_id')
  .sort({ name: 1 });

// Updating employee salary
await Employee.updateOne(
  { _id: 10001 },
  { $set: { salary: 130000 }}
);

// Updating bank details
await Employee.updateOne(
  { _id: 10001 },
  { 
    $set: { 
      "bank_details.balance": 275000,
      "bank_details.account_number": 98765432101
    }
  }
);
```

## Notes
- Employee IDs are auto-incremented starting from 10000
- The schema supports various medical and administrative staff roles
- Bank details are stored as embedded documents for efficient access
- The schema includes both personal information and employment details
- Unique constraints on email and Aadhar number prevent duplicate entries
- Department references allow for organizational structure