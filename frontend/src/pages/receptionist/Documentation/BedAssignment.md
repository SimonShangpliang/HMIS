# BedAssignment Component Documentation

## Overview

The `BedAssignment` component is a React-based interface for managing hospital bed assignments. It provides functionality for healthcare staff to assign patients to beds, discharge patients from beds, and visualize bed occupancy status across different rooms.

## Component Structure

This component utilizes React hooks for state management and Axios for API interactions. It features:
- Room selection dropdown
- Visual bed occupancy grid
- Interactive bed assignment/discharge modal
- Loading states with visual indicators
- Error handling and notification system

## State Management

The component maintains several state variables:

| State | Type | Purpose |
|-------|------|---------|
| `selectedRoom` | Number | Currently selected room number |
| `beds` | Object | Stores bed data for the selected room (occupancy status, patient and nurse IDs) |
| `selectedBed` | String/Number | Currently selected bed identifier |
| `patientForm` | Object | Form data for patient and nurse assignment |
| `showModal` | Boolean | Controls visibility of the assignment/discharge modal |
| `modalAction` | String | Determines modal mode ('assign' or 'discharge') |
| `roomList` | Array | List of available rooms with their types |
| `loading` | Boolean | Tracks initial data loading state |
| `error` | String | Stores error messages |
| `actionLoading` | Boolean | Tracks API request status during bed operations |

## API Integration

The component connects to a backend service with the following endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/reception/rooms` | GET | Fetches available rooms |
| `/api/reception/beds` | GET | Retrieves bed information for a specific room |
| `/api/reception/assign-bed` | POST | Assigns a patient to a bed |
| `/api/reception/discharge-bed` | POST | Discharges a patient from a bed |

## Key Functions

### `fetchRooms()`
Fetches available rooms from the API and sets default room selection.

```javascript
const fetchRooms = async () => {
  setLoading(true);
  setError('');
  try {
    const response = await axios.get('http://localhost:5000/api/reception/rooms');
    setRoomList(response.data);
    if (response.data.length > 0) {
      setSelectedRoom(response.data[0].room_number);
    }
  } catch (err) {
    console.error('Error fetching room list:', err);
    setError('Failed to fetch room list.');
  } finally {
    setLoading(false);
  }
};
```

### `fetchRoomBeds()`
Retrieves and formats bed data for the selected room.

### `handleBedClick(bedId)`
Handles bed selection and determines the modal action based on bed occupancy status.

### `handleAssignBed()`
Processes bed assignment requests and updates the UI accordingly.

### `handleDischargeBed()`
Processes patient discharge requests and updates the UI accordingly.

## UI Components

The component renders:
1. Room selection dropdown
2. Error notification area (conditional)
3. Interactive bed grid with color-coded occupancy status
4. Legend explaining the color coding
5. Modal for bed assignment/discharge with appropriate form fields
6. Loading indicators for various operations

## Error Handling

The component implements error handling at multiple levels:
- API request errors with descriptive messages
- Auto-dismissing error notifications after 5 seconds
- Fallback to empty state when data fetching fails
- Proper loading states during asynchronous operations

## Styling

The component uses Tailwind CSS for styling:
- Responsive grid layout for bed display
- Color-coded bed status indicators
- Modal overlay with focus styling
- Loading spinners for both initial loading and action states
- Interactive hover effects for bed selection

