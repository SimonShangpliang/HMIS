# Calendar Component Documentation

## Overview

The `MyCalendar` component is a React functional component that provides a comprehensive calendar interface for managing medical appointments. It supports role-based access control, allowing different functionality for receptionists, doctors, and administrators.

## Features

- Role-based permissions and views
- Appointment creation, viewing, and updating
- Visual status indicators via color coding
- Multiple calendar views (month, week, day)
- Doctor filtering for admin and receptionist roles
- Detailed appointment information display

## File: `Calendar.jsx`

### Imports

```jsx
import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from 'axios';
import { Search } from 'lucide-react';
```

### Helper Functions

- `fetchConsultations(doctorId)`: Fetches consultation data from the API based on doctor ID.
- `updateConsultation(consultationId, updateData)`: Updates an existing consultation in the database.

### Calendar Configuration

- `localizer`: Uses momentLocalizer for date handling.
- `formats`: Custom date formatting for calendar headers.
- `statusColors`: Maps appointment statuses to specific colors for visual indication.

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

### `useEffect` Hook

Triggered when `userId`, `currentUserRole`, or `selectedDoctor` changes. It fetches appointment data based on the user's role and selected doctor.

### Event Handlers

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

- **Green** (#10b981): Scheduled appointments
- **Blue** (#3b82f6): Ongoing appointments
- **Indigo** (#6366f1): Completed appointments
- **Red** (#ef4444): Cancelled appointments

## Role-Based Access

- **Receptionist**: Full access to create and update appointments
- **Doctor**: Read-only access to view their appointments
- **Admin**: Read-only access with ability to filter by doctor

## Usage

This component assumes the user's role and ID are available from localStorage. For testing purposes, it currently uses hardcoded values (`userId: '10090'`, `currentUserRole: 'receptionist'`).

## API Integration

- `GET http://localhost:5000/api/common/calendar/doctor`: Retrieves appointments
- `POST http://localhost:5000/api/consultations/book`: Creates new appointments
- `PUT http://localhost:5000/api/consultations/update/:id`: Updates existing appointments

## Custom Styling

The component includes custom CSS for the calendar to enhance visual appearance, defined in a style tag that's appended to the document head.

## Example Routes

- `/doctor/calendar` - Shows Calendar for doctor.
- `/admin/calendar` - Shows Calendar for admin.
