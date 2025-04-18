# Profile Component Documentation

## Overview
The `Profile` component displays and manages user profile information. It supports viewing and editing personal and role-specific details.

## Features
- Displays personal information like name, email, phone number, and address.
- Shows role-specific details based on the user's role (e.g., doctor, nurse).
- Allows editing profile information, including bank details and role-specific fields.
- Provides a user-friendly interface for updating profile data.

## Key UI Components
- **Personal Information Section**: Displays general user details like name, email, and phone number.
- **Role-Specific Information Section**: Dynamically displays fields based on the user's role.
- **Edit Form**: Allows users to edit their profile information.
- **Save and Cancel Buttons**: Enables saving or discarding changes.

## Key Functionalities
### Viewing Profile
- **Functionality**: Displays personal and role-specific details.
- **Dynamic Fields**: Fields are dynamically rendered based on the user's role.
  - **Doctor**: Room number, specialization, qualification, and experience.
  - **Nurse**: Assigned department, location, and assigned room.
- **API Endpoint**: `GET /api/common/profile/:userType/:id`.

### Editing Profile
- **Functionality**: Allows users to edit their profile information.
- **Validation**:
  - Ensures required fields like `Name` and `Email` are filled.
  - Validates numeric fields like `Experience` and `Room Number`.
- **API Endpoint**: `PUT /api/common/profile/:userType/:id`.

### Saving Changes
- **Functionality**: Submits updated profile data to the server.
- **Validation**:
  - Only allows updating editable fields such as `name`, `phone_number`, `address`, and `profile_pic`.
  - Protects sensitive fields like `email`, `password`, `role`, and `salary`.
  - Allows updating specific bank details like `bank_name`, `ifsc_code`, and `branch_name`.

## Props and State
### State Variables
- `userData`: Stores the user's profile data.
- `isEditing`: Indicates if the profile is in edit mode.
- `editData`: Form data for editing the profile.
- `error`: Stores error messages for invalid submissions.

## Event Handlers
- **`handleEdit`**: Enables edit mode for the profile.
- **`handleSave`**: Submits the updated profile data to the server.
- **`handleCancel`**: Discards changes and exits edit mode.

## Roles and Permissions
- **Doctor**: Can view and edit details like room number, specialization, and experience.
- **Nurse**: Can view and edit details like assigned department and location.
- **Admin**: Can view all profile details but cannot edit.

## Error Handling
- Displays error messages for invalid form submissions.
- Handles API errors gracefully and provides feedback to the user.

## Dependencies
- `axios`: For API calls.
- `react`: For state management and rendering.

## Example Usage
```jsx
import Profile from './Profile';

function App() {
  return <Profile />;
}
```
