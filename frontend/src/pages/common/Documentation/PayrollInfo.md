# PayrollInfo Component Documentation

## Overview
The `PayrollInfo` component displays payroll history for employees. It allows employees to view their salary details and download payslips.

## Features
- Displays payroll history in a tabular format.
- Shows details like basic salary, allowance, deduction, and net salary.
- Allows downloading payslips for paid salaries.
- Calculates total earnings and deductions.

## Key UI Components
- **Payroll Table**: Displays payroll records with details like salary components and status.
- **Download Button**: Allows downloading payslips for paid salaries.
- **Loading Indicator**: Displays a spinner while payroll data is being fetched.

## Key Functionalities
### Fetching Payroll Data
- **Functionality**: Fetches payroll history for the logged-in employee.
- **API Endpoint**: `/api/common/findPayroll`.
- **Response Format**:
  ```json
  {
    "payrolls": [
      {
        "month_year": "2023-10-01T00:00:00Z",
        "basic_salary": 50000,
        "allowance": 5000,
        "deduction": 2000,
        "net_salary": 53000,
        "payment_status": "paid"
      }
    ]
  }
  ```

### Downloading Payslips
- **Functionality**: Allows employees to download payslips for paid salaries.
- **Helper Function**: `downloadPayslip`.

## Props and State
### State Variables
- `payrollHistory`: List of payroll records.
- `loading`: Indicates if data is being fetched.
- `downloadingId`: Tracks the ID of the payslip being downloaded.

## Event Handlers
- **`handleDownload`**: Initiates the download of a payslip.
- **`calculateTotals`**: Calculates total earnings and deductions.

## Roles and Permissions
- **Employee**: Can view their payroll history and download payslips.

## Error Handling
- Displays error messages for API failures.
- Handles download errors gracefully.

## Customization
- **Status Colors**: Colors are dynamically assigned based on the payment status:
  - `Paid`: Green.
  - `Pending`: Yellow.
  - `Partially Paid`: Orange.

## Dependencies
- `axios`: For API calls.

## Example Usage
```jsx
import PayrollInfo from './PayrollInfo';

function App() {
  return <PayrollInfo />;
}
```
