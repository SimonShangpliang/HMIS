# 📊 Analytics API Documentation

This documentation provides an overview of the Analytics-related API endpoints in the system. These endpoints are responsible for generating statistics, tracking trends, and managing feedback, medicine, diagnosis, and performance data.

---

## 📁 Endpoints

### 1. 🔢 Department Rating
**Endpoint:** `GET /api/analytics/feedback/department-rating/:departmentId`

**Description:** Calculates average rating for a department.

**Success Response:**
```json
{
  "departmentRating": 4.5
}
```

---

### 2. 📋 All Feedbacks
**Endpoint:** `GET /api/analytics/feedback/all`

**Description:** Returns all user feedback.

**Success Response:**
```json
{
  "totalFeedbacks": 10,
  "feedbacks": [   ]
}
```

---

### 3. 🌟 Overall Rating
**Endpoint:** `GET /api/analytics/feedback/overall`

**Description:** Calculates the overall average rating from all feedback.

**Success Response:**
```json
{
  "overallRating": 4.2,
  "totalFeedbacks": 50
}
```

---

### 4. 📊 Doctor Rating Distribution
**Endpoint:** `GET /api/analytics/feedback/doctor`

**Description:** Returns distribution of doctor ratings in predefined ranges.

**Success Response:**
```json
{
  "success": true,
  "data": {
    "1.5-2.2": 2,
    "2.2-2.9": 5,
    
  }
}
```

---

### 5. 🗽 Feedbacks by Rating
**Endpoint:** `GET /api/analytics/feedbacks/rating/:rating`

**Description:** Gets all feedback comments that match a particular rating.

**Success Response:**
```json
{
  "rating": 4,
  "totalComments": 3,
  "comments": [  ]
}
```

**Additional Insight:** Semantic phrase extraction is used for clustering reviews. A boosted TF-IDF algorithm identifies keywords and trends.

---

### 6. 📊 Medicine Inventory Trends
**Endpoint:** `POST /api/analytics/medicine-trends`

**Description:** Provides monthly and weekly trend analysis for medicine inventory ordering and availability.

**Request Body:**
```json
{
  "medicineId": 1,
  "startDate": "2025-01-01",
  "endDate": "2025-04-01"
}
```

---

### 7. 📈 Medicine Prescription Trends
**Endpoint:** `POST /api/analytics/medicine-prescription-trends`

**Description:** Tracks prescription frequency over time for a given medicine.

**Backend Insights:** Uses aggregated prescription logs to analyze dispensing frequency weekly and monthly.

---

### 8. 🫏️ Bed Occupancy Trends
**Endpoint:** `POST /api/analytics/occupied-beds/:period`

**Description:** Displays weekly/monthly occupancy data per bed type (General, Private, etc.).

**Visualization:** Bar, line, and area charts used in frontend.

---

### 9. 🏥 Facility Statistics
**Endpoint:** `GET /api/analytics/facility-stats`

**Description:** Returns the count of rooms and total beds in the hospital.

**Use Case:** Visualizes infrastructure capacity for administrators.

---

### 10. 🩺 Doctor Performance (Quadrant)
**Endpoint:** `POST /api/analytics/doc-performance`

**Description:** Divides doctors into performance quadrants based on consultations and feedback ratings.

**Visualization:** Scatter plot for quadrant analysis.

---

### 11. 🏥 Department Performance (Quadrant)
**Endpoint:** `POST /api/analytics/dept-performance`

**Description:** Similar quadrant analysis at department level using feedback and consultation metrics.

---

### 12. 🕒 Doctor Working Trends
**Endpoint:** `GET /api/analytics/doctor-working`

**Description:** Shows weekly/monthly number of consultations for a doctor.

**Usage:** Helps in understanding consultation load.

---

### 13. 💰 Finance Trends
**Endpoint:** `POST /api/analytics/finance-trends`

**Description:** Aggregates payment data over time to track revenue trends.

**Backed by:** Bill and Payment schemas with status filtering.

---

### 14. 🦠 Top K Diseases
**Endpoint:** `POST /api/analytics/illness-trends/topk`

**Description:** Returns the most common diseases in a selected time range.

**Response:** Count and percentage of each diagnosis.

---

### 15. 📉 Disease Trends
**Endpoint:** `POST /api/analytics/illness-trends/disease-trends`

**Description:** Tracks diagnosis trends and age-wise distribution over time.

**Visualization:** Monthly and weekly breakdowns with age group filters.

---

### 16. 📊 Dashboard KPIs
**Endpoint:** `GET /api/analytics/dashboard/kpis`

**Description:** Returns real-time key metrics like patient counts, average rating, and revenue compared to last month.

**Backend Logic:** Aggregates consultation, billing, and feedback data.

---

### 17. 📊 Feedback Rating Distribution
**Endpoint:** `GET /api/analytics/feedback-rating-metrics`

**Description:** Distribution of feedback count per rating value (1–5).

---

## ⚙️ Technologies Used
- Node.js
- Express.js
- MongoDB with Mongoose

## 🛠️ Developer Notes
- All analytics endpoints are prefixed with `/api/analytics`
- Ensure request payloads match defined JSON formats
- Use appropriate date formats (ISO-8601) for all time filters
- Integrated with frontend visualizations using chart libraries like Chart.js and Recharts

