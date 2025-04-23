import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from 'axios';
import { Calendar, Clock, User, Filter, Plus, Search, ChevronRight, Calendar as CalendarIcon, Clock as ClockIcon, User as UserIcon, Filter as FilterIcon, Plus as PlusIcon, Search as SearchIcon, ChevronRight as ChevronRightIcon, X, RefreshCw, Download, Eye } from 'lucide-react';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const doctorId = localStorage.getItem("role_id");
  const navigate = useNavigate();

  const fetchAppointmentsByDoctorId = async (doctorId) => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/doctors/appointments`, {
        params: { user: doctorId },
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      return response.data;
    } catch (error) {
      console.error("Failed to fetch appointments:", error.message);
      return [];
    } finally {
      setIsLoading(false);
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
  
  const handleRefreshAppointments = async () => {
    const data = await fetchAppointmentsByDoctorId(doctorId);
    setAppointments(data);
  };

  const handleQuickView = (appointment) => {
    setSelectedAppointment(appointment);
  };

  const closeQuickView = () => {
    setSelectedAppointment(null);
  };
  
  const updateAppointmentStatus = async (appointmentId, newStatus,isDone) => {
    try {
      setIsUpdatingStatus(true);
      
      // Determine if marking as completed
      
      await axios.put(`${import.meta.env.VITE_API_URL}/doctors/appointments`, 
        { id: appointmentId, isDone },
        { 
          params: { user: doctorId },
          headers: { 'Content-Type': 'application/json' }
        }
      );
      
      // Update appointment in state
      const updatedAppointments = appointments.map(appointment => {
        if (appointment.id === appointmentId) {
          return { ...appointment, status: newStatus };
        }
        return appointment;
      });
      
      setAppointments(updatedAppointments);
      
      // If there's a selected appointment, update it too
      if (selectedAppointment && selectedAppointment.id === appointmentId) {
        setSelectedAppointment({ ...selectedAppointment, status: newStatus });
      }
      
      // Show success message
      alert(`Appointment status updated to ${newStatus} successfully!`);
      
    } catch (error) {
      console.error("Failed to update appointment status:", error.message);
      alert("Failed to update appointment status. Please try again.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };
  
  // Filter appointments based on status and search query
  const filteredAppointments = appointments
    .filter(appointment => 
      statusFilter === "all" || appointment.status === statusFilter
    )
    .filter(appointment =>
      appointment.patientName.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'ongoing':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  const getStatusButtonColors = (buttonStatus, currentStatus) => {
    if (buttonStatus === currentStatus) {
      return "opacity-50 cursor-not-allowed";
    }
    
    switch (buttonStatus) {
      case 'ongoing':
        return "bg-amber-500 hover:bg-amber-600 focus:ring-amber-500";
      case 'completed':
        return "bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-500";
      default:
        return "bg-gray-500 hover:bg-gray-600 focus:ring-gray-500";
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const getAppointmentCount = (status) => {
    if (status === 'all') return appointments.length;
    return appointments.filter(appointment => appointment.status === status).length;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Appointments</h1>
              <p className="mt-2 text-sm text-gray-600">Manage and view your patient appointments</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search Bar */}
              <div className="relative flex items-center">
                <div className="absolute left-3 flex items-center justify-center">
                  <SearchIcon className="text-gray-400" size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full sm:w-64 bg-white shadow-sm transition-all"
                />
                {searchQuery && (
                  <button 
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Status Filter */}
              <div className="flex items-center bg-white rounded-xl shadow-sm border border-gray-200 p-1">
                <button 
                  onClick={() => setStatusFilter("all")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    statusFilter === "all" 
                      ? "bg-indigo-500 text-white shadow-sm" 
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  All <span className="ml-1 text-xs bg-white/20 px-1.5 py-0.5 rounded-full">{getAppointmentCount('all')}</span>
                </button>
                <button 
                  onClick={() => setStatusFilter("scheduled")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    statusFilter === "scheduled" 
                      ? "bg-indigo-500 text-white shadow-sm" 
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Scheduled <span className="ml-1 text-xs bg-white/20 px-1.5 py-0.5 rounded-full">{getAppointmentCount('scheduled')}</span>
                </button>
                <button 
                  onClick={() => setStatusFilter("ongoing")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    statusFilter === "ongoing" 
                      ? "bg-indigo-500 text-white shadow-sm" 
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Ongoing <span className="ml-1 text-xs bg-white/20 px-1.5 py-0.5 rounded-full">{getAppointmentCount('ongoing')}</span>
                </button>
                <button 
                  onClick={() => setStatusFilter("completed")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    statusFilter === "completed" 
                      ? "bg-indigo-500 text-white shadow-sm" 
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Completed <span className="ml-1 text-xs bg-white/20 px-1.5 py-0.5 rounded-full">{getAppointmentCount('completed')}</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button 
                  onClick={handleRefreshAppointments}
                  className="inline-flex items-center justify-center px-4 py-2.5 bg-white text-gray-700 font-medium rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 shadow-sm transition-all border border-gray-200"
                  title="Refresh appointments"
                >
                  <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
                </button>
                
                <Link 
                  to="/doctor/book-appointment" 
                  className="inline-flex items-center justify-center px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-sm transition-all"
                >
                  <PlusIcon size={18} className="mr-2" />
                  Add Appointment
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Appointments List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-7 text-gray-700 font-medium bg-gray-50 border-b px-6 py-4">
            <div className="flex items-center">
              <UserIcon size={16} className="mr-2 text-indigo-500" />
              Patient Name
            </div>
            <div className="flex items-center">
              <CalendarIcon size={16} className="mr-2 text-indigo-500" />
              Date
            </div>
            <div className="flex items-center">
              <ClockIcon size={16} className="mr-2 text-indigo-500" />
              Time
            </div>
            <div className="flex items-center">
              <FilterIcon size={16} className="mr-2 text-indigo-500" />
              Type
            </div>
            <div>Status</div>
            <div className="col-span-2">Actions</div>
          </div>

          {/* Table Rows */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
              <p className="mt-4 text-gray-500">Loading appointments...</p>
            </div>
          ) : filteredAppointments.length > 0 ? (
            filteredAppointments.map((appointment) => (
              <div 
                key={appointment.id} 
                className="grid grid-cols-7 border-b hover:bg-gray-50 transition-colors px-6 py-4"
              >
                <div 
                  className="font-medium text-indigo-600 cursor-pointer hover:underline flex items-center"
                  onClick={() => handlePatientClick(appointment.patientId)}
                >
                  <UserIcon size={16} className="mr-2 text-gray-400" />
                  {appointment.patientName}
                </div>
                <div className="text-gray-700 flex items-center">
                  <CalendarIcon size={16} className="mr-2 text-gray-400" />
                  {appointment.date}
                </div>
                <div className="text-gray-700 flex items-center">
                  <ClockIcon size={16} className="mr-2 text-gray-400" />
                  {appointment.time}
                </div>
                <div className="text-gray-700 capitalize flex items-center">
                  <FilterIcon size={16} className="mr-2 text-gray-400" />
                  {appointment.appointmentType}
                </div>
                <div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                    {appointment.status}
                  </span>
                </div>
                <div className="col-span-2 flex gap-2">
                  <button
                    onClick={() => handleQuickView(appointment)}
                    className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-1 transition-all"
                    title="Quick view"
                  >
                    <Eye size={16} className="mr-1" />
                    Quick View
                  </button>
                  <button
                    onClick={() => handleConsultationClick(appointment.patientId, appointment.id)}
                    className="inline-flex items-center px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 transition-all shadow-sm"
                  >
                    <ChevronRightIcon size={16} className="mr-1" />
                    View Details
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16">
              <div className="text-gray-300 mb-4">
                <CalendarIcon size={64} className="mx-auto" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No appointments found</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {statusFilter === "all" 
                  ? "You don't have any appointments scheduled." 
                  : `You don't have any ${statusFilter} appointments.`}
              </p>
              <Link 
                to="/doctor/book-appointment" 
                className="inline-flex items-center justify-center px-4 py-2 mt-6 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-sm transition-all"
              >
                <PlusIcon size={18} className="mr-2" />
                Schedule New Appointment
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick View Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Appointment Details</h3>
              <button 
                onClick={closeQuickView}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <UserIcon size={18} className="text-indigo-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Patient Name</p>
                  <p className="font-medium">{selectedAppointment.patientName}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <CalendarIcon size={18} className="text-indigo-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">{selectedAppointment.date}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <ClockIcon size={18} className="text-indigo-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="font-medium">{selectedAppointment.time}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <FilterIcon size={18} className="text-indigo-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-medium capitalize">{selectedAppointment.appointmentType}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-1">Status</p>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedAppointment.status)}`}>
                  {selectedAppointment.status}
                </span>
              </div>
              
              {/* Status Management Buttons */}
              <div>
                <p className="text-sm text-gray-500 mb-2">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {selectedAppointment.status !== "ongoing" && (
                    <button 
                      onClick={() => updateAppointmentStatus(selectedAppointment.id, "ongoing",false)}
                      disabled={isUpdatingStatus || selectedAppointment.status === "completed"}
                      className={`px-3 py-1.5 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all shadow-sm ${
                        selectedAppointment.status === "completed" 
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-amber-500 hover:bg-amber-600 focus:ring-amber-500"
                      }`}
                    >
                      {isUpdatingStatus ? "Updating..." : "Mark as Ongoing"}
                    </button>
                  )}
                  
                  {selectedAppointment.status !== "completed" && (
                    <button 
                      onClick={() => updateAppointmentStatus(selectedAppointment.id, "completed",true)}
                      disabled={isUpdatingStatus}
                      className="px-3 py-1.5 text-sm font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all shadow-sm"
                    >
                      {isUpdatingStatus ? "Updating..." : "Mark as Completed"}
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeQuickView}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-all"
              >
                Close
              </button>
              <button
                onClick={() => {
                  closeQuickView();
                  handleConsultationClick(selectedAppointment.patientId, selectedAppointment.id);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all shadow-sm"
              >
                View Full Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;