# DocConsultationPrescriptions Component Documentation

## Technical Documentation

### Overview
The `DocConsultationPrescriptions` component is a React component designed to display, create, and edit prescription information for a specific medical consultation. It provides a comprehensive interface for medical professionals to manage medication orders for patients.

### Dependencies
- React (with Hooks)
- Tailwind CSS for styling

### Component Structure
```jsx
import React, { useState, useEffect } from "react";

const DocConsultationPrescriptions = ({ consultationId }) => {
  // Component implementation
};

export default DocConsultationPrescriptions;
```

### Props
- `consultationId` (String/Number): Unique identifier for the consultation whose prescriptions should be displayed

### State Management
- `prescriptions`: Array of prescription objects fetched from the API
- `loading`: Boolean flag indicating whether data is currently being fetched
- `editing`: Boolean flag indicating whether the component is in edit mode
- `editPrescription`: Object containing the current prescription being edited with fields:
  - `medicine`: Name of the medicine
  - `dosage`: Dosage information
  - `frequency`: How often the medicine should be taken

### Key Functions

#### `fetchPrescriptionsByConsultationId(consultationId)`
- **Purpose**: Retrieves prescriptions associated with a specific consultation
- **Parameters**: `consultationId` (String/Number) - Unique identifier for the consultation
- **Returns**: Promise that resolves to an array of prescription objects
- **Note**: Currently implemented as a mock function with simulated delay

#### `loadPrescriptions()`
- **Purpose**: Async function that manages the loading state, calls the fetch method, and handles errors
- **Called by**: useEffect hook on component mount and consultationId changes
- **Error Handling**: Logs errors to console and updates loading state

#### `handleEdit()`
- **Purpose**: Switches the component to edit mode and initializes the edit form with default values
- **Note**: In a real implementation, this would likely pre-populate with the selected prescription's data

#### `handleSave()`
- **Purpose**: Exits edit mode and logs the updated prescription data
- **Note**: In a real implementation, this would send data to a server API

### Data Structure
Each prescription object contains:
```javascript
{
  id: Number,           // Unique prescription identifier
  medicine: String,     // Name of the medicine
  dosage: String,       // Dosage information
  frequency: String,    // How often the medicine should be taken
  duration: String,     // How long the medicine should be taken
  notes: String         // Additional instructions or information
}
```

### UI Components
- Loading spinner during data fetch
- Empty state with "Add Prescription" button when no prescriptions are available
- Prescription cards displaying medication details
- Edit form for creating/modifying prescriptions

### Conditional Rendering
- Shows loading spinner when `loading` is true
- Shows edit form when `editing` is true
- Shows "No prescriptions available" message with add button when `prescriptions` array is empty
- Renders prescription cards when prescriptions are available and not in edit mode

### Styling
- Uses Tailwind CSS for responsive design
- Clean grid layout for prescription details
- Form inputs with labels in edit mode
- Appropriate spacing and borders to distinguish sections

### Implementation Notes
- The fetch function is currently mocked and should be replaced with actual API calls
- Error handling is minimal, showing only console errors
- The edit functionality is simplified and would need enhancements for production use
- The component assumes consultationId will be provided as a prop

### Future Improvements
- Add validation for prescription input fields
- Implement ability to edit existing prescriptions rather than just creating new ones
- Add confirmation dialog before saving changes
- Support for adding multiple medications at once
- Add ability to delete prescriptions
- Enhance error handling with user-facing error messages

---

## User Documentation

### Prescription Management System

#### Overview
The Prescription Management section allows medical professionals to view, add, and edit medication orders for a patient consultation. This interface provides a comprehensive view of all prescribed medications with their dosage, frequency, duration, and special instructions.

#### Features

##### Viewing Prescriptions
When you open a patient's consultation, you'll see all prescribed medications displayed as cards. Each prescription card includes:
- **Medicine Name**: The name of the prescribed medication
- **Dosage**: The strength and form of the medication
- **Frequency**: How often the medication should be taken
- **Duration**: How long the medication should be taken
- **Notes**: Any special instructions for taking the medication

##### Adding a New Prescription
If no prescriptions exist for the consultation, you'll see an "Add Prescription" button. To add a new prescription:
1. Click the "Add Prescription" button
2. Fill in the required fields in the form:
   - Medicine name
   - Dosage
   - Frequency
3. Click "Save" to record the prescription

##### Editing Prescriptions
To modify existing prescriptions:
1. Click the "Edit" button in the top-right corner of the prescriptions section
2. Update the information in the form fields
3. Click "Save" to confirm your changes

#### Loading States
- When prescriptions are being retrieved, you'll see a spinning loader
- If no prescriptions exist for this consultation, you'll see a message with an option to add a new prescription

#### Form Field Guidelines

**Medicine Name**
- Enter the full, accurate name of the medication
- Include brand name or generic name as appropriate for your practice

**Dosage**
- Specify the amount (e.g., "500mg", "5ml")
- Be clear and precise to avoid medication errors

**Frequency**
- Indicate how often the medication should be taken (e.g., "Every 6 hours", "Twice daily")
- Use standard medical abbreviations when appropriate

**Duration and Notes**
- These fields may be visible on existing prescriptions but are not currently editable in the form
- In a future update, you'll be able to specify these details as well

#### Best Practices
- Double-check all prescription information before saving
- Use standard medical terminology and abbreviations
- Include clear instructions in the notes field when necessary
- Always verify that prescriptions are appropriate for the patient's condition

#### Troubleshooting

**Issue**: Prescriptions not loading
- Check your internet connection
- Refresh the page
- Verify that the correct consultation is selected

**Issue**: Unable to save a prescription
- Ensure all required fields are completed
- Check your permissions in the system

