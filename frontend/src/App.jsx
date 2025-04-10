import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Unauthorized from "./pages/Unauthorized";
import FeaturesPage from './pages/FeaturesPage';
import CommunityPage from './pages/CommunityPage';
import TrendsPage from './pages/TrendsPage';
import AboutPage from './pages/AboutPage';
import TermsPage from './pages/terms';
import PrivacyPolicyPage from './pages/privacy';
import './App.css';

// Common Pages
import Profile from "./pages/common/Profile";
import Calendar from "./pages/common/Calendar";
import Inventory from "./pages/common/Inventory";
import ContactAdmin from "./pages/common/ContactAdmin";
import PayrollInfo from "./pages/common/PayrollInfo";
import PatientInfo from "./pages/common/PatientInfo";

// Patient Pages
import PatientDashboard from "./pages/patient/PatientDashboard";
import Feedback from "./pages/patient/Feedback";
import DoctorProfile from "./pages/patient/DoctorProfile";
import Bills from "./pages/patient/Bills";
import PreviousConsultations from "./pages/patient/PreviousConsultations";
import BookConsultation from "./pages/patient/BookConsultation";
import BookedConsultation from "./pages/patient/BookedConsultation";
import RescheduleConsultation from "./pages/patient/RescheduleConsultation";
import ConsultationDetails from "./pages/patient/ConsultationDetails";
import ConsultationReports from "./pages/patient/ConsultationReports";
import ConsultationPrescriptions from "./pages/patient/ConsultationPrescryptions";
import ConsultationDiagnosis from "./pages/patient/ConsultationDiagnosis";
import ConsultantBills from "./pages/patient/ConsultantBills";
import Support from "./pages/patient/Support";

import Consultations from "./pages/patient/Consultations";
import DailyProgress from "./pages/patient/DailyProgress";

// Medical Staff Pages
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import Appointments from "./pages/doctor/Appointments";
import PatientConsulatation from "./pages/doctor/PatientConsultation"

import NurseDashboard from "./pages/nurse/NurseDashboard";
import PatientRecords from "./pages/nurse/PatientRecords";
import PatientConsultations from "./pages/nurse/PatientConsultations"; // Add import for the new component
import PatientConsultationDetails from "./pages/nurse/PatientConsultationDetails";

import PharmacistDashboard from "./pages/pharmacist/PharmacistDashboard";

import PathologistDashboard from "./pages/pathologist/PathologistDashboard";
import AddReport from "./pages/pathologist/AddReport";

// Reception & Admin Pages
import ReceptionistDashboard from "./pages/receptionist/ReceptionistDashboard";
import AppointmentBooking from "./pages/receptionist/AppointmentBooking";
import BedAssignment from "./pages/receptionist/BedAssignment";
import Registration from "./pages/receptionist/Registration";
import AppointmentUpdate from "./pages/receptionist/AppointmentUpdate";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AddStaff from "./pages/admin/AddStaff";
import ManagePayrolls from "./pages/admin/ManagePayrolls";
import Ambulance from "./pages/admin/Ambulance";

// Analytics Pages
import AnalyticsDashboard from "./pages/admin/analytics/AnalyticsDashboard";
import IllnessTrends from "./pages/admin/analytics/IllnessTrends";
import MedicineTrends from "./pages/admin/analytics/MedicineTrends";
import FinancialTrends from "./pages/admin/analytics/FinancialTrends";
import BedOccupancyTrends from "./pages/admin/analytics/BedOccupancyTrends";
import DoctorWorkingTrends from "./pages/admin/analytics/DoctorWorkingTrends";
import TextualFeedbackAnalysis from "./pages/admin/analytics/FeedbackTextAnalysis";
import Feedbacks from "./pages/admin/analytics/Feedbacks";

import PublicData from "./pages/PublicData";
import AddBill from "./pages/receptionist/AddBill";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(prevState => !prevState);
  };
  return (
    <AuthProvider>
      <Router>
        <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen}/>
        <div className="flex">

        <Sidebar isSidebarOpen={isSidebarOpen} />
        <div className="flex-1 ml-0 transition-all">

        <Routes>
          {/* Authentication & Public Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/public-data" element={<PublicData />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/trends" element={<TrendsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage/>} />
          <Route path= "/terms" element={<TermsPage/>} />

         {/* Role-Based Common Pages */}                  
         <Route element={<ProtectedRoute allowedRoles={["doctor", "nurse", "receptionist", "admin", "patient", "pathologist"]} />}>
            <Route path=":role/profile" element={<Profile />} />
          </Route>
                     
         {/*inventory */}
          <Route element={<ProtectedRoute allowedRoles={["doctor", "nurse",  "admin",  "pathologist","pharmacist"]} />}>
          <Route path=":role/inventory" element={<Inventory />} />
          </Route>
                  
          {/*Calendar */}
         <Route element={<ProtectedRoute allowedRoles={["doctor",  "receptionist", "admin"]} />}>
            <Route path=":role/calendar" element={<Calendar />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["doctor", "nurse", "receptionist", "patient", "pathologist", "pharmacist"]} />}>
            <Route path=":role/contact-admin" element={<ContactAdmin />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["doctor", "nurse", "admin", "pathologist"]} />}>
            <Route path=":role/payroll-info" element={<PayrollInfo />} />
          </Route>

          {/* difference based on test or medicine displayed*/}
          <Route element={<ProtectedRoute allowedRoles={["pharmacist", "pathologist"]} />}>
            <Route path=":role/patient-info" element={<PatientInfo />} />
          </Route>

          {/* Patient Routes */}
          <Route element={<ProtectedRoute allowedRoles={["patient"]} />}>
            <Route path="/patient/profile" element={<PatientDashboard />} />
            <Route path="/patient/feedback" element={<Feedback />} />
            <Route path="/patient/doctor-profile" element={<DoctorProfile />} />
            <Route path="/patient/bills" element={<Bills />} />
            <Route path="/patient/bills/:billId" element={<Bills />} />
            <Route path="/patient/consultations" element={<Consultations />} />
            <Route path="/patient/daily-progress" element={<DailyProgress />} />
            <Route path="/patient/support" element={<Support />} />

            <Route path="/patient/previous-consultations" element={<PreviousConsultations />} />
            {/* <Route path="/patient/previous-consultations/:id" element={<PreviousConsultations />} /> */}
            {/* <Route path="/previous-consultations" element={<PreviousConsultations />} /> */}
            <Route path="/patient/previous-consultations/:id" element={<ConsultationDetails />} />
            <Route path="/patient/previous-consultations/:id/reports" element={<ConsultationReports />} />
            <Route path="/patient/previous-consultations/:id/prescriptions" element={<ConsultationPrescriptions />} />
            <Route path="/patient/previous-consultations/:id/diagnosis" element={<ConsultationDiagnosis />} />
            <Route path="/patient/previous-consultations/:id/bills" element={<ConsultantBills />} />
            <Route path="/patient/book-consultation" element={<BookConsultation />} />
            <Route path="/patient/booked-consultation" element={<BookedConsultation />} />
            <Route path="/patient/reschedule-consultation/:consultationId" element={<RescheduleConsultation />} />

          </Route>

          {/* Medical Staff Routes */}
          <Route element={<ProtectedRoute allowedRoles={["doctor"]} />}>
            <Route path="/doctor" element={<DoctorDashboard />} />
            <Route path="/doctor/appointments" element={<Appointments />} />
            
          </Route>
          <Route element={<ProtectedRoute allowedRoles={["doctor","nurse"]} />}>
        
            <Route path=":role/patient-consultations/:consultationId?" element={<PatientConsulatation />} />
            {/* Patient progress and Patient consultation share same page ,, if consulatation id exists, go into further details about particular patient*/}
          </Route>
        

          <Route element={<ProtectedRoute allowedRoles={["nurse"]} />}>
            <Route path="/nurse" element={<NurseDashboard />} />
            <Route path="/nurse/patient-records" element={<PatientRecords />} />
            <Route path="/nurse/patient-records/:patientId/consultations" element={<PatientConsultations />} />
                {/* Add this new route for consultation details */}
                <Route path="/nurse/patient-consultations/:consultationId" element={<PatientConsultationDetails />} />
              
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["pharmacist"]} />}>
            <Route path="/pharmacist" element={<PharmacistDashboard />} />
            {/* <Route path="/pharmacist/profile" element={<PharmacistDashboard />} /> */}
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["pathologist"]} />}>
            <Route path="/pathologist" element={<PathologistDashboard />} />
            <Route path="/pathologist/add-report" element={<AddReport />} />
          </Route>

          {/* Reception & Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={["receptionist"]} />}>
            <Route path="/receptionist" element={<ReceptionistDashboard />} />
            <Route path="/receptionist/appointment-booking" element={<AppointmentBooking />} />
            {/* ideally use same screen for bed mapping and assignment*/}
            <Route path="/receptionist/bed-assignment" element={<BedAssignment />} />
            {/* Registration means new user registration*/}
            <Route path="/receptionist/registration" element={<Registration />} />
            <Route path="/receptionist/update-appointment" element={<AppointmentUpdate />} />
            <Route path="/receptionist/add-bill" element={<AddBill />} />


          </Route>

         {/* Admin & Analytics Routes */}
         <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/add-staff" element={<AddStaff />} />
            <Route path="/admin/manage-payrolls" element={<ManagePayrolls />} />
            <Route path="/admin/ambulance" element={<Ambulance />} />

            {/* Analytics Routes */}
            <Route path="/admin/analytics" element={<AnalyticsDashboard />} />
            <Route path="/admin/analytics/illness-trends" element={<IllnessTrends />} />
            <Route path="/admin/analytics/medicine-trends" element={<MedicineTrends />} />
            <Route path="/admin/analytics/financial-trends" element={<FinancialTrends />} />
            <Route path="/admin/analytics/bed-occupancy-trends" element={<BedOccupancyTrends />} />
            <Route path="/admin/analytics/doctor-working-trends" element={<DoctorWorkingTrends />} />
            <Route path="/admin/analytics/text-feedback" element={<TextualFeedbackAnalysis />} />
            <Route path="/admin/analytics/feedbacks" element={<Feedbacks />} />
          </Route>
        </Routes>
        </div>

        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
