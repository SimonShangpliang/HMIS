import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PatientRecords = () => {
  const [allPatients, setAllPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // Function to fetch patients from backend
  const fetchPatients = async () => {
    try {
      setLoading(true);
      
      // CORRECTED ENDPOINT: Using 'reception' instead of 'receptionist' based on server.js
      console.log("Fetching patients from corrected API endpoint...");
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/reception/patients`);
      
      console.log("API Response:", response.data);
      
      // Handle different response formats
      let patientsArray = [];
      
      if (response.data && response.data.patients) {
        // Format { patients: [...] }
        patientsArray = response.data.patients;
      } else if (Array.isArray(response.data)) {
        // Format direct array
        patientsArray = response.data;
      } else {
        console.error("Unexpected API response format:", response.data);
        setError("Received incorrect data format from server.");
        setLoading(false);
        return;
      }
      
      // Format the patient data
      const formattedPatients = patientsArray.map(patient => ({
        id: patient._id || patient.id,
        name: patient.name,
        contact: patient.phone_number || patient.contact || patient.mobile,
        status: patient.admitted ? "Admitted" : "Outpatient",
        roomNo: patient.room_number || patient.roomNo || "N/A"
      }));
      
      console.log("Formatted patients:", formattedPatients);
      
      setAllPatients(formattedPatients);
      setFilteredPatients(formattedPatients);
      setError(null);
    } catch (error) {
      console.error("Failed to fetch patients:", error);
      
      // Use mock data if API fails
      console.log("API failed, using mock data");
      const mockPatients = [
        { id: "001", name: "John Doe", contact: "555-123-4567", status: "Admitted", roomNo: "201" },
        { id: "002", name: "Jane Smith", contact: "555-987-6543", status: "Outpatient", roomNo: "N/A" },
        { id: "003", name: "Robert Johnson", contact: "555-456-7890", status: "Admitted", roomNo: "105" },
        { id: "004", name: "Emily Williams", contact: "555-789-0123", status: "Discharged", roomNo: "N/A" },
      ];
      
      setAllPatients(mockPatients);
      setFilteredPatients(mockPatients);
      
      // Set an error message so the user knows there's an issue
      if (error.response && error.response.status === 401) {
        setError("Authentication issue. The mock data is shown temporarily.");
      } else if (error.response && error.response.status === 404) {
        setError("API endpoint not found. The mock data is shown temporarily.");
      } else {
        setError(`API connection issue. The mock data is shown temporarily. (${error.message})`);
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Function to handle search
  const handleSearch = (term) => {
    setSearchTerm(term);
    
    if (!term.trim()) {
      setFilteredPatients(allPatients);
      return;
    }
    
    const lowerCaseTerm = term.toLowerCase();
    const filtered = allPatients.filter(patient => 
      patient.name?.toLowerCase().includes(lowerCaseTerm) || 
      `p${patient.id?.toString().substring(0, 5)}`.toLowerCase().includes(lowerCaseTerm) ||
      patient.contact?.toLowerCase().includes(lowerCaseTerm)
    );
    
    setFilteredPatients(filtered);
  };
  
  // Updated function to view patient consultations
  const viewPatientDetails = (patientId) => {
    navigate(`/nurse/patient-records/${patientId}/consultations`);
  };

  useEffect(() => {
    // Fetch patients when component mounts
    fetchPatients();
  }, []); // No dependencies needed

  return (
    <div className="p-6 bg-white h-full">
      {/* Search Bar */}
      <div className="mb-8 max-w-3xl mx-auto">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by Patient Name / ID / Contact No."
          className="w-full p-3 bg-gray-200 rounded-md text-center text-gray-700"
        />
      </div>
      
      {/* Loading and Error States */}
      {loading && (
        <div className="text-center py-8">
          <p className="text-lg text-gray-600">Loading patient records...</p>
        </div>
      )}
      
      {error && (
        <div className="text-center py-4 mb-4 bg-yellow-100 rounded-lg">
          <p className="text-yellow-800">{error}</p>
        </div>
      )}
      
      {/* Patient Records Table */}
      {!loading && (
        <div className="max-w-3xl mx-auto">
          {/* Table Header */}
          <div className="grid grid-cols-6 bg-gray-800 text-white rounded-md overflow-hidden mb-4">
            <div className="p-4 text-center">PID</div>
            <div className="p-4">Patient Name</div>
            <div className="p-4">Contact</div>
            <div className="p-4">Status</div>
            <div className="p-4">Room No.</div>
            <div className="p-4"></div>
          </div>
          
          {/* Table Rows */}
          {filteredPatients.length > 0 ? (
            filteredPatients.map((patient) => (
              <div 
                key={patient.id}
                className="grid grid-cols-6 bg-gray-800 text-white mb-4 rounded-md overflow-hidden"
              >
                <div className="p-4 text-center">{`P${patient.id?.toString().substring(0, 5) || '000'}`}</div>
                <div className="p-4">{patient.name}</div>
                <div className="p-4">{patient.contact}</div>
                <div className="p-4">{patient.status}</div>
                <div className="p-4">{patient.roomNo}</div>
                <div className="p-4 flex justify-center">
                  <button 
                    onClick={() => viewPatientDetails(patient.id)}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-1 rounded transition-colors"
                  >
                    View
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-lg text-gray-600">No patients found matching your search.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PatientRecords;