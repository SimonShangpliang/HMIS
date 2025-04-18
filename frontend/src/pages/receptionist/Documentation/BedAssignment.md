# Bed Assignment Component Documentation

## User Documentation

### Overview
The Bed Assignment component is a tool designed for hospital staff to manage and track patient bed assignments within different rooms. It provides a user-friendly interface for assigning patients to beds, viewing occupancy status, and discharging patients.

### Features
- View available rooms and their types
- See bed availability within each room using a visual color-coded grid
- Assign patients to available beds
- Discharge patients from occupied beds
- Error notifications for failed operations

### How to Use

#### Viewing Rooms and Beds
1. Select a room from the dropdown menu in the top-right corner
2. The bed grid will display all beds in the selected room
3. Available beds appear in light gray
4. Occupied beds appear in light blue (cyan)

#### Assigning a Patient to a Bed
1. Click on an available (gray) bed
2. In the modal that appears, enter:
   - Patient ID
   - Nurse ID
3. Click "Assign" to complete the process
4. The bed color will change to cyan, indicating it's now occupied

#### Discharging a Patient
1. Click on an occupied (cyan) bed
2. Review the patient and nurse information in the modal
3. Click "Discharge" to free up the bed
4. The bed color will change to gray, indicating it's now available

### Troubleshooting
- If an error occurs, a red notification will appear and automatically disappear after 5 seconds
- If the system is loading, a spinning indicator will be displayed
- If the "Assign" or "Discharge" button seems unresponsive, wait for the current operation to complete

## Technical Documentation

### Component Structure
`BedAssignment` is a React functional component that manages bed assignments for hospital rooms.

### State Management
The component uses React's `useState` hook to manage several state variables:
- `selectedRoom`: Tracks which room is currently being viewed
- `beds`: Object containing information about each bed in the room
- `selectedBed`: Tracks which bed is selected for assignment/discharge
- `patientForm`: Stores patient and nurse ID data for assignment
- `showModal`: Controls modal visibility
- `modalAction`: Determines if modal is for assignment or discharge
- `roomList`: Stores all available rooms from API
- `loading`: Indicates when API data is being fetched
- `error`: Stores error messages from failed operations
- `actionLoading`: Controls loading state for assignment/discharge actions

### API Integration
The component interacts with a backend API at `http://localhost:5000/api/reception/` with the following endpoints:
- `GET /rooms`: Fetches all available rooms
- `GET /beds?room={roomNumber}`: Fetches beds for a specific room
- `POST /assign-bed`: Assigns a patient to a bed
- `POST /discharge-bed`: Discharges a patient from a bed

### Key Functions
- `handleBedClick`: Manages bed selection and determines modal action
- `handleInputChange`: Updates form data when user inputs information
- `handleAssignBed`: Makes API call to assign a patient to a bed
- `handleDischargeBed`: Makes API call to discharge a patient

### Data Structure
Bed data is structured as an object where:
- Keys are bed numbers/IDs
- Values are objects containing:
  - `occupied`: Boolean indicating if bed is in use
  - `patientId`: ID of assigned patient (or null)
  - `nurseId`: ID of assigned nurse (or null)

### Effect Hooks
The component uses `useEffect` hooks to:
1. Fetch room list on component mount
2. Fetch bed data when selected room changes
3. Auto-dismiss error messages after 5 seconds

