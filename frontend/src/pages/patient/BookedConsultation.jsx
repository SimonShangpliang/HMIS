import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react";
import "../../styles/patient/BookedConsultations.css";
import { useAuth } from "../../context/AuthContext";

import axios from "axios";

export const fetchConsultationsByPatientId = async (patientId, axiosInstance) => {
  try {
    const res = await axiosInstance.get(`${import.meta.env.VITE_API_URL}/patients/${patientId}/consultations`);
    const data = res.data;

    if (!data) {
      throw new Error("Failed to fetch consultations");
    }

    const now = new Date();

    // Filter only past consultations
    const pastConsultations = Array.isArray(data)
      ? data.filter((c) => {
        const consultDate = new Date(c.booked_date_time);
        const status = c.status;
        return consultDate > now && status !== "cancelled" && status !== 'completed'; // cancelled or completed consultations should not show
      })
      : [];
      console.log("here")
      console.log(pastConsultations)

    // Transform the data to match the component's expected format
    const formattedConsultations = pastConsultations.map(consult => ({
      id: consult._id,
      date: new Date(consult.booked_date_time).toLocaleString(undefined, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true, // optional: for AM/PM format
      }),
      doctor: consult.doctor.name,
      location: consult.appointment_type,
      doctorId: consult.doctor_id,
      status: consult.status,
      reason: consult.reason,
      // Add any other properties your component needs
    }));

    console.log(formattedConsultations);
    return formattedConsultations;
  } catch (err) {
    console.error("Error fetching consultations:", err);
    return [];
  }
};


export const deleteConsultationById = async (consultationId,axiosInstance) => {
  try {
    const res = await axiosInstance.delete(`${import.meta.env.VITE_API_URL}/patients/${consultationId}/cancel`);

    console.log(res.data);

    return { success: true, message: res.data.message };
  } catch (err) {
    console.error("Error deleting consultation:", err);
    const errorMsg =
      err.response?.data?.error ||
      err.response?.data?.message ||
      err.message ||
      "Something went wrong";
      
    return { success: false, message: errorMsg };
  }
};


const BookedConsultation = () => {
  const [consultations, setConsultations] = useState([]);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [Loading, setLoading] = useState(true);
  const { axiosInstance } = useAuth();


  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelConsultationId, setCancelConsultationId] = useState(null);

  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);

  const navigate = useNavigate();
  const patientId = localStorage.getItem("user_id");

  useEffect(() => {
    const loadConsultations = async () => {
      const data = await fetchConsultationsByPatientId(patientId, axiosInstance);
      setConsultations(data);
      if (!window._authFailed)setLoading(false);
    };

    loadConsultations();
  }, [patientId]);

  const handleCancel = (consultationId) => {
    setCancelConsultationId(consultationId);
    setShowCancelModal(true);
  };

  const confirmReschedule = () => {
    if (selectedConsultation) {
      console.log(selectedConsultation)
      navigate('/patient/reschedule-consultation/' + selectedConsultation.id)
      // Clear selection after navigation
      setSelectedConsultation(null);
    }
  };

  const handleReschedule = (consult) => {
    setSelectedConsultation(consult);
  };

  const confirmCancel = async () => {
    if (cancelConsultationId) {
      try {
        const result = await deleteConsultationById(cancelConsultationId,axiosInstance);

        if (result.success) {
          setShowCancelModal(false);
          setCancelConsultationId(null);
          window.location.reload();
        } else {
          setShowCancelModal(false);
          setErrorMessage(result.message);
          setShowErrorModal(true);
        }
      } catch (error) {
        setShowCancelModal(false);
        setErrorMessage("Unexpected error while cancelling consultation.");
        setShowErrorModal(true);
      }
    }
  };
  if (Loading) return <div className="loading">Loading...</div>;


  return (
    <div className="consultations-page">
      <main className="consultations-content">
        <header className="consultations-header">
          <h2>Booked Consultations</h2>
          <Home className="home-icon cursor-pointer" onClick={() => navigate("/patient/profile")}/>
        </header>
        <section className="consultations-list">
          {consultations.length > 0 ? (
            <>
              <div className="consultation-card header">
                <span className="consult-date">Date</span>
                <span className="consult-doctor">Doctor</span>
                <span className="consult-location">Location</span>
                <span className="consult-status">Status</span>
                <span className="consult-actions">Actions</span>
              </div>

              {consultations.map((consult) => (
                <div key={consult.id} className="consultation-card">
                  <span className="consult-date">{consult.date}</span>
                  <span className="consult-doctor">{consult.doctor}</span>
                  <span className="consult-location">{consult.location}</span>
                  <span className="consult-status">{consult.status}</span>
                  <div className="consult-actions">
                  <button
                    onClick={() => handleCancel(consult.id)}
                    disabled={consult.status === "cancelled" || consult.status === "ongoing"}
                    className={`px-4 py-2 rounded-md font-medium transition ${
                      consult.status === "cancelled" || consult.status === "ongoing"
                        ? "disabled cursor-not-allowed"
                        : "cancel-active hover:bg-red-700"
                    }`}
                    title={
                      consult.status === "cancelled"
                        ? "Already cancelled"
                        : consult.status === "ongoing"
                        ? "Ongoing consultation cannot be cancelled"
                        : "Cancel consultation"
                    }
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleReschedule(consult)}
                    disabled={
                      consult.status === "completed" ||
                      consult.status === "cancelled" ||
                      consult.status === "ongoing"
                    }
                    className={`px-4 py-2 rounded-md font-medium transition ${
                      consult.status === "completed" ||
                      consult.status === "cancelled" ||
                      consult.status === "ongoing"
                        ? "disabled cursor-not-allowed"
                        : "reschedule-active hover:bg-green-700"
                    }`}
                    title={
                      consult.status === "completed"
                        ? "Completed consultations cannot be rescheduled"
                        : consult.status === "cancelled"
                        ? "Cancelled consultations cannot be rescheduled"
                        : consult.status === "ongoing"
                        ? "Ongoing consultations cannot be rescheduled"
                        : "Reschedule consultation"
                    }
                  >
                    Reschedule
                  </button>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <p className="no-data">No Consultations Available</p>
          )}
        </section>

      </main>

      {/* Custom Modal for Reschedule Confirmation */}
      {selectedConsultation && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Reschedule</h3>
            <p>
              Are you sure you want to reschedule your appointment with{" "}
              <strong>{selectedConsultation.doctor}</strong> on{" "}
              <strong>{selectedConsultation.date}</strong>?
            </p>
            <div className="modal-actions">
              <button className="cancel-modal-btn" onClick={() => setSelectedConsultation(null)}>
                No, Cancel
              </button>
              <button className="confirm-modal-btn" onClick={confirmReschedule}>
                Yes, Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Cancel Consultation</h3>
            <p>Are you sure you want to cancel this consultation?</p>
            <div className="modal-actions">
              <button className="cancel-modal-btn" onClick={() => setShowCancelModal(false)}>
                No, Keep It
              </button>
              <button className="confirm-modal-btn" onClick={confirmCancel}>
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Error</h3>
            <p>{errorMessage}</p>
            <div className="modal-actions">
              <button className="confirm-modal-btn" onClick={() => setShowErrorModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default BookedConsultation;
