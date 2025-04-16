# Joi Validation Documentation: Patient System

This document describes the validation rules applied to the Patient system's API endpoints using Joi.

## Vitals Validation Schema



| Field | Validation Rules | Error Message |
|-------|------------------|---------------|
| `date` | Required date | Default Joi error messages |
| `time` | Required string matching 24-hour time format (HH:mm) | "Time must be in HH:mm 24-hour format" |
| `bloodPressure` | Optional string in format "120/80" | "Blood pressure must be in format '120/80'" |
| `bodyTemp` | Optional number | Default Joi error messages |
| `pulseRate` | Optional number | Default Joi error messages |
| `breathingRate` | Optional number | Default Joi error messages |

## PatientInfo Validation Schema

| Field | Validation Rules | Error Message |
|-------|------------------|---------------|
| `age` | Optional integer, minimum 0 | Default Joi error messages |
| `height` | Optional number, minimum 0 | Default Joi error messages |
| `weight` | Optional number, minimum 0 | Default Joi error messages |
| `bloodGrp` | Optional enum: "A+", "B+", "AB+", "O+", "A-", "B-", "AB-", "O-" | Default Joi error messages |
| `familyHistory` | Optional string, empty allowed | Default Joi error messages |
| `bedNo` | Optional integer, minimum 1 | Default Joi error messages |
| `roomNo` | Optional integer, minimum 1 | Default Joi error messages |
| `other` | Optional string, empty allowed | Default Joi error messages |

## Patient Validation Schema

| Field | Validation Rules                           | Error Message |
|-------|--------------------------------------------|---------------|
| `password` | Optional string, minimum 6 characters      | Default Joi error messages |
| `name` | Optional string, 3-100 characters          | Default Joi error messages |
| `profile_pic` | Optional URI string, empty string allowed  | Default Joi error messages |
| `phone_number` | Optional string of exactly 10 digits       | Default Joi error messages |
| `emergency_contact` | Optional string of exactly 10 digits       | Default Joi error messages |
| `email` | Optional valid email format                | Default Joi error messages |
| `date_of_birth` | Optional date, must be in the past         | "Date of birth must be in the past" |
| `aadhar_number` | Optional string of exactly 12 digits       | Default Joi error messages |
| `gender` | Optional enum: "Male", "Female"            | Default Joi error messages |
| `address` | Optional string                            | Default Joi error messages |
| `patient_info` | Optional PatientInfoJoiSchema object       | See PatientInfo validation |
| `vitals` | Optional array of VitalsJoiSchema objects  | See Vitals validation |
| `insurance_details` | Optional array of MongoDB ObjectId strings | Default Joi error messages |

## Usage Examples

```javascript
// Validating new patient registration
router.post('/patients', async (req, res) => {
  try {
    // Validate request body
    const { error, value } = PatientJoiSchema.validate(req.body);
    
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

// Adding new vitals record
router.post('/patients/:id/vitals', async (req, res) => {
  try {
    // Validate vital signs data
    const { error, value } = VitalsJoiSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }
    
    // Add vitals to patient record
    
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

// Updating patient information
router.put('/patients/:id', async (req, res) => {
  try {
    // Validate request body
    const { error, value } = PatientJoiSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }
    
    // Update patient with validated data
    
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

- The validation uses a hierarchical structure with sub-schemas for vitals and patient information
- Time format validation ensures proper 24-hour format (HH:mm)
- Blood pressure validation enforces a format of "systolic/diastolic" (e.g., "120/80")
- Age, height, and weight must be non-negative values
- Bed and room numbers must be positive integers
- Aadhar number must be exactly 12 digits
- Phone numbers must be exactly 10 digits
- Date of birth must be in the past
- The validation supports nested objects and arrays of objects
- MongoDB ObjectId validation ensures proper 24-character hexadecimal format for insurance references