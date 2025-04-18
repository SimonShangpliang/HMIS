import React, { useState, useEffect } from "react";
import { useNavigate,Link } from "react-router-dom";
import axios from 'axios';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const doctorId = "10008"; // Replace with dynamic doctor ID
  const navigate = useNavigate();

  // Mock data fetching function
  const fetchAppointmentsByDoctorId = async (doctorId) => {
    // return new Promise((resolve) => {
      // setTimeout(() => {
      //   resolve([
      //     { id: "001645", patientId: "P001", patientName: "Arpan Jain", timeSlot: "8:00-8:05 PM", isDone: false },
      //     { id: "001659", patientId: "P002", patientName: "Ness Wadia", timeSlot: "8:25-8:30 PM", isDone: false },
      //     { id: "001663", patientId: "P003", patientName: "Robert Johnson", timeSlot: "9:00-9:05 PM", isDone: false },
      //     { id: "001671", patientId: "P004", patientName: "Emily Williams", timeSlot: "9:15-9:20 PM", isDone: false },
      //   ]);
      // }, 500);
      // fetch from backend

      try {
        const response = await axios.get(`http://localhost:5000/api/doctors/appointments`, {
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

  const handlePatientClick = (patientId) => {
    navigate(`/patient-consultations/${patientId}`);
  };

  return (
    <div className="p-6 bg-white">
      <h1 className="text-2xl font-bold mb-6">Appointments</h1>
      <div className="max-w-4xl mx-auto">
        {/* Table Header */}
        <Link 
          to="/doctor/book-appointment" 
          className="px-4 py-2 bg-teal-600 text-white font-medium rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
        >
          Add Appointment
        </Link>
        <div className="grid grid-cols-4 text-gray-700 font-medium mb-4">
          <div className="p-3">Appointment ID</div>
          <div className="p-3">Patient Name</div>
          <div className="p-3">Time</div>
          <div className="p-3">Done</div>
        </div>

        {/* Table Rows */}
        {appointments.map((appointment) => (
          <div key={appointment.id} className="grid grid-cols-4 mb-4 rounded-lg overflow-hidden bg-gray-800 text-white">
            <div className="p-4 text-center">{appointment.id}</div>
            <button
              onClick={() => handlePatientClick(appointment.patientId)}
              className="p-4 text-blue-500 hover:text-blue-700 underline"
            >
              {appointment.patientName}
            </button>
            <div className="p-4">{appointment.timeSlot}</div>
            <div className="p-4 flex justify-center">
              {/* Checkbox for marking as done */}
              <input type="checkbox" checked={appointment.isDone} readOnly />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Appointments;
