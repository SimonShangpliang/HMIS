import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const PatientConsultations = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState([]);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Status colors for visual indication
  const statusColors = {
    scheduled: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  // Fetch patient details
  const fetchPatientDetails = async () => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`${import.meta.env.VITE_API_URL}/patients/profile/${patientId}`);
      const data = await response.json();
      
      // Mock data for now
      const patientData = {
        id: parseInt(patientId),
        name: data.name,
        contact: data.phone_number
      };
      
      setPatient(patientData);
    } catch (error) {
      console.error("Failed to fetch patient details:", error);
      setError("Failed to load patient information");
    }
  };

  const fetchConsultations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/patients/${patientId}/consultations`);
      const data = await response.json();
  
      // Normalize consultations for display
      const formattedConsultations = data.map((consult) => ({
        consult_id: consult._id,
        patient_id: consult.patient_id,
        doctor_id: consult.doctor?.id || consult.doctor_id,
        doctor_name: consult.doctor?.name || "Unknown Doctor",
        booked_date_time: consult.booked_date_time,
        status: consult.status,
        reason: consult.reason || "N/A",
        created_by: consult.createdBy || null,
        created_at: consult.createdAt,
        actual_start_datetime: consult.actual_start_datetime || null,
        remark: consult.remark || "",
        diagnosis: consult.diagnosis?.map(d => d.name).join(', ') || "",
        bill_id: consult.bill_id || null, // if exists
        prescription: consult.prescription?.length > 0,
        reports: consult.reports?.length > 0,
        recordedAt: consult.recordedAt || null
      }));
  
      setConsultations(formattedConsultations);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch consultations:", error);
      
      setLoading(false);
    }
  };
  

  // View consultation details function
  const viewConsultationDetails = (consultId) => {
    // Navigate to the shared consultation view component
    navigate(`/nurse/patient-consultations/${consultId}`);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Handle back button click
  const handleBackClick = () => {
    navigate('/nurse/patient-records');
  };
  const handleDailyProgressClick = () => {
    navigate(`/nurse/patient-progress/${patientId}`);
  };

  useEffect(() => {
    fetchPatientDetails();
    fetchConsultations();
  }, [patientId]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700">{error}</p>
          <button 
            onClick={handleBackClick}
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      {/* Header Section */}
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={handleBackClick}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <span>← Back to Patients</span>
          </button>
          
          <h1 className="text-2xl font-bold text-gray-800">
            Patient Consultations
          </h1>
          <button 
            onClick={handleDailyProgressClick}
            className="px-4 py-2 bg-green-100 text-green-800 font-medium rounded-md hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            <span>Daily Progress</span>
          </button>
          <div className="w-24"></div> {/* Empty div for flex spacing */}
        </div>
        
        {/* Patient Info Card */}
        {patient && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Patient Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Patient ID</p>
                <p className="font-medium">P{patient.id.toString().padStart(3, '0')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{patient.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Contact</p>
                <p className="font-medium">{patient.contact}</p>
              </div>
            </div>
          </div>
        )}

        {/* Consultations List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              Consultation History
            </h2>
          </div>
          
          {loading ? (
            <div className="p-6 text-center">
              <p className="text-gray-600">Loading consultations...</p>
            </div>
          ) : consultations.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-600">No consultations found for this patient.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Consult ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doctor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {consultations.map((consultation) => (
                    <tr key={consultation.consult_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium text-gray-900">
                          C{consultation.consult_id.toString().padStart(3, '0')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-900">
                          {consultation.doctor_name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-900">
                          {formatDate(consultation.booked_date_time)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[consultation.status]}`}>
                          {consultation.status.charAt(0).toUpperCase() + consultation.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-900">
                          {consultation.reason}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => viewConsultationDetails(consultation.consult_id)}
                          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-1 rounded transition-colors"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientConsultations;