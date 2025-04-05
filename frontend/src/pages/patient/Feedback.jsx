import React, { useState, useEffect } from 'react';

const PatientFeedbackForm = ({ patientId }) => {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState({
    treatmentSatisfaction: '',
    comments: '',
    followUpRequired: false
  });

  // Fetch patient data
  useEffect(() => {
    const fetchPatient = async () => {
      try {
        // In a real app, you would fetch patient data from API
        // Using mock data based on the schema for demonstration
        const response = await fetch(`/api/patients/${patientId}`);
        const data = await response.json();
        setPatient(data);
      } catch (error) {
        console.error("Error fetching patient data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [patientId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // In a real app, you would submit feedback to an API
    console.log("Submitting feedback:", {
      patientId,
      overallRating: rating,
      ...feedback
    });
    
    // Reset form after submission
    setRating(0);
    setFeedback({
      treatmentSatisfaction: '',
      comments: '',
      followUpRequired: false
    });
    
    alert("Thank you for your feedback!");
  };

  if (loading) {
    return <div className="text-center p-4">Loading patient data...</div>;
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-6 rounded-md shadow-md">
        <h2 className="text-center text-xl font-semibold mb-4">Patient Feedback</h2>
        
        {patient && (
          <div className="mb-4 p-3 bg-gray-50 rounded-md">
            <p><span className="font-medium">Name:</span> {patient.name}</p>
            <p><span className="font-medium">Room:</span> {patient.patient_info?.roomNo}</p>
            <p><span className="font-medium">Age:</span> {patient.patient_info?.age}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <p className="text-gray-600 mb-2 font-bold">Overall Rating</p>
            <div className="flex space-x-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="focus:outline-none transition-transform duration-200 hover:scale-110"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill={(hoverRating || rating) >= star ? "gold" : "lightgray"}
                    className="w-6 h-6"
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
          
          <div className="mb-4">
            <label className="block text-gray-600 mb-2">How satisfied are you with your treatment?</label>
            <select 
              className="w-full p-2 border border-gray-300 rounded-md"
              value={feedback.treatmentSatisfaction}
              onChange={(e) => setFeedback({...feedback, treatmentSatisfaction: e.target.value})}
              required
            >
              <option value="">Select an option</option>
              <option value="Very Satisfied">Very Satisfied</option>
              <option value="Satisfied">Satisfied</option>
              <option value="Neutral">Neutral</option>
              <option value="Dissatisfied">Dissatisfied</option>
              <option value="Very Dissatisfied">Very Dissatisfied</option>
            </select>
          </div>
          
          <div className="mb-6">
            <p className="text-gray-600 mb-2 font-bold">Additional Comments</p>
            <textarea
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              rows="3"
              placeholder="Tell us about your experience..."
              value={feedback.comments}
              onChange={(e) => setFeedback({...feedback, comments: e.target.value})}
            ></textarea>
          </div>
              
          <button
            type="submit"
            className="w-full bg-teal-500 hover:bg-teal-600 text-white py-2 px-4 rounded-md transition-colors duration-200"
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
            {patient?.email || "patient@hospital.com"}
          </div>
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-2">
              <path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" clipRule="evenodd" />
            </svg>
            {patient?.phone_number || "xxxxx-xxxxx"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientFeedbackForm;


