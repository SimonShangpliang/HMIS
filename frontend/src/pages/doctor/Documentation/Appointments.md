# Appointments Component Documentation

## Technical Documentation

### Overview
The `Appointments` component is a React-based interface for doctors to view and manage their scheduled appointments. It displays appointments in a tabular format with patient information, appointment times, and completion status.

### Dependencies
- React (with Hooks)
- React Router DOM
- Tailwind CSS for styling

### Component Structure
```jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

const Appointments = () => {
  // Component implementation
};

export default Appointments;
```

### State Management
- `appointments`: Array of appointment objects fetched from the API
- `doctorId`: Currently hardcoded as "D001", intended to be dynamic in future implementations

### Key Functions

#### `fetchAppointmentsByDoctorId(doctorId)`
- **Purpose**: Retrieves appointments for a specific doctor
- **Parameters**: `doctorId` (String) - Unique identifier for the doctor
- **Returns**: Promise that resolves to an array of appointment objects
- **Note**: Currently implemented as a mock function with simulated delay

#### `loadAppointments()`
- **Purpose**: Async function that calls the fetch method and updates component state
- **Called by**: useEffect hook on component mount and doctorId changes

#### `handlePatientClick(patientId)`
- **Purpose**: Navigation handler for redirecting to patient consultation page
- **Parameters**: `patientId` (String) - Unique identifier for the patient
- **Behavior**: Uses React Router's `navigate` to redirect to `/patient-consultations/{patientId}`

### Data Structure
Each appointment object contains:
```javascript
{
  id: String,        // Appointment identifier
  patientId: String, // Patient identifier
  patientName: String, // Patient's full name
  timeSlot: String,  // Appointment time range
  isDone: Boolean    // Completion status
}
```

### Routing
- Uses `Link` component to navigate to appointment booking page
- Uses `useNavigate` hook for programmatic navigation to patient consultation pages

### UI Components
- List view of appointments with four columns:
  - Appointment ID
  - Patient Name (clickable)
  - Time Slot
  - Completion Status (checkbox)
- "Add Appointment" button that links to the appointment booking page

### Styling
- Uses Tailwind CSS for responsive design
- Dark background for appointment rows with light text
- Interactive elements have hover states

### Implementation Notes
- The doctor ID is currently hardcoded and should be replaced with dynamic authentication
- Checkbox for marking appointments as done is currently read-only
- Data fetching uses a mock function that should be replaced with actual API calls

### Future Improvements
- Replace mock data with real API integration
- Implement appointment completion functionality
- Add filtering and sorting capabilities
- Implement pagination for large datasets
- Add error handling for API requests

---

## User Documentation

### Doctor's Appointment Management System

#### Overview
The Appointments page provides doctors with a comprehensive view of their scheduled appointments. This interface allows you to track your upcoming appointments, view patient information, and navigate to detailed patient records.

#### Getting Started
1. Navigate to the Appointments page from your dashboard
2. You will see a list of all your scheduled appointments
3. Appointments are displayed chronologically by time slot

#### Features

##### Viewing Appointments
- Each appointment displays:
  - Appointment ID: Unique identifier for the appointment
  - Patient Name: Full name of the patient
  - Time: The scheduled time slot (start and end time)
  - Done: Checkbox indicating if the appointment has been completed

##### Accessing Patient Information
- Click on a patient's name to view their consultation history and detailed information
- This will take you to a dedicated patient page with comprehensive medical records

##### Adding New Appointments
- To schedule a new appointment, click the "Add Appointment" button at the top of the page
- This will redirect you to the appointment booking interface

#### Troubleshooting

**Issue**: Appointments not displaying
- Refresh the page
- Check your internet connection
- Contact technical support if the problem persists

**Issue**: Unable to access patient records
- Ensure you have proper permissions to view patient data
- Try logging out and logging back in
- Report access issues to your system administrator

#### Support
For technical assistance, please contact the IT support team at [support@example.com](mailto:support@example.com) or call the help desk at (555) 123-4567.