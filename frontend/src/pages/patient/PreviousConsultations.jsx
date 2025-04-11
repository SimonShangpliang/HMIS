import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

// -------------------------------------------------
// ADD ID FUNCTIONALITY. DUMMY PATIENT ID IN USE !!!
//--------------------------------------------------

/**
 * @desc    Fetch all consultations for a patient
 * @param   {String|Number} patientId - The ID of the patient
 * @returns {Array} - List of consultations before currrent datettime
 */
export const fetchConsultationsByPatientId = async (patientId) => {
  try {
    const res = await fetch(`http://localhost:5000/api/patients/${patientId}/consultations`);
    const data = await res.json();

    if (!res.ok || !data.consultations) {
      throw new Error("Failed to fetch consultations");
    }

    // Get current date (without time) to compare safely
    const now = new Date();

    // Filter only past consultations (date < now)
    const pastConsultations = data.consultations.filter((c) => {
      const consultDate = new Date(c.date); // assumes ISO or YYYY-MM-DD
      return consultDate < now;
    });

    return pastConsultations;
  } catch (err) {
    console.error("Error fetching consultations:", err);
    return []; // fallback return
  }
};


export const fetchConsultationById = async (consultationId) => {
  try {
    const res = await fetch(`http://localhost:5000/api/consultations/view/${consultationId}`);
    const data = await res.json();

    if (!res.ok || !data) {
      throw new Error("Failed to fetch consultation");
    }

    return data;
  } catch (err) {
    console.error("Error fetching consultation by ID:", err);
    return null;
  }
};

const PreviousConsultations = () => {
  const [consultations, setConsultations] = useState([]);
  const [consultation, setConsultation] = useState(null); // Store single consultation
  const navigate = useNavigate();
  const { id } = useParams();
  const patientId = "123"; // Example patient ID

  // Load all consultations (for list view)
  useEffect(() => {
    const loadConsultations = async () => {
      const data = await fetchConsultationsByPatientId(patientId);
      setConsultations(data);
    };
    loadConsultations();
  }, [patientId]);

  // Load single consultation if ID is provided
  useEffect(() => {
    if (id) {
      const loadConsultation = async () => {
        const data = await fetchConsultationById(id);
        setConsultation(data);
      };
      loadConsultation();
    }
  }, [id]);

  const handleConsultationClick = (id) => {
    navigate(`/patient/previous-consultations/${id}`); // Redirect to the consultation details page
  };

  const navigateToSubpage = (page) => {
    navigate(`/patient/previous-consultations/${id}/${page}`);
  };

  return (
    <div className="bg-white p-8 min-h-screen">
      <h2 className="text-2xl font-normal mb-8 text-center md:text-left">Previous Consultations</h2>
      
      {!id ? (
        // List View - Now displaying the actual dummy data
        <div className="max-w-5xl mx-auto">
          {/* First table-header row */}
          <div className="mb-4 rounded-md bg-gray-900 cursor-pointer">
            <div className="grid grid-cols-4 py-5 px-4 text-white">
              <div className="text-center font-normal">Date</div>
              <div className="text-center font-normal">Doctor Name</div>
              <div className="text-center font-normal">Location</div>
              <div className="text-center font-normal">Details</div>
            </div>
          </div>
          
          {/* Consultation data rows */}
          {consultations.map((consult) => (
            <div 
              key={consult.id}
              onClick={() => handleConsultationClick(consult.id)}
              className="mb-4 rounded-md bg-gray-900 hover:bg-gray-800 cursor-pointer transition-colors duration-200"
            >
              <div className="grid grid-cols-4 py-5 px-4 text-white">
                <div className="text-center">{consult.date}</div>
                <div className="text-center">{consult.doctor}</div>
                <div className="text-center">{consult.location}</div>
                <div className="text-center">{consult.details}</div>
              </div>
            </div>
          ))}
        </div>
      ) : consultation ? (
        // Details View
        <div className="consultation-details max-w-5xl mx-auto">
          <div className="bg-gray-900 rounded-md mb-6">
            <div className="grid grid-cols-4 py-5 px-4 text-white">
              <div className="text-center font-normal">Date</div>
              <div className="text-center font-normal">Doctor Name</div>
              <div className="text-center font-normal">Location</div>
              <div className="text-center font-normal">Details</div>
            </div>
            <div className="grid grid-cols-4 py-5 px-4 text-white border-t border-gray-700">
              <div className="text-center">{consultation.date}</div>
              <div className="text-center">{consultation.doctor}</div>
              <div className="text-center">{consultation.location}</div>
              <div className="text-center">{consultation.details}</div>
            </div>
          </div>
          
          <div className="navigation-options grid grid-cols-3 gap-4 mb-6">
            <button 
              onClick={() => navigateToSubpage("reports")}
              className="bg-gray-200 hover:bg-gray-300 p-4 rounded-md text-center"
            >
              Reports
            </button>
            <button 
              onClick={() => navigateToSubpage("prescriptions")}
              className="bg-gray-200 hover:bg-gray-300 p-4 rounded-md text-center"
            >
              Prescriptions
            </button>
            <button 
              onClick={() => navigateToSubpage("diagnosis")}
              className="bg-gray-200 hover:bg-gray-300 p-4 rounded-md text-center"
            >
              Summary/Diagnosis
            </button>
          </div>
          
          <button 
            onClick={() => navigate("/patient/previous-consultations")} 
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-white"
          >
            Back to Consultations
          </button>
        </div>
      ) : (
        // Not Found View
        <div className="text-center py-10 max-w-5xl mx-auto">
          <p className="mb-4 text-xl">Consultation Not Found</p>
          <button 
            onClick={() => navigate("/patient/previous-consultations")} 
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-white"
          >
            Back to Consultations
          </button>
        </div>
      )}
    </div>
  );
};

export default PreviousConsultations;