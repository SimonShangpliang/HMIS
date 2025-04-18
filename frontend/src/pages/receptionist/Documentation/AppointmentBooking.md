# Appointment Booking Component Documentation

## User Documentation

### Overview
The AppointmentBooking component provides a user-friendly interface for hospital staff to schedule patient appointments with doctors. It captures essential information about the patient, doctor, and appointment details in a structured form.

### Features
- **Patient Information Collection**: Record patient ID and name
- **Doctor Assignment**: Specify doctor ID and name for the appointment
- **Scheduling**: Set date, time, and room number for the appointment
- **Appointment Classification**: Categorize appointments by type (Regular, Emergency, Follow-up, Consultation)
- **Responsive Design**: User-friendly layout that works well on both desktop and mobile devices

### How to Use

1. **Access the Appointment Form**:
   - Navigate to the appointment booking section in the hospital management system

2. **Enter Appointment Details**:
   - **Patient Information**:
     - Enter the patient's ID
     - Input the patient's full name
   
   - **Doctor Information**:
     - Enter the doctor's ID
     - Input the doctor's name
   
   - **Appointment Details**:
     - Select the appointment date using the date picker
     - Choose the appointment time
     - Specify the room number for the appointment
     - Select the appropriate appointment type from the dropdown menu:
       - Regular: Standard scheduled appointment
       - Emergency: Urgent care appointment
       - Follow-up: Check-up after previous treatment
       - Consultation: Initial consultation appointment

3. **Book the Appointment**:
   - Review all entered information for accuracy
   - Click the "Submit" button to book the appointment
   - A confirmation message will appear when the appointment is successfully booked
   - The form will reset after successful submission for booking another appointment

## Technical Documentation

### Component Structure
`AppointmentBooking` is a React functional component that manages a form for booking patient appointments.

### State Management
The component uses React's useState hook to manage form data:

```javascript
{
  patientId: string,
  doctorId: string,
  time: string,
  roomNo: string,
  date: string,
  patientName: string,
  doctorName: string,
  appointmentType: string
}
```

### Key Functions

#### `handleChange`
Updates the form data state when any input field changes:
- Takes the event object as a parameter
- Extracts input name and value
- Updates the corresponding field in the form data state

#### `handleSubmit`
Processes the form submission:
- Prevents default form submission behavior
- Currently logs the form data to the console (placeholder for API integration)
- Displays a success alert to the user
- Resets the form to its initial state


### Form Validation
- Basic HTML5 form validation using the `required` attribute
- No additional custom validation implemented yet

### API Integration
The component is prepared for backend integration:
- The `handleSubmit` function includes a placeholder (`console.log`) where API calls would be implemented
- Form data is structured in a way that can be easily sent to a backend endpoint



