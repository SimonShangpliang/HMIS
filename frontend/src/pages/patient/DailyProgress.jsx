import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from "../../context/AuthContext";

const PatientVitals = () => {
  const [latestVital, setLatestVital] = useState(null);
  const [allVitals, setAllVitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const patientId = localStorage.getItem("user_id"); // 👈 Fetch from localStorage
  const { axiosInstance } = useAuth();
  


  useEffect(() => {
    const fetchPatientVitals = async () => {
      try {
        // Fetch the latest vital
        const latestVitalResponse = await axiosInstance.get(`${import.meta.env.VITE_API_URL}/patients/${patientId}/vitals/latest`);
        const latestVitalData = latestVitalResponse.data;


        const allVitalsResponse = await axiosInstance.get(`${import.meta.env.VITE_API_URL}/patients/${patientId}/vitals`);
        const allVitalsData = allVitalsResponse.data;


        setLatestVital(latestVitalData.data);
        setAllVitals(allVitalsData.data || []);
      } catch (error) {

        console.error("Error fetching patient vitals:", error);
        setError(error.response.data.message);
      } finally {
        if (!window._authFailed) setLoading(false);

      }
    };

    fetchPatientVitals();
  }, [patientId]);

  // Mock data for demonstration purposes
  useEffect(() => {
    if (!loading && !latestVital && !error) {
      // Mock latest vital
 
    }
  }, [loading, latestVital, error]);

  if (loading) {
    return <div className="text-center p-4">Loading patient vitals...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Latest Vitals Display */}
      {latestVital && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Latest Vitals - {new Date(latestVital.date).toLocaleDateString()} {latestVital.time}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-100 p-4 rounded shadow">
              <div className="text-blue-800 font-semibold">Blood Pressure</div>
              <div className="text-2xl font-bold">{latestVital.bloodPressure} <span className="text-sm">mmHg</span></div>
            </div>
            <div className="bg-red-100 p-4 rounded shadow">
              <div className="text-red-800 font-semibold">Body Temperature</div>
              <div className="text-2xl font-bold">{latestVital.bodyTemp} <span className="text-sm">°C</span></div>
            </div>
            <div className="bg-purple-100 p-4 rounded shadow">
              <div className="text-purple-800 font-semibold">Pulse Rate</div>
              <div className="text-2xl font-bold">{latestVital.pulseRate} <span className="text-sm">bpm</span></div>
            </div>
            <div className="bg-green-100 p-4 rounded shadow">
              <div className="text-green-800 font-semibold">Breathing Rate</div>
              <div className="text-2xl font-bold">{latestVital.breathingRate} <span className="text-sm">breaths/min</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Vitals History */}
      <div>
        <h2 className="text-xl font-bold mb-4">Vitals History</h2>
        {allVitals.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="py-2 px-4 text-left">Date</th>
                  <th className="py-2 px-4 text-left">Time</th>
                  <th className="py-2 px-4 text-left">Blood Pressure (mmHg)</th>
                  <th className="py-2 px-4 text-left">Body Temp (°C)</th>
                  <th className="py-2 px-4 text-left">Pulse Rate (bpm)</th>
                  <th className="py-2 px-4 text-left">Breathing Rate</th>
                </tr>
              </thead>
              <tbody>
                {allVitals.map((vital, index) => (
                  <tr key={vital._id || index} className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}>
                    <td className="py-2 px-4">{new Date(vital.date).toLocaleDateString()}</td>
                    <td className="py-2 px-4">{vital.time}</td>
                    <td className="py-2 px-4">{vital.bloodPressure}</td>
                    <td className="py-2 px-4">{vital.bodyTemp}</td>
                    <td className="py-2 px-4">{vital.pulseRate}</td>
                    <td className="py-2 px-4">{vital.breathingRate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center p-4 bg-gray-100 rounded">No vitals history available</div>
        )}
      </div>
    </div>
  );
};

export default PatientVitals;