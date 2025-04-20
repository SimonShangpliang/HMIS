import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const DocDailyProgress = () => {
  const [progressData, setProgressData] = useState([]);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const { patientId } = useParams();
  const navigate = useNavigate();

  // Mock data fetching function
  const fetchDailyProgressByPatientId = async (patientId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/doctors/progress/${patientId}`);
      
      // Ensure the response is OK (status code 200-299)
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
  
      const data = await response.json();
  
      // Return the data in the format you need
      return data.data.map(item => ({
        id: item._id,  // Assuming _id can be used as the unique identifier
        date: item.date.slice(0, 10),  // Extract date in YYYY-MM-DD format
        temperature: `${item.bodyTemp}°C`,  // Assuming the body temperature is in Celsius
        bloodPressure: `${item.bloodPressure}/80`,  // Assuming fixed diastolic pressure, adjust as necessary
        pulse: `${item.pulseRate} bpm`,
        respiration: `${item.breathingRate} /min`,
        oxygenSaturation: "Unknown"  // You don't have data for oxygen saturation in the example provided
      }));
    } catch (error) {
      console.error("Error fetching patient progress:", error);
      return [];  // Return an empty array on error
    }
  };
  
  // Mock function to get patient details
  const fetchPatientDetails = async (patientId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/patients/profile/${patientId}`);
      
      // Ensure the response is OK (status code 200-299)
      if (!response.ok) {
        throw new Error('Failed to fetch patient details');
      }
  
      const data = await response.json();
      
      // Map the response data to your required format
      return {
        id: data._id,  // Patient's ID
        name: data.name,  // Patient's name
        age: data.patient_info.age,  // Patient's age
        gender: data.gender,  // Patient's gender
        // You can add more fields as required (e.g., address, email, etc.)
      };
    } catch (error) {
      console.error("Error fetching patient details:", error);
      return null;  // Return null or empty object if there's an error
    }
  };
  

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [progressData, patientData] = await Promise.all([
          fetchDailyProgressByPatientId(patientId),
          fetchPatientDetails(patientId)
        ]);
        setProgressData(progressData);
        setPatient(patientData);
        setLoading(false);
      } catch (error) {
        console.error("Error loading data:", error);
        setLoading(false);
      }
    };

    loadData();
  }, [patientId]);

  const handleBackClick = () => {
    navigate(`/doctor/patient-consultations/${patientId}`);
  };

  return (
    <div className="p-6 bg-white">
      {/* Header with Back Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Daily Progress</h1>
        <button
          onClick={handleBackClick}
          className="px-4 py-2 bg-green-100 text-green-800 font-medium rounded-md hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Back
        </button>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading progress data...</p>
        </div>
      ) : (
        <>
          {/* Patient Information */}
          {patient && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Patient: {patient.name}
              </h2>
              <p className="text-sm text-gray-600">
                {patient.age} years, {patient.gender}
              </p>
            </div>
          )}

          {/* Progress Table */}
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg overflow-hidden">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Temperature</th>
                  <th className="px-4 py-3 text-left">Blood Pressure</th>
                  <th className="px-4 py-3 text-left">Pulse</th>
                  <th className="px-4 py-3 text-left">Respiration</th>
                  <th className="px-4 py-3 text-left">O₂ Saturation</th>
                </tr>
              </thead>
              <tbody>
                {progressData.map((progress) => (
                  <tr key={progress.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{progress.date}</td>
                    <td className="px-4 py-3">{progress.temperature}</td>
                    <td className="px-4 py-3">{progress.bloodPressure}</td>
                    <td className="px-4 py-3">{progress.pulse}</td>
                    <td className="px-4 py-3">{progress.respiration}</td>
                    <td className="px-4 py-3">{progress.oxygenSaturation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default DocDailyProgress;
