import React, { useState, useEffect } from 'react';

const PatientFeedbackForm = ({ patientId }) => {
  const [patient, setPatient] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConsultationList, setShowConsultationList] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [rating, setRating] = useState(3);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState({
    comments: '',
  });

  // Dummy patient data
  const dummyPatient = {
    id: "P12345",
    name: "Sarah Johnson",
    email: "patient@hospital.com",
    phone_number: "xxxxx-xxxxx",
  };

  // Dummy consultation data
  const dummyConsultations = [
    {
      id: "C001",
      doctorName: "Michael Chen",
      specialty: "Cardiology",
      date: "2025-03-15T10:30:00",
    },
    {
      id: "C002",
      doctorName: "Emily Rodriguez",
      specialty: "Orthopedics",
      date: "2025-03-28T14:15:00",
    },
    {
      id: "C003",
      doctorName: "James Wilson",
      specialty: "Neurology",
      date: "2025-04-02T09:00:00",
    }
  ];

  // Simulate API fetch with dummy data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulate network delay
        setTimeout(() => {
          setPatient(dummyPatient);
          setConsultations(dummyConsultations);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
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
      alert("Please select a consultation first.");
      return;
    }
    
    // In a real app, you would submit feedback to an API
    console.log("Submitting feedback:", {
      patientId,
      consultationId: selectedConsultation.id,
      doctorName: selectedConsultation.doctorName,
      consultationDate: selectedConsultation.date,
      overallRating: rating,
      ...feedback
    });
    
    // Reset form after submission
    setRating(3);
    setSelectedConsultation(null);
    setFeedback({
      comments: '',
    });
    
    alert("Thank you for your feedback!");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
    });
  };

  const getConsultationDropdown = () => {
    if (consultations.length === 0) {
      return (
        <div className="p-4 text-center text-gray-500 border rounded-md">
          No consultations found
        </div>
      );
    }

    return (
      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
        {consultations.map((consultation) => (
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
      <div className="w-full max-w-md bg-white p-6 rounded-md shadow-md">
        <h2 className="text-center text-2xl font-bold mb-6">Patient Feedback</h2>
        
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
              onChange={(e) => setFeedback({...feedback, comments: e.target.value})}
            ></textarea>
          </div>
              
          <button
            type="submit"
            className="w-full bg-teal-500 hover:bg-teal-600 text-white py-3 px-4 rounded-md transition-colors duration-200 font-medium"
          >
            Submit Feedback
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
    </div>
  );
};

export default PatientFeedbackForm;