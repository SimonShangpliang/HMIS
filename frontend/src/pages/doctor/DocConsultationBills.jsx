import React, { useState, useEffect } from "react";
import axios from "axios";
const DocConsultationBills = ({ consultationId }) => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  

  const fetchBillsByConsultationId = async (consultationId) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/consultations/${consultationId}/bill`);
      // console.log( "helalui", response.data.bill);  
      return response.data.bill;
    } catch (error) {
      console.error("Error fetching bills:", error);
      throw error;
    }
  };

  useEffect(() => {
    const loadBills = async () => {
      setLoading(true);
      try {
        const data = await fetchBillsByConsultationId(consultationId);
        setBills(data);
        setLoading(false);
      } catch (error) {
        console.error("Error loading bills:", error);
        setLoading(false);
      }
    };

    loadBills();
  }, [consultationId]);
  
  // console.log("bills", bills.breakdown.length);
  // console.log("bills", bills);

  return (
  
    <div>
      <h2 className="text-xl font-semibold mb-4">Bills</h2>
      
      {loading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading bills...</p>
        </div>
      ) : bills.breakdown?.length > 0 ? (
        <div className="space-y-4">
          
            <div key={bills.id} className="border rounded p-4 bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-semibold">Bill #{bills.id}</h3>
                  <p className="text-sm text-gray-500">{bills.generation_date ? new Date(bills.generation_date).toISOString().split('T')[0] : "N/A"}</p>
                </div>
                <div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    bills.payment_status === 'paid' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {bills.payment_status === 'paid' ? 'Paid' : 'partially Paid/Pending'}
                  </span>
                </div>
              </div>
              
              <div className="border-t border-b py-2 mb-4">
                <div className="flex justify-between text-sm text-gray-600 font-medium">
                  <span>Item</span>
                  <span>Amount</span>
                </div>
              </div>

           
              
              {bills.breakdown.map((item, index) => (
                <div key={index} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                  <span>{item.description}</span>
                  <span>${item.amount?.toFixed(2)}</span>
                </div>
              ))}
              
              <div className="mt-4 flex justify-between font-semibold">
                <span>Total</span>
                <span>${bills.totalAmount?.toFixed(2)}</span>
              </div>
            </div>
          
        </div>
      ) : (
        <p className="text-center text-gray-500 py-4">No bills available</p>
      )}
    </div>
  );
};

export default DocConsultationBills;
