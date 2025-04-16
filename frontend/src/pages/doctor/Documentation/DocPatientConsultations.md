# DocPatientConsultations Component Documentation

## Technical Documentation

### Overview
The `DocPatientConsultations` component displays a list of past and upcoming consultations for a specific patient. It provides a navigation interface for doctors to access patient consultation details and daily progress records.

### Dependencies
- React (with Hooks)
- React Router DOM (for navigation and route parameters)
- Tailwind CSS for styling

### Component Structure
```jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const DocPatientConsultations = () => {
  // Component implementation
};

export default DocPatientConsultations;
```

### Routing and Navigation
- Uses `useParams` hook to extract `patientId` from the URL
- Uses `useNavigate` hook for programmatic navigation
- Provides navigation buttons to:
  - View patient's daily progress
  - Access specific consultation details
  - Return to appointments list

### State Management
- `consultations`: Array of consultation records fetched from the API

### Key Functions

#### `fetchConsultationsByPatientId(patientId)`
- **Purpose**: Retrieves consultation records for a specific patient
- **Parameters**: `patientId` (String/Number) - Unique identifier for the patient
- **Returns**: Promise that resolves to an array of consultation objects
- **Note**: Currently implemented as a mock function with simulated delay

#### `loadConsultations()`
- **Purpose**: Async function that calls the fetch method and updates component state
- **Called by**: useEffect hook on component mount and patientId changes

#### Navigation Handlers
- `handleDailyProgressClick()`: Navigates to patient's daily progress page
- `handleConsultationClick(id)`: Navigates to a specific consultation's details
- `handleBackToAppointmentsClick()`: Returns to the appointments list

### Data Structure
Each consultation object contains:
```javascript
{
  id: Number,           // Unique consultation identifier
  date: String,         // Date in YYYY-MM-DD format
  doctorName: String,   // Name of the doctor who conducted the consultation
  location: String,     // Physical location where the consultation took place
  details: String       // Brief description of the consultation purpose
}
```

### UI Components
- Header section with component title and "Daily Progress" button
- Tabular display of consultations with columns for date, doctor name, and location
- "Back to Appointments" button for navigation
- Each consultation row is clickable to access detailed information

### Styling
- Uses Tailwind CSS for responsive design
- Dark background for consultation rows with light text
- Interactive elements with hover states
- Consistent button styling with contextual colors

### Implementation Notes
- The fetch function is currently mocked and should be replaced with actual API calls
- No loading state or error handling is implemented
- The component expects the patientId to be available in the URL parameters
- Consultations are displayed in the order they are received from the API

### Future Improvements
- Add loading and error states
- Implement pagination for large numbers of consultations
- Add filtering options (by date range, doctor, etc.)
- Enhance error handling with user-facing error messages
- Add sorting functionality for table columns
- Include additional consultation information in the display

---

## User Documentation

### Patient Consultations System

#### Overview
The Patient Consultations page provides healthcare providers with a comprehensive view of a patient's consultation history. This interface allows you to access detailed information about each consultation and navigate to related patient data.

#### Features

##### Consultation List
The main feature of the page is a table displaying all consultations for the selected patient. Each consultation entry shows:
- **Date**: When the consultation occurred
- **Doctor Name**: The healthcare provider who conducted the consultation
- **Location**: Where the consultation took place (room number or department)

Each consultation row is clickable, allowing you to access detailed information about that specific visit.

##### Navigation Options
The page includes three navigation options:
1. **Daily Progress Button**: Located in the header, this button takes you to the patient's vital signs and progress measurements.
2. **Consultation Rows**: Clicking on any consultation row navigates to the detailed view for that specific consultation.
3. **Back to Appointments Button**: Located at the bottom of the page, this returns you to the main appointments list.

#### Using the Consultation List

**Viewing Consultation Details**
To access detailed information about a specific consultation:
1. Locate the consultation of interest in the table
2. Click anywhere on that consultation's row
3. You will be redirected to a detailed view showing all information recorded during that visit

**Accessing Daily Progress**
To view the patient's vital signs and progress over time:
1. Click the "Daily Progress" button in the top-right corner of the page
2. You will be redirected to a page showing the patient's measurements across multiple dates

**Returning to Appointments**
When you've finished reviewing the patient's consultations:
1. Click the "Back to Appointments" button at the bottom of the page
2. You will be returned to the main appointments list

#### Best Practices
- Review the patient's consultation history before creating new records
- Check recent consultations to understand the patient's ongoing care
- Use the daily progress view to track changes in the patient's condition over time
- Maintain consistency in documentation across consultations

#### Troubleshooting

**Issue**: Consultation list not loading
- Check your internet connection
- Refresh the page
- Verify that the correct patient ID is in the URL

**Issue**: Unable to access consultation details
- Ensure you click directly on the consultation row
- Check your permissions to access detailed patient information