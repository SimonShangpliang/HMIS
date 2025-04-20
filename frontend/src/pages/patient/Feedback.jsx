import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from "../../context/AuthContext";

export const fetchConsultationsByPatientId = async (patientId,axiosInstance) => {
  try {
    const response = await axiosInstance.get(`${import.meta.env.VITE_API_URL}/patients/${patientId}/consultations`);
    const data = response.data;

    // Check if we received dummy data or actual consultations
    if (data.dummy) {
      return data.consultations; // Return the dummy data as is
    }

    console.log(data);
    return data;
  } catch (err) {
    console.error("Error fetching consultations:", err);
    return []; // fallback return
  }
};

const PatientFeedbackForm = () => {
  const patientId = localStorage.getItem("user_id");
  const [patient, setPatient] = useState(null);
  const [consultationsWithoutFeedback, setConsultationsWithoutFeedback] = useState([]);
  const [consultationsWithFeedback, setConsultationsWithFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConsultationList, setShowConsultationList] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [rating, setRating] = useState(3);
  const { axiosInstance } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState({
    comments: '',
  });

  // Dummy patient data
  const dummyPatient = {
    id: "10013",
    name: "Sarah Johnson",
    email: "patient@hospital.com",
    phone_number: "xxxxx-xxxxx",
  };

  // Fetch consultations and separate them based on feedback status
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const allConsultations = await fetchConsultationsByPatientId(patientId,axiosInstance);

        // Separate consultations with and without feedback
        const withFeedback = [];
        const withoutFeedback = [];

        allConsultations.forEach(consultation => {
          if (consultation.feedback) {
            withFeedback.push({
              ...consultation,
              doctorName: consultation.doctor.name, // Align with expected format
              specialty: consultation.doctor.specialization,
              date: consultation.booked_date_time,
            });
          } else if (consultation.status === "completed") {
            withoutFeedback.push({
              ...consultation,
              doctorName: consultation.doctor.name, // Align with expected format
              specialty: consultation.doctor.specialization,
              date: consultation.booked_date_time,
            });
          }
        });

        setConsultationsWithFeedback(withFeedback);
        setConsultationsWithoutFeedback(withoutFeedback);
        setPatient(dummyPatient); // In a real app, you would fetch patient data
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
       
      }
      finally{
        if (!window._authFailed) setLoading(false);
      }
    };

    fetchData();
  }, [patientId]);

  const handleSelectConsultation = (consultation) => {
    setSelectedConsultation(consultation);
    setShowConsultationList(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!selectedConsultation) {
      alert("No consultation chosen. Please select a consultation before submitting feedback.");
      return;
    }
  
    setSubmitting(true);
    const feedbackData = {
      rating: rating,
      comments: feedback.comments,
    };
  
    try {
      await axiosInstance.post(
        `${import.meta.env.VITE_API_URL}/patients/${patientId}/consultations/${selectedConsultation._id}/feedback`,
        feedbackData
      );
  
      alert("Thank you for your feedback!");
  
      // Update feedback lists
      const updatedConsultation = { ...selectedConsultation, feedback: feedbackData };
      setConsultationsWithFeedback((prev) => [...prev, updatedConsultation]);
      setConsultationsWithoutFeedback((prev) =>
        prev.filter((c) => c._id !== selectedConsultation._id)
      );
  
      // Reset form
      setRating(3);
      setSelectedConsultation(null);
      setFeedback({ comments: '' });
    } catch (err) {
      console.error("Error submitting feedback:", err);
      alert("Failed to submit feedback. Please try again.");
    } finally {
      if(!window._authFailed)setSubmitting(false);
    }
  };
  

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getConsultationDropdown = () => {
    if (consultationsWithoutFeedback.length === 0) {
      return (
        <div className="p-4 text-center text-gray-500 border rounded-md">
          No consultations found without feedback
        </div>
      );
    }

    return (
      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
        {consultationsWithoutFeedback.map((consultation) => (
          <div
            key={consultation.id}
            onClick={() => handleSelectConsultation(consultation)}
            className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100"
          >
            <div className="font-medium">Dr. {consultation.doctorName}</div>
            <div className="text-sm text-gray-500 flex justify-between">
              <span>{formatDate(consultation.date)}</span>
              <span className="text-xs text-gray-400">{consultation.specialty}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderStars = (ratingValue) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={ratingValue >= star ? "#FFD700" : "#E5E7EB"}
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
              clipRule="evenodd"
            />
          </svg>
        ))}
      </div>
    );
  };

  const renderPreviousFeedbacks = () => {
    if (consultationsWithFeedback.length === 0) {
      return (
        <div className="text-center text-gray-500 p-4">
          No feedback submitted yet.
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {consultationsWithFeedback.map((consultation) => (
          <div key={consultation.id} className="border rounded-md p-4 bg-gray-50">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-medium">Dr. {consultation.doctorName}</h4>
                <p className="text-sm text-gray-500">{formatDate(consultation.date)}</p>
              </div>
              {renderStars(consultation.feedback.rating)}
            </div>
            {consultation.feedback.comments && (
              <p className="mt-2 text-gray-700">{consultation.feedback.comments}</p>
            )}
            <div className="mt-2 text-xs text-gray-400">
              {consultation.feedback.created_at ? `Submitted on ${formatDate(consultation.feedback.created_at)}` : ''}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <p className="text-gray-600">Loading patient data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Feedback Form */}
          <div className="bg-white p-6 rounded-md shadow-md">
            <h2 className="text-center text-2xl font-bold mb-6">Submit Feedback</h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-gray-700 mb-2 font-medium">Select Consultation</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowConsultationList(!showConsultationList)}
                    className="w-full p-3 bg-white border border-gray-300 rounded-md text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {selectedConsultation ? (
                      <div>
                        <div className="font-medium">Dr. {selectedConsultation.doctorName}</div>
                        <div className="text-sm text-gray-500">{formatDate(selectedConsultation.date)}</div>
                      </div>
                    ) : (
                      <span className="text-gray-500">Select a consultation</span>
                    )}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-5 w-5 text-gray-400 transition-transform ${showConsultationList ? 'transform rotate-180' : ''}`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  {showConsultationList && getConsultationDropdown()}
                </div>
              </div>

              <div className="mb-6">
                <p className="block text-gray-700 mb-2 font-medium">Overall Rating</p>
                <div className="flex justify-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="focus:outline-none"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill={(hoverRating || rating) >= star ? "#FFD700" : "#E5E7EB"}
                        className="w-8 h-8"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <p className="block text-gray-700 mb-2 font-medium">Additional Comments</p>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  rows="4"
                  placeholder="Tell us about your experience..."
                  value={feedback.comments}
                  onChange={(e) => setFeedback({ ...feedback, comments: e.target.value })}
                ></textarea>
              </div>

             <button
              type="submit"
              className="w-full bg-teal-500 hover:bg-teal-600 text-white py-3 px-4 rounded-md transition-colors duration-200 font-medium flex justify-center items-center"
              disabled={!selectedConsultation || submitting}
            >
              {submitting ? (
                <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
              ) : null}
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </button>

            </form>

            <div className="mt-6 pt-4 border-t border-gray-200 flex flex-col items-center text-gray-400 text-sm">
              <div className="flex items-center mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-2">
                  <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                  <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
                </svg>
                {patient?.email}
              </div>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-2">
                  <path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" clipRule="evenodd" />
                </svg>
                {patient?.phone_number}
              </div>
            </div>
          </div>

          {/* Previous Feedback Section */}
          <div className="bg-white p-6 rounded-md shadow-md">
            <h2 className="text-center text-2xl font-bold mb-6">Previous Feedback</h2>
            <div className="overflow-y-auto max-h-96">
              {renderPreviousFeedbacks()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientFeedbackForm;