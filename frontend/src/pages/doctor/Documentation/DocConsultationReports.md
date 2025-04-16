# DocConsultationReports Component Documentation

## Technical Documentation

### Overview
The `DocConsultationReports` component displays medical test reports associated with a specific patient consultation. It provides a clean interface for healthcare providers to view laboratory results, imaging reports, and other diagnostic information.

### Dependencies
- React (with Hooks)
- Tailwind CSS for styling

### Component Structure
```jsx
import React, { useState, useEffect } from "react";

const DocConsultationReports = ({ consultationId }) => {
  // Component implementation
};

export default DocConsultationReports;
```

### Props
- `consultationId` (String/Number): Unique identifier for the consultation whose reports should be displayed

### State Management
- `reports`: Array of report objects fetched from the API
- `loading`: Boolean flag indicating whether data is currently being fetched

### Key Functions

#### `fetchReportsByConsultationId(consultationId)`
- **Purpose**: Retrieves medical reports associated with a specific consultation
- **Parameters**: `consultationId` (String/Number) - Unique identifier for the consultation
- **Returns**: Promise that resolves to an array of report objects
- **Note**: Currently implemented as a mock function with simulated delay

#### `loadReports()`
- **Purpose**: Async function that manages the loading state, calls the fetch method, and handles errors
- **Called by**: useEffect hook on component mount and consultationId changes
- **Error Handling**: Logs errors to console and updates loading state

### Data Structure
Each report object contains:
```javascript
{
  id: Number,         // Unique report identifier
  title: String,      // Type or name of the report
  date: String,       // Date in YYYY-MM-DD format
  content: String,    // Report findings or results
  status: String      // Report status ('completed' or other values)
}
```

### UI Components
- Loading spinner during data fetch
- Empty state message when no reports are available
- Report cards displaying report details including:
  - Report title
  - Date
  - Content/findings
  - Status badge

### Conditional Rendering
- Shows loading spinner when `loading` is true
- Shows "No reports available" message when `reports` array is empty
- Renders report cards when reports are available

### Styling
- Uses Tailwind CSS for responsive design
- Status badges are color-coded (green for completed, yellow for pending)
- Clean card layout for each report
- Appropriate spacing and borders to distinguish sections

### Implementation Notes
- The fetch function is currently mocked and should be replaced with actual API calls
- Error handling is minimal, showing only console errors
- The component assumes consultationId will be provided as a prop
- Reports are displayed in the order they are received from the API

### Future Improvements
- Add ability to download or print reports
- Implement filtering options (by date, type, status)
- Add pagination for multiple reports
- Enhance error handling with user-facing error messages
- Add ability to upload new reports
- Include support for viewing attached files (PDFs, images)
- Add report preview/detail view

---

## User Documentation

### Medical Reports System

#### Overview
The Medical Reports section displays all diagnostic and laboratory results associated with a patient consultation. This interface provides healthcare providers with quick access to test results and findings to support clinical decision-making.

#### Features

##### Viewing Reports
When you open a patient's consultation, you'll see all associated medical reports displayed as cards. Each report card includes:
- **Report Title**: The type of test or examination (e.g., Blood Test, X-Ray)
- **Date**: When the test was performed
- **Content**: Key findings or results from the test
- **Status Badge**: Indicates whether the report is completed or pending

##### Report Status Indicators
Reports are marked with one of two statuses:
- **Completed**: The test has been performed and results are finalized
- **Pending**: The test has been ordered but results are not yet available

##### Reading Report Content
The content section of each report card contains a summary of the findings or results. This may include:
- Numerical test values with reference ranges
- Qualitative findings from imaging studies
- Interpretations from specialists

#### Loading States
- When reports are being retrieved, you'll see a spinning loader
- If no reports exist for this consultation, you'll see a "No reports available" message

#### Understanding Report Information

**Test Names and Types**
Reports are labeled with standardized names that indicate:
- The type of test performed (e.g., CBC, MRI, CT Scan)
- The body system or region examined
- The specific parameters measured

**Date Information**
The date shown represents when the test was performed, not necessarily when results were received or reviewed.

**Report Content**
The content section provides a summary of key findings. For detailed information:
- Review the full report in the patient's medical record
- Check specific values against reference ranges
- Consult with specialists for interpretation when needed

#### Troubleshooting

**Issue**: Reports not loading
- Check your internet connection
- Refresh the page
- Verify that the correct consultation is selected

**Issue**: Expected reports not appearing
- Confirm that the tests have been ordered in the system
- Check with the laboratory or imaging department for status
- Verify that results have been uploaded to the electronic medical record

#### Best Practices
- Review all available reports before finalizing diagnosis
- Compare current results with previous values when available
- Consider the clinical context when interpreting results
- Follow up on any pending reports
