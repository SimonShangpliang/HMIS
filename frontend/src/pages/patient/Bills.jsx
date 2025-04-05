import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react";

//dummy function to simulate real API call to backend
const fetchBillsByPatientId = async (patientId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const dummyBills = [
        { bill_id: 1, date: "2025-04-03", bill_number: 12, total_amount: 13.50 },
        { bill_id: 2, date: "2025-04-04", bill_number: 13, total_amount: 14.50 },
        { bill_id: 3, date: "2025-04-05", bill_number: 14, total_amount: 15.0 },
        { bill_id: 4, date: "2025-04-06", bill_number: 15, total_amount: 16.0 },
      ];
      resolve(dummyBills);
    }, 500);
  });
};

//dummy function to simulate fetching bill details from backend
const fetchBillDetails = async (billId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Following the Bill Collection
      const billDetails = {
        _id: `b${billId}`,
        bill_id: billId,
        patient_id: "123",
        generation_date: new Date().toISOString().split('T')[0],
        total_amount: 150.0,
        payment_status: {
          type: "String",
          enum: "partially_paid" 
        },
        bill_items: [
          {
            bill_item_id: "bi1001",
            item_type:{
              type:"String",
              enum:"consultation"
            },
            consult_id: "c2001", // ref: Consultation (optional)
            report_id: "", // ref: Reports (optional)
            prescription_id: "", // ref: Prescription (optional)
            item_description: "General Consultation",
            item_amount: 70.0,
            quantity: 1
          },
          {
            bill_item_id: "bi1002",
            item_type:{
              type:"String",
              enum:"medication"
            },
            consult_id: "c2002", // ref: Consultation (optional)
            report_id: "", // ref: Reports (optional)
            prescription_id: "", // ref: Prescription (optional)
            item_description: "Blood Test",
            item_amount: 80.0,
            quantity: 1
          }
        ],
        referredBy: "Dr. HMIS",
        timestamp: new Date().toISOString()
      };
      resolve(billDetails);
    }, 300);
  });
};

//dummy function to simulate fetching payements from backend using billId
const fetchPaymentsByBillId = async (billId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      //Payment Collection
      const payments = [
        {
          _id: "pay1001",
          payment_id: "p1001",
          bill_id: billId, // ref: Bill
          amount: 50.0,
          insurance_id: "ins001", // ref: Insurance (optional)
          payment_date: "2025-04-02",
          payment_gateway_id: "pg123",
          transaction_id: "tx78901",
          status: {
            type: "String",
            enum: "success" // Could be "success" or "failed"
          },
          payment_method: {
            type: "String",
            enum: "cash" // Could be "cash", "card", "bank_transfer", "insurance"
          }
        },
        {
          _id: "pay1002",
          payment_id: "p1002",
          bill_id: billId, // ref: Bill
          amount: 30.0,
          insurance_id: "", // ref: Insurance (optional)
          payment_date: "2025-04-03",
          payment_gateway_id: "pg123",
          transaction_id: "tx78902",
          status: {
            type: "String",
            enum: "success" 
          },
          payment_method: {
            type: "String",
            enum: "card"
          }
        }
      ];
      resolve(payments);
    }, 300);
  });
};

const Bills = () => {
  const [bills, setBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [billDetails, setBillDetails] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const patientId = "123"; //dummy patient

  useEffect(() => {
    const loadBills = async () => {
      const data = await fetchBillsByPatientId(patientId);
      setBills(data);
    };

    loadBills();
  }, [patientId]);

  useEffect(() => {
    const loadBillDetails = async () => {
      if (selectedBill) {
        setLoading(true);
        const details = await fetchBillDetails(selectedBill);
        const paymentData = await fetchPaymentsByBillId(selectedBill);
        
        setBillDetails(details);
        setPayments(paymentData);
        setLoading(false);
      }
    };
    
    loadBillDetails();
  }, [selectedBill]);

  const handleView = (billId) => {
    console.log(`Viewing bill details for bill: ${billId}`);
    setSelectedBill(billId);
  };

  const handleBack = () => {
    setSelectedBill(null);
    setBillDetails(null);
    setPayments([]);
  };

  // Function to format amount with rupee symbol and 2 decimal places
  const formatAmount = (amount) => {
    return `₹${amount.toFixed(2)}`;
  };

  const calculateSummary = () => {
    if (!billDetails || !payments) return { billed: 0, discount: 0, insurance: 0, paid: 0, refunds: 0, net: 0 };
    
    // Calculate total from bill items
    const billed = billDetails.bill_items?.reduce((sum, item) => 
      sum + (item.item_amount * (item.quantity || 1)), 0) || 0;
    
    // Calculate total payments
    const paid = payments.reduce((sum, payment) => {
      if (payment?.status?.enum === "success") {
        return sum + (payment.amount || 0);
      }
      return sum;
    }, 0);
  
    // Calculate insurance payments
    const insurance = payments.reduce((sum, payment) => {
      if (payment?.status?.enum === "success" && 
          payment?.payment_method?.enum === "insurance") {
        return sum + (payment.amount || 0);
      }
      return sum;
    }, 0);
  
    // For this example, assume no refunds and discount is a placeholder
    const discount = 0;
    const refunds = 0;
    
    // Net amount is billed minus paid
    const net = billed - paid - discount;

    return { billed, discount, insurance, paid, refunds, net };
  };

  const handleAddBillingItem = () => {
    console.log("Adding billing item");
    // Implementation would be added by backend team
  };

  const handleAddRegnChanges = () => {
    console.log("Adding registration changes");
    // Implementation would be added by backend team
  };

  const handleAddDiscount = () => {
    console.log("Adding discount");
    // Implementation would be added by backend team
  };

  const handleClearDiscount = () => {
    console.log("Clearing discount");
    // Implementation would be added by backend team
  };

  const handleClearAll = () => {
    console.log("Clearing all");
    // Implementation would be added by backend team
  };

  const handleAddPayment = () => {
    console.log("Adding payment");
    // Implementation would be added by backend team
  };

  const handleSave = () => {
    console.log("Saving bill");
    // Implementation would be added by backend team
  };

  const handleSaveAndPrint = () => {
    console.log("Saving and printing bill");
    // Implementation would be added by backend team
  };

  const handlePrint = () => {
    console.log("Printing bill");
    // Implementation would be added by backend team
  };

  const handlePrintReceipt = () => {
    console.log("Printing receipt");
    // Implementation would be added by backend team
  };

  const summary = calculateSummary();

  return (
    <div className="w-full h-full bg-white p-20">
      <div className="max-w-4xl mx-auto">
        {selectedBill ? (
          // Bill details page
          <div className="bg-white rounded shadow">
            {loading ? (
              <p className="text-center py-8">Loading bill details...</p>
            ) : (
              <div className="space-y-6">
                {}
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">Seen/Referred By</span>
                    <input 
                      type="text" 
                      placeholder="Scroller for Doc..." 
                      className="ml-2 border rounded px-2 py-1 text-sm"
                      value={billDetails?.referredBy || ""}
                      onChange={(e) => setBillDetails({...billDetails, referredBy: e.target.value})}
                    />
                  </div>
                  <div>
                    <span className="font-medium">Timestamp-Bill Date</span>
                    <input 
                      type="text" 
                      placeholder="Date / Time" 
                      className="ml-2 border rounded px-2 py-1 text-sm"
                      value={billDetails?.generation_date || ""}
                      readOnly
                    />
                  </div>
                </div>

                {/* Billing Items section */}
                <div>
                  <h3 className="font-medium mb-2">Billing items</h3>
                  <div className="flex space-x-2 mb-3">
                    <button 
                      className="bg-[#4C7E75] hover:bg-[#3d635c] text-white py-1 px-3 rounded text-sm"
                      onClick={handleAddBillingItem}
                    >
                      Add Billing Item
                    </button>
                    <button 
                      className="bg-[#4C7E75] hover:bg-[#3d635c] text-white py-1 px-3 rounded text-sm"
                      onClick={handleAddRegnChanges}
                    >
                      Add Regn. Changes
                    </button>
                    <button 
                      className="bg-[#4C7E75] hover:bg-[#3d635c] text-white py-1 px-3 rounded text-sm"
                      onClick={handleAddDiscount}
                    >
                      Add Discount
                    </button>
                    <button 
                      className="bg-[#4C7E75] hover:bg-[#3d635c] text-white py-1 px-3 rounded text-sm"
                      onClick={handleClearDiscount}
                    >
                      Clear Discount
                    </button>
                    <button 
                      className="bg-[#4C7E75] hover:bg-[#3d635c] text-white py-1 px-3 rounded text-sm"
                      onClick={handleClearAll}
                    >
                      Clear All
                    </button>
                  </div>
                  
                  {/* Billing items table */}
                  <div className="overflow-hidden rounded">
                    <div className="flex bg-[#1b2432] text-white py-2 rounded-t">
                      <div className="w-1/3 text-center">Date</div>
                      <div className="w-1/3 text-center">Item No.</div>
                      <div className="w-1/3 text-center">Amount</div>
                    </div>
                    {billDetails?.bill_items.map((item, index) => (
                      <div key={item.bill_item_id} className="flex bg-[#1d2839] text-white py-2 border-t border-gray-700">
                        <div className="w-1/3 text-center">{billDetails.generation_date}</div>
                        <div className="w-1/3 text-center">{item.bill_item_id}</div>
                        <div className="w-1/3 text-center">{formatAmount(item.item_amount * item.quantity)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payments section */}
                <div>
                  <div className="flex items-center mb-2">
                    <h3 className="font-medium">Payments</h3>
                    <button 
                      className="ml-4 bg-[#4C7E75] hover:bg-[#3d635c] text-white py-1 px-3 rounded text-sm"
                      onClick={handleAddPayment}
                    >
                      + Add Payment
                    </button>
                  </div>
                  
                  {/* Payments table */}
                  <div className="overflow-hidden rounded mb-4">
                    {/* Table header */}
                    <div className="flex bg-[#1b2432] text-white py-2 rounded-t">
                      <div className="w-1/4 truncate text-center px-1">Date</div>
                      <div className="w-1/4 truncate text-center px-1">Mode</div>
                      <div className="w-1/4 truncate text-center px-1">Amount</div>
                      <div className="w-1/4 truncate text-center px-1">Status + Proof (Trans...)</div>
                    </div>

                    {/* Table rows */}
                    {payments.map((payment) => (
                      <div key={payment._id} className="flex bg-[#1d2839] text-white py-2 border-t border-gray-700">
                        <div className="w-1/4 truncate text-center px-1">{payment.payment_date}</div>
                        <div className="w-1/4 truncate text-center px-1">{payment.payment_method.enum}</div>
                        <div className="w-1/4 truncate text-center px-1">{formatAmount(payment.amount)}</div>
                        <div className="w-1/4 truncate text-center px-1">
                          {payment.status.enum} ({payment.transaction_id})
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Billing summary */}
                <div className="text-center">
                  <p className="mb-4">
                    Billed :[{formatAmount(summary.billed)}] 
                    Discount / Insurance :[{formatAmount(summary.discount + summary.insurance)}] 
                    Paid :[{formatAmount(summary.paid)}]
                    Refunds :[{formatAmount(summary.refunds)}] 
                    Net :[{formatAmount(summary.net)}]
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex space-x-2 justify-start">
                  <button 
                    className="bg-[#4C7E75] hover:bg-[#3d635c] text-white py-2 px-4 rounded"
                    onClick={handleSave}
                  >
                    Save
                  </button>
                  <button 
                    className="bg-[#4C7E75] hover:bg-[#3d635c] text-white py-2 px-4 rounded"
                    onClick={handleSaveAndPrint}
                  >
                    Save and Print
                  </button>
                  <button 
                    className="bg-[#4C7E75] hover:bg-[#3d635c] text-white py-2 px-4 rounded"
                    onClick={handlePrint}
                  >
                    Print
                  </button>
                  <button 
                    className="bg-[#4C7E75] hover:bg-[#3d635c] text-white py-2 px-4 rounded"
                    onClick={handlePrintReceipt}
                  >
                    Print Receipt
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Bills listing
          bills.map((bill, index) => (
            <div 
              key={bill.bill_id} 
              className="flex items-center justify-between bg-gray-900 text-white rounded mb-4 p-4"
            >
              <div className="w-1/4 px-2 font-bold text-center text-white/80">
                <p className="text-sm ">Date</p>
                <p className="mt-1 font-bold">{bill.date}</p>
              </div>
              <div className="w-1/4 px-2 font-bold text-center text-white/80">
                <p className="text-sm">Bill Number</p>
                <p className="mt-1">{bill.bill_number}</p>
              </div>
              <div className="w-1/4 px-2 font-bold text-center text-white/80">
                <p className="text-sm">Total Amount</p>
                <p className="mt-1">{formatAmount(bill.total_amount)}</p>
              </div>
              <div className="w-1/4 flex justify-end px-2">
                <button 
                  onClick={() => handleView(bill.bill_id)}
                  className="bg-[#4C7E75] hover:bg-[#3d635c] text-white py-2 px-4 rounded"
                >
                  View Status
                </button>
              </div>
            </div>
          ))
        )}
        
        {bills.length === 0 && !selectedBill && (
          <p className="text-center text-gray-500 py-8">No Bills Available</p>
        )}
      </div>
    </div>
  );
};

export default Bills;