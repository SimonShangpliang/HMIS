import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const fetchConsultationById = async (consultationId) => {
  // Use the existing fetchConsultationById function from PreviousConsultations.jsx
  return new Promise((resolve) => {
    setTimeout(() => {
      const dummyConsultations = [
        { id: 1, date: "2025-04-03", doctor: "Dr. Smith", location: "Room 101", details: "Checkup" },
        { id: 2, date: "2025-04-05", doctor: "Dr. Adams", location: "Room 203", details: "Follow-up" },
        { id: 3, date: "2025-04-07", doctor: "Dr. Williams", location: "Room 305", details: "Diagnosis" },
        { id: 4, date: "2025-04-10", doctor: "Dr. Brown", location: "Room 408", details: "Consultation" },
      ];
      const consultation = dummyConsultations.find((c) => c.id === Number(consultationId));
      resolve(consultation || null);
    }, 500);
  });
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
      <div className="mb-6">
        <button 
          onClick={() => navigate("/patient/previous-consultations")}
          className="text-blue-600 hover:text-blue-800"
        >
          Back to List
        </button>
      </div>

      {/* Table Header */}
      <div className="bg-gray-800 text-white grid grid-cols-4 p-4 rounded-t-lg mb-px">
        <div className="font-medium">Date</div>
        <div className="font-medium">Doctor Name</div>
        <div className="font-medium">Location</div>
        <div className="font-medium">Details</div>
      </div>

      {/* Table Data Row - Hidden in the image but keeping the structure */}
      <div className="hidden grid grid-cols-4 p-4 bg-white border-b">
        <div>{consultation.date}</div>
        <div>{consultation.doctor}</div>
        <div>{consultation.location}</div>
        <div>{consultation.details}</div>
      </div>

      {/* Options */}
      <div className="mt-4 space-y-4">
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
    </div>
  );
};

export default ConsultationDetails;