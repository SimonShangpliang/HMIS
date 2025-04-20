import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from 'axios';
import { Calendar, Clock, User, Search, Filter, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const doctorId = localStorage.getItem("role_id");
  const navigate = useNavigate();

  const fetchAppointmentsByDoctorId = async (doctorId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/doctors/appointments`, {
        params: { user: doctorId },
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
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
    navigate(`/doctor/patient-consultations/${patientId}/consultation/${appointmentId}`);
  };

  const handlePatientClick = (patientId) => {
    navigate(`/doctor/patient-consultations/${patientId}`);
  };

  // Filter appointments based on status and search query
  const filteredAppointments = appointments
    .filter(appointment => 
      statusFilter === "all" || appointment.status === statusFilter
    )
    .filter(appointment =>
      appointment.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.id.toString().includes(searchQuery)
    );

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'ongoing':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">My Appointments</h1>
              <p className="text-gray-600 mt-1">Manage and view your scheduled appointments</p>
            </div>
            <Link 
              to="/doctor/book-appointment" 
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Appointment
            </Link>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by patient name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
              <Filter className="text-gray-500" size={20} />
              <button 
                onClick={() => setStatusFilter("all")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  statusFilter === "all" 
                    ? "bg-white text-indigo-600 shadow-sm" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                All
              </button>
              <button 
                onClick={() => setStatusFilter("scheduled")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  statusFilter === "scheduled" 
                    ? "bg-white text-indigo-600 shadow-sm" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Scheduled
              </button>
              <button 
                onClick={() => setStatusFilter("ongoing")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  statusFilter === "ongoing" 
                    ? "bg-white text-indigo-600 shadow-sm" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Ongoing
              </button>
              <button 
                onClick={() => setStatusFilter("completed")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  statusFilter === "completed" 
                    ? "bg-white text-indigo-600 shadow-sm" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Completed
              </button>
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {filteredAppointments.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredAppointments.map((appointment) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Patient Info */}
                    <div className="flex-1">
                      <div 
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => handlePatientClick(appointment.patientId)}
                      >
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 hover:text-indigo-600">
                            {appointment.patientName}
                          </h3>
                          <p className="text-sm text-gray-500">ID: {appointment.patientId}</p>
                        </div>
                      </div>
                    </div>

                    {/* Appointment Details */}
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-600">{appointment.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-600">{appointment.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </div>
                      <button
                        onClick={() => handleConsultationClick(appointment.patientId, appointment.id)}
                        className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No appointments found</h3>
              <p className="text-gray-500">
                {statusFilter === "all" 
                  ? "You don't have any appointments scheduled."
                  : `You don't have any ${statusFilter} appointments.`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Appointments;