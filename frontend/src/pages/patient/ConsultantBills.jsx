import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

// Dummy fetch function to simulate fetching bills by consultation ID
const fetchBillByConsultationId = async (consultationId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const dummyBill = {
        id: consultationId,
        totalAmount: 5000,
        paymentStatus: "Paid",
        breakdown: [
          { id: 1, description: "Consultation Fee", amount: 2000 },
          { id: 2, description: "Lab Tests", amount: 1500 },
          { id: 3, description: "Medications", amount: 1500 },
        ],
      };
      resolve(dummyBill);
    }, 500);
  });
};

const ConsultantBills = () => {
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();

  // Fetch bill details by consultation ID
  useEffect(() => {
    const loadBill = async () => {
      try {
        const data = await fetchBillByConsultationId(id);
        setBill(data);
      } catch (error) {
        console.error("Error loading bill:", error);
      } finally {
        setLoading(false);
      }
    };

    loadBill();
  }, [id]);

  if (loading) return <div className="text-center text-gray-500">Loading...</div>;
  if (!bill) return <div className="text-center text-red-500">No Bill Found</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Billing Details</h2>

      {/* Bill Summary */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <p className="text-lg">
          <strong>Total Amount:</strong> ₹{bill.totalAmount}
        </p>
        <p className={`text-lg ${bill.paymentStatus === "Paid" ? "text-green-600" : "text-red-600"}`}>
          <strong>Payment Status:</strong> {bill.paymentStatus}
        </p>
      </div>

      {/* Bill Breakdown */}
      <table className="w-full bg-white rounded-lg shadow-md overflow-hidden">
        <thead>
          <tr className="bg-gray-800 text-white">
            <th className="py-2 px-4 text-left">#</th>
            <th className="py-2 px-4 text-left">Description</th>
            <th className="py-2 px-4 text-right">Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          {bill.breakdown.map((item, index) => (
            <tr key={item.id} className={`${index % 2 === 0 ? "bg-gray-100" : "bg-white"}`}>
              <td className="py-2 px-4">{item.id}</td>
              <td className="py-2 px-4">{item.description}</td>
              <td className="py-2 px-4 text-right">{item.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Back Button */}
      <button
        onClick={() => navigate(`/patient/previous-consultations/${id}`)}
        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
      >
        Back to Consultation
      </button>
    </div>
  );
};

export default ConsultantBills;
