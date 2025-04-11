import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

// Fetch full consultation (but only use diagnosis in UI)
export const fetchConsultationById = async (consultationId) => {
  try {
    const response = await fetch(`http://localhost:5000/api/consultations/${consultationId}/view`);
    if (!response.ok) throw new Error("Failed to fetch consultation");
    const data = await response.json();
    return data.consultation || [];
  } catch (error) {
    console.error("Fetch error:", error);
    return [];
  }
};

const ConsultationDetails = () => {
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const loadConsultation = async () => {
      try {
        const data = await fetchConsultationById(id);
        setConsultation(data);
      } catch (error) {
        console.error("Error loading consultation:", error);
      } finally {
        setLoading(false);
      }
    };

    loadConsultation();
  }, [id]);

  const handleNavigate = (path) => {
    navigate(`/patient/previous-consultations/${id}/${path}`);
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (!consultation) return <div className="p-4">Consultation not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">

      {/* Table Header */}
      <div className="bg-gray-800 text-white grid grid-cols-4 p-4 rounded-t-lg mb-px">
        <div className="font-medium">Date</div>
        <div className="font-medium">Doctor Name</div>
        <div className="font-medium">Location</div>
        <div className="font-medium">Details</div>
      </div>

      {/* Table Data Row - Now visible */}
      <div className="grid grid-cols-4 p-4 bg-white border border-t-0 rounded-b-lg">
        <div>{consultation.date}</div>
        <div>{consultation.doctor}</div>
        <div>{consultation.location}</div>
        <div>{consultation.details}</div>
      </div>

      {/* Options */}
      <div className="mt-6 space-y-4">
        <div 
          onClick={() => handleNavigate("reports")}
          className="bg-gray-200 p-4 text-center rounded cursor-pointer hover:bg-gray-300"
        >
          <h3 className="text-base font-medium">Reports</h3>
        </div>

        <div 
          onClick={() => handleNavigate("prescriptions")}
          className="bg-gray-200 p-4 text-center rounded cursor-pointer hover:bg-gray-300"
        >
          <h3 className="text-base font-medium">Prescriptions</h3>
        </div>

        <div 
          onClick={() => handleNavigate("bills")}
          className="bg-gray-200 p-4 text-center rounded cursor-pointer hover:bg-gray-300"
        >
          <h3 className="text-base font-medium">Bills</h3>
        </div>

        <div 
          onClick={() => handleNavigate("diagnosis")}
          className="bg-gray-200 p-4 text-center rounded cursor-pointer hover:bg-gray-300"
        >
          <h3 className="text-base font-medium">Remarks/ Diagnosis</h3>
        </div>
      </div>

      {/* Back Button */}
      <div className="flex justify-end">
        <button 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mt-6"
          onClick={() => navigate(`/patient/previous-consultations/`)}
        >
          Back to List
        </button>
      </div>
    </div>
  );
};

export default ConsultationDetails;
