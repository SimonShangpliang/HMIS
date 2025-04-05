import React, { useState } from "react";

const PublicData = () => {
  const [disease, setDisease] = useState("covid");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const handleDownload = () => {
    // Simulating download logic for now
    console.log("Downloading data for:");
    console.log("Disease:", disease);
    console.log("From:", startTime);
    console.log("To:", endTime);
    alert(`Downloading ${disease.toUpperCase()} data from ${startTime} to ${endTime}...`);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Public Data</h1>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Disease Type</label>
          <select
            value={disease}
            onChange={(e) => setDisease(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="covid">COVID-19</option>
            <option value="flu">Influenza</option>
            <option value="malaria">Malaria</option>
            <option value="dengue">Dengue</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
          <input
            type="date"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
          <input
            type="date"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={handleDownload}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200"
        >
          Get data
        </button>
      </div>
    </div>
  );
};

export default PublicData;
