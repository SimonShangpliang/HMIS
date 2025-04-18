# Calendar Component Documentation

## Overview

The `MyCalendar` component is a React functional component that provides a comprehensive calendar interface for managing medical appointments. It supports role-based access control, allowing different functionality for receptionists, doctors, and administrators.

## Features

- Displays appointments in a calendar view.
- Role-based permissions and views.
- Appointment creation, viewing, and updating.
- Visual status indicators via color coding.
- Multiple calendar views (month, week, day).
- Doctor filtering for admin and receptionist roles.
- Detailed appointment information display.

## Key UI Components

- **Calendar View**: Displays appointments in month, week, or day views.
- **Add Appointment Modal**: Allows receptionists to add new appointments.
- **Update Appointment Modal**: Allows receptionists to update existing appointments.
- **Status Legend**: Displays color-coded statuses for appointments.

## Key Functionalities

### Fetching Consultations
- **Functionality**: Fetches consultations for a specific doctor.
- **API Endpoint**: `/api/common/calendar/doctor`.
- **Response Format**:
  ```json
  [
    {
      "id": "123",
      "title": "Consultation with John Doe",
      "start": "2023-10-01T10:00:00Z",
      "end": "2023-10-01T11:00:00Z",
      "status": "scheduled",
      "reason": "Routine checkup",
      "patientId": "P001",
      "appointment_type": "regular"
    }
  ]
  ```

### Adding Appointments
- **Functionality**: Allows receptionists to add new appointments using a modal form.
- **Validation**:
  - Required fields: `Doctor ID`, `Patient ID`, `Reason`.
- **API Endpoint**: `/api/consultations/book`.

### Updating Appointments
- **Functionality**: Allows receptionists to update existing appointments, including status and reason.
- **Validation**:
  - Required fields: `Doctor ID`, `Patient ID`, `Reason`.
- **API Endpoint**: `/api/consultations/update/:id`.

## Props and State

### State Variables

- `events`: Stores fetched appointments.
- `view`: Controls the current calendar view (month, week, day).
- `date`: Current displayed date in the calendar.
- `showPrompt`: Controls visibility of the appointment creation modal.
- `showUpdatePrompt`: Controls visibility of the appointment update modal.
- `loading`: Indicates data fetching state.
- `errorMessage`: Stores error messages for display.
- `selectedDoctor`: Stores doctor ID for filtering appointments.
- `selectedEvent`: Stores the currently selected event for editing.
- `formData`: Form data for creating new appointments.
- `updateFormData`: Form data for updating existing appointments.

## Event Handlers

- `handleSaveEvent()`: Creates a new appointment.
- `handleEventSelect()`: Handles selection of an existing appointment.
- `handleUpdateEvent()`: Updates an existing appointment.

### Rendering

- Calendar title and description
- Role-based buttons (Add Appointment only for receptionists)
- Doctor filter (for admin and receptionist roles)
- Status legend with color indicators
- Main calendar view with appropriate permissions
- Modal for creating new appointments
- Modal for updating existing appointments

### Conditional Rendering

- The "Add Appointment" button is only shown for receptionists
- Doctor search is only available for admin and receptionist roles
- Calendar interactivity (selecting dates/events) is enabled only for receptionists
- Different modals appear based on user actions

## Status Colors

- **Green** (#10b981): Scheduled appointments.
- **Blue** (#3b82f6): Ongoing appointments.
- **Indigo** (#6366f1): Completed appointments.
- **Red** (#ef4444): Cancelled appointments.

## Role-Based Access

- **Receptionist**: Full access to create and update appointments.
- **Doctor**: Read-only access to view their appointments.
- **Admin**: Read-only access with the ability to filter by doctor.

## Error Handling

- Displays error messages for invalid form submissions.
- Handles API errors gracefully.

## Dependencies

- `react-big-calendar`: For calendar UI.
- `moment`: For date manipulation.
- `axios`: For API calls.

## Example Usage

```jsx
import MyCalendar from './Calendar';

function App() {
  return <MyCalendar />;
}
```

## API Integration

- `GET /api/common/calendar/doctor`: Retrieves appointments.
- `POST /api/consultations/book`: Creates new appointments.
- `PUT /api/consultations/update/:id`: Updates existing appointments.

## Custom Styling

The component includes custom CSS for the calendar to enhance visual appearance, defined in a style tag that's appended to the document head.

## Example Routes

- `/doctor/calendar` - Shows Calendar for doctor.
- `/admin/calendar` - Shows Calendar for admin.
