# Appointment Booking Component: Technical Documentation

## Overview
The Appointment Booking component is a React-based form designed for healthcare scheduling systems. It provides a streamlined interface for receptionists or healthcare staff to book appointments by collecting essential patient, doctor, and scheduling information.

## Key Features
- Simple and intuitive appointment scheduling
- Collection of both patient and doctor information
- Appointment type categorization
- Responsive design for various screen sizes
- Form validation for required fields

## Component Structure

### State Management
The component uses React's `useState` hook to manage form data with the following fields:
- `patientId`: Unique identifier for the patient
- `doctorId`: Unique identifier for the doctor
- `time`: Appointment time
- `roomNo`: Assigned room number
- `date`: Appointment date
- `patientName`: Name of the patient
- `doctorName`: Name of the doctor
- `appointmentType`: Category of appointment (Regular, Emergency, Follow-up, Consultation)

### Event Handlers
Two primary event handlers manage user interaction:
- `handleChange`: Updates individual form fields in response to user input
- `handleSubmit`: Processes the form submission, currently outputs to console and displays an alert

## Form Fields

| Field Name | Type | Validation | Description |
|------------|------|------------|-------------|
| patientId | text | Required | Unique identifier for the patient |
| patientName | text | Required | Full name of the patient |
| date | date | Required | Date of the appointment |
| time | time | Required | Time of the appointment |
| doctorId | text | Required | Unique identifier for the doctor |
| doctorName | text | Required | Full name of the doctor |
| roomNo | text | Required | Room number for the appointment |
| appointmentType | select | Required | Type of appointment (Regular, Emergency, Follow-up, Consultation) |

## UI Components
- Form container with responsive shadow and rounded corners
- Two-column layout on larger screens, single column on mobile
- Styled input fields with focus states
- Dropdown menu for appointment types
- Submission button with hover and focus states

## Form Validation
- Basic HTML validation using the `required` attribute
- Frontend validation ensures all fields are filled before submission
- Form reset functionality after successful submission
``

## Implementation Details

### Styling
- Uses Tailwind CSS for styling
- Responsive grid layout (one column on mobile, two columns on larger screens)
- Consistent color scheme with teal as the primary accent color
- Focus states for improved accessibility

### Form Submission
Currently, the form submission:
1. Prevents default form submission behavior
2. Logs the form data to the console
3. Displays a success alert
4. Resets all form fields to their initial state

