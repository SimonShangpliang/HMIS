import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchConsultationById } from "./ConsultationDetails";
import { useAuth } from "../../context/AuthContext";


const fetchPrescriptionsByConsultationId = async (consultationId,axiosInstance) => {
  try {
    const response = await axiosInstance.get(`${import.meta.env.VITE_API_URL}/consultations/${consultationId}/prescription`);
    console.log("data here", response.data.consultation);
    return response.data.consultation.prescription; // unwrap `prescription` key directly
  } catch (error) {
    console.error("Failed to fetch prescriptions:", error);
    throw error;
  }
};

const ConsultationPrescriptions = () => {
  const [prescription, setPrescription] = useState([]);
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();
  const { axiosInstance } = useAuth();
  

  useEffect(() => {
    const loadPrescriptions = async () => {
      try {
        const data = await fetchPrescriptionsByConsultationId(id,axiosInstance);
        setPrescription(data);
        const condata = await fetchConsultationById(id,axiosInstance);
        setConsultation(condata);
      } catch (error) {
        console.error("Error loading prescriptions:", error);
      } finally {
        if (!window._authFailed) setLoading(false);

      }
    };

    loadPrescriptions();
  }, [id]);

  if (loading) return <div className="p-4">Loading prescriptions...</div>;
  if (!prescription) return <div className="p-4">No prescriptions found</div>;

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

      {prescription.length > 0 && prescription[0].entries.length > 0 ? (
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-300">
              <th className="text-left pb-2">Medicine</th>
              <th className="text-left pb-2">Dosage</th>
              <th className="text-left pb-2">Frequency</th>
              <th className="text-left pb-2">Duration</th>
            </tr>
          </thead>
          <tbody>
            {prescription[0].entries.map((entry, idx) => (
              <tr key={idx} className="border-b border-gray-200">
                <td className="py-3">{entry.medicine_id.med_name}</td> {/* Accessing med_name */}
                <td className="py-3">{entry.dosage}</td>
                <td className="py-3">{entry.frequency}</td>
                <td className="py-3">{entry.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-500">No medications prescribed</p>
      )}



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

export default ConsultationPrescriptions;