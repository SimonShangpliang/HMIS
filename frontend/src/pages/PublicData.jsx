import React, { useState, useEffect } from "react";
import axios from "axios";

const PublicData = () => {
  const [selectedDisease, setSelectedDisease] = useState({ _id: "", name: "" });
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [diagonses, setDiagonses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);


  useEffect(() => {
    const fetchDiagonses = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/public-data/get-diagonses`); // replace with your actual backend URL
        setDiagonses(response.data.diseases);
        console.log(response.data.diseases);
      } catch (err) {
        console.error('Error fetching diagnoses:', err);
        setError('Failed to load diagnoses. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiagonses();
  }, []);


  // const handleDownload = () => {
  //   // Simulating download logic for now
  //   console.log("Downloading data for:");
  //   console.log("Disease:", disease);
  //   console.log("From:", startTime);
  //   console.log("To:", endTime);
  //   alert(`Downloading ${disease.toUpperCase()} data from ${startTime} to ${endTime}...`);
  // };

  const handleStartDateChange = (e)=>{
    const newStartDate = e.target.value;
    setStartTime(newStartDate);
    if (endTime && endTime < newStartDate) {
      setEndTime("");
    }
  }


  const handleDownload = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/public-data/download`,
        {
          params: {
            diseaseId: selectedDisease._id,
            diseaseName: selectedDisease.name,
            startTime,
            endTime,
          },
          responseType: 'blob',
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      const contentDisposition = response.headers["content-disposition"];
      const filename = contentDisposition
        ? contentDisposition.split("filename=")[1].replace(/"/g, "")
        : `${selectedDisease.name || "data"}-data.zip`;

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download data. Please try again.");
    }
  };



  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Public Data</h1>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Disease Type</label>
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <select
              value={selectedDisease._id}
              onChange={(e) => {
                const selected = diagonses.find(d => d._id === e.target.value);
                setSelectedDisease(selected || { _id: "", name: "" });
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a disease</option>
              {diagonses.map((diag) => (
                <option key={diag._id} value={diag._id}>
                  {diag.name}
                </option>
              ))}
            </select>

          )}
        </div>


        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
          <input
            type="date"
            value={startTime}
            onChange={handleStartDateChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
          <input
            type="date"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            min={startTime}
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
