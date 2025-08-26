# 🏥 Hospital Management Information System (HMIS)

A comprehensive, full-stack Hospital Management Information System built using the **MERN Stack** (MongoDB, Express.js, React, Node.js). This system provides a complete digital solution for managing hospital operations, patient care, staff management, and administrative tasks with role-based access control and advanced analytics.

## 🌟 Notable Features

### Core Functionality
- **Multi-Role Authentication System** - Secure login for Patients, Doctors, Nurses, Pharmacists, Pathologists, Receptionists, and Administrators
- **Patient Management** - Complete patient records, medical history, vitals tracking, and bed assignment
- **Appointment Management** - Online booking, rescheduling, and real-time appointment tracking
- **Consultation Management** - Digital consultations, prescriptions, diagnosis, and treatment records
- **Medical Records** - Comprehensive EMR system with report generation and history tracking
- **Billing & Insurance** - Automated billing, insurance claim processing, and payment management
- **Inventory Management** - Medicine and equipment tracking with low-stock alerts
- **Staff Management** - Employee records, payroll processing, and performance tracking

### Advanced Features
- **Analytics Dashboard** - Real-time insights on patient trends, financial metrics, and hospital performance
- **AI Integration** - Gemini AI-powered chatbot for administrative assistance and decision support
- **Notification System** - Automated alerts for appointments, prescriptions, and critical updates
- **Queue Management** - Background job processing for emails and notifications using BullMQ
- **Document Generation** - Automated PDF generation for bills, reports, and prescriptions
- **Ambulance Management** - Vehicle tracking and emergency response coordination
- **Data Export** - CSV export functionality for reports and analytics

### Technical Features
- **Real-time Updates** - Live notifications and status updates
- **File Upload** - Cloudinary integration for profile pictures and document storage
- **Responsive Design** - Mobile-friendly interface with modern UI components
- **Security** - JWT authentication, password hashing, and role-based access control
- **Testing Suite** - Comprehensive test coverage using Vitest
- **Deployment Ready** - Configured for Vercel deployment with production optimizations

## 📁 Directory Structure

```
HMIS/
├── backend/                    # Express.js backend server
│   ├── config/                # Database and third-party service configurations
│   ├── controllers/           # Business logic handlers
│   │   ├── adminController.js
│   │   ├── analytics.controller.js
│   │   ├── authController.js
│   │   ├── doctorController.js
│   │   ├── employeeController.js
│   │   ├── patientController.js
│   │   └── [other role-based controllers]
│   ├── dist/                  # Built frontend files for production
│   ├── documentations/        # Technical documentation
│   │   ├── Schemas/          # Database schema documentation
│   │   ├── Validators/       # Input validation documentation
│   │   └── controllers/      # Controller documentation
│   ├── middleware/           # Authentication and validation middleware
│   ├── models/              # MongoDB schema definitions
│   │   ├── patient.js
│   │   ├── employee.js
│   │   ├── bill.js
│   │   ├── consultation.js
│   │   └── [other data models]
│   ├── queues/              # Background job definitions
│   ├── routes/              # API route definitions
│   │   ├── admin.routes.js
│   │   ├── patient.routes.js
│   │   ├── doctor.routes.js
│   │   └── [other route files]
│   ├── tests/               # Test files and configurations
│   ├── validators/          # Input validation schemas
│   ├── workers/             # Background job processors
│   ├── server.js           # Main server entry point
│   ├── package.json        # Backend dependencies
│   └── vercel.json         # Deployment configuration
│
├── frontend/                  # React + Vite frontend
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── [other components]
│   │   ├── context/          # React context providers
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utility libraries
│   │   ├── pages/            # Role-based page components
│   │   │   ├── admin/        # Administrator pages
│   │   │   ├── doctor/       # Doctor portal pages
│   │   │   ├── nurse/        # Nurse interface pages
│   │   │   ├── patient/      # Patient portal pages
│   │   │   ├── pharmacist/   # Pharmacist pages
│   │   │   ├── pathologist/  # Pathologist pages
│   │   │   ├── receptionist/ # Reception desk pages
│   │   │   └── common/       # Shared pages across roles
│   │   ├── services/         # API service functions
│   │   ├── styles/           # CSS and styling files
│   │   ├── utils/            # Utility functions
│   │   ├── App.jsx           # Main application component
│   │   └── main.jsx          # Application entry point
│   ├── components.json       # ShadCN UI configuration
│   ├── package.json          # Frontend dependencies
│   ├── vite.config.js        # Vite build configuration
│   └── vercel.json           # Frontend deployment config
│
├── README.md                  # Project documentation
├── .gitignore                 # Git ignore rules
└── .vercelignore             # Vercel deployment ignore rules
```

## 🚀 Setup and Installation

### Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download from nodejs.org](https://nodejs.org/)
- **Git** - For version control
- **MongoDB** - Database (local installation or MongoDB Atlas)
- **Redis** (optional) - For background job queues

### Installation Steps

#### 1. Clone the Repository

```bash
git clone https://github.com/SimonShangpliang/HMIS.git
cd HMIS
```

#### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install backend dependencies
npm install
```

#### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install frontend dependencies
npm install
```

#### 4. Environment Configuration

Create a `.env` file in the `backend` directory with the following variables:

```env
# Server Configuration
PORT=5000
CLIENT_URL=http://localhost:5173

# Database Configuration
MONGO_URI=your_mongodb_connection_string

# Authentication
JWT_SECRET=your_jwt_secret_key

# Email Configuration (NodeMailer)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# File Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Redis Configuration (optional)
REDIS_URL=redis://localhost:6379

# AI Integration
GEMINI_API_KEY=your_gemini_api_key
```

Create a `.env` file in the `frontend` directory:

```env
# Backend API URL
VITE_API_URL=http://localhost:5000/api
```

#### 5. Database Setup

Ensure your MongoDB instance is running. The application will automatically create the necessary collections on first run.

#### 6. Start the Application

##### Backend Server
```bash
cd backend
npm run dev
```
The backend server will start on `http://localhost:5000`

##### Frontend Development Server
```bash
cd frontend
npm run dev
```
The frontend will be available at `http://localhost:5173`

#### 7. Initial Admin Setup

After starting the application:
1. Navigate to `http://localhost:5173/register`
2. Register the first admin account
3. Use the admin panel to add additional staff members

## 🖥️ Frontend Features - Module Wise

### 1. Authentication Module
- **Login System**: Role-based authentication with JWT tokens
- **Registration**: Multi-step registration process for different user types
- **Password Management**: Forgot password and reset functionality
- **Security**: Protected routes based on user roles and permissions

### 2. Patient Portal Module
- **Dashboard**: Personalized patient dashboard with health metrics
- **Appointment Booking**: Search and book appointments with doctors
- **Medical Records**: Access to consultation history, prescriptions, and reports
- **Bill Management**: View and download billing statements
- **Feedback System**: Provide feedback on services and treatments
- **Profile Management**: Update personal information and medical history

### 3. Doctor Portal Module
- **Dashboard**: Overview of daily appointments and patient statistics
- **Appointment Management**: View, update, and manage patient appointments
- **Consultation Interface**: Digital consultation with prescription and diagnosis tools
- **Patient Records**: Access complete patient medical history
- **Schedule Management**: Manage availability and working hours
- **Performance Analytics**: View consultation metrics and patient feedback

### 4. Nurse Interface Module
- **Dashboard**: Daily tasks and patient assignments overview
- **Patient Care**: Monitor patient vitals and update medical records
- **Medication Management**: Track medication administration
- **Ward Management**: Bed assignment and patient transfer coordination
- **Progress Tracking**: Daily patient progress monitoring
- **Emergency Alerts**: Critical patient notification system

### 5. Administrative Module
- **Dashboard**: Hospital-wide analytics and key performance indicators
- **Staff Management**: Employee onboarding, payroll, and performance tracking
- **Analytics Suite**:
  - Financial trends and revenue analysis
  - Patient admission and discharge statistics
  - Department-wise performance metrics
  - Bed occupancy tracking
  - Medicine usage trends
  - Doctor performance analytics
- **Inventory Oversight**: Hospital-wide inventory management
- **Billing Administration**: Revenue management and insurance processing
- **System Configuration**: Hospital settings and user role management

### 6. Pharmacist Module
- **Dashboard**: Pending prescriptions and inventory status
- **Prescription Management**: Process and fulfill patient prescriptions
- **Inventory Control**: Medicine stock management with expiry tracking
- **Drug Interaction Alerts**: Safety checks for prescription combinations
- **Supplier Management**: Vendor relationships and procurement

### 7. Pathologist Module
- **Dashboard**: Pending tests and report generation queue
- **Test Management**: Process laboratory tests and generate reports
- **Report Generation**: Create detailed diagnostic reports with findings
- **Quality Control**: Test result validation and verification
- **Equipment Management**: Laboratory equipment status and maintenance

### 8. Reception Module
- **Dashboard**: Daily appointments and visitor management
- **Appointment Booking**: Schedule appointments for walk-in patients
- **Patient Registration**: New patient onboarding and documentation
- **Bed Assignment**: Manage room and bed allocations
- **Billing Interface**: Generate bills and process payments
- **Queue Management**: Manage patient flow and waiting times

### 9. Common Modules (Shared Across Roles)
- **Calendar Integration**: Personal and institutional calendar management
- **Inventory Access**: Role-based inventory viewing and management
- **Notification Center**: Real-time alerts and messaging system
- **Profile Management**: Personal information and preference settings
- **Contact Administration**: Internal communication and support system
- **Payroll Information**: Salary slips and financial information (for staff)

### 10. Public Interface
- **Hospital Information**: Public data about services and facilities
- **Health Trends**: Community health statistics and insights
- **Contact Information**: Hospital contact details and directions
- **Emergency Services**: Quick access to emergency contact information

## 🗄️ Backend Database Architecture

### Database Schema Design

#### Core Entities

##### 1. Patient Schema
```javascript
PatientSchema = {
  _id: Number (Auto-increment starting from 10000),
  password: String (Hashed),
  name: String,
  profile_pic: String (Cloudinary URL),
  phone_number: String,
  emergency_contact: String,
  email: String (Unique),
  date_of_birth: Date,
  aadhar_number: String (Unique),
  gender: Enum ["male", "female"],
  address: String,
  patient_info: {
    age: Number,
    height: Number,
    weight: Number,
    bloodGrp: Enum ["A+", "B+", "AB+", "O+", "A-", "B-", "AB-", "O-"],
    familyHistory: String,
    bedNo: Number,
    roomNo: Number,
    other: String
  },
  vitals: [VitalsSchema],
  insurance_details: [ObjectId ref: 'Insurance']
}
```

##### 2. Employee Schema
```javascript
EmployeeSchema = {
  _id: Number (Auto-increment starting from 10000),
  name: String,
  email: String (Unique),
  password: String (Hashed),
  profile_pic: String,
  role: Enum ["doctor", "nurse", "pharmacist", "receptionist", "admin", "pathologist", "driver"],
  dept_id: ObjectId ref: 'Department',
  phone_number: String,
  emergency_contact: String,
  bloodGrp: Enum,
  address: String,
  date_of_birth: Date,
  aadhar_number: String (Unique),
  date_of_joining: Date,
  gender: Enum ["male", "female"],
  salary: Number,
  bank_details: {
    bank_name: String,
    account_number: Number,
    ifsc_code: String,
    branch_name: String,
    balance: Number
  }
}
```

##### 3. Consultation Schema
```javascript
ConsultationSchema = {
  patient_id: ObjectId ref: 'Patient',
  doctor_id: ObjectId ref: 'Employee',
  date: Date,
  time: String,
  diagnosis: String,
  prescription: String,
  notes: String,
  status: Enum ["scheduled", "completed", "cancelled"],
  followUp: Date,
  tests_recommended: [ObjectId ref: 'Test'],
  bills: [ObjectId ref: 'Bill']
}
```

##### 4. Bill Schema
```javascript
BillSchema = {
  patient_id: ObjectId ref: 'Patient',
  consultation_id: ObjectId ref: 'Consultation',
  items: [{
    description: String,
    quantity: Number,
    rate: Number,
    amount: Number
  }],
  total_amount: Number,
  payment_status: Enum ["pending", "paid", "partial"],
  payment_method: String,
  insurance_claim: Boolean,
  created_date: Date
}
```

##### 5. Inventory Schema
```javascript
InventorySchema = {
  name: String,
  category: String,
  quantity: Number,
  unit: String,
  price_per_unit: Number,
  supplier: String,
  expiry_date: Date,
  minimum_stock_level: Number,
  description: String,
  location: String
}
```

### Database Relationships

#### One-to-Many Relationships
- **Patient → Consultations**: One patient can have multiple consultations
- **Doctor → Consultations**: One doctor can conduct multiple consultations
- **Patient → Bills**: One patient can have multiple bills
- **Department → Employees**: One department can have multiple employees

#### Many-to-Many Relationships
- **Patient ↔ Insurance**: Patients can have multiple insurance policies
- **Consultation ↔ Tests**: Consultations can have multiple tests, tests can be part of multiple consultations

#### Embedded Documents
- **Patient.vitals**: Vital signs stored as embedded documents
- **Patient.patient_info**: Medical information embedded within patient record
- **Employee.bank_details**: Banking information embedded within employee record

## 🔧 Backend API Architecture

### Authentication APIs

#### Auth Routes (`/api/auth`)
```javascript
POST   /api/auth/login           // User login with role-based access
POST   /api/auth/register        // New user registration
POST   /api/auth/logout          // Secure logout with token invalidation
POST   /api/auth/forgot-password // Password reset request
POST   /api/auth/reset-password  // Password reset confirmation
GET    /api/auth/verify-token    // Token validation for protected routes
```

### Patient Management APIs

#### Patient Routes (`/api/patients`)
```javascript
GET    /api/patients/            // Get all patients (admin/nurse access)
GET    /api/patients/:id         // Get specific patient details
POST   /api/patients/            // Create new patient record
PUT    /api/patients/:id         // Update patient information
DELETE /api/patients/:id         // Soft delete patient record
POST   /api/patients/:id/vitals  // Add vital signs
GET    /api/patients/:id/history // Get patient medical history
POST   /api/patients/:id/feedback// Submit patient feedback
```

### Medical Staff APIs

#### Doctor Routes (`/api/doctors`)
```javascript
GET    /api/doctors/dashboard       // Doctor dashboard data
GET    /api/doctors/appointments    // Doctor's appointments
POST   /api/doctors/appointments    // Create new appointment
PUT    /api/doctors/appointments/:id// Update appointment
GET    /api/doctors/consultations   // Doctor's consultation history
POST   /api/doctors/consultations   // Create consultation record
PUT    /api/doctors/consultations/:id// Update consultation
POST   /api/doctors/prescriptions   // Generate prescription
```

#### Nurse Routes (`/api/nurses`)
```javascript
GET    /api/nurses/dashboard        // Nurse dashboard
GET    /api/nurses/patients         // Assigned patients
POST   /api/nurses/vitals           // Record patient vitals
PUT    /api/nurses/patient-care     // Update patient care notes
GET    /api/nurses/medication-schedule// Medication administration schedule
POST   /api/nurses/medication-log   // Log medication administration
```

### Administrative APIs

#### Admin Routes (`/api/admin`)
```javascript
GET    /api/admin/dashboard         // Admin dashboard analytics
GET    /api/admin/employees         // All hospital employees
POST   /api/admin/employees         // Add new employee
PUT    /api/admin/employees/:id     // Update employee details
DELETE /api/admin/employees/:id     // Remove employee
GET    /api/admin/payroll           // Payroll management
POST   /api/admin/payroll/generate  // Generate payroll
GET    /api/admin/analytics         // Hospital analytics data
POST   /api/admin/notifications     // Send system notifications
```

### Appointment & Scheduling APIs

#### Appointment Routes (`/api/appointments`)
```javascript
GET    /api/appointments/           // Get appointments (role-filtered)
POST   /api/appointments/           // Book new appointment
PUT    /api/appointments/:id        // Update/reschedule appointment
DELETE /api/appointments/:id        // Cancel appointment
GET    /api/appointments/available  // Get available time slots
POST   /api/appointments/confirm    // Confirm appointment booking
```

### Billing & Finance APIs

#### Billing Routes (`/api/billing`)
```javascript
GET    /api/billing/patient/:id    // Patient billing history
POST   /api/billing/generate       // Generate new bill
PUT    /api/billing/:id/payment    // Process payment
GET    /api/billing/pending        // Pending payments
POST   /api/billing/insurance      // Process insurance claim
GET    /api/billing/reports        // Financial reports
```

### Inventory Management APIs

#### Inventory Routes (`/api/inventory`)
```javascript
GET    /api/inventory/              // Get inventory items
POST   /api/inventory/              // Add new inventory item
PUT    /api/inventory/:id           // Update inventory item
DELETE /api/inventory/:id           // Remove inventory item
GET    /api/inventory/low-stock     // Low stock alerts
POST   /api/inventory/order         // Place inventory order
GET    /api/inventory/expiry-alerts // Expiring items
```

### Analytics & Reporting APIs

#### Analytics Routes (`/api/analytics`)
```javascript
GET    /api/analytics/dashboard     // Main analytics dashboard
GET    /api/analytics/patient-trends// Patient admission trends
GET    /api/analytics/financial     // Financial analytics
GET    /api/analytics/bed-occupancy // Bed occupancy statistics
GET    /api/analytics/medicine-usage// Medicine consumption trends
GET    /api/analytics/doctor-performance// Doctor performance metrics
GET    /api/analytics/feedback-analysis// Patient feedback analysis
POST   /api/analytics/custom-report // Generate custom reports
```

### Notification System APIs

#### Notification Routes (`/api/notifications`)
```javascript
GET    /api/notifications/          // Get user notifications
POST   /api/notifications/          // Send notification
PUT    /api/notifications/:id/read  // Mark notification as read
DELETE /api/notifications/:id       // Delete notification
POST   /api/notifications/broadcast // Broadcast to multiple users
GET    /api/notifications/unread    // Get unread notifications count
```

## 🔄 Background Job Processing

### Queue Management with BullMQ

The system uses **BullMQ** with Redis for handling background jobs:

#### Email Queue
- **Appointment confirmations** and reminders
- **Password reset** emails
- **Payroll notifications**
- **System alerts** and notifications

#### Notification Queue
- **Real-time notifications** to users
- **SMS alerts** for critical updates
- **Push notifications** for mobile devices

#### Report Generation Queue
- **PDF generation** for bills and reports
- **Data export** jobs for analytics
- **Automated backup** processes

#### Scheduled Jobs
```javascript
// Daily occupancy initialization
cron.schedule("0 0 * * *", initializeDailyOccupancy);

// Monthly payroll status reset
cron.schedule('0 0 * * *', resetPayrollStatus);

// Weekly inventory reports
cron.schedule('0 9 * * 1', generateInventoryReports);
```

## 🚀 Future Enhancements

### Short-term Improvements (Next 3-6 months)
- **Mobile Application**: React Native app for iOS and Android
- **Telemedicine Integration**: Video consultation capabilities
- **Advanced Reporting**: More detailed analytics and custom report builder
- **API Documentation**: Comprehensive Swagger/OpenAPI documentation
- **Performance Optimization**: Database indexing and query optimization
- **Enhanced Security**: Two-factor authentication and audit logging

### Medium-term Enhancements (6-12 months)
- **IoT Integration**: Medical device connectivity and real-time monitoring
- **AI Diagnostics**: Machine learning for preliminary diagnosis suggestions
- **Blockchain Integration**: Secure and immutable medical records
- **Multi-language Support**: Internationalization for diverse user base
- **Advanced Analytics**: Predictive analytics for resource planning
- **Integration APIs**: Third-party integrations (labs, insurance, government)

### Long-term Vision (1-2 years)
- **Microservices Architecture**: Scalable service-oriented architecture
- **Cloud-native Deployment**: Kubernetes orchestration and auto-scaling
- **Advanced AI Features**: Natural language processing for medical records
- **Interoperability**: HL7 FHIR standard compliance
- **Real-time Collaboration**: Multi-user real-time editing capabilities
- **Advanced Security**: Zero-trust architecture implementation

## 🐛 Known Issues and Bug Handling

### Current Known Issues

#### Frontend Issues
1. **Calendar Component**: Date picker sometimes shows incorrect timezone
   - **Workaround**: Manual date adjustment required
   - **Fix in Progress**: Implementing proper timezone handling

2. **Mobile Responsiveness**: Some admin panels not fully optimized for mobile
   - **Impact**: Limited mobile usability for admin functions
   - **Priority**: Medium

3. **File Upload**: Large file uploads (>10MB) may timeout
   - **Workaround**: Compress files before uploading
   - **Solution**: Implementing chunked upload

#### Backend Issues
1. **Database Connections**: Occasional connection pool exhaustion under high load
   - **Mitigation**: Connection pooling configured
   - **Monitoring**: Connection metrics tracking implemented

2. **Email Delivery**: Some email providers block automated emails
   - **Solution**: Implementing multiple SMTP provider support
   - **Current**: Using application-specific passwords

### Bug Reporting Process

#### For Developers
1. **Create Issue**: Use GitHub issues with appropriate labels
2. **Provide Details**: Include steps to reproduce, expected vs actual behavior
3. **Environment Info**: Specify OS, browser, Node.js version
4. **Logs**: Include relevant console logs and error messages

#### For Users
1. **Contact Support**: Use in-app feedback system
2. **Describe Problem**: Provide detailed description of the issue
3. **Screenshots**: Include screenshots if UI-related
4. **User Context**: Specify role and actions performed before issue

### Testing Strategy

#### Automated Testing
- **Unit Tests**: Core business logic validation using Vitest
- **Integration Tests**: API endpoint testing with Supertest
- **Database Tests**: MongoDB Memory Server for isolated testing
- **Coverage Goals**: Maintaining >80% code coverage

#### Manual Testing
- **User Acceptance Testing**: Role-based testing scenarios
- **Cross-browser Testing**: Chrome, Firefox, Safari, Edge compatibility
- **Mobile Testing**: Responsive design validation
- **Performance Testing**: Load testing with multiple concurrent users

#### Test Commands
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run specific test file
npm run test -- patient.test.js
```

### Performance Monitoring

#### Metrics Tracking
- **Response Time**: API endpoint performance monitoring
- **Memory Usage**: Server memory consumption tracking
- **Database Performance**: Query execution time analysis
- **User Experience**: Frontend performance metrics

#### Monitoring Tools
- **Backend**: Custom logging with Winston
- **Database**: MongoDB Compass for query analysis
- **Frontend**: React DevTools for component performance
- **Network**: Browser dev tools for API call monitoring

### Deployment and DevOps

#### Production Deployment
- **Platform**: Vercel for both frontend and backend
- **Database**: MongoDB Atlas with automated backups
- **File Storage**: Cloudinary for images and documents
- **Monitoring**: Vercel Analytics for performance tracking

#### Environment Management
- **Development**: Local development with hot reloading
- **Staging**: Feature testing environment
- **Production**: Live system with monitoring and alerts

#### Backup Strategy
- **Database**: Daily automated backups with 30-day retention
- **File Storage**: Cloudinary provides automatic redundancy
- **Code**: Git version control with multiple remotes
- **Configuration**: Environment variables secured in deployment platforms

## 📞 Support and Contribution

### Getting Help
- **Documentation**: Check this README and `/backend/documentations/` folder
- **Issues**: Create GitHub issues for bugs and feature requests
- **Community**: Join discussions in the project's community channels

### Contributing
1. **Fork the repository** and create a feature branch
2. **Follow coding standards** and add appropriate tests
3. **Update documentation** for new features
4. **Submit pull requests** with detailed descriptions
5. **Code review process** ensures quality and consistency

### Development Guidelines
- **Code Style**: Follow ESLint and Prettier configurations
- **Commit Messages**: Use conventional commit format
- **Branch Naming**: Use descriptive branch names (feature/*, bugfix/*, hotfix/*)
- **Documentation**: Update relevant documentation for changes

---

 

