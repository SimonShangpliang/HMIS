# Add Bills Component: Technical Documentation

## Overview
The Add Bills component is a React-based interface for healthcare billing operations. It allows staff to create itemized bills for patients by adding various healthcare services, including consultations, medical tests, prescriptions, and custom services. The component also supports insurance integration for partial payment processing.

## Key Features
- Patient-specific billing
- Integration with patient medical history
- Support for insurance claim processing
- Dynamic calculation of bill totals
- Itemized billing for different service types
- Real-time feedback and validation

## Component Structure

### State Management
The component uses multiple React hooks to manage state:
- `formData`: Tracks the patient ID, total amount, and services added to the bill
- `currentService`: Manages the currently being added custom service
- `availableRooms`: Stores room data for room charges
- `patientConsultations`: Contains the patient's consultation history
- `patientBills`: Tracks existing bills for the patient
- `billableItems`: Organizes unbilled consultations, reports, and prescriptions
- `patientInsurance`: Stores patient's insurance information
- `selectedInsurance`: Tracks the insurance policy selected for claims
- `insurancePayments`: Records payments made by insurance providers

### Dependencies
- React
- Axios for HTTP requests
- Environment variables for API endpoints

## API Integration

### Endpoints Used
1. `${import.meta.env.VITE_API_URL}/patients/${patientId}/consultations` - Fetch patient consultations
2. `${import.meta.env.VITE_API_URL}/insurance/${patientId}/insurances` - Fetch patient insurance
3. `http://localhost:5000/api/reception/rooms` - Fetch available rooms
4. `${import.meta.env.VITE_API_URL}/billing/detailed/patient/${patientId}` - Fetch patient bills
5. `${import.meta.env.VITE_API_URL}/billing` - Create a new bill
6. `${import.meta.env.VITE_API_URL}/billing/${billId}/items` - Add items to a bill
7. `${import.meta.env.VITE_API_URL}/billing/${billId}/payments-list` - Add payments to a bill
8. `${import.meta.env.VITE_API_URL}/consultations/update/${consultId}` - Update consultations with bill ID

### Request/Response Handling
- API requests are made asynchronously using fetch and axios
- Response data is processed and stored in component state
- Error handling is implemented for API failures

## Component Workflow

### 1. Patient Lookup
- User enters patient ID
- Component fetches patient consultations, bills, and insurance information
- Billable items are identified and categorized

### 2. Service Selection
- User can select from unbilled consultations, reports, and prescriptions
- Each selection adds the service to the bill with a default price
- Custom services can be added manually

### 3. Insurance Processing
- User can select an available insurance policy
- "Call Insurance" simulates insurance claim processing
- Insurance coverage reduces the patient's portion of the bill

### 4. Bill Creation
- On form submission, bill and related items are created via API
- Consultation records are updated with the new bill ID
- Insurance payments are recorded
- Form is reset after successful submission

## Data Models

### Service Item Structure
```javascript
{
  item_type: string,         // 'consultation', 'test', 'medication', 'procedure', 'room_charge', 'other'
  item_description: string,  // Description of the service
  price: string,             // Price as string with 2 decimal places
  quantity: number,          // Number of items
  consult_id?: string,       // ID for consultation items
  report_id?: string,        // ID for test report items
  prescription_id?: string,  // ID for medication items
  room_id?: string,          // ID for room charge items
  originalItem?: object      // Reference to the original data object
}
```

### Insurance Payment Structure
```javascript
{
  id: number,                      // Temporary ID for UI
  insurance_id: string,            // Insurance policy ID
  insurance_provider: string,      // Name of insurance provider
  policy_number: string,           // Policy number
  amount: string,                  // Amount covered by insurance
  payment_date: Date,              // Date of payment
  payment_method: string,          // 'insurance'
  status: string                   // 'success', 'pending', etc.
}
```

## Form Validation
- Validates required fields before submission
- Prevents duplicate items from being added
- Ensures at least one service is added before submission
- Validates insurance selection before claim processing

## UI Components
- Responsive grid layout
- Tabular display for bill items
- Card-based UI for billable items
- Form inputs with validation
- Status indicators for bill progress

## Error Handling
- API error handling with user feedback
- Validation errors with specific messages
- Console error logging for debugging

## Performance Considerations
- On-demand data fetching based on patient ID
- Efficient state management
- Optimized re-renders

