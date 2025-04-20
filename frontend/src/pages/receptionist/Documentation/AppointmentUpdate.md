# AppointmentUpdate Component Documentation

## Overview

The `AppointmentUpdate` component is a React-based form interface designed for updating existing medical appointments in a healthcare system. It provides a user-friendly interface for staff to modify appointment details such as doctor assignments, scheduling times, dates, and room allocations.

## Component Structure

The component is built using React with hooks for state management, featuring:
- Form input fields for appointment details
- Auto-fetching functionality based on appointment ID
- Loading states with user feedback
- Success/error messaging system
- Responsive grid layout for optimal display on different devices

## State Management

The component uses the following state hooks:

| State | Type | Purpose |
|-------|------|---------|
| `formData` | Object | Stores all appointment fields (appointmentId, doctorId, time, roomNo, date) |
| `isLoading` | Boolean | Tracks API request status for UI feedback |
| `message` | Object/null | Displays success/error notifications |

## Key Functions

### `handleChange(e)`
Manages form field updates for most input fields.


### `fetchAppointmentDetails(id)`
Retrieves appointment data based on ID. Currently implemented with a mock API call but designed to be replaced with actual API integration.



### `handleAppointmentIdChange(e)`
Special handler for appointment ID field that triggers auto-fetching when ID reaches sufficient length.

### `handleSubmit(e)`
Form submission handler that processes the update request.

## UI Components

The component renders:
1. Notification banner (conditional based on message state)
2. Two-column responsive form layout
3. Input fields with proper validation attributes
4. Submit button with loading state

## Styling

The component uses Tailwind CSS for styling with:
- Responsive grid layout (`grid-cols-1 md:grid-cols-2`)
- Form styling with focus states
- Color-coded notification banners
- Disabled button states during loading

