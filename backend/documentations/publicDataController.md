# 📘 Public Data Controller Documentation

This documentation provides an overview of the API functionality for exporting filtered medical consultation data in a ZIP format.

---

## 📁 Endpoints

### 1. 📦 Download Medical Data as ZIP

**Endpoint:**  
`GET /api/public-data`

**Description:**  
Downloads a ZIP archive containing medical data (consultations, reports, prescriptions, and patient vitals) filtered by disease diagnosis and date range.

**Query Parameters:**

| Parameter | Type   | Required | Description                                    |
| --------- | ------ | -------- | ---------------------------------------------- |
| disease   | string | ✅ Yes   | Disease name to filter consultations           |
| startTime | date   | ✅ Yes   | Start date for filtering (ISO format)          |
| endTime   | date   | ✅ Yes   | End date for filtering (ISO format)            |

**Example Request:**
- `/api/public-data?disease=Diabetes&startTime=2025-01-01&endTime=2025-04-15`

**Success Response:**
- `200 OK`: Returns a ZIP file containing the requested medical data organized by consultation.

**Failure Responses:**
- `400 Bad Request`: If any required parameters are missing.
- `500 Internal Server Error`: On server failure during ZIP creation.

---

## 📦 ZIP File Structure

The generated ZIP archive contains data organized by consultation, with the following structure:

```
consultation-{consultationId}/
├── reports/
│   ├── report-1.txt
│   ├── report-2.txt
│   └── ...
├── prescription-{prescriptionId}.csv
├── prescription-{prescriptionId}-info.txt
└── vitals.csv
```

### Report Files (Text Format)
Each report contains:
- Report number
- Title and description
- Status
- Creation and update timestamps
- Report content text

### Prescription Files
For each prescription:
- **CSV file** containing medicine entries with:
  - Medicine ID
  - Dosage
  - Frequency
  - Duration
  - Quantity
  - Dispensed quantity
- **Info text file** containing:
  - Prescription ID
  - Date
  - Status

### Vitals File (CSV Format)
Patient vitals within the specified date range, including:
- Date
- Time
- Blood pressure
- Body temperature
- Pulse rate
- Breathing rate



## ⚙️ Technologies Used

- **Node.js**
- **Express.js**
- **MongoDB with Mongoose**
- **archiver** - For ZIP file creation
- **csv-writer** - For generating CSV files

---

## 📁 Folder Structure (Relevant)
```
/models
  └── consultation.js (Consultation & Prescription models)
  └── patient.js (Patient model)
/controllers
  └── publicDataController.js
/routes
  └── public.routes.js
/middleware
  └── authMiddleware.js
server.js 
```

---

## 🛠️ Developer Notes

- The controller creates a temporary directory for file generation if it doesn't exist
- ZIP compression level is set to 6 (balanced between size and speed)
- Empty placeholder files are created when no data is available
- All temporary files are automatically cleaned up after download
- The system filters consultations by the specified disease and date range
- Patient vitals are also filtered to match the specified date range
- The controller handles population of related data (patient_id, prescription)
- Authentication is required for accessing all data routes
- Error handling includes proper resource cleanup and informative messages
- If no matching consultations are found, a simple text file is included explaining this
- The API is designed to handle large data sets efficiently through streaming
