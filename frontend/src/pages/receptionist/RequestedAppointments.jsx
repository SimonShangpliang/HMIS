import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Check, X, Loader2 } from 'lucide-react';

const RequestedAppointments = () => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingIds, setProcessingIds] = useState(new Set());

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/consultations/requested`);
      setConsultations(response.data);
      console.log(response);
    } catch (err) {
      setError('Failed to fetch consultation requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (consultationId, status) => {
    try {
      setProcessingIds(prev => new Set([...prev, consultationId]));
      await axios.put(`${import.meta.env.VITE_API_URL}/consultations/${consultationId}/status`, { status });
      // Update local state instead of refetching
      setConsultations(prevConsultations => 
        prevConsultations.filter(consultation => consultation.id !== consultationId)
      );
    } catch (err) {
      setError(`Failed to ${status} consultation`);
      console.error(err);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(consultationId);
        return newSet;
      });
    }
  };

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

  const ActionButtons = ({ consultation }) => {
    const isProcessing = processingIds.has(consultation.id);

    if (isProcessing) {
      return (
        <div className="flex justify-center">
          <Loader2 size={18} className="animate-spin text-gray-500" />
        </div>
      );
    }

    return (
      <div className="flex justify-center space-x-3">
        <button 
          onClick={() => handleStatusUpdate(consultation.id, 'scheduled')}
          className="p-1.5 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors duration-200 disabled:opacity-50"
          title="Approve"
          disabled={isProcessing}
        >
          <Check size={18} />
        </button>
        <button 
          onClick={() => handleStatusUpdate(consultation.id, 'cancelled')}
          className="p-1.5 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors duration-200 disabled:opacity-50"
          title="Cancel"
          disabled={isProcessing}
        >
          <X size={18} />
        </button>
      </div>
    );
  };

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  );

  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Appointment Requests</h2>
      
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
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Time
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reason
              </th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
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
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getAppointmentTypeColor(consultation.appointment_type)}`}>
                    {consultation.appointment_type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatDateTime(consultation.booked_date_time)}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate">{consultation.reason}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <ActionButtons consultation={consultation} />
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