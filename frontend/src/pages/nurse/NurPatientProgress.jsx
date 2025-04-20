import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const NurPatientProgress = () => {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [patient, setPatient] = useState(null);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [vitalsData, setVitalsData] = useState({
    bloodPressure: '',
    bodyTemp: '',
    pulseRate: '',
    breathingRate: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  useEffect(() => {
    const fetchPatientVitals = async () => {
      setLoading(true);
      try {
        // Fetch patient details first
        const patientResponse = await axios.get(`${import.meta.env.VITE_API_URL}/patients/profile/${patientId}`);
        setPatient(patientResponse.data);

        // Then fetch all vitals for this patient
        const vitalsResponse = await axios.get(`${import.meta.env.VITE_API_URL}/doctors/progress/${patientId}`);
        console.log(vitalsResponse);
        
        // Format the data for display
        const formattedData = vitalsResponse.data.data.map(item => ({
          id: item._id,
          date: item.date,
          time: item.time,
          details: `Temp ${item.bodyTemp}°F, BP ${item.bloodPressure}/80, HR ${item.pulseRate} bpm, BR ${item.breathingRate} rpm`
        }));
        
        setProgressData(formattedData);
      } catch (err) {
        console.error('Error fetching patient vitals:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load patient progress data');
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchPatientVitals();
    }
  }, [patientId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVitalsData({
      ...vitalsData,
      [name]: value
    });
  };

  const handleSubmitVitals = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');
    
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/nurses/patients/${patientId}/vitals`, 
        vitalsData
      );
      
      // Add new vitals to the displayed list
      const newVital = response.data.data;
      const formattedNewVital = {
        id: newVital._id || Date.now().toString(),
        date: newVital.date,
        time: newVital.time,
        details: `Temp ${newVital.bodyTemp}°F, BP ${newVital.bloodPressure}/80, HR ${newVital.pulseRate} bpm, BR ${newVital.breathingRate} rpm`
      };
      
      setProgressData([formattedNewVital, ...progressData]);
      setSubmitSuccess('Vitals added successfully!');
      
      // Reset form
      setVitalsData({
        bloodPressure: '',
        bodyTemp: '',
        pulseRate: '',
        breathingRate: ''
      });
      
      // Close modal after a short delay
      setTimeout(() => {
        setShowModal(false);
        setSubmitSuccess('');
      }, 2000);
      
    } catch (err) {
      console.error('Error adding vitals:', err);
      setSubmitError(err.response?.data?.message || err.message || 'Failed to add vitals');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Daily Progress</h2>
        <button
          className="px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-md hover:bg-gray-300"
          onClick={() => navigate(`/nurse/patient-records/${patientId}/consultations`)}
        >
          Back to Patient Consultations
        </button>
      </div>

      {patient && (
        <div className="mb-6 p-4 bg-green-50 rounded-md">
          <h3 className="text-lg font-semibold text-gray-800">
            Patient: {patient.name}
          </h3>
          <p className="text-sm text-gray-600">
            ID: {patient._id}
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
          {error}
        </div>
      ) : progressData.length === 0 ? (
        <div className="bg-yellow-50 text-yellow-700 p-4 rounded-md mb-6">
          No vitals data available for this patient.
        </div>
      ) : (
        <table className="w-full border-collapse border border-gray-300 mb-6">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 px-4 py-2">Date</th>
              <th className="border border-gray-300 px-4 py-2">Time</th>
              <th className="border border-gray-300 px-4 py-2">Details</th>
            </tr>
          </thead>
          <tbody>
            {progressData.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-100">
                <td className="border border-gray-300 px-4 py-2">{entry.date}</td>
                <td className="border border-gray-300 px-4 py-2">{entry.time}</td>
                <td className="border border-gray-300 px-4 py-2">{entry.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="flex space-x-4">
        <button
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          onClick={() => setShowModal(true)}
        >
          Add Vitals
        </button>
      </div>

      {/* Modal for adding vitals */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Add Patient Vitals</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            {submitSuccess && (
              <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
                {submitSuccess}
              </div>
            )}
            
            {submitError && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                {submitError}
              </div>
            )}
            
            <form onSubmit={handleSubmitVitals}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Blood Pressure (systolic)
                </label>
                <input
                  type="number"
                  name="bloodPressure"
                  value={vitalsData.bloodPressure}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="e.g., 120"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Body Temperature (°F)
                </label>
                <input
                  type="number"
                  name="bodyTemp"
                  value={vitalsData.bodyTemp}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="e.g., 98.6"
                  step="0.1"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Pulse Rate (bpm)
                </label>
                <input
                  type="number"
                  name="pulseRate"
                  value={vitalsData.pulseRate}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="e.g., 72"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Breathing Rate (rpm)
                </label>
                <input
                  type="number"
                  name="breathingRate"
                  value={vitalsData.breathingRate}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="e.g., 16"
                  required
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : 'Save Vitals'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NurPatientProgress;