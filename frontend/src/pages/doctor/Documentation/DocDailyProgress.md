# DocDailyProgress Component Documentation

## Technical Documentation

### Overview
The `DocDailyProgress` component displays a patient's vital signs and medical measurements over time in a tabular format. It provides healthcare providers with a chronological view of a patient's physiological data to track changes and trends in their condition.

### Dependencies
- React (with Hooks)
- React Router DOM (for navigation and route parameters)
- Tailwind CSS for styling

### Component Structure
```jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const DocDailyProgress = () => {
  // Component implementation
};

export default DocDailyProgress;
```

### Routing and Navigation
- Uses `useParams` hook to extract `patientId` from the URL
- Uses `useNavigate` hook for programmatic navigation
- Provides a "Back" button to return to the patient consultation page

### State Management
- `progressData`: Array of progress records fetched from the API
- `patient`: Object containing patient information
- `loading`: Boolean flag indicating whether data is currently being fetched

### Key Functions

#### `fetchDailyProgressByPatientId(patientId)`
- **Purpose**: Retrieves daily progress records for a specific patient
- **Parameters**: `patientId` (String/Number) - Unique identifier for the patient
- **Returns**: Promise that resolves to an array of progress record objects
- **Note**: Currently implemented as a mock function with simulated delay

#### `fetchPatientDetails(patientId)`
- **Purpose**: Retrieves basic information about a specific patient
- **Parameters**: `patientId` (String/Number) - Unique identifier for the patient
- **Returns**: Promise that resolves to a patient object
- **Note**: Currently implemented as a mock function with simulated delay

#### `loadData()`
- **Purpose**: Async function that manages the loading state, calls both fetch methods concurrently, and handles errors
- **Called by**: useEffect hook on component mount and patientId changes
- **Error Handling**: Logs errors to console and updates loading state

#### `handleBackClick()`
- **Purpose**: Navigation handler for the "Back" button
- **Behavior**: Uses React Router's `navigate` to return to the patient consultation page

### Data Structures

#### Progress Record Object
```javascript
{
  id: Number,                // Unique record identifier
  date: String,              // Date in YYYY-MM-DD format
  temperature: String,       // Body temperature with unit
  bloodPressure: String,     // Blood pressure reading (systolic/diastolic)
  pulse: String,             // Heart rate with unit
  respiration: String,       // Respiratory rate with unit
  oxygenSaturation: String   // Oxygen saturation percentage
}
```

#### Patient Object
```javascript
{
  id: String/Number,   // Unique patient identifier
  name: String,        // Patient's full name
  age: Number,         // Patient's age in years
  gender: String       // Patient's gender
}
```

### UI Components
- Header section with title and back button
- Loading spinner during data fetch
- Patient information display
- Tabular data display with multiple columns for vitals

### Conditional Rendering
- Shows loading spinner when `loading` is true
- Shows patient information and progress table when data is loaded
- Table dynamically generates rows based on available progress records

### Styling
- Uses Tailwind CSS for responsive design
- Dark header for the table with light rows
- Hover effect on table rows
- Responsive table with horizontal scroll for smaller screens

### Implementation Notes
- The fetch functions are currently mocked and should be replaced with actual API calls
- Error handling is minimal, showing only console errors
- The component expects the patientId to be available in the URL parameters
- Fetches both progress data and patient details in parallel for efficiency

### Future Improvements
- Add date filtering capabilities
- Implement trend visualization with charts
- Add ability to enter new progress records
- Enhance error handling with user-facing error messages
- Add sorting functionality for table columns
- Implement pagination for large datasets
- Add data export functionality

---

## User Documentation

### Daily Progress Monitoring System

#### Overview
The Daily Progress page provides healthcare providers with a chronological view of a patient's vital signs and key physiological measurements. This interface allows you to track changes in a patient's condition over time and identify trends that may require clinical attention.

#### Features

##### Patient Information
At the top of the page, you'll see basic identification information about the patient:
- Patient name
- Age
- Gender

This helps confirm you are viewing the correct patient's records.

##### Vital Signs Table
The main feature of the page is a comprehensive table showing vital sign measurements across multiple days. The table includes:

- **Date**: When the measurements were taken
- **Temperature**: Patient's body temperature (typically in °F)
- **Blood Pressure**: Systolic and diastolic readings (mmHg)
- **Pulse**: Heart rate (beats per minute)
- **Respiration**: Breathing rate (breaths per minute)
- **O₂ Saturation**: Blood oxygen level (percentage)

Each row represents a complete set of measurements taken on a specific date, allowing you to easily compare changes over time.

##### Navigation
A "Back" button at the top of the page allows you to return to the patient's consultation page when you've finished reviewing the progress data.

#### Reading the Progress Data

**Temperature**
- Normal adult range is typically 97.8°F to 99.0°F (36.5°C to 37.2°C)
- Values outside this range may indicate fever or hypothermia

**Blood Pressure**
- Displayed as systolic/diastolic (e.g., 120/80)
- Normal adult range is typically around 90-120/60-80 mmHg
- Consistent readings above 130/80 may indicate hypertension

**Pulse**
- Normal adult resting heart rate is typically 60-100 beats per minute
- Athletes may have lower resting heart rates
- Significant variations may indicate cardiovascular issues

**Respiration**
- Normal adult respiratory rate is typically 12-20 breaths per minute
- Rates consistently above or below this range may require clinical attention

**Oxygen Saturation**
- Normal values are typically 95% or higher
- Values below 90% may indicate significant respiratory compromise

#### Best Practices
- Review trends over time rather than focusing on single measurements
- Consider all vital signs together for a comprehensive assessment
- Compare current readings to the patient's baseline when available
- Use this data to complement, not replace, clinical evaluation

#### Troubleshooting

**Issue**: Progress data not loading
- Check your internet connection
- Refresh the page
- Verify that the correct patient ID is in the URL

**Issue**: Incomplete or missing data
- Ensure all measurements were recorded during patient assessment
- Check if data entry was completed for all required fields