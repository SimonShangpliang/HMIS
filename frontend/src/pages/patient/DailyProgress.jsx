import React, { useState, useEffect } from 'react';

const PatientConsultations = ({ patientId }) => {
  const [activeTab, setActiveTab] = useState('consultations');
  const [patient, setPatient] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [dailyProgress, setDailyProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        // In a real app, these would be API calls
        const patientResponse = await fetch(`/api/patients/${patientId}`);
        const patient = await patientResponse.json();
        
        const consultationsResponse = await fetch(`/api/patients/${patientId}/consultations`);
        const consultations = await consultationsResponse.json();
        
        const progressResponse = await fetch(`/api/patients/${patientId}/daily-progress`);
        const progress = await progressResponse.json();
        
        setPatient(patient);
        setConsultations(consultations);
        setDailyProgress(progress);
      } catch (error) {
        console.error("Error fetching patient data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [patientId]);

  // Mock data for demonstration purposes
  useEffect(() => {
    if (!loading && !consultations.length) {
      // Mock consultations data
      setConsultations([
        { id: 1, date: '2025-04-01', notes: 'Initial consultation, prescribed medication for pain relief', doctor: 'Dr. Smith' },
        { id: 2, date: '2025-04-02', notes: 'Follow-up consultation, patient reports improvement', doctor: 'Dr. Jones' },
        { id: 3, date: '2025-04-03', notes: 'Routine check, vitals are normal', doctor: 'Dr. Smith' },
        { id: 4, date: '2025-04-04', notes: 'Final consultation, cleared for discharge', doctor: 'Dr. Williams' }
      ]);

      // Mock daily progress data
      setDailyProgress([
        { id: 1, date: '2025-04-01', bloodPressure: 120, bodyTemp: 37.2, pulseRate: 78, breathingRate: 16 },
        { id: 2, date: '2025-04-02', bloodPressure: 118, bodyTemp: 36.9, pulseRate: 76, breathingRate: 15 },
        { id: 3, date: '2025-04-03', bloodPressure: 122, bodyTemp: 37.0, pulseRate: 75, breathingRate: 16 },
        { id: 4, date: '2025-04-04', bloodPressure: 120, bodyTemp: 36.8, pulseRate: 74, breathingRate: 15 }
      ]);
    }
  }, [loading, consultations.length]);

  if (loading) {
    return <div className="text-center p-4">Loading patient data...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-end mb-4">
        <button 
          className={`px-4 py-2 ${activeTab === 'consultations' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('consultations')}
        >
          Consultations
        </button>
        <button 
          className={`px-4 py-2 ${activeTab === 'dailyProgress' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('dailyProgress')}
        >
          Daily Progress
        </button>
      </div>

      {activeTab === 'consultations' && (
        <div>
          {consultations.map((consultation) => (
            <div key={consultation.id} className="mb-2 bg-gray-800 text-white rounded">
              <div className="grid grid-cols-2 p-4">
                <div className="text-left">
                  <span className="text-gray-300">Date</span>
                  <p>{new Date(consultation.date).toLocaleDateString()}</p>
                </div>
                <div className="text-left">
                  <span className="text-gray-300">Details</span>
                  <p>{consultation.notes}</p>
                  <p className="text-sm text-gray-300 mt-1">Doctor: {consultation.doctor}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'dailyProgress' && (
        <div>
          {dailyProgress.map((progress) => (
            <div key={progress.id} className="mb-2 bg-gray-800 text-white rounded">
              <div className="grid grid-cols-2 p-4">
                <div className="text-left">
                  <span className="text-gray-300">Date</span>
                  <p>{new Date(progress.date).toLocaleDateString()}</p>
                </div>
                <div className="text-left">
                  <span className="text-gray-300">Details</span>
                  <p>Blood Pressure: {progress.bloodPressure} mmHg</p>
                  <p>Body Temperature: {progress.bodyTemp}°C</p>
                  <p>Pulse Rate: {progress.pulseRate} bpm</p>
                  <p>Breathing Rate: {progress.breathingRate} breaths/min</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientConsultations;