import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate, useParams } from "react-router-dom";
import "../../styles/patient/RescheduleConsultation.css";

export const rescheduleConsultation = async (consultationId, newDateTime) => {
  try {
    const res = await fetch(`http://localhost:5000/api/patients/${consultationId}/reschedule`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ newDateTime }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to reschedule consultation.");
    }

    return { success: true, consultation: data.consultation };
  } catch (err) {
    console.error("Reschedule error:", err);
    return { success: false, error: err.message };
  }
};

const RescheduleConsultation = () => {
  // states
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState("");
  const [tempDate, setTempDate] = useState(new Date());

  // inbuilt
  const { consultationId } = useParams();
  const navigate = useNavigate();

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

  const handleApply = () => {
    setSelectedDate(tempDate);
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
  
    // Extract start time from selected slot
    const [startTime] = selectedSlot.split(" - ");
    const [time, meridiem] = startTime.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
  
    if (meridiem === "PM" && hours < 12) hours += 12;
    if (meridiem === "AM" && hours === 12) hours = 0;
  
    const newDateTime = new Date(selectedDate);
    newDateTime.setHours(hours, minutes, 0, 0);
  
    const result = await rescheduleConsultation(consultationId, newDateTime);
  
    if (result.success) {
      alert("Consultation successfully rescheduled!");
      navigate("/patient/booked-consultation");
    } else {
      setErrorMessage(result.error); // 🆕 Set backend error message
      setShowErrorModal(true);
    }
  };  

  const confirmReschedule = () => {
    setShowConfirmModal(false);
    alert(`Consultation rescheduled successfully!\nNew Date: ${selectedDate.toDateString()}\nTime: ${selectedSlot}`);
    navigate("/patient/booked-consultation");
  };

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
        />
        <div className="calendar-buttons" style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
          <button className="apply-button" onClick={handleApply}>Apply</button>
          <button className="clear-button" onClick={handleClear}>Clear</button>
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
              <strong>{selectedDate.toDateString()}</strong> at <strong>{selectedSlot}</strong>?
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
            <h3>Error!</h3>
            <p>{errorMessage}</p>
            <div className="modal-actions">
              <button className="confirm-modal-btn" onClick={() => setShowErrorModal(false)}>
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
