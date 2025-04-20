# DocConsultationBills Component Documentation

## Technical Documentation

### Overview
The `DocConsultationBills` component displays billing information related to a specific medical consultation. It shows a list of bills with their details including bill number, date, payment status, line items, and total amount.

### Dependencies
- React (with Hooks)
- Tailwind CSS for styling

### Component Structure
```jsx
import React, { useState, useEffect } from "react";

const DocConsultationBills = ({ consultationId }) => {
  // Component implementation
};

export default DocConsultationBills;
```

### Props
- `consultationId` (String/Number): Unique identifier for the consultation whose bills should be displayed

### State Management
- `bills`: Array of bill objects fetched from the API
- `loading`: Boolean flag indicating whether data is currently being fetched

### Key Functions

#### `fetchBillsByConsultationId(consultationId)`
- **Purpose**: Retrieves bills associated with a specific consultation
- **Parameters**: `consultationId` (String/Number) - Unique identifier for the consultation
- **Returns**: Promise that resolves to an array of bill objects
- **Note**: Currently implemented as a mock function with simulated delay

#### `loadBills()`
- **Purpose**: Async function that manages the loading state, calls the fetch method, and handles errors
- **Called by**: useEffect hook on component mount and consultationId changes
- **Error Handling**: Logs errors to console and updates loading state

### Data Structure
Each bill object contains:
```javascript
{
  id: Number,           // Unique bill identifier
  billNumber: String,   // Human-readable bill number
  date: String,         // Date in YYYY-MM-DD format
  amount: Number,       // Total bill amount
  status: String,       // Payment status ('paid' or other values)
  items: [              // Array of line items
    {
      description: String, // Description of the service or product
      amount: Number       // Cost of the individual item
    }
  ]
}
```

### UI Components
- Loading spinner during data fetch
- Empty state message when no bills are available
- Bill card for each bill containing:
  - Header with bill number, date, and status badge
  - Line items table with descriptions and amounts
  - Total amount summary

### Conditional Rendering
- Shows loading spinner when `loading` is true
- Shows "No bills available" message when `bills` array is empty
- Renders bill cards when bills are available

### Styling
- Uses Tailwind CSS for responsive design
- Status badges are color-coded (green for paid, yellow for pending)
- Clean table-like layout for line items
- Subtle borders and background colors to distinguish sections

### Implementation Notes
- The fetch function is currently mocked and should be replaced with actual API calls
- Error handling is minimal, showing only console errors
- Component assumes consultationId will be provided as a prop

### Future Improvements
- Add ability to download/print bills
- Implement pagination for multiple bills
- Add filtering options (by date, status, etc.)
- Enhance error handling with user-facing error messages
- Add bill action buttons (mark as paid, send reminder, etc.)

---

## User Documentation

### Consultation Billing System

#### Overview
The Consultation Bills section displays all financial transactions associated with a specific patient consultation. Here you can view detailed billing information including payment status, itemized charges, and total amounts.

#### The Bills Display

When viewing a patient's consultation, you'll see the Bills section which includes:

##### Bill Card
Each bill is displayed as a card containing:
- **Bill Number**: A unique identifier for the bill (e.g., BILL-2025-001)
- **Date**: When the bill was generated
- **Status Badge**: 
  - Green badge for "Paid" bills
  - Yellow badge for "Pending" bills
- **Itemized Charges**: Breakdown of individual services or products
- **Total Amount**: The sum of all charges

##### Loading States
- When bills are being retrieved, you'll see a spinning loader
- If no bills exist for this consultation, you'll see a "No bills available" message

#### Understanding Bill Status

Bills are marked with one of two statuses:
- **Paid**: Payment has been received and processed
- **Pending**: Payment is still awaited

#### Reading Bill Details

Each bill contains itemized entries showing:
- **Item Description**: Name of the service provided or product dispensed
- **Amount**: The cost of the individual item

All amounts are displayed in dollars with two decimal places.

#### Troubleshooting

**Issue**: Bills not loading
- Check your internet connection
- Refresh the page
- Verify that the correct consultation is selected

**Issue**: Missing bill information
- Ensure that billing has been completed for this consultation
- Contact the billing department if you believe there's an error

