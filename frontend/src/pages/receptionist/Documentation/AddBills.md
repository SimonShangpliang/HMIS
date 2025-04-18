# AddBills Component Documentation

## User Documentation

### Overview
The AddBills component is a user interface for creating and managing patient billing records in a healthcare system. It allows staff to add detailed billing information including patient identification, multiple billable services, and payment status tracking.

### Features
- **Patient Information**: Enter patient ID and bill generation date
- **Service Management**: Add multiple services to a bill with different categories
- **Dynamic Form Fields**: Fields change based on service type (consultation, medication, test, room charge)
- **Automatic Calculation**: Bill total is calculated automatically as services are added
- **Service Review**: View and remove added services before finalizing the bill
- **Payment Status Tracking**: Mark bills as pending, paid, or partially paid

### How to Use

1. **Enter Basic Information**:
   - Input the patient's ID
   - Verify the generation date (defaults to current date)
   - Select payment status (defaults to pending)

2. **Add Services**:
   - Select service type (consultation, medication, procedure, room charge, test, other)
   - Input relevant ID (e.g., consultation ID for consultations)
   - Enter service description and price
   - Click "Add Service"
   - Repeat for all services to include in the bill

3. **Review Added Services**:
   - Check the table of added services
   - Remove any incorrect entries if needed
   - Verify the automatically calculated total amount

4. **Save the Bill**:
   - Click "Save Bill" to finalize and submit the bill

## Technical Documentation

### Component Structure
`AddBills` is a React functional component that uses React hooks for state management.

### State Management
The component uses two main state objects:
1. `formData`: Tracks the overall bill information
   ```javascript
   {
     patient_id: string,
     generation_date: string (YYYY-MM-DD),
     total_amount: string,
     payment_status: string ('pending', 'paid', 'partially_paid'),
     services: array
   }
   ```

2. `currentService`: Manages the form for adding new services
   ```javascript
   {
     item_type: string,
     item_description: string,
     consult_id: string,
     report_id: string,
     prescription_id: string,
     room_id: string,
     price: string
   }
   ```

### Key Functions

#### `handleInputChange`
Updates the main form data when inputs change.

#### `handleServiceChange`
Updates the current service form data when service inputs change.

#### `addService`
- Validates service inputs
- Calculates new total amount
- Adds service to the services array
- Resets service form

#### `removeService`
- Removes a service by index
- Recalculates total amount

#### `handleSubmit`
- Prevents default form submission
- Logs form data (placeholder for API integration)
- Displays success alert

#### `renderDynamicFields`
Conditionally renders different form fields based on selected service type.



