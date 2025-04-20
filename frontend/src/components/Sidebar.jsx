import { NavLink, useLocation } from "react-router-dom";
import { Home, Calendar, User, Clipboard, Briefcase, Package, PlusSquare, List, Bell } from "lucide-react"; // Import icons

const Sidebar = ({isSidebarOpen}) => {
  const location = useLocation();
  const userRole = location.pathname.split("/")[1]; // Extract role from URL

  // Define role-based menu items with icons
  const menuItems = {
    doctor: [
      { path: "/doctor/profile", label: "Profile", icon: <User size={20} /> },
      { path: "/doctor/appointments", label: "Appointments", icon: <Clipboard size={20} /> },
      { path: "/doctor/calendar", label: "Calendar", icon: <Calendar size={20} /> },
      { path: "/doctor/contact-admin", label: "Contact Admin", icon: <List size={20} /> },
      { path: "/doctor/inventory", label: "Inventory", icon: <Package size={20} /> },
      { path: "/doctor/payroll-info", label: "Payroll Info.", icon: <Briefcase size={20} /> },
      { path: "/doctor/schedule-notification", label: "Schedule Notification", icon: <Bell size={20} /> },
      { path: "/doctor/notification-management", label: "Manage Notification", icon: <Bell size={20} /> },
    ],
    nurse: [
      { path: "/nurse/profile", label: "Profile", icon: <User size={20} /> },
      { path: "/nurse/patient-records", label: "Patient Records", icon: <Clipboard size={20} /> },
      { path: "/nurse/inventory", label: "Inventory", icon: <Package size={20} /> },
      { path: "/nurse/contact-admin", label: "Contact Admin", icon: <List size={20} /> },
      { path: "/nurse/payroll-info", label: "Payroll Info.", icon: <Briefcase size={20} /> },
      { path: "/nurse/schedule-notification", label: "Schedule Notification", icon: <Bell size={20} /> },
      { path: "/nurse/notification-management", label: "Manage Notification", icon: <Bell size={20} /> },
    ],
    receptionist: [
      { path: "/receptionist/profile", label: "Profile", icon: <User size={20} /> },
      { path: "/receptionist/registration", label: "New User Registration", icon: <PlusSquare size={20} /> },
      { path: "/receptionist/bed-assignment", label: "Bed Mapping", icon: <Clipboard size={20} /> },
      { path: "/receptionist/calendar", label: "Doctors Schedule", icon: <Calendar size={20} /> },
      { path: "/receptionist/requested-appointments", label: "Appointment Requests", icon: <List size={20} /> },
      { path: "/receptionist/add-bill", label: "Add Bills", icon: <Clipboard size={20} /> },
      { path: "/receptionist/contact-admin", label: "Contact Admin", icon: <List size={20} /> },
      { path: "/receptionist/payroll-info", label: "Payroll Info.", icon: <Briefcase size={20} /> },
      { path: "/receptionist/schedule-notification", label: "Schedule Notification", icon: <Bell size={20} /> },
      { path: "/receptionist/notification-management", label: "Manage Notification", icon: <Bell size={20} /> },
    ],
    pathologist: [
      { path: "/pathologist/profile", label: "Profile", icon: <User size={20} /> },
      { path: "/pathologist/inventory", label: "Equipment Status", icon: <Package size={20} /> },
      { path: "/pathologist/patient-info", label: "Patient Information", icon: <User size={20} /> },
      { path: "/pathologist/add-report", label: "Add Report", icon: <Clipboard size={20} /> },
      { path: "/pathologist/contact-admin", label: "Contact Admin", icon: <List size={20} /> },
      { path: "/pathologist/payroll-info", label: "Payroll Info.", icon: <Briefcase size={20} /> },
      { path: "/pathologist/schedule-notification", label: "Schedule Notification", icon: <Bell size={20} /> },
      { path: "/pathologist/notification-management", label: "Manage Notification", icon: <Bell size={20} /> },
    ],
    pharmacist: [
      { path: "/pharmacist/profile", label: "Profile", icon: <Package size={20} /> },
      { path: "/pharmacist/inventory", label: "Inventory", icon: <Package size={20} /> },
      { path: "/pharmacist/patient-info", label: "Patient Information", icon: <User size={20} /> },
      { path: "/pharmacist/contact-admin", label: "Contact Admin", icon: <List size={20} /> },
      { path: "/pharmacist/payroll-info", label: "Payroll Info.", icon: <Briefcase size={20} /> },
      { path: "/pharmacist/schedule-notification", label: "Schedule Notification", icon: <Bell size={20} /> },
      { path: "/pharmacist/notification-management", label: "Manage Notification", icon: <Bell size={20} /> },
    ],
    patient: [
      { path: "/patient/profile", label: "Profile", icon: <User size={20} /> },
      { path: "/patient/consultations", label: "Consultations", icon: <Clipboard size={20} /> },
      { path: "/patient/bills", label: "Bills", icon: <Briefcase size={20} /> },
      { path: "/patient/feedback", label: "Feedback", icon: <List size={20} /> },
      { path: "/patient/daily-progress", label: "Daily Progress", icon: <Clipboard size={20} /> },
      { path: "/patient/support", label: "Help and Support", icon: <Clipboard size={20} /> },      
    ],
    admin: [
      { path: "/admin/profile", label: "Profile", icon: <User size={20} /> },
      { path: "/admin/inventory", label: "Inventory", icon: <Package size={20} /> },
      { path: "/admin/calendar", label: "Calendars", icon: <Calendar size={20} /> },
      { path: "/admin/payroll-info", label: "Payroll", icon: <Briefcase size={20} /> },
      { path: "/admin/staff", label: "Staff", icon: <PlusSquare size={20} /> },
      { path: "/admin/analytics", label: "Analytics", icon: <List size={20} /> },
      { path: "/admin/manage-payrolls", label: "Manage Payrolls", icon: <Briefcase size={20} /> },
      { path: "/admin/ambulance", label: "Manage Ambulance", icon: <Clipboard size={20} /> },
      { path: "/admin/assistant", label: "Assistant", icon: <Clipboard size={20} /> },
      { path: "/admin/schedule-notification", label: "Schedule Notification", icon: <Bell size={20} /> },
      { path: "/admin/notification-management", label: "Manage Notification", icon: <Bell size={20} /> },
    ],
  };

  // If user role is invalid, hide the sidebar
  if (!menuItems[userRole]) return null;

  return (
    <aside className={`w-64 bg-gray-900 text-white min-h-screen p-4 ${isSidebarOpen ? 'block' : 'hidden'}`}>
    <ul className="space-y-2">
      {menuItems[userRole].map((item) => (
        <li key={item.path}>
          <NavLink
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-md transition-all ${isActive ? "bg-blue-500 text-white font-semibold" : "text-gray-300 hover:bg-gray-700"}`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        </li>
      ))}
    </ul>
  </aside>
  );
};

export default Sidebar;
