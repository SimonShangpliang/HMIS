import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";


// Fetch full consultation (but only use diagnosis in UI)
export const fetchDiagnosisByConsultationId = async (consultationId,axiosInstance) => {
  try {
    const response = await axiosInstance.get(`${import.meta.env.VITE_API_URL}/consultations/${consultationId}/diagnosis`);
    return response.data.consultation;
  } catch (error) {
    console.error("Fetch error:", error);
    return [];
  }
};

const ConsultationDiagnosis = () => {
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();
  const { axiosInstance } = useAuth();
  

  useEffect(() => {
    const loadConsultation = async () => {
      try {
        const data = await fetchDiagnosisByConsultationId(id,axiosInstance);
        setConsultation(data);
      } catch (error) {
        console.error("Error loading consultation:", error);
      } finally {
        if (!window._authFailed) setLoading(false);

      }
    };

    loadConsultation();
  }, [id]);

  if (loading) return <div className="p-4">Loading diagnosis information...</div>;
  if (!consultation) return <div className="p-4">No diagnosis information found</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-4">
      {/* Header */}
      {/* Table Header */}
      <div className="bg-gray-800 text-white grid grid-cols-4 p-4 rounded-t-lg mb-px">
        <div className="font-medium">Date</div>
        <div className="font-medium">Doctor Name</div>
        <div className="font-medium">Location</div>
        <div className="font-medium">Details</div>
      </div>

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

      {/* Diagnosis Section */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Diagnosis</h2>
        <div className="bg-gray-200 p-6 rounded-md space-y-4">
          {consultation.diagnosis?.length > 0 ? (
            consultation.diagnosis.map((d, idx) => (
              <div key={d._id || idx} className="border-b border-gray-300 pb-2">
                <h4 className="font-semibold">{d.name}</h4>
                <p className="text-sm text-gray-600">Diagnosis ID: {d.diagnosis_id}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-700 italic">No diagnosis recorded.</p>
          )}
        </div>
      </div>


      {/* Remarks Section */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Remarks</h2>
        <div className="bg-gray-200 p-6 rounded-md min-h-32">
          <p>{consultation.remark || "No remarks provided."}</p>
        </div>
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

export default ConsultationDiagnosis;
