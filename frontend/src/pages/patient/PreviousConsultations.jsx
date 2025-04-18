import React, { useState, useEffect } from "react";
import { Home } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns"; // You may need to install this package

/**
 * @desc    Fetch all consultations for a patient
 * @param   {String|Number} patientId - The ID of the patient
 * @returns {Array} - List of consultations before current datetime
 */
export const fetchConsultationsByPatientId = async (patientId) => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/patients/${patientId}/consultations`);
    const data = await res.json();
    console.log(data)
    if (!res.ok) {
      throw new Error("Failed to fetch consultations");
    }

    // Check if we received dummy data or actual consultations
    if (data.dummy) {
      return data.consultations; // Return the dummy data as is
    }

    // Handle actual data
    // Get current date to compare
    const now = new Date();

    // Filter only past consultations
    const pastConsultations = Array.isArray(data)
      ? data.filter((c) => {
        const consultDate = new Date(c.booked_date_time);
        return consultDate < now;
      })
      : [];

    return pastConsultations;
  } catch (err) {
    console.error("Error fetching consultations:", err);
    return []; // fallback return
  }
};

const PreviousConsultations = () => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();
  const patientId = localStorage.getItem("user_id");

  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, "yyyy-MM-dd");
    } catch (error) {
      return "Invalid date";
    }
  };

  // Load all consultations once
  useEffect(() => {
    const loadConsultations = async () => {
      setLoading(true);
      const data = await fetchConsultationsByPatientId(patientId);
      setConsultations(data);
      setLoading(false);
    };
    loadConsultations();
  }, [patientId]);

  const handleConsultationClick = (id) => {
    navigate(`/patient/previous-consultations/${id}`);
  };

  const navigateToSubpage = (page) => {
    navigate(`/patient/previous-consultations/${id}/${page}`);
  };

  // Helper to format consultation data for display
  const formatConsultationForDisplay = (consult) => {
    // Check if it's dummy data format
    if (consult.date && consult.doctor && typeof consult.doctor === 'string') {
      return {
        id: consult.id,
        date: consult.date,
        doctor: consult.doctor,
        location: consult.location,
        details: consult.details
      };
    }

    // Handle actual API data format
    return {
      id: consult._id,
      date: formatDate(consult.booked_date_time),
      doctor: consult.doctor?.name || 'Unknown Doctor',
      location: `Room ${consult.doctor?.room_num || 'N/A'}`,
      details: consult.reason || consult.appointment_type || 'Consultation'
    };
  };

  // Find the selected consultation from the existing data
  const findConsultationById = (id) => {
    return consultations.find(consult => consult._id === id || consult.id === id) || null;
  };

  // Get the currently selected consultation
  const selectedConsultation = id ? findConsultationById(id) : null;

  if (loading) {
    return (
      <div className="bg-white p-8 min-h-screen">
        <div className="text-center py-10">
          <p>Loading consultations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="book-consultation">
      <header className="consultations-header">
        <h2>Booked Consultations</h2>
        <Home className="home-icon cursor-pointer" onClick={() => navigate("/patient/profile")}/>
      </header>
      {!id ? (
        // List View
        <div className="max-w-5xl mx-auto">
          {/* Table header row */}
          <div className="mb-4 rounded-md bg-gray-900">
            <div className="grid grid-cols-4 py-5 px-4 text-white">
              <div className="text-center font-normal">Date</div>
              <div className="text-center font-normal">Doctor</div>
              <div className="text-center font-normal">Location</div>
              <div className="text-center font-normal">Details</div>
            </div>
          </div>

          {/* Consultation data rows */}
          {consultations.length > 0 ? (
            consultations.map((consult) => {
              const formattedConsult = formatConsultationForDisplay(consult);
              return (
                <div
                  key={formattedConsult.id}
                  onClick={() => handleConsultationClick(formattedConsult.id)}
                  className="mb-4 rounded-md bg-gray-900 hover:bg-gray-800 cursor-pointer transition-colors duration-200"
                >
                  <div className="grid grid-cols-4 py-5 px-4 text-white items-center">
                    <div className="text-center">{formattedConsult.date}</div>

                    {/* Doctor Info */}
                    <div className="flex justify-center items-center space-x-2 text-left">
                      {consult.doctor?.profilePic && (
                        <img
                          src={consult.doctor.profilePic}
                          alt={consult.doctor.name}
                          className="w-8 h-8 rounded-full"
                        />
                      )}
                      <div>
                        <div className="font-medium">{consult.doctor?.name}</div>
                        <div className="text-sm text-gray-300">{consult.doctor?.specialization}</div>
                      </div>
                    </div>

                    <div className="text-center">{formattedConsult.location}</div>
                    <div className="text-center">{formattedConsult.details}</div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-10">
              <p>No previous consultations found.</p>
            </div>
          )}
        </div>

      ) : selectedConsultation ? (
        // Details View using the selected consultation from existing data
        <div className="consultation-details max-w-5xl mx-auto">
          <div className="bg-gray-900 rounded-md mb-6">
            <div className="grid grid-cols-4 py-5 px-4 text-white">
              <div className="text-center font-normal">Date</div>
              <div className="text-center font-normal">Doctor Name</div>
              <div className="text-center font-normal">Location</div>
              <div className="text-center font-normal">Details</div>
            </div>
            <div className="grid grid-cols-4 py-5 px-4 text-white border-t border-gray-700">
              {(() => {
                const formattedConsult = formatConsultationForDisplay(selectedConsultation);
                return (
                  <>
                    <div className="text-center">{formattedConsult.date}</div>
                    <div className="text-center">{formattedConsult.doctor}</div>
                    <div className="text-center">{formattedConsult.location}</div>
                    <div className="text-center">{formattedConsult.details}</div>
                  </>
                );
              })()}
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