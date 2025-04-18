import React, { useState, useEffect } from 'react';

const RequestedAppointments = () => {
  // Sample data - replace with actual API call
  const [consultations, setConsultations] = useState([
    {
      id: "1001",
      patient_id: 5001,
      patient_name: "John Smith",
      doctor_id: 2001,
      doctor_name: "Dr. Sarah Johnson",
      status: "requested",
      appointment_type: "regular",
      booked_date_time: "2025-04-18T14:30:00",
      reason: "Persistent cough and fever for 3 days"
    },
    {
      id: "1002",
      patient_id: 5002,
      patient_name: "Emily Davis",
      doctor_id: 2003,
      doctor_name: "Dr. Michael Chen",
      status: "requested",
      appointment_type: "follow-up",
      booked_date_time: "2025-04-19T10:15:00",
      reason: "Follow-up for previous treatment"
    },
    {
      id: "1003",
      patient_id: 5003,
      patient_name: "Robert Wilson",
      doctor_id: 2002,
      doctor_name: "Dr. Jessica Patel",
      status: "requested",
      appointment_type: "emergency",
      booked_date_time: "2025-04-17T16:45:00",
      reason: "Severe abdominal pain"
    },
    {
      id: "1004",
      patient_id: 5004,
      patient_name: "Maria Rodriguez",
      doctor_id: 2001,
      doctor_name: "Dr. Sarah Johnson",
      status: "requested",
      appointment_type: "consultation",
      booked_date_time: "2025-04-20T09:00:00",
      reason: "Annual checkup and vaccination"
    },
    {
      id: "1005",
      patient_id: 5005,
      patient_name: "David Thompson",
      doctor_id: 2004,
      doctor_name: "Dr. James Wilson",
      status: "requested",
      appointment_type: "regular",
      booked_date_time: "2025-04-19T13:30:00",
      reason: "Skin rash and itching"
    }
  ]);

  // Format date and time for display
  const formatDateTime = (dateTimeStr) => {
    const date = new Date(dateTimeStr);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Status badge color mapping
  const getStatusColor = (status) => {
    return 'bg-yellow-100 text-yellow-800';
  };

  // Appointment type badge color mapping
  const getAppointmentTypeColor = (type) => {
    switch (type) {
      case 'regular':
        return 'bg-purple-100 text-purple-800';
      case 'follow-up':
        return 'bg-indigo-100 text-indigo-800';
      case 'emergency':
        return 'bg-red-100 text-red-800';
      case 'consultation':
        return 'bg-teal-100 text-teal-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Consultation Requests</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Patient
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Doctor
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Time
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reason
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {consultations.map((consultation) => (
              <tr key={consultation.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{consultation.patient_name}</div>
                  <div className="text-xs text-gray-500">#{consultation.patient_id}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{consultation.doctor_name}</div>
                  <div className="text-xs text-gray-500">#{consultation.doctor_id}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(consultation.status)}`}>
                    {consultation.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getAppointmentTypeColor(consultation.appointment_type)}`}>
                    {consultation.appointment_type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatDateTime(consultation.booked_date_time)}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate">{consultation.reason}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button className="text-green-600 hover:text-green-900 font-medium">Approve</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {consultations.length === 0 && (
        <div className="text-center py-4 text-gray-500">No consultation requests found</div>
      )}
    </div>
  );
};

export default RequestedAppointments;