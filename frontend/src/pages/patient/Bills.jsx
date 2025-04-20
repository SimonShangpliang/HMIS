import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { CloudCog, Home, X } from "lucide-react";
import axios from "axios";
import html2pdf from 'html2pdf.js';
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "jspdf-autotable";
import { useAuth } from "../../context/AuthContext";

// API base URL - adjust as needed
const API_BASE_URL = `${import.meta.env.VITE_API_URL}/billing`;

const Bills = () => {

  const [bills, setBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [billDetails, setBillDetails] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
   const {axiosInstance } = useAuth();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [newPayment, setNewPayment] = useState({
    amount: 0,
    payment_method: "cash",
    payment_date: new Date().toISOString().split('T')[0],
    transaction_id: "",
    status: "success"
  });

  const navigate = useNavigate();
  const patientId = localStorage.getItem("user_id");

  const formatINR = (amount) => {
    return amount.toFixed(2).toString();
  };
  
  const handlePrint = () => {
    try {
      const doc = new jsPDF();
      let y = 10;
      const pageHeight = 290;
  
      // Title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Patient Billing Receipt', 14, y);
      y += 10;
  
      // Bill and patient info
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Bill ID: ${billDetails?.bill_id || 'N/A'}`, 14, y);
      y += 6;
      doc.text(`Patient ID: ${billDetails?.patient_id || 'Unknown'}`, 14, y);
      y += 10;
  
      // Billing Items Section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Billing Items', 14, y);
      y += 8;
  
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Date', 14, y);
      doc.text('Type', 40, y);
      doc.text('Description', 70, y);
      doc.text('Amount', 190, y, { align: 'right' });
      y += 6;
  
      doc.setFont('helvetica', 'normal');
      if (doc.setCharSpace) doc.setCharSpace(0); // Reduces spacing between characters
  
      if (billDetails?.bill_items && billDetails.bill_items.length > 0) {
        billDetails.bill_items.forEach((item) => {
          if (y > pageHeight) {
            doc.addPage();
            y = 10;
          }
  
          const itemDate = billDetails?.generation_date || '-';
          const itemType = item?.item_type?.enum || '-';
          const description = item?.item_description || '-';
          const rawAmount = Number(item?.item_amount || 0) * Number(item?.quantity || 1);
          const amount = formatINR(rawAmount);
  
          const wrappedDesc = doc.splitTextToSize(description, 100);
          const descHeight = wrappedDesc.length * 6;
  
          doc.text(itemDate, 14, y);
          doc.text(itemType, 40, y);
          doc.text(wrappedDesc, 70, y);
          doc.text(amount, 190, y, { align: 'right' });
  
          y += descHeight;
        });
      } else {
        doc.text('No billing items found.', 14, y);
      }
  
      y += 8;
  
      // Payments Section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Payments', 14, y);
      y += 8;
  
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Date', 14, y);
      doc.text('Amount', 60, y);
      doc.text('Status + Txn ID', 110, y);
      y += 6;
  
      doc.setFont('helvetica', 'normal');
  
      if (payments && payments.length > 0) {
        payments.forEach((payment) => {
          if (y > pageHeight) {
            doc.addPage();
            y = 10;
          }
  
          const payDate = payment?.payment_date || '-';
          const payAmount = formatINR(payment.amount || 0);
          const status = typeof payment.status.enum === 'object'
            ? JSON.stringify(payment.status.enum)
            : payment.status.enum || '-';
          const txnId = payment?.transaction_id || 'N/A';
  
          doc.text(payDate, 14, y);
          doc.text(payAmount, 60, y);
          doc.text(`${status} (${txnId})`, 110, y);
          y += 6;
        });
      } else {
        doc.text('No payments found.', 14, y);
        y += 8;
      }
  
      // Billing Summary
      y += 6;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Billing Summary', 14, y);
      y += 8;
  
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      const billed = formatINR(summary.billed || 0);
      doc.text(`Billed: `, 14, y);
      doc.text(billed, 50, y);
      y += 6;
      const paid = formatINR(summary.paid || 0);
      doc.text('Paid:', 14, y);
      doc.text(paid, 50, y);
      y += 6;
      const net = formatINR(summary.net || 0);
      doc.text('Balance:', 14, y);
      doc.text(net, 50, y);
      y += 10;
  
      // Save PDF
      doc.save('billing_receipt.pdf');
    } catch (error) {
      console.error('Error printing receipt:', error);
    }
  };
  
  

  // Fetch all bills for the patient
  useEffect(() => {
    const fetchBills = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`${API_BASE_URL}/patient/${patientId}`);
        if (response.data.success) {
          setBills(response.data.data);
        } else {
          setError("Failed to fetch bills");
        }
      } catch (err) {
        console.error("Error fetching bills:", err);
        setError("Failed to fetch bills. Please try again later.");
      } finally {
        if (!window._authFailed) {
          setLoading(false);
        }
      }
    };

    fetchBills();
  }, [patientId]);

  // Fetch bill details and payments when a bill is selected
  useEffect(() => {
    const fetchBillDetails = async () => {
      if (selectedBill) {
        try {
          setLoading(true);

          // Fetch bill details
          const detailsResponse = await axiosInstance.get(`${API_BASE_URL}/${selectedBill}`);

          // Fetch payments
          const paymentsResponse = await axiosInstance.get(`${API_BASE_URL}/${selectedBill}/payments`);

          if (detailsResponse.data.success && paymentsResponse.data.success) {
            setBillDetails(detailsResponse.data.data);
            setPayments(paymentsResponse.data.data);
          } else {
            setError("Failed to fetch bill details");
          }
        } catch (err) {
          console.error("Error fetching bill details:", err);
          setError("Failed to fetch bill details. Please try again later.");
        } finally {
          if (!window._authFailed) {
            setLoading(false);
          }
        }
      }
    };

    fetchBillDetails();
  }, [selectedBill]);

  const handleView = (billId) => {
    console.log(`Viewing bill details for bill: ${billId}`);
    setSelectedBill(billId);
  };

  const handleBack = () => {
    setSelectedBill(null);
    setBillDetails(null);
    setPayments([]);
    setError(null);
  };

  // Function to format amount with rupee symbol and 2 decimal places
  const formatAmount = (amount) => {
    return `₹${Number(amount).toFixed(2)}`;
  };

  const calculateSummary = () => {
    if (!billDetails || !payments) return { billed: 0, paid: 0, net: 0 };

    // Calculate total from bill items
    const billed = billDetails.bill_items?.reduce((sum, item) =>
      sum + (item.item_amount * (item.quantity || 1)), 0) || 0;

    // Calculate total payments
    const paid = payments.reduce((sum, payment) => {
      if (payment?.status?.enum === "success") {
        return sum + (Number(payment.amount) || 0);
      }
      return sum;
    }, 0);

    // Net amount is billed minus paid
    const net = billed - paid;

    return { billed, paid, net };
  };

  const handlePaymentInputChange = (e) => {
    const { name, value } = e.target;
    setNewPayment({
      ...newPayment,
      [name]: name === "amount" ? Number(value) : value
    });
  };

  const handleOpenPaymentModal = () => {
    // Generate a unique transaction ID
    setNewPayment({
      ...newPayment,
      transaction_id: `tx${Date.now()}`
    });
    setShowPaymentModal(true);
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
  };

  const handleAddPayment = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.post(`${API_BASE_URL}/${selectedBill}/payments`, newPayment);

      if (response.data.success) {
        // Refresh payments and bill details
        const updatedPaymentsResponse = await axiosInstance.get(`${API_BASE_URL}/${selectedBill}/payments`);
        const updatedDetailsResponse = await axiosInstance.get(`${API_BASE_URL}/${selectedBill}`);

        setPayments(updatedPaymentsResponse.data.data);
        setBillDetails(updatedDetailsResponse.data.data);
        setShowPaymentModal(false);
        setNewPayment({
          amount: 0,
          payment_method: "cash",
          payment_date: new Date().toISOString().split('T')[0],
          transaction_id: "",
          status: "success"
        });
      } else {
        setError("Failed to add payment");
      }
    } catch (err) {
      console.error("Error adding payment:", err);
      setError("Failed to add payment. Please try again.");
    } finally {
      if (!window._authFailed) {
        setLoading(false);
      }
    }
  };


  const summary = calculateSummary();

  if (loading && !selectedBill) {
    return (
      <div className="w-full h-full bg-white p-20">
        <div className="max-w-4xl mx-auto text-center py-8">
          Loading bills...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white p-20">
      <div className="max-w-4xl mx-auto">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {selectedBill ? (
          // Bill details page
          <div className="bg-white rounded shadow">
            <div className="py-4 px-6 bg-gray-100 rounded-t flex justify-between items-center">
              <h2 className="text-xl font-semibold">Bill Details</h2>
              <button
                onClick={handleBack}
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                <Home className="h-4 w-4 mr-1" /> Back to Bills
              </button>
            </div>

            {loading ? (
              <p className="text-center py-8">Loading bill details...</p>
            ) : (
              <div className="p-6 space-y-6">
                {/* Bill header */}
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">Seen/Referred By</span>
                    <input
                      type="text"
                      placeholder="Scroller for Doc..."
                      className="ml-2 border rounded px-2 py-1 text-sm"
                      value={billDetails?.referredBy || ""}
                      onChange={(e) => setBillDetails({ ...billDetails, referredBy: e.target.value })}
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

                  {/* Billing items table */}
                  <div className="overflow-hidden rounded">
                    <div className="flex bg-[#1b2432] text-white py-2 rounded-t">
                      <div className="w-1/4 text-center">Date</div>
                      <div className="w-1/4 text-center">Type</div>
                      <div className="w-1/4 text-center">Item Description</div>
                      <div className="w-1/4 text-center">Amount</div>
                    </div>
                    {billDetails?.bill_items && billDetails.bill_items.length > 0 ? (
                      billDetails.bill_items.map((item) => (
                        <div key={item.bill_item_id} className="flex bg-[#1d2839] text-white py-2 border-t border-gray-700">
                          <div className="w-1/4 text-center">{billDetails.generation_date}</div>
                          <div className="w-1/4 text-center capitalize">{item.item_type?.enum || "N/A"}</div>
                          <div className="w-1/4 text-center">{item.item_description}</div>
                          <div className="w-1/4 text-center">{formatAmount(item.item_amount * (item.quantity || 1))}</div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-[#1d2839] text-white py-4 text-center">
                        No billing items found
                      </div>
                    )}
                  </div>
                </div>
                
                  {/* Payments section */}
                  <div>
                    <div className="flex items-center mb-2">
                      <h3 className="font-medium">Payments</h3>
                      <button
                        className="ml-4 bg-[#4C7E75] hover:bg-[#3d635c] text-white py-1 px-3 rounded text-sm"
                        onClick={handleOpenPaymentModal}
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
                      {payments && payments.length > 0 ? (
                        payments.map((payment) => (
                          <div key={payment._id} className="flex bg-[#1d2839] text-white py-2 border-t border-gray-700">
                            <div className="w-1/4 truncate text-center px-1">{payment.payment_date}</div>
                            <div className="w-1/4 truncate text-center px-1 capitalize">{payment.payment_method?.enum}</div>
                            <div className="w-1/4 truncate text-center px-1">{formatAmount(payment.amount)}</div>
                            <div className="w-1/4 truncate text-center px-1">
                              {payment.status?.enum} ({payment.transaction_id})
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="bg-[#1d2839] text-white py-4 text-center">
                          No payments found
                        </div>
                      )}
                    </div>
                  </div>
              

                {/* Billing summary - simplified design */}
                <div className="bg-gray-100 p-4 rounded-lg flex justify-between items-center">
                  <div className="text-center flex-1">
                    <p className="text-gray-600 text-sm font-medium">Billed</p>
                    <p className="text-2xl font-bold text-gray-800">{formatAmount(summary.billed)}</p>
                  </div>
                  <div className="text-center flex-1">
                    <p className="text-gray-600 text-sm font-medium">Paid</p>
                    <p className="text-2xl font-bold text-green-600">{formatAmount(summary.paid)}</p>
                  </div>
                  <div className="text-center flex-1">
                    <p className="text-gray-600 text-sm font-medium">Balance</p>
                    <p className="text-2xl font-bold text-blue-600">{formatAmount(summary.net)}</p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex space-x-2 justify-start">

                  <button
                    className="bg-[#4C7E75] hover:bg-[#3d635c] text-white py-2 px-4 rounded"
                    onClick={handlePrint}
                  >
                    Print Receipt
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Bills listing
          <>
            <header className="consultations-header">
              <h2>Patient Bills</h2>
              <Home className="home-icon cursor-pointer" onClick={() => navigate("/patient/profile")}/>
            </header>

            {bills.length > 0 ? (
              bills.map((bill) => (
                <div
                  key={bill.bill_id}
                  className="flex items-center justify-between bg-gray-900 text-white rounded mb-4 p-4"
                >
                  <div className="w-1/5 px-2 font-bold text-center text-white/80">
                    <p className="text-sm">Date</p>
                    <p className="mt-1 font-bold">{bill.date}</p>
                  </div>
                  <div className="w-1/5 px-2 font-bold text-center text-white/80">
                    <p className="text-sm">Bill Number</p>
                    <p className="mt-1">{bill.bill_number}</p>
                  </div>
                  <div className="w-1/5 px-2 font-bold text-center text-white/80">
                    <p className="text-sm">Total Amount</p>
                    <p className="mt-1">{formatAmount(bill.total_amount)}</p>
                  </div>
                  <div className="w-1/5 px-2 font-bold text-center text-white/80">
                    <p className="text-sm">Status</p>
                    <p className={`mt-1 ${bill.payment_status === 'paid' ? 'text-green-400' :
                        bill.payment_status === 'partially_paid' ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                      {bill.payment_status === 'paid' ? 'Paid' :
                        bill.payment_status === 'partially_paid' ? 'Partially Paid' : 'Pending'}
                    </p>
                  </div>
                  <div className="w-1/5 flex justify-end px-2">
                    <button
                      onClick={() => handleView(bill.bill_id)}
                      className="bg-[#4C7E75] hover:bg-[#3d635c] text-white py-2 px-4 rounded"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8 bg-gray-100 rounded">
                <p className="mb-4">No Bills Available</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Add Payment</h3>
              <button onClick={handleClosePaymentModal} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleAddPayment(); }}>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Amount</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="amount"
                  value={newPayment.amount}
                  onChange={handlePaymentInputChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Payment Method</label>
                <select
                  name="payment_method"
                  value={newPayment.payment_method}
                  onChange={handlePaymentInputChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Payment Date</label>
                <input
                  type="date"
                  name="payment_date"
                  value={newPayment.payment_date}
                  onChange={handlePaymentInputChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Transaction ID</label>
                <input
                  type="text"
                  name="transaction_id"
                  value={newPayment.transaction_id}
                  onChange={handlePaymentInputChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">Auto-generated transaction ID</p>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={handleClosePaymentModal}
                  className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#4C7E75] hover:bg-[#3d635c] text-white rounded"
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Add Payment"}
                </button>s
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bills;

