import React, { useState, useEffect } from "react";
import axios from "axios";

const DocConsultationReports = ({ consultationId }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    status: "pending",
    reportText: "",
    title: "",
    description: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDownload = async (reportId) => {
    try {
      window.open(`${import.meta.env.VITE_API_URL}/doctors/consultations/${consultationId}/reports/${reportId}/download`, '_blank');
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Error downloading report');
    }
  };

  // Mock data fetching function
  const fetchReportsByConsultationId = async (consultationId) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/consultations/${consultationId}/view`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data.consultation.reports;
    } catch (error) {
      console.error("Error fetching consultation details:", error);
      return null;
    }
  };

  const addReport = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const doctorId = localStorage.getItem("role_id"); // Get the doctor ID from local storage

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/doctors/updateConsultations/${consultationId}/addreports?doctor="${doctorId}"`,
        reportData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      // Handle the response and update reports
      if (response.data.success) {
        setReports((prevReports) => [...prevReports, reportData]);
      }

      // Reset form fields
      setReportData({
        status: "pending",
        reportText: "",
        title: "",
        description: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),

      });
      setIsSubmitting(false);
    } catch (error) {
      console.error("Error adding report:", error);
      setIsSubmitting(false);
    }
  };

  // Load reports on component mount and consultationId change
  useEffect(() => {
    const loadReports = async () => {
      setLoading(true);
      try {
        const data = await fetchReportsByConsultationId(consultationId);
        setReports(data);
        setLoading(false);
      } catch (error) {
        console.error("Error loading reports:", error);
        setLoading(false);
      }
    };

    loadReports();
  }, [consultationId]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Reports</h2>
      {loading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading reports...</p>
        </div>
      ) : reports.length > 0 ? (
        <div className="space-y-4">
          {reports.map((report, index) => (
            <div key={index} className="border rounded p-4 bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">{report.title}</h3>
                <span className="text-sm text-gray-500">
                  {new Date(report.createdAt).toLocaleDateString()} | {new Date(report.createdAt).toLocaleTimeString()}
                </span>
              </div>
              <div className="mt-2 flex justify-between items-center">
                <span
                  className={`px-2 py-1 text-xs rounded ${report.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                    }`}
                >
                  {report.status === "completed" ? "Completed" : "Pending"}
                </span>
                {report.reportFile && (
                  <button
                    onClick={() => handleDownload(report._id)}
                    className="inline-flex items-center px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 py-4">No reports available</p>
      )}

      {/* Add Report Form */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">Add Report</h3>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Title"
            value={reportData.title}
            onChange={(e) => setReportData({ ...reportData, title: e.target.value })}
            className="w-full px-4 py-2 border rounded"
          />
          <textarea
            placeholder="Report Text"
            value={reportData.reportText}
            onChange={(e) => setReportData({ ...reportData, reportText: e.target.value })}
            className="w-full px-4 py-2 border rounded"
            rows="4"
          />
          <input
            type="text"
            placeholder="Description"
            value={reportData.description}
            onChange={(e) => setReportData({ ...reportData, description: e.target.value })}
            className="w-full px-4 py-2 border rounded"
          />
          <div className="flex justify-between items-center">
            <select
              value={reportData.status}
              onChange={(e) => setReportData({ ...reportData, status: e.target.value })}
              className="px-4 py-2 border rounded"
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
            <button
              onClick={addReport}
              disabled={isSubmitting}
              className={`${isSubmitting ? "bg-gray-300" : "bg-blue-500"
                } text-white px-4 py-2 rounded`}
            >
              {isSubmitting ? "Adding..." : "Add Report"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocConsultationReports;
