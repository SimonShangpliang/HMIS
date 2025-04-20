import React, { useState, useEffect } from "react";
import axios from "axios";
const doctorId = localStorage.getItem("role_id"); // Get the doctor ID from local storage

const DocConsultationRemarksDiagnosis = ({ consultationId }) => {
  const [remarksDiagnosis, setRemarksDiagnosis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingDiagnosis, setEditingDiagnosis] = useState(false);
  const [editingRemarks, setEditingRemarks] = useState(false);
  const [remarksText, setRemarksText] = useState("");
  const [diagnosisList, setDiagnosisList] = useState([]);
  const [allDiagnoses, setAllDiagnoses] = useState([]);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState("");
  const [newDiagnosis, setNewDiagnosis] = useState("");
  console.log("consultationId", consultationId); // Log the consultationId
  const fetchRemarksDiagnosisByConsultationId = async (consultationId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/consultations/${consultationId}/diagnosis`
      );
      return response.data.consultation;
    } catch (error) {
      console.error("Error fetching diagnosis:", error);
      throw error;
    }
  };

  const fetchAllDiagnoses = async () => {
    try {
      const response = await axios.get(
       `${import.meta.env.VITE_API_URL}/doctors/consultations/fetchallDiagnoses`
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching all diagnoses:", error);
      return [];
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [consultationData, allDiagnosisData] = await Promise.all([
          fetchRemarksDiagnosisByConsultationId(consultationId),
          fetchAllDiagnoses(),
        ]);

        setRemarksDiagnosis(consultationData);
        setRemarksText(consultationData.remark || "");
        setDiagnosisList(
          (consultationData.diagnosis || []).map((item) =>
            typeof item === "string" ? item : item.name
          )
        );
        setAllDiagnoses(allDiagnosisData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [consultationId]);

  const handleSaveDiagnosis = async () => {
    setEditingDiagnosis(false);
    console.log(doctorId);
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/doctors/updateConsultations/${consultationId}/updatediagnosis`,
        diagnosisList,
        {
          params: { user: doctorId },
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      console.error("Error saving diagnosis:", error);
    }
  };

  const handleSaveRemarks = async () => {
    setEditingRemarks(false);
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/doctors/updateConsultations/${consultationId}/remark`,
        { message: remarksText },
        {
          params: { user: doctorId },
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      console.error("Error saving remarks:", error);
    }
  };

  const handleAddDiagnosis = () => {
    if (
      selectedDiagnosis &&
      !diagnosisList.includes(selectedDiagnosis)
    ) {
      setDiagnosisList([...diagnosisList, selectedDiagnosis]);
    }
  };

  const handleAddCustomDiagnosis = () => {
    const trimmed = newDiagnosis.trim();
    if (trimmed && !diagnosisList.includes(trimmed)) {
      setDiagnosisList([...diagnosisList, trimmed]);
      setNewDiagnosis("");
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Remarks & Diagnosis</h2>

      {loading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading data...</p>
        </div>
      ) : remarksDiagnosis ? (
        <div className="space-y-6">
          {/* Diagnosis Section */}
          <div className="border rounded p-4 bg-gray-50">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Diagnosis</h3>
              {!editingDiagnosis && (
                <button
                  onClick={() => setEditingDiagnosis(true)}
                  className="text-sm px-2 py-1 bg-gray-700 text-white rounded hover:bg-gray-800"
                >
                  Edit
                </button>
              )}
            </div>

            {editingDiagnosis ? (
              <div>
                <ul className="mb-2 list-disc list-inside text-gray-700">
                  {diagnosisList.map((item, index) => (
                    <li key={index}>
                      {item}
                      <button
                        className="ml-2 text-red-600 text-xs"
                        onClick={() =>
                          setDiagnosisList(
                            diagnosisList.filter((_, i) => i !== index)
                          )
                        }
                      >
                        [Remove]
                      </button>
                    </li>
                  ))}
                </ul>

                <div className="mb-2">
                  <select
                    className="w-full p-2 border rounded"
                    value={selectedDiagnosis}
                    onChange={(e) => setSelectedDiagnosis(e.target.value)}
                  >
                    <option value="">Select a diagnosis</option>
                    {allDiagnoses.map((diag) => (
                      <option key={diag._id} value={diag.name}>
                        {diag.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAddDiagnosis}
                    className="mt-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                  >
                    Add Selected
                  </button>
                </div>

                <div className="mb-2">
                  <input
                    type="text"
                    value={newDiagnosis}
                    onChange={(e) => setNewDiagnosis(e.target.value)}
                    placeholder="Add custom diagnosis"
                    className="w-full p-2 border rounded"
                  />
                  <button
                    onClick={handleAddCustomDiagnosis}
                    className="mt-2 px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm"
                  >
                    Add Custom
                  </button>
                </div>

                <div className="text-right">
                  <button
                    onClick={handleSaveDiagnosis}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    Save All
                  </button>
                </div>
              </div>
            ) : (
              <ul className="list-disc list-inside text-gray-700">
                {diagnosisList.length > 0 ? (
                  diagnosisList.map((item, index) => <li key={index}>{item}</li>)
                ) : (
                  <li>No diagnosis recorded</li>
                )}
              </ul>
            )}
          </div>

          {/* Remarks Section */}
          <div className="border rounded p-4 bg-gray-50">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Remarks</h3>
              {!editingRemarks && (
                <button
                  onClick={() => setEditingRemarks(true)}
                  className="text-sm px-2 py-1 bg-gray-700 text-white rounded hover:bg-gray-800"
                >
                  Edit
                </button>
              )}
            </div>

            {editingRemarks ? (
              <div>
                <textarea
                  value={remarksText}
                  onChange={(e) => setRemarksText(e.target.value)}
                  className="w-full p-2 border rounded mb-2"
                  rows={3}
                />
                <div className="text-right">
                  <button
                    onClick={handleSaveRemarks}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-700">
                {remarksText || "No remarks recorded"}
              </p>
            )}
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500 py-4">No data available</p>
      )}
    </div>
  );
};

export default DocConsultationRemarksDiagnosis;
