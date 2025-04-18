# AddStaff Component Documentation

## Overview
The `AddStaff` component is used to add new staff members to the system. It supports capturing personal, role-specific, and salary details.

## Features
- Add new staff members with role-specific details.
- Automatically calculate total salary based on basic salary, allowance, and deduction.
- Upload profile pictures for staff members.
- Validate form fields before submission.

## Key UI Components
- **Form Fields**: Includes fields for personal details, role-specific details, and salary breakdown.
- **Profile Picture Upload**: Allows uploading and previewing a profile picture.
- **Submit Button**: Submits the form to add a new staff member.

## Key Functionalities
### Adding Staff
- **Functionality**: Allows admins to add new staff members.
- **Validation**:
  - Required fields: `Name`, `Role`, `Basic Salary`.
  - Ensures valid numeric values for salary fields.
- **API Endpoint**: `/api/admin/add-staff`.

### Salary Calculation
- **Functionality**: Automatically calculates the total salary as:
  ```
  Total Salary = Basic Salary + Allowance - Deduction
  ```

### Profile Picture Upload
- **Functionality**: Allows uploading a profile picture for the staff member.
- **Preview**: Displays a preview of the uploaded image.

## Props and State
### State Variables
- `formData`: Stores the form data for adding staff.
- `profilePreview`: Stores the preview URL for the uploaded profile picture.
- `isSubmitting`: Indicates if the form is being submitted.

## Event Handlers
- **`handleChange`**: Updates form data as the user types.
- **`handleImageUpload`**: Handles profile picture uploads and previews.
- **`handleSubmit`**: Submits the form to add a new staff member.

## Roles and Permissions
- **Admin**: Full access to add staff members.

## Error Handling
- Displays error messages for invalid form submissions.
- Handles API errors gracefully.

## Dependencies
- `axios`: For API calls.

## Example Usage
```jsx
import AddStaff from './AddStaff';

function App() {
  return <AddStaff />;
}
```
