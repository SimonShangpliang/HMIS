# ManagePayrolls Component Documentation

## Overview
The `ManagePayrolls` component is used to manage employee payrolls. It supports updating salaries, processing payrolls, and viewing payroll history.

## Features
- View and search employees with payroll details.
- Update salary components (basic salary, allowance, deduction).
- Process payrolls for selected employees.
- Display payroll history with the last processed date.

## Key UI Components
- **Employee Table**: Displays a list of employees with their payroll details.
- **Salary Update Popup**: Allows admins to update salary components for an employee.
- **Payroll Processing Button**: Processes payrolls for selected employees.

## Key Functionalities
### Fetching Payrolls
- **Functionality**: Fetches payroll details for all employees.
- **API Endpoint**: `/api/common/findPayroll`.
- **Response Format**:
  ```json
  {
    "payrolls": [
      {
        "employee_id": 123,
        "basic_salary": 50000,
        "allowance": 5000,
        "deduction": 2000,
        "net_salary": 53000,
        "month_year": "2023-10-01T00:00:00Z",
        "payment_status": "paid"
      }
    ]
  }
  ```

### Updating Salaries
- **Functionality**: Allows admins to update salary components for employees.
- **Validation**:
  - `Basic Salary`, `Allowance`, and `Deduction` must be non-negative numbers.
  - All fields are required.
- **API Endpoint**: `/api/admin/update-salary`.

### Processing Payrolls
- **Functionality**: Processes payrolls for selected employees.
- **API Endpoint**: `/api/admin/process-payroll`.
- **Response Format**:
  ```json
  {
    "message": "Payroll processed successfully"
  }
  ```

## Props and State
### State Variables
- `employees`: List of employees with payroll details.
- `selectedEmployees`: List of selected employees for payroll processing.
- `popupData`: Form data for updating salaries.
- `selectAll`: Boolean indicating if all employees are selected.
- `showPopup`: Boolean indicating if the salary update popup is visible.

## Event Handlers
- **`handleSelectAll`**: Toggles the selection of all employees.
- **`handlePopupSubmit`**: Submits the updated salary data to the server.
- **`handleProcessPayroll`**: Processes payrolls for the selected employees.

## Roles and Permissions
- **Admin**: Full access to manage payrolls.

## Customization
- **Dynamic Salary Calculation**: Automatically calculates net salary as:
  ```
  Net Salary = Basic Salary + Allowance - Deduction
  ```

## Error Handling
- Displays error messages for API failures (e.g., "Failed to process payroll").
- Validates salary fields before submission.

## Dependencies
- `axios`: For API calls.

## Example Usage
```jsx
import ManagePayrolls from './ManagePayrolls';

function App() {
  return <ManagePayrolls />;
}
```
