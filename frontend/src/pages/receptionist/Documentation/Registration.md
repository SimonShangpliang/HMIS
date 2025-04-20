# Patient Registration Component Documentation


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


### Response Handling

- Successful registration: Displays success message and redirects to receptionist profile
- Failed registration: Displays error message from API response
- Errors are automatically cleared after 5 seconds

### Layout and Styling

- Responsive grid layout (single column on mobile, two columns on larger screens)
- Tailwind CSS for styling
- Form fields are organized into logical groupings
- Form inputs include focus states and accessibility considerations

### Navigation
Uses React Router's `useNavigate` hook to redirect to the receptionist profile page after successful submission.



