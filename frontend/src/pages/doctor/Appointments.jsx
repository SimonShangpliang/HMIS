import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from 'axios';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  // const doctorId = "10008"; // Replace with dynamic doctor ID
  const doctorId = localStorage.getItem("role_id"); // Get the doctor ID from local storage
  console.log("doctorId  " ,  doctorId); 
  const navigate = useNavigate();

  const fetchAppointmentsByDoctorId = async (doctorId) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/doctors/appointments`, {
        params: { user: doctorId },
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      return response.data; // Axios automatically parses JSON
    } catch (error) {
      console.error("Failed to fetch appointments:", error.message);
      return [];
    }
  };

  useEffect(() => {
    const loadAppointments = async () => {
      const data = await fetchAppointmentsByDoctorId(doctorId);
      setAppointments(data);
    };
    loadAppointments();
  }, [doctorId]);

  const handleConsultationClick = (patientId, appointmentId) => {
    // Navigate to the specific consultation with the requested URL structure
    navigate(`/doctor/patient-consultations/${patientId}/consultation/${appointmentId}`);
  };

  const handlePatientClick = (patientId) => {
    navigate(`/doctor/patient-consultations/${patientId}`);
  };
  
  // Filter appointments based on status
  const filteredAppointments = statusFilter === "all" 
    ? appointments 
    : appointments.filter(appointment => appointment.status === statusFilter);

  return (
    <div className="p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Appointments</h1>
          
          <div className="flex space-x-4">
            {/* Status Filter Toggle */}
            <div className="flex items-center bg-white rounded-lg shadow px-2">
              <button 
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-2 text-sm font-medium rounded-md ${statusFilter === "all" ? "bg-indigo-500 text-white" : "text-gray-600 hover:bg-gray-100"}`}
              >
                All
              </button>
              <button 
                onClick={() => setStatusFilter("scheduled")}
                className={`px-3 py-2 text-sm font-medium rounded-md ${statusFilter === "scheduled" ? "bg-indigo-500 text-white" : "text-gray-600 hover:bg-gray-100"}`}
              >
                Scheduled
              </button>
              <button 
                onClick={() => setStatusFilter("ongoing")}
                className={`px-3 py-2 text-sm font-medium rounded-md ${statusFilter === "ongoing" ? "bg-indigo-500 text-white" : "text-gray-600 hover:bg-gray-100"}`}
              >
                Ongoing
              </button>
              <button 
                onClick={() => setStatusFilter("completed")}
                className={`px-3 py-2 text-sm font-medium rounded-md ${statusFilter === "completed" ? "bg-indigo-500 text-white" : "text-gray-600 hover:bg-gray-100"}`}
              >
                Completed
              </button>
            </div>
            
            {/* Add Appointment Button */}
            <Link 
              to="/doctor/book-appointment" 
              className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow"
            >
              Add Appointment
            </Link>
          </div>
        </div>
        
        {/* Appointments List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-6 text-gray-700 font-medium bg-gray-50 border-b">
            <div className="p-4">Patient Name</div>
            <div className="p-4">Date</div>
            <div className="p-4">Time</div>
            <div className="p-4">Type</div>
            <div className="p-4">Status</div>
            <div className="p-4">Action</div>
          </div>

          {/* Table Rows */}
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((appointment) => (
              <div 
                key={appointment.id} 
                className="grid grid-cols-6 border-b hover:bg-gray-50 transition-colors"
              >
                <div 
  className="p-4 font-medium text-indigo-600 cursor-pointer hover:underline"
  onClick={(e) => {
    e.stopPropagation();
    handlePatientClick(appointment.patientId);
  }}
>
  {appointment.patientName}
</div>
                <div className="p-4 text-gray-700">{appointment.date}</div>
                <div className="p-4 text-gray-700">{appointment.time}</div>
                <div className="p-4 text-gray-700 capitalize">{appointment.appointmentType}</div>
                <div className="p-4">
                  <span className={`px-2 py-1 text-xs rounded-full text-white ${
                    appointment.status === 'scheduled' ? 'bg-indigo-500' :
                    appointment.status === 'ongoing' ? 'bg-indigo-500' : 'bg-indigo-500'
                  }`}>
                    {appointment.status}
                  </span>
                </div>
                <div className="p-4">
                  <button
                    onClick={() => handleConsultationClick(appointment.patientId, appointment.id)}
                    className="px-3 py-1 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
                  >
                    Details
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center p-8 text-gray-500 col-span-6">
              {statusFilter === "all" 
                ? "No appointments found." 
                : `No ${statusFilter} appointments found.`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Appointments;