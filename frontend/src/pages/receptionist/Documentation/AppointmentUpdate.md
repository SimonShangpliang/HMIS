# Appointment Update Component Documentation

## User Documentation

### Overview
The AppointmentUpdate component provides a user interface for hospital staff to modify existing patient appointments. It allows users to search for appointments by ID and update details such as doctor assignment, time, date, and room allocation.

### Features
- **Appointment Lookup**: Fetch appointment details by entering an appointment ID
- **Doctor Reassignment**: Change the assigned doctor for an appointment
- **Schedule Modification**: Update appointment date and time
- **Room Reallocation**: Change the assigned room for the appointment
- **Visual Feedback**: Status messages for successful updates and loading states

### How to Use

1. **Find the Appointment**:
   - Enter the appointment ID in the Appointment ID field
   - When the ID is at least 5 characters long, the system will automatically attempt to retrieve the appointment details
   - Wait for the form fields to populate with the current appointment information

2. **Update Appointment Details**:
   - Modify any of the following fields as needed:
     - Doctor ID: Enter the new doctor's identification code
     - Time: Select the new appointment time
     - Date: Choose the new appointment date
     - Room No: Enter the new room number

3. **Save Changes**:
   - Click the "Update" button to save the changes
   - The button will show "Updating..." while processing
   - A success message will appear briefly when the update is complete

4. **Error Handling**:
   - If the system cannot find the appointment, verify the ID is correct
   - If any field is missing required information, the form will indicate which fields need attention

## Technical Documentation

### Component Structure
`AppointmentUpdate` is a React functional component that manages an appointment update form with automatic data fetching.

### State Management
The component uses React's useState hook to manage:

1. `formData`: Object containing all form fields
   ```javascript
   {
     appointmentId: string,
     doctorId: string,
     time: string,
     roomNo: string,
     date: string
   }
   ```

2. `isLoading`: Boolean to track loading states during fetch and update operations
3. `message`: Object for displaying feedback messages
   ```javascript
   {
     type: string ('success' | 'error'),
     text: string
   }
   ```

### Key Functions

#### `handleChange`
Updates the form data state when any input field changes.

#### `fetchAppointmentDetails`
Simulates an API call to retrieve appointment details:
- Takes an appointment ID as parameter
- Sets loading state during the operation
- Updates form data with retrieved information
- Currently implemented with a mock timeout and data

#### `handleAppointmentIdChange`
Special handler for the appointment ID field:
- Updates the appointment ID in form data
- Triggers automatic data fetching when ID is at least 5 characters

#### `handleSubmit`
Processes the form submission:
- Prevents default form submission behavior
- Sets loading state during the operation
- Simulates an API call to update the appointment (currently logs to console)
- Displays a success message
- Automatically clears the message after 3 seconds

### Mock API Implementation
The component currently uses `setTimeout` to simulate API calls:
- `fetchAppointmentDetails`: Simulates fetching appointment data (500ms delay)
- `handleSubmit`: Simulates updating appointment data (800ms delay)

These should be replaced with actual API calls in production.



### Form Validation
- Basic HTML5 form validation using the `required` attribute on most fields
- No additional custom validation implemented yet



