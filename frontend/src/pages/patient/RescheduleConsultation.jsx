import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate, useParams } from "react-router-dom";
import "../../styles/patient/RescheduleConsultation.css";
import { useAuth } from "../../context/AuthContext";


const CONFIRMATION = "Consultation rescheduled successfully";

export const rescheduleConsultation = async (consultationId, newDateTime,axiosInstance) => {
  try {
    const res = await axiosInstance.put(
      `${import.meta.env.VITE_API_URL}/patients/${consultationId}/reschedule`,
      { newDateTime },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return { success: true, consultation: res.data.consultation };
  } catch (err) {
    console.error('Reschedule error:', err);
    return {
      success: false,
      error: err.response?.data?.error || err.message || 'Failed to reschedule consultation.',
    };
  }
};

const RescheduleConsultation = () => {
  // states
  const [tempDate, setTempDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loading, setLoading] = useState(false);
  

  // inbuilt
  const { consultationId } = useParams();
  const navigate = useNavigate();
  const { axiosInstance } = useAuth();
  

  // Message boards
  const [showConfirmModal, setShowConfirmModal] = useState(false); // ✅ Confirm modal
  const [showErrorModal, setShowErrorModal] = useState(false); // ✅ Error modal
  const [errorMessage, setErrorMessage] = useState(""); // 🆕 To store dynamic error message

  const availableSlots = [
    "9:00 AM - 10:00 AM",
    "10:00 AM - 11:00 AM",
    "11:00 AM - 12:00 PM",
    "2:00 PM - 3:00 PM",
    "3:00 PM - 4:00 PM",
    "4:00 PM - 5:00 PM",
  ];

  const handleCancel = () => {
    navigate("/patient/booked-consultation");
  };

  const handleClear = () => {
    setTempDate(new Date());
    setSelectedSlot("");
  };

  const handleReschedule = async () => {
    if (!selectedSlot) {
      setErrorMessage("Please select a time slot before rescheduling.");
      setShowErrorModal(true);
      return;
    }

    setShowConfirmModal(true);
  };

  const confirmReschedule = async () => {
    setShowConfirmModal(false);
    setLoading(true);
  
    // Parse slot time
    const [startTime] = selectedSlot.split(" - ");
    const [time, meridiem] = startTime.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
  
    if (meridiem === "PM" && hours < 12) hours += 12;
    if (meridiem === "AM" && hours === 12) hours = 0;
  
    // Use tempDate for the date portion
    const newDateTime = new Date(tempDate); // ✅ Use tempDate
    newDateTime.setHours(hours, minutes, 0, 0);

    const result = await rescheduleConsultation(consultationId, newDateTime,axiosInstance);
    if (!window._authFailed)setLoading(false);
    if (result.success) {
      setErrorMessage(CONFIRMATION);
      setShowErrorModal(true);
    } else {
      setErrorMessage(result.error);
      setShowErrorModal(true);
    }
  };  

  if (loading) {
    return (
      <div className="bg-white p-8 min-h-screen">
        <div className="text-center py-10">
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="reschedule-container">
      <h2 className="reschedule-title">Reschedule Consultation</h2>

      <div className="reschedule-calendar">
        <h3 className="reschedule-label">Select a new date:</h3>
        <DatePicker
          selected={tempDate}
          onChange={(date) => setTempDate(date)}
          inline
          calendarClassName="custom-calendar"
          dayClassName={(date) =>
            date.getMonth() !== tempDate.getMonth() ? "outside-month" : ""
          }
        />
        <div className="calendar-buttons" style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
          <button className="apply-button" onClick={handleClear}>Clear</button>
          <button className="clear-button" onClick={handleCancel}>Cancel</button>
        </div>
      </div>

      <div className="reschedule-slot">
        <h3 className="reschedule-label">Choose a new slot:</h3>
        <select value={selectedSlot} onChange={(e) => setSelectedSlot(e.target.value)} className="reschedule-dropdown">
          <option value="">Select a time slot</option>
          {availableSlots.map((slot, index) => (
            <option key={index} value={slot}>{slot}</option>
          ))}
        </select>
      </div>

      <button onClick={handleReschedule} className="reschedule-button">Reschedule Consultation</button>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Reschedule</h3>
            <p>
              Are you sure you want to reschedule your consultation to <br />
              <strong>{tempDate.toDateString()}</strong> at <strong>{selectedSlot}</strong>?
            </p>
            <div className="modal-actions">
              <button className="cancel-modal-btn" onClick={() => setShowConfirmModal(false)}>
                No, Cancel
              </button>
              <button className="confirm-modal-btn" onClick={confirmReschedule}>
                Yes, Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{errorMessage === CONFIRMATION ? "Success!" : "Error!"}</h3>
            <p>{errorMessage}</p>
            <div className="modal-actions">
              <button className="confirm-modal-btn" onClick={() => {
                setShowErrorModal(false)
                if(errorMessage === CONFIRMATION) {
                  navigate("/patient/booked-consultation");
                }
              }}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RescheduleConsultation;
