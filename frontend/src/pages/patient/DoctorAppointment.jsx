import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, Clock, ArrowLeft, User, Award, Star, MapPin, Phone } from "lucide-react";
import axios from "axios";
import "../../styles/patient/DoctorAppointment.css";

const DoctorAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [reason, setReason] = useState("");
  const [appointmentType, setAppointmentType] = useState("consultation");

  // Modal state controls
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Fetch doctor details
  useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/patients/doctors/${doctorId}`);
        console.log(response.data)
        setDoctor(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching doctor details:', err);
        setError('Failed to fetch doctor details. Please try again later.');
        setLoading(false);
      }
    };

    if (doctorId) {
      fetchDoctorDetails();
    }
  }, [doctorId]);

  // Generate available times for the selected date
  useEffect(() => {
    if (selectedDate) {
      const times = [];
      const startHour = 9;
      const endHour = 17;

      for (let hour = startHour; hour < endHour; hour++) {
        times.push(`${hour}:00`);
        times.push(`${hour}:30`);
      }

      setAvailableTimes(times);
    }
  }, [selectedDate]);

  // Get next 14 days for calendar
  const getDateOptions = () => {
    const dates = [];
    const today = new Date();

    for (let i = 0; i < 14; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      dates.push(date);
    }

    return dates;
  };

  const handleDateSelection = (date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setShowCalendar(false);
  };

  const handleTimeSelection = (time) => {
    setSelectedTime(time);
  };

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedTime) {
      setErrorMessage("Please select both date and time for your appointment");
      setShowErrorModal(true); // Show error modal if date/time is not selected
      return;
    }

    // Store the selected appointment details
    setSelectedAppointment({
      doctor: doctor.employee_id?.name,
      date: selectedDate.toLocaleDateString(),
      time: selectedTime,
    });

    // Show the confirmation modal
    setShowConfirmModal(true);
  };

  const confirmBookAppointment = async () => {
    try {
      const appointmentDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(":");
      appointmentDateTime.setHours(parseInt(hours), parseInt(minutes));

      const patientId = localStorage.getItem("user_id");

      const consultationData = {
        patient_id: patientId,
        doctor_id: doctor.employee_id._id,
        booked_date_time: appointmentDateTime,
        reason: reason,
        appointment_type: appointmentType,
        created_by: 10126, // Assuming 10126 is the ID of a bot account for users self creating appointments
        status:'requested'
      };

      await axios.post(`${import.meta.env.VITE_API_URL}/consultations/book`, consultationData);

      setShowConfirmModal(false);
      navigate("/patient/consultations");
    } catch (err) {
      console.error('Error booking appointment:', err);
      setErrorMessage("Failed to book appointment. Please try again.");
      setShowErrorModal(true); // Show error modal if the booking fails
    }
  };

  if (loading) return <p className="loading-message">Loading doctor details...</p>;
  if (error) return <p className="error-message">{error}</p>;
  if (!doctor) return <p className="error-message">Doctor not found</p>;

  return (
    <div className="doctor-appointment-page">
      <button className="back-button" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} />
        Back to Doctors
      </button>

      <div className="doctor-profile">
        <div className="doctor-header">
          <div className="doctor-avatar">
            {doctor.employee_id?.profile_pic ? (
              <img src={doctor.employee_id.profile_pic} alt={doctor.employee_id?.name} />
            ) : (
              <div className="avatar-placeholder">
                <User size={40} />
              </div>
            )}
          </div>

          <div className="doctor-header-info">
            <h2 className="doctor-name">{doctor.employee_id?.name || 'Unknown Doctor'}</h2>
            <p className="doctor-specialty">{doctor.specialization}</p>
            <div className="doctor-rating">
              <Star size={16} className="star-icon" />
              <span>{doctor.rating}/5</span>
              <span className="rating-count">({doctor.num_ratings} ratings)</span>
            </div>
          </div>
        </div>

        <div className="doctor-details">
          <div className="detail-section">
            <h3 className="section-title">About</h3>
            <p className="detail-item">
              <Award size={16} className="detail-icon" />
              <span>{doctor.qualification} • {doctor.experience} years experience</span>
            </p>
            <p className="detail-item">
              <MapPin size={16} className="detail-icon" />
              <span>Room {doctor.room_num} • {doctor.department_id?.dept_name || 'Unknown Department'}</span>
            </p>
            {doctor.employee_id?.phone_number && (
              <p className="detail-item">
                <Phone size={16} className="detail-icon" />
                <span>{doctor.employee_id.phone_number}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="appointment-section">
        <h3 className="section-title">Book Appointment</h3>

        <div className="appointment-selectors">
          <div className="date-selector">
            <button className="selector-button" onClick={() => setShowCalendar(!showCalendar)}>
              <Calendar size={16} className="selector-icon" />
              {selectedDate ? new Date(selectedDate).toLocaleDateString() : 'Select Date'}
            </button>

            {showCalendar && (
              <div className="calendar-dropdown">
                <div className="date-options">
                  {getDateOptions().map((date, index) => (
                    <button
                      key={index}
                      className={`date-option ${selectedDate && date.toDateString() === new Date(selectedDate).toDateString() ? 'selected' : ''}`}
                      onClick={() => handleDateSelection(date)}
                    >
                      <div className="date-day">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                      <div className="date-number">{date.getDate()}</div>
                      <div className="date-month">{date.toLocaleDateString('en-US', { month: 'short' })}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {selectedDate && (
            <div className="time-selector">
              <div className="time-header">
                <Clock size={16} className="selector-icon" />
                <span>Available Times</span>
              </div>

              <div className="time-options">
                {availableTimes.map((time, index) => (
                  <button
                    key={index}
                    className={`time-option ${selectedTime === time ? 'selected' : ''}`}
                    onClick={() => handleTimeSelection(time)}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="appointment-type-selector">
            <label htmlFor="appointment-type">Appointment Type:</label>
            <select
              id="appointment-type"
              value={appointmentType}
              onChange={(e) => setAppointmentType(e.target.value)}
              className="type-selector"
            >
              <option value="consultation">Consultation</option>
              <option value="regular">Regular</option>
              <option value="follow-up">Follow-up</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>

          <div className="reason-input">
            <label htmlFor="reason">Reason for Visit (Symptoms):</label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please describe your symptoms or reason for the appointment"
              rows={3}
              className="reason-textarea"
            />
          </div>
        </div>

        <button
          className={`book-button ${!selectedDate || !selectedTime ? 'disabled' : ''}`}
          onClick={handleBookAppointment}
          disabled={!selectedDate || !selectedTime}
        >
          Book Appointment
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Appointment</h3>
            <p>
              Are you sure you want to book an appointment with <strong>{selectedAppointment?.doctor}</strong> on{" "}
              <strong>{selectedAppointment?.date} at {selectedAppointment?.time}</strong>?
            </p>
            <div className="modal-actions">
              <button className="cancel-modal-btn" onClick={() => setShowConfirmModal(false)}>
                No, Cancel
              </button>
              <button className="confirm-modal-btn" onClick={confirmBookAppointment}>
                Yes, Book
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

export default DoctorAppointment;
