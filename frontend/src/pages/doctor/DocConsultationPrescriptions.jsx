import React, { useState, useEffect } from "react";
import axios from "axios";

const DocConsultationPrescriptions = ({ consultationId }) => {
  const doctorId = localStorage.getItem("role_id");

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [entries, setEntries] = useState([]);
  const [prescription, setPrescription] = useState([]);

  const handleSaveAll = async () => {
    const updatedPrescription = {
      ...prescription,
      entries: entries,
    };

    console.log("Updated Prescription:", updatedPrescription);

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/doctors/updateConsultations/${consultationId}/addprescriptions`,
        updatedPrescription,
        {
          params: { doctor: doctorId },
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setEditing(false);
    } catch (err) {
      console.error("Failed to update prescription:", err.response?.data || err.message);
    }
  };

  const handleDeleteEntry = (index) => {
    const updated = entries.filter((_, i) => i !== index);
    setEntries(updated);
  };

  const handleEntryChange = (index, field, value) => {
    const updated = [...entries];
    updated[index][field] = value;
    setEntries(updated);
  };

  const fetchPrescriptionsByConsultationId = async (consultationId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/consultations/${consultationId}/view`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setPrescription(response.data.consultation.prescription[0] || {});
      return response.data.consultation?.prescription[0]?.entries || [];
    } catch (error) {
      console.error("Error fetching consultation details:", error);
      return [];
    }
  };

  useEffect(() => {
    const loadPrescriptions = async () => {
      setLoading(true);
      try {
        const data = await fetchPrescriptionsByConsultationId(consultationId);
        console.log("Fetched Prescriptions:", data);
        setEntries(data || []);
      } catch (error) {
        console.error("Error loading prescriptions:", error);
        setEntries([]);
      } finally {
        setLoading(false);
      }
    };

    loadPrescriptions();
  }, [consultationId]);

  const handleAddEntry = () => {
    const newEntry = {
      medicine: "",
      dosage: "",
      frequency: "",
      duration: "",
      quantity: 0,
      dispensed_qty: 0,
    };

    setEntries((prev) => [...(prev || []), newEntry]);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Prescriptions</h2>

      {loading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading prescriptions...</p>
        </div>
      ) : (
        <>
          <div className="mt-4">
            <button
              onClick={handleAddEntry}
              className="bg-green-600 text-white px-4 py-2 rounded mr-2"
            >
              Add Entry
            </button>
            <button
              onClick={handleSaveAll}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Save All
            </button>
          </div>

          {entries?.length > 0 ? (
            <div className="space-y-4 mt-4">
              {entries.map((entry, index) => (
                <div key={index} className="border rounded p-4 bg-gray-50">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-500 text-sm">Medicine</p>
                      <input
                        type="text"
                        value={entry.medicine_id?.med_name}
                        onChange={(e) =>
                          handleEntryChange(index, "medicine", e.target.value)
                        }
                        placeholder="Medicine"
                        className="font-medium"
                      />
                    </div>

                    <div>
                      <p className="text-gray-500 text-sm">Dosage</p>
                      <input
                        type="text"
                        value={entry.dosage}
                        onChange={(e) =>
                          handleEntryChange(index, "dosage", e.target.value)
                        }
                        placeholder="Dosage"
                        className="font-medium"
                      />
                    </div>

                    <div>
                      <p className="text-gray-500 text-sm">Frequency</p>
                      <input
                        type="text"
                        value={entry.frequency}
                        onChange={(e) =>
                          handleEntryChange(index, "frequency", e.target.value)
                        }
                        placeholder="Frequency"
                        className="font-medium"
                      />
                    </div>

                    <div>
                      <p className="text-gray-500 text-sm">Duration</p>
                      <input
                        type="text"
                        value={entry.duration}
                        onChange={(e) =>
                          handleEntryChange(index, "duration", e.target.value)
                        }
                        placeholder="Duration"
                        className="font-medium"
                      />
                    </div>

                    <div className="flex items-center justify-start space-x-2 col-span-2">
                      <button
                        onClick={() => handleEntryChange(index)}
                        className="bg-green-400 text-white px-1.5 py-0.5 w-10 min-w-0 rounded hover:bg-green-600 text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteEntry(index)}
                        className="bg-red-400 text-white px-1.5 py-0.5 w-12 min-w-0 rounded hover:bg-red-600 text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {entry.notes && (
                    <div className="mt-2 pt-2 border-t">
                      <p className="text-gray-500 text-sm">Notes</p>
                      <p>{entry.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-4">
              <p className="text-gray-500 mb-4">No prescriptions available</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DocConsultationPrescriptions;
