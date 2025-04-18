# Patient Registration Component Documentation

## User Documentation

### Overview
The Registration component provides a user interface for hospital receptionists to register new patients in the healthcare system. It collects essential patient information including personal details, contact information, and vital statistics.

### Features
- **Complete Patient Profile Creation**: Captures comprehensive patient information
- **Form Validation**: Ensures accurate data entry with validation for phone numbers
- **Success/Error Feedback**: Clear visual indicators when registration succeeds or fails
- **Responsive Layout**: Adapts to different screen sizes for ease of use

### How to Use

1. **Access the Registration Form**:
   - Navigate to the patient registration page in the receptionist portal

2. **Fill in Patient Information**:
   - Enter patient's full name
   - Input Aadhar ID (government identification)
   - Select date of birth using the date picker
   - Choose gender from the dropdown
   - Select blood group from available options
   - Enter patient email address
   - Input height in centimeters
   - Input weight in kilograms
   - Add complete residential address
   - Enter 10-digit mobile number
   - Provide 10-digit emergency contact number

3. **Submit the Form**:
   - Click the "Submit" button
   - Wait for the success confirmation message
   - The system will automatically redirect to the receptionist profile page upon successful registration

4. **Error Handling**:
   - If any validation errors occur (like incorrect phone number format), address the highlighted issues
   - If submission fails, review the error message and try again

## Technical Documentation

### Component Structure
`Registration` is a React functional component that handles patient registration form submission.

### Dependencies
- React
- React Router (for navigation)
- Environment variables for API endpoints

### State Management
The component uses React's useState hook to manage:

1. `formData`: Object containing all form fields
   ```javascript
   {
     patientName: string,
     aadharId: string,
     dob: string,
     gender: string,
     bloodGroup: string,
     email: string,
     height: string,
     weight: string,
     address: string,
     emergencyNumber: string,
     mobile: string,
     
   }
   ```

2. `isSubmitting`: Boolean to track form submission status
3. `message`: Object containing feedback message type and text
   ```javascript
   {
     type: string ('success' | 'error'),
     text: string
   }
   ```

### Key Functions

#### `handleChange`
Updates the form data state when any input field changes.

#### `handleSubmit`
- Prevents default form submission behavior
- Validates mobile and emergency numbers using regex
- Sets submission status
- Sends form data to the API endpoint
- Handles success/error responses
- Resets form on success and navigates to the receptionist profile page
- Displays feedback message to the user
- Clears feedback message after 5 seconds

### API Integration
The component integrates with a backend API:
- **Endpoint**: `${import.meta.env.VITE_API_URL}/reception/register-patient`
- **Method**: POST
- **Headers**: Content-Type: application/json
- **Body**: JSON-stringified form data

### Form Validation
- Mobile number validation: Ensures exactly 10 digits
- Emergency number validation: Ensures exactly 10 digits
- Required field validation: Uses HTML5 required attribute



### Navigation
Uses React Router's `useNavigate` hook to redirect to the receptionist profile page after successful submission.



