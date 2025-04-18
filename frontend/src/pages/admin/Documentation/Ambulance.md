# Ambulance Component Documentation

## Overview
The `Ambulance` component is used to manage ambulance details, including adding, updating, and decommissioning ambulances.

## Features
- Add new ambulances with details like vehicle number, driver ID, and nurse ID.
- Update ambulance status (active/inactive).
- Decommission ambulances.
- Search ambulances by vehicle number.
- Display a list of ambulances with their details.

## Key UI Components
- **Search Bar**: Allows searching ambulances by vehicle number.
- **Ambulance List**: Displays a list of ambulances with their details.
- **Add Ambulance Form**: Allows admins to add new ambulances.
- **Selected Ambulance Details**: Displays details of the selected ambulance.

## Key Functionalities
### Fetching Ambulances
- **Functionality**: Fetches the list of ambulances from the server.
- **API Endpoint**: `/api/facility/ambulances`.
- **Response Format**:
  ```json
  [
    {
      "vehicle_number": "AB123",
      "driver": "D001",
      "nurse_id": "N001",
      "status": "active"
    }
  ]
  ```

### Adding Ambulances
- **Functionality**: Allows admins to add new ambulances.
- **Validation**:
  - Required fields: `Vehicle Number`, `Driver ID`, `Nurse ID`.
- **API Endpoint**: `/api/facility/ambulance`.

### Updating Ambulance Status
- **Functionality**: Allows toggling ambulance status between active and inactive.

### Decommissioning Ambulances
- **Functionality**: Removes an ambulance from the system.
- **API Endpoint**: `/api/facility/ambulance/decommission`.

## Props and State
### State Variables
- `ambulances`: List of all ambulances.
- `filteredAmbulances`: List of ambulances filtered by the search query.
- `selectedAmbulance`: Currently selected ambulance for actions.
- `newAmbulance`: Form data for adding a new ambulance.

## Event Handlers
- **`handleAddAmbulance`**: Opens the form to add a new ambulance.
- **`handleAddFormSubmit`**: Submits the form to add a new ambulance.
- **`handleToggleStatus`**: Toggles the status of an ambulance.
- **`handleDecommission`**: Decommissions an ambulance.

## Roles and Permissions
- **Admin**: Full access to manage ambulances.

## Error Handling
- Displays error messages for invalid form submissions.
- Handles API errors gracefully.

## Dependencies
- `axios`: For API calls.

## Example Usage
```jsx
import ManageAmbulance from './Ambulance';

function App() {
  return <ManageAmbulance />;
}
```
