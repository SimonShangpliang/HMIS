import React, { useState } from "react";

const PublicData = () => {
  const [disease, setDisease] = useState("covid");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDownload = async() => {
    try {
      if (!startTime || !endTime) {
        setError("Please select both start and end dates");
        return;
      }

      setLoading(true);
      setError("");
      
      console.log("Initiating download...");
      
      
      const params = new URLSearchParams();
      params.append('disease', disease);
      params.append('startTime', startTime);
      params.append('endTime', endTime);
      
     
      const response = await fetch(`/api/public-data?${params.toString()}`, {
        method: 'GET',
      });
  
      console.log("Response status:", response.status);
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }
  
     
      const blob = await response.blob();
      console.log("Blob received:", blob.size, "bytes", blob.type);
      
      
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      
      
      const dateStr = new Date().toISOString().split('T')[0];
      a.download = `${disease}-data-${dateStr}.zip`;
      
      document.body.appendChild(a);
      a.click();
      
      
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
      console.log("Download initiated successfully");
  
    } catch (err) {
      console.error("Download error:", err);
      if (err.response) {
        setError(`Error (${err.response.status}): ${err.response.data?.message || err.message}`);
      } else {
        setError(err.message || 'Failed to download file');
      }
    } finally {
      setLoading(false);
    }
  };

  
  const diseases = [
    { value: "covid", label: "COVID-19" },
    { value: "flu", label: "Influenza" },
    { value: "malaria", label: "Malaria" },
    { value: "dengue", label: "Dengue" },
    { value: "tuberculosis", label: "Tuberculosis" },
    { value: "pneumonia", label: "Pneumonia" },
    { value: "hypertension", label: "Hypertension" },
    { value: "diabetes", label: "Diabetes" }
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Export Patient Data</h1>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Disease Type</label>
          <select
            value={disease}
            onChange={(e) => setDisease(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {diseases.map((disease) => (
              <option key={disease.value} value={disease.value}>
                {disease.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input
            type="date"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <input
            type="date"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <button
          onClick={handleDownload}
          disabled={loading || !startTime || !endTime}
          className={`w-full py-2 rounded-lg transition duration-200 flex items-center justify-center ${
            loading || !startTime || !endTime
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Downloading...
            </>
          ) : (
            'Download Data'
          )}
        </button>
        
        <p className="mt-4 text-xs text-gray-500 text-center">
          Downloads a ZIP file containing consultation data, prescriptions, and vitals for patients diagnosed with the selected disease.
        </p>
      </div>
    </div>
  );
};

export default PublicData;
