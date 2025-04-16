# Joi Validation Documentation: Employee System

This document describes the validation rules applied to the Employee system's API endpoints using Joi.

## Bank Details Validation Schema

| Field | Validation Rules | Error Message |
|-------|------------------|---------------|
| `bank_name` | Optional string | Default Joi error messages |
| `account_number` | Optional integer | Default Joi error messages |
| `ifsc_code` | Optional string matching pattern ^[A-Z]{4}0[A-Z0-9]{6}$ | "Invalid IFSC code format" |
| `branch_name` | Optional string | Default Joi error messages |
| `balance` | Optional number, minimum 0 | Default Joi error messages |

## Employee Validation Schema

| Field | Validation Rules                                                                                 | Error Message |
|-------|--------------------------------------------------------------------------------------------------|---------------|
| `name` | Optional string, 3-100 characters                                                                | Default Joi error messages |
| `email` | Optional valid email format                                                                      | Default Joi error messages |
| `password` | Optional string, minimum 6 characters                                                            | Default Joi error messages |
| `profile_pic` | Optional URI string, empty string allowed                                                        | Default Joi error messages |
| `role` | Optional enum: "doctor", "nurse", "pharmacist", "receptionist", "admin", "pathologist", "driver" | Default Joi error messages |
| `dept_id` | Optional string matching MongoDB ObjectId pattern                                                | "dept_id must be a valid ObjectId" |
| `phone_number` | Optional string of exactly 10 digits                                                             | "Phone number must be 10 digits" |
| `address` | Optional string                                                                                  | Default Joi error messages |
| `date_of_birth` | Optional date, must be in the past                                                               | "Date of birth must be in the past" |
| `date_of_joining` | Optional date                                                                                    | Default Joi error messages |
| `gender` | Optional enum: "Male", "Female"                                                                  | Default Joi error messages |
| `salary` | Optional number, minimum 0                                                                       | Default Joi error messages |
| `bank_details` | Optional BankDetailsJoiSchema object                                                             | See Bank Details validation |

## Usage Examples

```javascript
// Validating employee data in an API route handler
router.post('/employees', async (req, res) => {
  try {
    // Validate request body
    const { error, value } = EmployeeJoiSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }
    
    // Process validated data
    
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

// Validating employee update
router.put('/employees/:id', async (req, res) => {
  try {
    // Validate request body
    const { error, value } = EmployeeJoiSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }
    
    // Update employee with validated data
    
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});
```

## Notes

- Most fields are optional to support partial updates in PUT/PATCH requests
- IFSC code validation follows the Indian banking code format (4 letters + 0 + 6 alphanumeric characters)
- The MongoDB ObjectId validation ensures proper 24-character hexadecimal format
- Custom error messages are provided for complex validations like phone number format
- Empty strings are allowed for profile_pic to support clearing the field
- Date of birth must be in the past with a custom error message
- The validation is designed to be reusable across create and update endpoints
- Salary cannot be negative as enforced by the minimum value constraint