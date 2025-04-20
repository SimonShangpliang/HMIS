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

  // Mock data fetching function
  const fetchReportsByConsultationId = async (consultationId) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/consultations/${consultationId}/view`, {
        // params: { id: consultationId }, // Pass query param here
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data.consultation.reports; // Assuming your backend sends the consultation in the response body
    } catch (error) {
      console.error("Error fetching consultation details:", error);
      return null; // Fallback: return null if there's an error
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
                  {new Date(report.createdAt).toLocaleDateString()} |  {new Date(report.createdAt).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-gray-700">{report.reportText}</p>
              <div className="mt-2">
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    report.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {report.status === "completed" ? "Completed" : "Pending"}
                </span>
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
              className={`${
                isSubmitting ? "bg-gray-300" : "bg-blue-500"
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
