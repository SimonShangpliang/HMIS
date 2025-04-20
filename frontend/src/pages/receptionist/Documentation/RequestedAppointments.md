# RequestedAppointments Component Documentation

## Technical Documentation

### Overview
The `RequestedAppointments` component displays a list of requested consultations and allows the receptionist to approve or cancel them. It fetches data from the backend and provides real-time updates to the UI.

### Dependencies
- **React**: For building the component.
- **Axios**: For making API requests.
- **Lucide-react**: For icons used in action buttons.

### Component Structure
- **State Variables**:
  - `consultations`: Stores the list of consultation requests.
  - `loading`: Indicates whether data is being fetched.
  - `error`: Stores error messages, if any.
  - `processingIds`: Tracks IDs of consultations currently being processed.
- **Effect Hooks**:
  - `useEffect`: Fetches consultation requests on component mount.

### Props
This component does not accept any props.

### State Management
- **`consultations`**: Array of consultation objects fetched from the API.
- **`loading`**: Boolean flag indicating whether data is being fetched.
- **`error`**: String containing error messages for failed operations.
- **`processingIds`**: Set of IDs for consultations currently being processed.

### Key Functions
- **`fetchConsultations`**:
  - Fetches consultation requests from the backend.
  - Updates the `consultations` state with the fetched data.
  - Handles errors and updates the `error` state if the request fails.
- **`handleStatusUpdate`**:
  - Updates the status of a consultation (e.g., `scheduled`, `cancelled`).
  - Removes the consultation from the list upon successful update.
  - Handles errors and updates the `error` state if the request fails.
- **`formatDateTime`**:
  - Formats the date and time for display in a user-friendly format.
- **`getAppointmentTypeColor`**:
  - Returns the appropriate CSS classes for appointment type badges.

### Data Structure
- **Consultation Object**:
  ```json
  {
    "id": "123",
    "patient_name": "John Doe",
    "patient_id": "P001",
    "doctor_name": "Dr. Smith",
    "doctor_id": "D001",
    "appointment_type": "regular",
    "booked_date_time": "2023-10-01T10:00:00Z",
    "reason": "Follow-up for previous consultation"
  }
  ```

### UI Components
- **Table**:
  - Displays consultation details such as patient name, doctor name, appointment type, date & time, and reason.
- **Action Buttons**:
  - Approve (`Check` icon): Marks the consultation as `scheduled`.
  - Cancel (`X` icon): Marks the consultation as `cancelled`.
- **Loading Spinner**:
  - Displays a spinner while data is being fetched or actions are being processed.
- **Error Message**:
  - Displays error messages if data fetching or actions fail.

### Conditional Rendering
- **Loading State**:
  - Displays a spinner while data is being fetched.
- **Error State**:
  - Displays an error message if data fetching fails.
- **Empty State**:
  - Displays a message if no consultation requests are found.

### Styling
- Uses Tailwind CSS for responsive design and consistent styling.
- Color-coded badges for appointment types:
  - **Regular**: Purple
  - **Follow-up**: Indigo
  - **Emergency**: Red
  - **Consultation**: Teal

### API Integration
- **Endpoints**:
  - `GET /consultations/requested`: Fetches the list of requested consultations.
  - `PUT /consultations/:id/status`: Updates the status of a consultation.
- **Error Handling**:
  - Displays error messages for failed API requests.
  - Logs errors to the console for debugging.

### Future Improvements
- Add pagination for large datasets.
- Implement search and filtering functionality.
- Enhance error handling with user-friendly messages.
- Add confirmation dialogs for status updates.