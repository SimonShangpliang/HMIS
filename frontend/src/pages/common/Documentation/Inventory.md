# Inventory Component Documentation

## Overview
The `Inventory` component is used to manage medicines and equipment inventory. It supports adding, updating, and viewing inventory items.

## Features
- Toggle between medicine and equipment inventory.
- Add new medicines or equipment.
- Update existing inventory items.
- Search and filter inventory items.
- Handle pending requests for inventory orders.
- Update order status by the admin.

## Key UI Components
- **Search Bar**: Allows searching inventory items by name or ID.
- **Inventory List**: Displays a list of inventory items with their details.
- **Add/Update Modal**: Allows admins to add or update inventory items.
- **Pagination Controls**: Enables navigation through large inventories.

## Key Functionalities
### Fetching Inventory
- **Functionality**: Fetches inventory data based on the selected type (medicine or equipment).
- **API Endpoint**: `/api/inventory/search`.
- **Response Format**:
  ```json
  {
    "items": [
      {
        "id": "M001",
        "name": "Paracetamol",
        "manufacturer": "ABC Pharma",
        "quantity": 100,
        "status": "available"
      }
    ]
  }
  ```

### Adding Inventory
- **Functionality**: Allows admins to add new medicines or equipment.
- **Validation**:
  - Required fields: `Name`, `Quantity`, `Supplier`.
- **API Endpoint**: `/api/admin/update-inventory`.

### Updating Inventory
- **Functionality**: Allows admins to update existing inventory items.
- **Validation**:
  - Required fields: `Name`, `Quantity`, `Supplier`.

### Handling Orders
- **Functionality**: Pharmacists and pathologists can place orders for medicines and equipment, respectively.
- **Order Status**:
  - `Requested`: Order placed by the user.
  - `Ordered`: Order approved by the admin.
  - `Cancelled`: Order rejected by the admin.

### Updating Order Status
- **Functionality**: Allows admins to update the status of pending orders.
- **API Endpoint**: `/api/admin/update-order-status`.
- **Request Body**:
  ```json
  {
    "status": "ordered"
  }
  ```
- **Validation**:
  - Status must be one of `ordered` or `cancelled`.

## Props and State
### State Variables
- `inventoryType`: Current inventory type (`medicine` or `equipment`).
- `inventory`: List of inventory items.
- `updateForm`: Form data for updating inventory.
- `equipmentForm`: Form data for adding/updating equipment.

## Event Handlers
- **`handleAddInventory`**: Opens the form to add a new inventory item.
- **`handleUpdateInventory`**: Submits the form to update an inventory item.
- **`handleToggleStatus`**: Toggles the status of an inventory item.
- **`handleUpdateOrderStatus`**: Updates the status of a pending order.

## Roles and Permissions
- **Admin**: Full access to manage inventory and update order statuses of pending requests.
- **Pharmacist**: Can place orders for medicines.
- **Pathologist**: Can place orders for equipment.

## Error Handling
- Displays error messages for invalid form submissions.
- Handles API errors gracefully.

## Dependencies
- `axios`: For API calls.

## Example Usage
```jsx
import Inventory from './Inventory';

function App() {
  return <Inventory />;
}
```
