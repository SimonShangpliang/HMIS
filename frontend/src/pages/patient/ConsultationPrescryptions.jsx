import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const fetchPrescriptionsByConsultationId = async (consultationId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const dummyPrescriptions = {
        prescriptionDate: "2025-04-03",
        status: "dispensed",
        entries: [
          {
            id: 1,
            medicine: "Paracetamol 500mg",
            dosage: "1 tablet",
            frequency: "3 times a day",
            duration: "5 days",
            quantity: 15,
            dispensed_qty: 15
          },
          {
            id: 2,
            medicine: "Cetirizine 10mg",
            dosage: "1 tablet",
            frequency: "Once daily at night",
            duration: "7 days",
            quantity: 7,
            dispensed_qty: 7
          }
        ]
      };
      resolve(dummyPrescriptions);
    }, 500);
  });
};

const ConsultationPrescriptions = () => {
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const loadPrescriptions = async () => {
      try {
        const data = await fetchPrescriptionsByConsultationId(id);
        setPrescription(data);
      } catch (error) {
        console.error("Error loading prescriptions:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPrescriptions();
  }, [id]);

  if (loading) return <div className="p-4">Loading prescriptions...</div>;
  if (!prescription) return <div className="p-4">No prescriptions found</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-4">
      {/* Header with consultation info */}
      <div className="bg-gray-800 text-white rounded-md mb-6">
        <div className="grid grid-cols-4 p-4">
          <div className="text-center">
            <h3 className="font-medium">Date</h3>
            <p>{prescription.prescriptionDate}</p>
          </div>
          <div className="text-center">
            <h3 className="font-medium">Doctor Name</h3>
            <p>Dr. Sarah Johnson</p>
          </div>
          <div className="text-center">
            <h3 className="font-medium">Location</h3>
            <p>City Medical Center</p>
          </div>
          <div className="text-center">
            <h3 className="font-medium">Details</h3>
            <p>General checkup</p>
          </div>
        </div>
      </div>
      
      {/* Prescriptions section */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Prescriptions</h2>
        <div className="bg-gray-200 p-6 rounded-md min-h-64">
          {prescription.entries.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-left pb-2">Medicine</th>
                  <th className="text-left pb-2">Dosage</th>
                  <th className="text-left pb-2">Frequency</th>
                  <th className="text-left pb-2">Duration</th>
                </tr>
              </thead>
              <tbody>
                {prescription.entries.map((entry) => (
                  <tr key={entry.id} className="border-b border-gray-200">
                    <td className="py-3">{entry.medicine}</td>
                    <td className="py-3">{entry.dosage}</td>
                    <td className="py-3">{entry.frequency}</td>
                    <td className="py-3">{entry.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500">No medications prescribed</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsultationPrescriptions;