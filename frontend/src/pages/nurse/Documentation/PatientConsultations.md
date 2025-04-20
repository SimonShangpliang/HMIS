# Detailed Documentation of PatientConsultations Component
## Component Overview

The `PatientConsultations` component implements a comprehensive view of a patient's consultation history in the hospital management system. It provides nursing staff with a tabular list of all consultations for a specific patient, including key details such as doctor information, appointment timing, status, and reason for visit. The component fetches both patient profile data and consultation records from backend APIs, transforming them into a structured format for display. It also offers navigation controls to view detailed information about specific consultations or to access the patient's daily progress records.

## State Management

The component maintains four key state objects to handle component behavior and data:

```jsx
const [consultations, setConsultations] = useState([]);
const [patient, setPatient] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
```

This state structure encapsulates:

- `consultations`: An array containing the formatted consultation records
- `patient`: An object containing the patient's basic information
- `loading`: A boolean flag to track data fetching status
- `error`: A string to store error messages from data fetching operations

This approach enables the component to handle different rendering states based on the data loading progress and success/failure status.

## Constants and Utilities

The component defines a utility object for visual styling based on consultation status:

```jsx
// Status colors for visual indication
const statusColors = {
  scheduled: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};
```

This implementation:

1. Maps each possible consultation status to specific background and text color classes
2. Enables consistent visual styling across the component
3. Provides intuitive color-coding (yellow for scheduled, green for completed, red for cancelled)

This approach centralizes styling logic for maintainability and consistency.

## Route and Navigation Implementation

The component implements route parameter access and navigation capabilities:

```jsx
const { patientId } = useParams();
const navigate = useNavigate();

// Handle back button click
const handleBackClick = () => {
  navigate('/nurse/patient-records');
};

// Navigate to daily progress
const handleDailyProgressClick = () => {
  navigate(`/nurse/patient-progress/${patientId}`);
};

// View consultation details function
const viewConsultationDetails = (consultId) => {
  // Navigate to the shared consultation view component
  navigate(`/nurse/patient-consultations/${consultId}`);
};
```

This implementation:

1. Utilizes React Router's `useParams` hook to extract the patient identifier from the URL
2. Employs the `useNavigate` hook to enable programmatic navigation
3. Defines multiple navigation functions for different destinations:
   - Back navigation to the patient records list
   - Navigation to the patient's daily progress records
   - Navigation to detailed view for a specific consultation

This approach enables contextual navigation based on the current patient and selected consultation.

## Data Fetching Implementation

The component implements two separate API data retrieval functions:

```jsx
// Fetch patient details
const fetchPatientDetails = async () => {
  try {
    // TODO: Replace with actual API call
    const response = await fetch(`${import.meta.env.VITE_API_URL}/patients/profile/${patientId}`);
    const data = await response.json();
    
    // Mock data for now
    const patientData = {
      id: parseInt(patientId),
      name: data.name,
      contact: data.phone_number
    };
    
    setPatient(patientData);
  } catch (error) {
    console.error("Failed to fetch patient details:", error);
    setError("Failed to load patient information");
  }
};

const fetchConsultations = async () => {
  try {
    setLoading(true);
    const response = await fetch(`${import.meta.env.VITE_API_URL}/patients/${patientId}/consultations`);
    const data = await response.json();

    // Normalize consultations for display
    const formattedConsultations = data.map((consult) => ({
      consult_id: consult._id,
      patient_id: consult.patient_id,
      doctor_id: consult.doctor?.id || consult.doctor_id,
      doctor_name: consult.doctor?.name || "Unknown Doctor",
      booked_date_time: consult.booked_date_time,
      status: consult.status,
      reason: consult.reason || "N/A",
      created_by: consult.createdBy || null,
      created_at: consult.createdAt,
      actual_start_datetime: consult.actual_start_datetime || null,
      remark: consult.remark || "",
      diagnosis: consult.diagnosis?.map(d => d.name).join(', ') || "",
      bill_id: consult.bill_id || null, // if exists
      prescription: consult.prescription?.length > 0,
      reports: consult.reports?.length > 0,
      recordedAt: consult.recordedAt || null
    }));

    setConsultations(formattedConsultations);
    setLoading(false);
  } catch (error) {
    console.error("Failed to fetch consultations:", error);
    
    setLoading(false);
  }
};

useEffect(() => {
  fetchPatientDetails();
  fetchConsultations();
}, [patientId]);
```

This implementation:

1. Defines separate asynchronous functions for fetching patient details and consultations
2. Sets loading state during the consultations fetch operation
3. Makes API calls to fetch data using environment variable for API URL
4. Transforms API response data into structured formats for display
5. Implements comprehensive data normalization with fallback values for potentially missing fields
6. Updates component state with the fetched data
7. Implements error handling with console logging and user-friendly error messages
8. Uses useEffect to execute both fetch operations when component mounts and when patientId changes

The data transformation in `fetchConsultations` is particularly extensive, handling potential missing or nested data with optional chaining, default values, and array transformations.

## Helper Functions Implementation

The component implements a utility function for date formatting:

```jsx
// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleString();
};
```

This implementation:

1. Handles null or undefined date values with a default "N/A" return
2. Converts valid date strings to JavaScript Date objects
3. Formats dates using the browser's locale settings for consistent display

This approach encapsulates date formatting logic in a reusable function while providing fallback handling for missing data.

## Conditional Rendering Implementation

The component implements conditional rendering based on the error state:

```jsx
if (error) {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
        <p className="text-gray-700">{error}</p>
        <button 
          onClick={handleBackClick}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}
```

This implementation:

1. Uses early return pattern for error state to simplify the main render logic
2. Centers error content both horizontally and vertically for better user experience
3. Displays a prominent error title with appropriate coloring
4. Shows the specific error message
5. Provides a navigation button for recovery

Additionally, the component implements conditional rendering for loading and empty states within the table:

```jsx
{loading ? (
  <div className="p-6 text-center">
    <p className="text-gray-600">Loading consultations...</p>
  </div>
) : consultations.length === 0 ? (
  <div className="p-6 text-center">
    <p className="text-gray-600">No consultations found for this patient.</p>
  </div>
) : (
  <div className="overflow-x-auto">
    <table className="w-full">
      {/* Table content */}
    </table>
  </div>
)}
```

This approach ensures users receive appropriate feedback about the content state at every stage of the data loading process.

## Rendering Logic

The component implements a structured rendering approach with distinct sections:

### Main Container and Header

```jsx
<div className="bg-gray-100 min-h-screen p-6">
  {/* Header Section */}
  <div className="max-w-6xl mx-auto">
    <div className="flex justify-between items-center mb-6">
      <button 
        onClick={handleBackClick}
        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md flex items-center"
      >
        <span>← Back to Patients</span>
      </button>
      
      <h1 className="text-2xl font-bold text-gray-800">
        Patient Consultations
      </h1>
      <button 
        onClick={handleDailyProgressClick}
        className="px-4 py-2 bg-green-100 text-green-800 font-medium rounded-md hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
      >
        <span>Daily Progress</span>
      </button>
      <div className="w-24"></div> {/* Empty div for flex spacing */}
    </div>
    
    {/* Content sections */}
  </div>
</div>
```

This section provides:

1. A full-height container with consistent padding and background color
2. Content width constraint with maximum width and auto margins
3. A flex layout for the header with space-between alignment
4. Back navigation button with hover effects
5. Centered heading for the content
6. Navigation button to daily progress with focus and hover states
7. Empty spacer div to maintain visual balance

### Patient Information Card

```jsx
{/* Patient Info Card */}
{patient && (
  <div className="bg-white rounded-lg shadow-md p-6 mb-6">
    <h2 className="text-xl font-semibold text-gray-800 mb-4">Patient Information</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <p className="text-sm text-gray-500">Patient ID</p>
        <p className="font-medium">P{patient.id.toString().padStart(3, '0')}</p>
      </div>
      <div>
        <p className="text-sm text-gray-500">Name</p>
        <p className="font-medium">{patient.name}</p>
      </div>
      <div>
        <p className="text-sm text-gray-500">Contact</p>
        <p className="font-medium">{patient.contact}</p>
      </div>
    </div>
  </div>
)}
```

This section implements:

1. Conditional rendering based on patient data availability
2. Card styling with shadow, rounded corners, and padding
3. Section heading with appropriate typography
4. Responsive grid layout that adapts to screen size
5. Consistent typography with small gray labels and medium-weight values
6. Formatted patient ID with padding for consistent display

### Consultations Table Header

```jsx
<div className="bg-white rounded-lg shadow-md overflow-hidden">
  <div className="p-6 border-b border-gray-200">
    <h2 className="text-xl font-semibold text-gray-800">
      Consultation History
    </h2>
  </div>
  
  {/* Table content with conditional rendering */}
</div>
```

This section implements:

1. Card styling with shadow, rounded corners, and hidden overflow
2. Section heading with appropriate typography and border separation
3. Container for the table content that follows

### Consultations Table Implementation

```jsx
<table className="w-full">
  <thead>
    <tr className="bg-gray-50">
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        Consult ID
      </th>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        Doctor
      </th>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        Date & Time
      </th>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        Status
      </th>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        Reason
      </th>
      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
        Actions
      </th>
    </tr>
  </thead>
  <tbody className="bg-white divide-y divide-gray-200">
    {consultations.map((consultation) => (
      <tr key={consultation.consult_id} className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap">
          <span className="font-medium text-gray-900">
            C{consultation.consult_id.toString().padStart(3, '0')}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className="text-gray-900">
            {consultation.doctor_name}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className="text-gray-900">
            {formatDate(consultation.booked_date_time)}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[consultation.status]}`}>
            {consultation.status.charAt(0).toUpperCase() + consultation.status.slice(1)}
          </span>
        </td>
        <td className="px-6 py-4">
          <span className="text-gray-900">
            {consultation.reason}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right">
          <button
            onClick={() => viewConsultationDetails(consultation.consult_id)}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-1 rounded transition-colors"
          >
            View
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

This section implements:

1. Semantic HTML table structure for proper accessibility
2. Styled table headers with uppercase text and subtle background
3. Dividers between table rows for visual separation
4. Row hover effect for better interaction feedback
5. Whitespace control for appropriate text wrapping
6. Formatted consultation ID with padding for consistent display
7. Formatted date using the helper function
8. Status pills with dynamic styling based on the status value
9. Text capitalization for status display
10. Right-aligned action buttons with hover effects
11. Click handlers for navigation to detailed views

The table implementation combines consistent styling with dynamic data rendering to create a comprehensive consultation history display.

## Main Processing Flow

The complete data flow within the component consists of:

1. Component initialization with loading state
2. Route parameter extraction to identify the specific patient
3. Parallel API calls to fetch patient details and consultation history
4. Data transformation for display purposes
5. Conditional rendering based on error, loading, and data availability states
6. Display of patient information and consultation records
7. User interaction for navigation to detailed views or related screens

This implementation creates a comprehensive interface for nurses to efficiently view a patient's consultation history while providing appropriate loading states, error handling, and user-friendly navigation options.