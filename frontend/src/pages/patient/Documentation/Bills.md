# Bills Component Technical Documentation

## Overview
The `Bills` component is a comprehensive solution for managing patient billing records in a healthcare application. It provides functionality to view all bills for a patient, examine detailed bill information, track payment history, and process new payments. The component features a dual-view interface that toggles between a bills list and detailed bill information with payment management capabilities.

## Dependencies
- **React** (with Hooks for state management)
- **React Router DOM** (`useNavigate` for navigation)
- **Axios** (for API requests)
- **lucide-react** (for UI icons like `Home` and `X`)
- **Tailwind CSS** (for styling)

## Component Structure

```jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Home, X } from "lucide-react";
import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/billing`;

const Bills = () => {
  // Component implementation
};

export default Bills;
```

## State Management

The component uses multiple state variables to manage its functionality:

- `bills`: Array of bill records for the patient
- `selectedBill`: Currently selected bill ID for detailed view
- `billDetails`: Object containing detailed information about the selected bill
- `payments`: Array of payment records for the selected bill
- `loading`: Boolean indicating data fetching status
- `error`: String for error message display
- `showPaymentModal`: Boolean controlling payment modal visibility
- `newPayment`: Object representing form data for a new payment

## API Integration

The component interacts with a backend API for all data operations:

- Base URL is configured via environment variable: `${import.meta.env.VITE_API_URL}/billing`
- Currently uses a hardcoded patient ID (`10013`) which should be replaced with dynamic authentication data in production

## Key Functions

### Data Fetching

#### `fetchBills()`
- Fetches all bills for the current patient
- Called on component mount via `useEffect`
- Updates `bills` state on success
- Sets `error` state on failure

#### `fetchBillDetails()`
- Fetches detailed information and payment history for a selected bill
- Called via `useEffect` when `selectedBill` changes
- Makes parallel API calls for bill details and payments
- Updates `billDetails` and `payments` states on success

### UI Interaction

#### `handleView(billId)`
- Sets the selected bill ID to display detailed information
- Triggers the `fetchBillDetails` effect

#### `handleBack()`
- Clears the selected bill and returns to the bills list view
- Resets related states (`billDetails`, `payments`, `error`)

#### `formatAmount(amount)`
- Utility function to format currency values
- Adds rupee symbol (₹) and formats to 2 decimal places

#### `calculateSummary()`
- Computes billing summary statistics:
  - Total billed amount (from bill items)
  - Total paid amount (from successful payments)
  - Net balance (billed minus paid)
- Returns an object with `billed`, `paid`, and `net` properties

### Payment Management

#### `handlePaymentInputChange(e)`
- Form change handler for the payment modal
- Updates the `newPayment` state as user inputs values
- Handles special case for amount field (converting to Number)

#### `handleOpenPaymentModal()`
- Opens the payment modal
- Generates a unique transaction ID using timestamp

#### `handleClosePaymentModal()`
- Closes the payment modal without saving

#### `handleAddPayment()`
- Submits a new payment to the API
- Refreshes payment data and bill details on success
- Resets the payment form and closes the modal
- Handles errors appropriately

#### `handlePrintReceipt()`
- Placeholder function for receipt printing functionality
- Currently only logs to console

## Data Structures

### Bill Object
```javascript
{
  bill_id: String,         // Unique identifier
  date: String,            // Bill date (YYYY-MM-DD)
  bill_number: String,     // Bill reference number
  total_amount: Number,    // Total billed amount
  payment_status: String   // 'paid', 'partially_paid', 'pending'
}
```

### Bill Details Object
```javascript
{
  bill_id: String,         // Unique identifier
  referredBy: String,      // Referring doctor/provider
  generation_date: String, // Bill generation date
  bill_items: [            // Array of billable items
    {
      bill_item_id: String,
      item_type: { enum: String }, // 'service', 'medication', etc.
      item_description: String,
      item_amount: Number,
      quantity: Number
    }
  ]
}
```

### Payment Object
```javascript
{
  _id: String,                      // Unique payment identifier
  payment_date: String,             // Payment date (YYYY-MM-DD)
  payment_method: { enum: String }, // 'cash', 'card', 'bank_transfer'
  amount: Number,                   // Payment amount
  status: { enum: String },         // 'success', etc.
  transaction_id: String            // Transaction reference
}
```

### New Payment Form Object
```javascript
{
  amount: Number,          // Payment amount
  payment_method: String,  // Payment method
  payment_date: String,    // Payment date (YYYY-MM-DD)
  transaction_id: String,  // Auto-generated
  status: String           // Default: 'success'
}
```

## UI Components

### Bills List View
- Displays all bills for the patient in a list format
- Each bill shows date, bill number, total amount, and payment status
- Status is color-coded: green for paid, yellow for partially paid, red for pending
- "View Details" button for each bill

### Bill Details View
- Header with bill title and navigation back to bills list
- Bill header section with referring provider and bill date
- Billing items table with date, type, description, and amount columns
- Payments table with date, payment method, amount, and status/transaction info
- Summary section showing billed, paid, and balance amounts
- Action buttons for adding payments and printing receipts

### Payment Modal
- Form for adding new payments with fields for:
  - Amount
  - Payment method (dropdown: cash, card, bank transfer)
  - Payment date (date picker)
  - Transaction ID (auto-generated, read-only)
- Cancel and Add Payment buttons
- Form validation for required fields

## Conditional Rendering

The component uses conditional rendering extensively:

- Shows loading indicator when `loading` is true
- Displays error message when `error` is not null
- Toggles between bills list and bill details based on `selectedBill`
- Shows payment modal when `showPaymentModal` is true
- Renders appropriate content for empty states (no bills, no bill items, no payments)

## Error Handling

- API errors are caught and displayed to the user
- Loading states prevent interaction during data operations
- Form validation ensures proper data entry
- Console logging provides debugging information

## Styling

- Uses Tailwind CSS for responsive design and styling
- Dark headers for tables with lighter content rows
- Color-coded status indicators
- Consistent button styling with hover effects
- Modal overlay for focused user interaction
- Responsive layout with appropriate spacing

## Implementation Notes

- The patient ID is currently hardcoded as "10013" and should be replaced with a dynamic value from authentication or context
- The component uses environment variables for API configuration
- Transaction IDs are generated using the current timestamp
- Print receipt functionality is currently a placeholder
