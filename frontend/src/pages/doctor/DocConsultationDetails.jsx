import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DocConsultationReports from "./DocConsultationReports";
import DocConsultationPrescriptions from "./DocConsultationPrescriptions";
import DocConsultationBills from "./DocConsultationBills";
import DocConsultationRemarksDiagnosis from "./DocConsultationRemarksDiagnosis";
import axios from "axios";
const DocConsultationDetails = () => {
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("reports");
  const { patientId, consultationId } = useParams();
  const navigate = useNavigate();

  // Mock data fetching function for a specific consultation
  const fetchConsultationById = async (consultationId) => {
    // console.log(consultationId);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/consultations/${consultationId}/view`, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      return response.data; // Assuming your backend sends the consultation in the response body
    } catch (error) {
      console.error("Error fetching consultation details:", error);
      return null; // Fallback: return null if there's an error
    }
  };

  useEffect(() => {
    const loadConsultation = async () => {
      setLoading(true);
      try {
        const data = await fetchConsultationById(consultationId);
        setConsultation(data);
        setLoading(false);
      } catch (error) {
        console.error("Error loading consultation details:", error);
        setLoading(false);
      }
    };

    loadConsultation();
  }, [consultationId]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "reports":
        return <DocConsultationReports consultationId={consultationId} />;
      case "prescriptions":
        return <DocConsultationPrescriptions consultationId={consultationId} />;
      case "bills":
        return <DocConsultationBills consultationId={consultationId} />;
      case "remarks":
        return <DocConsultationRemarksDiagnosis consultationId={consultationId} />;
      default:
        return <div>Select a tab to view details</div>;
    }
  };
  
  

  return (
    <div className="p-6 bg-white">
      <div className="max-w-4xl mx-auto">
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading consultation details...</p>
          </div>
        ) : consultation ? (
          <>
            {/* Consultation Header Info */}
            <div className="bg-white rounded-lg overflow-hidden mb-6">
              <div className="grid grid-cols-3 text-gray-700 font-medium border-b">
                <div className="p-3">Date</div>
                <div className="p-3">Doctor Name</div>
                <div className="p-3">Location</div>
              </div>
              <div className="grid grid-cols-3 bg-gray-800 text-white">
                <div className="p-4">{consultation.consultation.date}</div>
                <div className="p-4">{consultation.consultation.doctor.name}</div>
                <div className="p-4">{consultation.consultation.location}</div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex mb-4 border-b">
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === "reports"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                onClick={() => setActiveTab("reports")}
              >
                Reports
              </button>
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === "prescriptions"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                onClick={() => setActiveTab("prescriptions")}
              >
                Prescriptions
              </button>
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === "bills"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                onClick={() => setActiveTab("bills")}
              >
                Bills
              </button>
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === "remarks"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                onClick={() => setActiveTab("remarks")}
              >
                Remarks / Diagnosis
              </button>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-lg p-4">
              {renderTabContent()}
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-red-500">Consultation not found</p>
            <button
              onClick={() => navigate(`/doctor/patient-consultations/${patientId}`)}
              className="mt-2 px-4 py-2 bg-gray-800 text-white rounded"
            >
              Back to Consultations
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocConsultationDetails;
