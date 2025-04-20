import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";


// Fetch full consultation (but only use diagnosis in UI)
export const fetchConsultationById = async (consultationId,axiosInstance) => {
  try {
    const response = await axiosInstance.get(`${import.meta.env.VITE_API_URL}/consultations/${consultationId}/view`);
    return response.data;
  } catch (error) {
    console.error("Fetch error:", error);
    return [];
  }
};


const ConsultationReports = () => {
  const [consultation, setConsultation] = useState(null);
  const [reports, setReports] = useState([]);

  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();
    const { axiosInstance } = useAuth();
  

  useEffect(() => {
    const loadReports = async () => {
      try {
        const data = await fetchConsultationById(id,axiosInstance);
        setReports(data.consultation.reports);
        setConsultation(data.consultation)
        console.log(data)
        if (data.length > 0) {
          //   setSelectedReport(data[0]);
        }

      } catch (error) {
        console.error("Error loading reports:", error);
      } finally {
        if (!window._authFailed) setLoading(false);

      }
    };

    loadReports();
  }, [id]);

  if (loading) return <div className="flex justify-center p-8">Loading reports...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Table Header */}
      <div className="bg-gray-800 text-white rounded-md mb-8">
        <div className="grid grid-cols-4 p-4">
          <div className="font-medium">Date</div>
          <div className="font-medium">Doctor Name</div>
          <div className="font-medium">Location</div>
          <div className="font-medium">Details</div>
        </div>
      </div>
      {/* Table Data Row - Now visible */}
      <div className="grid grid-cols-4 p-4 bg-white border border-t-0 rounded-b-lg">
        <div>{consultation.date}</div>
        <div className="flex items-center space-x-2">
          {consultation.doctor?.profilePic && (
            <img
              src={consultation.doctor.profilePic}
              alt={consultation.doctor.name}
              className="w-8 h-8 rounded-full"
            />
          )}
          <div>
            <div className="font-medium">{consultation.doctor?.name}</div>
            <div className="text-sm text-gray-500">{consultation.doctor?.specialization}</div>
          </div>
        </div>
        <div>{consultation.location}</div>
        <div>{consultation.details}</div>
      </div>
      {/* Report Section */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Reports</h2>

        {/* List of all reports */}
        <div className="space-y-2 mb-4">
          {reports.length === 0 && (
            <div className="text-gray-500">No reports found.</div>
          )}
          {reports.map((rpt, index) => (
            <div
              key={rpt._id}
              onClick={() => setSelectedReport(rpt)}
              className={`p-3 rounded-md cursor-pointer border hover:bg-gray-100 ${selectedReport?._id === rpt._id ? "bg-gray-200 border-blue-500" : "bg-white"
                }`}
            >
              <div className="font-medium">{rpt.title || `Report ${index + 1}`}</div>
              <div className="text-sm text-gray-600">{new Date(rpt.createdAt).toLocaleDateString()}</div>
              <div className="text-sm text-gray-600">Status: {rpt.status}</div>
            </div>
          ))}
        </div>

        {/* Selected Report Detail */}
        {selectedReport ? (
          <div className="bg-gray-300 rounded-md p-6 min-h-64">
            <p><strong>Title:</strong> {selectedReport.title}</p>
            <p><strong>Date:</strong> {new Date(selectedReport.createdAt).toLocaleString()}</p>
            <p><strong>Status:</strong> {selectedReport.status?.toUpperCase()}</p>
            <p><strong>Description:</strong> {selectedReport.description}</p>
            <p className="mt-4"><strong>Report Text:</strong><br />{selectedReport.reportText}</p>
          </div>
        ) : (
          <div className="bg-gray-300 rounded-md p-6 min-h-64 flex items-center justify-center">
            <p>No report selected. Please select a report to view details.</p>
          </div>
        )}
      </div>


      {/* Back Button */}
      <div className="flex justify-end">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          onClick={() => navigate(`/patient/previous-consultations/${id}`)}
        >
          Back to Consultation
        </button>
      </div>
    </div>
  );
};

export default ConsultationReports;