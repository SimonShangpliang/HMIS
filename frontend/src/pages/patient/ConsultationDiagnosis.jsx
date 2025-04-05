import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const fetchDiagnosisByConsultationId = async (consultationId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const dummyDiagnosis = {
        id: Number(consultationId),
        diagnosis: "Acute Upper Respiratory Infection",
        summary: "Patient presented with symptoms of cold, mild fever, and runny nose. Physical examination revealed slight inflammation of the throat. No signs of bacterial infection.",
        recommendations: "Rest and adequate hydration recommended. Monitor temperature. Return if symptoms worsen or persist beyond 7 days.",
        date: "2025-04-03"
      };
      resolve(dummyDiagnosis);
    }, 500);
  });
};

const ConsultationDiagnosis = () => {
  const [diagnosis, setDiagnosis] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const loadDiagnosis = async () => {
      try {
        const data = await fetchDiagnosisByConsultationId(id);
        setDiagnosis(data);
      } catch (error) {
        console.error("Error loading diagnosis:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDiagnosis();
  }, [id]);

  if (loading) return <div className="p-4">Loading diagnosis information...</div>;
  if (!diagnosis) return <div className="p-4">No diagnosis information found</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-4">
      {/* Header with consultation info */}
      <div className="bg-gray-800 text-white rounded-md mb-6">
        <div className="grid grid-cols-4 p-4">
          <div className="text-center">
            <h3 className="font-medium">Date</h3>
            <p>{diagnosis.date}</p>
          </div>
          <div className="text-center">
            <h3 className="font-medium">Doctor Name</h3>
            <p>Dr. Sarah Johnson</p>
          </div>
          <div className="text-center">
            <h3 className="font-medium">Location</h3>
            <p>City Medical Center</p>
          </div>
          <div className="text-center">
            <h3 className="font-medium">Details</h3>
            <p>General checkup</p>
          </div>
        </div>
      </div>
      
      {/* Diagnosis section */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Diagnosis</h2>
        <div className="bg-gray-200 p-6 rounded-md min-h-32">
          <p>{diagnosis.diagnosis}</p>
        </div>
      </div>
      
      {/* Remarks section */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Remarks</h2>
        <div className="bg-gray-200 p-6 rounded-md min-h-32">
          <p>{diagnosis.recommendations}</p>
        </div>
      </div>
    </div>
  );
};

export default ConsultationDiagnosis;