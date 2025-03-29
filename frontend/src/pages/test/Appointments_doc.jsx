import React, { useState, useEffect } from 'react';
import "../../styles/Appointments_doc.css";

//TODO: Replace with actual API calls
const mockFetchAppointments = () => {
  return Promise.resolve([
    { id: 1, patientName: "John Doe", timeSlot: "9:00 AM - 10:00 AM", isDone: true },
    { id: 2, patientName: "Jane Smith", timeSlot: "10:30 AM - 11:30 AM", isDone: false },
    { id: 3, patientName: "Robert Johnson", timeSlot: "1:00 PM - 2:00 PM", isDone: false },
    { id: 4, patientName: "Emily Williams", timeSlot: "3:30 PM - 4:30 PM", isDone: false },
  ]);
};

const mockUpdateAppointment = (id, isDone) => {
  console.log(`Appointment ${id} updated to isDone: ${isDone}`);
  return Promise.resolve({ success: true });
};

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);

  //TODO: Replace with actual fetch function
  const fetchAppointments = mockFetchAppointments;
  //TODO: Replace with actual fetch function
  const updateAppointment = mockUpdateAppointment;

  useEffect(() => {
    const getAppointments = async () => {
      try {
        const data = await fetchAppointments();
        setAppointments(data);
      } catch (error) {
        console.error("Failed to fetch appointments:", error);
      }
    };

    getAppointments();
  }, []);

  const handleToggleDone = async (id, currentStatus) => {
    try {
      await updateAppointment(id, !currentStatus);
      setAppointments(prevAppointments => 
        prevAppointments.map(appointment => 
          appointment.id === id 
            ? { ...appointment, isDone: !currentStatus } 
            : appointment
        )
      );
    } catch (error) {
      console.error("Failed to update appointment:", error);
    }
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <button className="menu-toggle">
            <span></span>
            <span></span>
            <span></span>
          </button>
          <div className="user-avatar"></div>
        </div>
        
        <nav className="nav-menu">
          <a href="#profile" className="nav-item">Profile</a>
          <a href="#appointments" className="nav-item active">Appointments</a>
          <a href="#calendar" className="nav-item">Calendar</a>
          <a href="#inventory" className="nav-item">Inventory</a>
          <a href="#contact" className="nav-item">Contact Admin</a>
          <a href="#payroll" className="nav-item">Payroll Info</a>
        </nav>
        
        <div className="logout-container">
          <button className="logout-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 16L21 12M21 12L17 8M21 12H7M13 16V17C13 18.6569 11.6569 20 10 20H6C4.34315 20 3 18.6569 3 17V7C3 5.34315 4.34315 4 6 4H10C11.6569 4 13 5.34315 13 7V8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Logout
          </button>
        </div>
      </div>

      <div className="main-content">
        <div className="top-navbar">
          <div className="navbar-icons">
            <a href="#" className="icon-link">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
            <a href="#" className="icon-link">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
            <a href="#" className="icon-link">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 2H18C19.1046 2 20 2.89543 20 4V20C20 21.1046 19.1046 22 18 22H6C4.89543 22 4 21.1046 4 20V4C4 2.89543 4.89543 2 6 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>
        </div>

        <div className="content-wrapper">
          <div className="appointment-table">
            <div className="table-header">
              <div className="header-cell">Appointment Id</div>
              <div className="header-cell">Patient Name</div>
              <div className="header-cell">Time</div>
              <div className="header-cell">Done</div>
            </div>
            
            {appointments.map((appointment) => (
              <div key={appointment.id} className="table-row">
                <div className="table-cell">AID{appointment.id}</div>
                <div className="table-cell">{appointment.patientName}</div>
                <div className="table-cell">{appointment.timeSlot}</div>
                <div className="table-cell">
                  <input
                    type="checkbox"
                    checked={appointment.isDone}
                    onChange={() => handleToggleDone(appointment.id, appointment.isDone)}
                    className="done-checkbox"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointments;