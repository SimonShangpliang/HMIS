import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const PatientConsultationDetails = () => {
  const { consultationId } = useParams();
  const navigate = useNavigate();
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchConsultationDetails = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/consultations/${consultationId}/view`);
      const data = await response.json();

      const consultationData = data.consultation;

      const formattedConsultation = {
        consult_id: consultationData.id,
        patient_id: null, // Not provided in the response
        doctor_id: consultationData.doctor?.id,
        doctor_name: consultationData.doctor?.name,
        doctor_specialization: consultationData.doctor?.specialization,
        doctor_profile_pic: consultationData.doctor?.profilePic,
        patient_name: null, // Not provided in the response
        booked_date_time: consultationData.date,
        location: consultationData.location,
        status: consultationData.status,
        reason: consultationData.reason,
        appointment_type: consultationData.appointment_type,
        remark: consultationData.details,
        diagnosis: consultationData.diagnosis?.map(d => d.name).join(", "),
        prescription: consultationData.prescription || [],
        reports: consultationData.prescription?.length > 0,
        reports_data: consultationData.reports,
        feedback: consultationData.feedback,
      };

      setConsultation(formattedConsultation);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch consultation details:", error);
      setError("Failed to load consultation information");
      setLoading(false);
    }
  };


  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Handle back button click
  const handleBackClick = () => {
    navigate(-1); // Go back to previous page
  };

  useEffect(() => {
    fetchConsultationDetails();
  }, [consultationId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-gray-700">Loading consultation details...</p>
        </div>
      </div>
    );
  }

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

  if (!consultation) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-gray-700">Consultation not found</p>
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
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handleBackClick}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <span>← Back</span>
          </button>

          <h1 className="text-2xl font-bold text-gray-800">
            Consultation Details
          </h1>

          <div className="w-24"></div> {/* Empty div for flex spacing */}
        </div>

        {/* Consultation Details Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header Info */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Consultation ID</p>
                <p className="font-medium">C{consultation.consult_id.toString().padStart(3, '0')}</p>
              </div>
              {/* Empty as consultation cannot see patient ID */}
              <div>
                <p className="text-sm text-gray-500"></p>
                <p className="font-medium"></p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Doctor</p>
                <p className="font-medium">{consultation.doctor_name}</p>
              </div>
            </div>
          </div>

          {/* Main Details */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-sm text-gray-500 mb-1">Status</h3>
                <p className={`font-medium ${consultation.status === 'completed' ? 'text-green-600' :
                  consultation.status === 'scheduled' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                  {consultation.status.charAt(0).toUpperCase() + consultation.status.slice(1)}
                </p>
              </div>

              <div>
                <h3 className="text-sm text-gray-500 mb-1">Booked Date & Time</h3>
                <p className="font-medium">{formatDate(consultation.booked_date_time)}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-sm text-gray-500 mb-1">Reason</h3>
              <p className="font-medium">{consultation.reason}</p>
            </div>

            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-sm text-gray-500 mb-1">Created By</h3>
                <p className="font-medium">{consultation.created_by_name}</p>
              </div>
              
              <div>
                <h3 className="text-sm text-gray-500 mb-1">Created At</h3>
                <p className="font-medium">{formatDate(consultation.created_at)}</p>
              </div>
            </div> */}

            {/* <div className="mb-6">
              <h3 className="text-sm text-gray-500 mb-1">Actual Start Time</h3>
              <p className="font-medium">{formatDate(consultation.actual_start_datetime)}</p>
            </div> */}

            <div className="mb-6">
              <h3 className="text-sm text-gray-500 mb-1">Remark</h3>
              <p className="font-medium">{consultation.remark || 'No remarks'}</p>
            </div>

            <div className="mb-6">
              <h3 className="text-sm text-gray-500 mb-1">Diagnosis</h3>
              <p className="font-medium">{consultation.diagnosis || 'No diagnosis recorded'}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-6">
              {/* <div>
                <h3 className="text-sm text-gray-500 mb-1">Bill ID</h3>
                <p className="font-medium">{consultation.bill_id ? `B${consultation.bill_id.toString().padStart(3, '0')}` : 'N/A'}</p>
              </div> */}

              <div className="bg-white rounded-lg shadow-md p-4 mt-6">
                <h3 className="text-sm text-gray-500 mb-2">Prescription Details</h3>
                {Array.isArray(consultation.prescription) && consultation.prescription.length > 0 ? (
                  <div className="overflow-auto">
                    <table className="min-w-full bg-white text-sm text-left border border-gray-200">
                      <thead>
                        <tr className="bg-gray-100 text-gray-600">
                          <th className="px-4 py-2 border">Medicine ID</th>
                          <th className="px-4 py-2 border">Name</th>
                          <th className="px-4 py-2 border">Dosage</th>
                          <th className="px-4 py-2 border">Frequency</th>
                          <th className="px-4 py-2 border">Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        {consultation.prescription.flatMap(prescription =>
                          prescription.entries.map((entry, idx) => (
                            <tr key={`${prescription._id}-${idx}`} className="border-t">
                              <td className="px-4 py-2 border">{entry.medicine_id._id}</td>
                              <td className="px-4 py-2 border">{entry.medicine_id.med_name}</td>
                              <td className="px-4 py-2 border">{entry.dosage}</td>
                              <td className="px-4 py-2 border">{entry.frequency}</td>
                              <td className="px-4 py-2 border">{entry.duration}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-700">N/A</p>
                )}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 mt-6">
              <h3 className="text-sm text-gray-500 mb-2">Reports</h3>
              {Array.isArray(consultation.reports_data) && consultation.reports_data.length > 0 ? (
                <ul className="space-y-4">
                  {consultation.reports_data.map((report) => (
                    <li key={report._id} className="border border-gray-200 p-3 rounded">
                      <p className="font-semibold text-gray-800">{report.title}</p>
                      <p className="text-gray-700 text-sm mt-1">{report.reportText}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-700">No reports available.</p>
              )}
            </div>
            {consultation.feedback && (
              <div className="bg-white rounded-lg shadow-md p-4 mt-6">
                <h3 className="text-sm text-gray-500 mb-2">Feedback</h3>

                {/* Stars */}
                <div className="flex items-center mb-2">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <svg
                      key={index}
                      className={`w-5 h-5 ${index < consultation.feedback.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.945a1 1 0 00.95.69h4.15c.969 0 1.371 1.24.588 1.81l-3.36 2.444a1 1 0 00-.364 1.118l1.287 3.944c.3.922-.755 1.688-1.538 1.118l-3.36-2.444a1 1 0 00-1.175 0l-3.36 2.444c-.783.57-1.838-.196-1.538-1.118l1.287-3.944a1 1 0 00-.364-1.118L2.075 9.372c-.783-.57-.38-1.81.588-1.81h4.15a1 1 0 00.95-.69l1.286-3.945z" />
                    </svg>
                  ))}
                </div>

                {/* Comment */}
                <p className="text-gray-700 text-sm">{consultation.feedback.comments}</p>
              </div>
            )}


            {/* <div>
              <h3 className="text-sm text-gray-500 mb-1">Recorded At</h3>
              <p className="font-medium">{formatDate(consultation.recordedAt)}</p>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientConsultationDetails;