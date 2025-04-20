import React, { useState, useEffect } from 'react';
import axios from 'axios';
const fetchConsultationsByPatientId = async (patientId) => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/patients/${patientId}/consultations`);
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error("Failed to fetch consultations");
    }

    // Check if we received dummy data or actual consultations
    if (data.dummy) {
      return data.consultations; // Return the dummy data as is
    }

    // Handle actual data
    // Get current date to compare
    const now = new Date();

    // Filter only past consultations
    const pastConsultations = Array.isArray(data)
      ? data.filter((c) => {
        const consultDate = new Date(c.booked_date_time);
        return consultDate < now;
      })
      : [];

    return pastConsultations;
  } catch (err) {
    console.error("Error fetching consultations:", err);
    return []; // fallback return
  }
};

const fetchPatientInsurance = async (patientId) => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/insurance/${patientId}/insurances`);
     const   data=(res.data);
    
  console.log(data)
    
    return data|| [];
  } catch (err) {
    console.error("Error fetching patient insurance:", err);
    return [];
  }
};
const fetchAvailableRooms = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/reception/rooms`);
    
    const data=await res.data
 
    return data || [];
  } catch (err) {
    console.error("Error fetching available rooms:", err);
    return [];
  }
};

// Fetch bills for a patient
const fetchPatientBills = async (patientId) => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/billing/detailed/patient/${patientId}`);
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error("Failed to fetch bills");
    }
    
    return data.data || [];
  } catch (err) {
    console.error("Error fetching bills:", err);
    return [];
  }
};

const AddBills = () => {
  const [formData, setFormData] = useState({
    patient_id: '',
    total_amount: '0.00',
    services: []
  });

  const [currentService, setCurrentService] = useState({
    item_type: 'procedure',
    item_description: '',
    room_id: '',
    price: '',
    quantity: 1
  });
  const [availableRooms, setAvailableRooms] = useState([]);
  const [patientConsultations, setPatientConsultations] = useState([]);
  const [patientBills, setPatientBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [billableItems, setBillableItems] = useState({
    consultations: [],
    reports: [],
    prescriptions: []
  });
  const [patientInsurance, setPatientInsurance] = useState([]);
  const [selectedInsurance, setSelectedInsurance] = useState(null);
  const [insurancePayments, setInsurancePayments] = useState([]);


  useEffect(() => {
    const fetchRooms = async () => {
      const rooms = await fetchAvailableRooms();
      setAvailableRooms(rooms);
    };
    
    fetchRooms();
  }, []);

  // Fetch patient consultations and bills when patient ID changes
  useEffect(() => {
    if (formData.patient_id&&formData.patient_id.length>4) {
      fetchPatientData(formData.patient_id);
    }
  }, [formData.patient_id]);

  // Process consultations to identify billable items
  useEffect(() => {
    if (patientConsultations.length > 0) {
      processBillableItems();
    }
  }, [patientConsultations, patientBills]);

  const fetchPatientData = async (patientId) => {
    setLoading(true);
    try {
      const consultationsData = await fetchConsultationsByPatientId(patientId);
      const billsData = await fetchPatientBills(patientId);
      const insuranceData = await fetchPatientInsurance(patientId);
      
      setPatientConsultations(consultationsData);
      setPatientBills(billsData);
      setPatientInsurance(insuranceData);
    } catch (error) {
      console.error("Error fetching patient data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInsuranceSelect = (insurance) => {
    setSelectedInsurance(insurance);
  };

  const handleCallInsurance = () => {
    if (!selectedInsurance) {
      alert('Please select an insurance provider first');
      return;
    }
    if(formData.total_amount<=0)
    {
      alert('Total amount is 0, please select more items to bill');
      return;
    }
    // Simulate insurance coverage (in a real app, this would make an API call)
    // For simulation, let's say insurance covers 70% of the bill
    const totalAmount = parseFloat(formData.total_amount);
    const coveragePercent = 0.7; // 70% coverage
    const insuranceCoverage = totalAmount * coveragePercent;
    
    // Create a new insurance payment
    const newPayment = {
      id: Date.now(), // temporary id for UI purposes
      insurance_id: selectedInsurance._id,
      insurance_provider: selectedInsurance.insurance_provider,
      policy_number: selectedInsurance.policy_number,
      amount: insuranceCoverage.toFixed(2),
      payment_date: new Date(),
      payment_method: 'insurance',
      status: 'success'
    };
    
    // Add to insurance payments
    setInsurancePayments(prev => [...prev, newPayment]);
    
    // Recalculate remaining amount
    const newTotal = totalAmount - insuranceCoverage;
    
    setFormData(prev => ({
      ...prev,
      total_amount: newTotal.toFixed(2)
    }));
    
    // Reset selected insurance after processing
    setSelectedInsurance(null);
    
    alert(`Insurance claim processed. Insurance will cover $${insuranceCoverage.toFixed(2)}`);
  };

  // Process consultations to identify billable items
  const processBillableItems = () => {
    // Create a set of billed item IDs for quick lookup
    const billedConsultations = new Set();
    const billedReports = new Set();
    const billedPrescriptions = new Set();
    
    patientBills.forEach(bill => {
      if (!bill.items) return;
      
      bill.items.forEach(item => {
        if (item.consultation_details) billedConsultations.add(item.consultation_details.id);
        if (item.test_details) billedReports.add(item.test_details.id);
        if (item.prescription_id) billedPrescriptions.add(item.prescription_id);
      });
    });
    
    // Filter consultations that haven't been billed
    const unbilledConsultations = patientConsultations.filter(
      consultation => !billedConsultations.has(consultation._id) && consultation.status === "completed"
    );
    
    // Gather all reports and prescriptions from consultations
    const allReports = [];
    const allPrescriptions = [];
    
    patientConsultations.forEach(consultation => {
      // Add reports
      if (consultation.reports && consultation.reports.length) {
        consultation.reports.forEach(report => {
          if (!billedReports.has(report._id)) {
            allReports.push({
              ...report,
              consultationId: consultation._id,
              consultationDate: consultation.booked_date_time
            });
          }
        });
      }
      
      // Add prescriptions - Handle the nested prescription structure
      if (consultation.prescription && consultation.prescription.length) {
        consultation.prescription.forEach(prescriptionObj => {
          // Extract the actual prescription ID from the nested structure
          let prescriptionId;
          if (typeof prescriptionObj === 'object' && prescriptionObj._id ) {
            // The format is {_id: {_id: 10376, ...}}
            prescriptionId = prescriptionObj._id;
          } else if (typeof prescriptionObj === 'number') {
            // Simple ID format
            prescriptionId = prescriptionObj;
          } else {
            console.warn("Unexpected prescription format:", prescriptionObj);
            return; // Skip this prescription
          }
          
          if (!billedPrescriptions.has(prescriptionId) && prescriptionObj.status !== "cancelled") {
            allPrescriptions.push({
              _id: prescriptionId,
              consultationId: consultation._id,
              consultationDate: consultation.booked_date_time,
              prescriptionData: prescriptionObj, // Store the full data
              displayId: prescriptionId // For display purposes
            });
          }
        });
      }
    });
    
    setBillableItems({
      consultations: unbilledConsultations,
      reports: allReports,
      prescriptions: allPrescriptions
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleServiceChange = (e) => {
    const { name, value } = e.target;
    setCurrentService(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleServicePriceChange = (index, value) => {
    const updatedServices = [...formData.services];
    
    // Update the price for this service
    const oldPrice = parseFloat(updatedServices[index].price) || 0;
    const newPrice = parseFloat(value) || 0;
    updatedServices[index].price = newPrice.toFixed(2);
    
    // Recalculate total
    const totalDifference = newPrice - oldPrice;
    const newTotal = (parseFloat(formData.total_amount) || 0) + totalDifference;
    
    setFormData(prev => ({
      ...prev,
      services: updatedServices,
      total_amount: newTotal.toFixed(2)
    }));
  };

  const addService = () => {
    if (!currentService.item_description || !currentService.price) {
      alert('Please enter service description and price');
      return;
    }

    // Calculate running total
    const servicePrice = parseFloat(currentService.price) * parseInt(currentService.quantity || 1);
    const newTotal = (parseFloat(formData.total_amount) || 0) + servicePrice;

    setFormData(prev => ({
      ...prev,
      services: [...prev.services, {
        ...currentService, 
        price: servicePrice.toFixed(2),
        isCustom: true
      }],
      total_amount: newTotal.toFixed(2)
    }));

    // Reset service form for next entry
    setCurrentService({
      item_type: 'procedure',
      item_description: '',
      room_id: '',
      price: '',
      quantity: 1
    });
  };

  const removeService = (index) => {
    const removedPrice = parseFloat(formData.services[index].price) || 0;
    const newTotal = (parseFloat(formData.total_amount) || 0) - removedPrice;

    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index),
      total_amount: newTotal.toFixed(2)
    }));
  };

  const handleConsultationSelect = (consultation) => {
    // Check if this consultation is already in the services
    const isAlreadyAdded = formData.services.some(
      service => service.item_type === 'consultation' && service.consult_id === consultation._id
    );
    
    if (isAlreadyAdded) {
      alert('This consultation is already added to the bill.');
      return;
    }
    
    // Set consultation as a service item
    const consultationService = {
      item_type: 'consultation',
      item_description: `Consultation on ${new Date(consultation.booked_date_time).toLocaleDateString()} - ${consultation.reason || 'General'}`,
      consult_id: consultation._id,
      price: '100.00', // Default price
      quantity: 1,
      originalItem: consultation // Store original item for reference
    };
    
    // Add consultation service to form
    const servicePrice = parseFloat(consultationService.price);
    const newTotal = (parseFloat(formData.total_amount) || 0) + servicePrice;
    
    setFormData(prev => ({
      ...prev,
      services: [...prev.services, consultationService],
      total_amount: newTotal.toFixed(2)
    }));
  };

  const handleReportSelect = (report) => {
    // Check if already added
    const isAlreadyAdded = formData.services.some(
      service => service.item_type === 'test' && service.report_id === report._id
    );
    
    if (isAlreadyAdded) {
      alert('This report is already added to the bill.');
      return;
    }
    
    const reportService = {
      item_type: 'test',
      item_description: `Report: ${report.title || 'Medical Test'}`,
      report_id: report._id,
      price: '50.00', // Default price
      quantity: 1,
      originalItem: report // Store original item for reference
    };
    
    // Add report service to form
    const servicePrice = parseFloat(reportService.price);
    const newTotal = (parseFloat(formData.total_amount) || 0) + servicePrice;
    
    setFormData(prev => ({
      ...prev,
      services: [...prev.services, reportService],
      total_amount: newTotal.toFixed(2)
    }));
  };

  const handlePrescriptionSelect = (prescription) => {
    // Check if already added
    const isAlreadyAdded = formData.services.some(
      service => service.item_type === 'medication' && service.prescription_id === prescription._id
    );
    
    if (isAlreadyAdded) {
      alert('This prescription is already added to the bill.');
      return;
    }
    
    // Get prescription details for a better description
    let prescriptionDetails = '';
    
    // Check if we have prescription data with entries
    if (prescription.prescriptionData && prescription.prescriptionData.entries && prescription.prescriptionData.entries.length > 0) {
      const medicineCount = prescription.prescriptionData.entries.length;
      const firstMedicine = prescription.prescriptionData.entries[0];
      
      if (medicineCount === 1 && firstMedicine.medicine_name) {
        prescriptionDetails = `Medicine: ${firstMedicine.medicine_name}`;
      } else {
        prescriptionDetails = `${medicineCount} medications`;
      }
    }
    
    const prescriptionService = {
      item_type: 'medication',
      item_description: `Prescription #${prescription.displayId}${prescriptionDetails ? ` (${prescriptionDetails})` : ''}`,
      prescription_id: prescription._id,
      price: '75.00', // Default price
      quantity: 1,
      originalItem: prescription // Store original item for reference
    };
    
    // Add prescription service to form
    const servicePrice = parseFloat(prescriptionService.price);
    const newTotal = (parseFloat(formData.total_amount) || 0) + servicePrice;
    
    setFormData(prev => ({
      ...prev,
      services: [...prev.services, prescriptionService],
      total_amount: newTotal.toFixed(2)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.services.length === 0) {
      alert('Please add at least one service to the bill');
      return;
    }
    
    // Calculate the original total before insurance
    const originalTotal = formData.services.reduce((sum, service) => sum + parseFloat(service.price), 0);
    const insuranceTotal = insurancePayments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
    
    // Prepare the bill data
    const billData = {
      patient_id: formData.patient_id,
      total_amount: originalTotal.toFixed(2),
      remaining_amount: formData.total_amount, // After insurance
      payment_status: insurancePayments.length > 0 ? "partially_paid" : "pending"
    };
    
    try {
      // Create the bill
      const response = await fetch(`${import.meta.env.VITE_API_URL}/billing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(billData),
      });
      
      const data = await response.json();
  
      if (data.success) {
        // Prepare billing items
        const billItems = {
          items: formData.services.map(service => ({
            item_type: service.item_type,
            consult_id: service.consult_id || null,
            report_id: service.report_id || null,
            prescription_id: service.prescription_id || null,
            room_id: service.room_id || null,
            item_description: service.item_description,
            item_amount: parseFloat(service.price) / parseInt(service.quantity || 1),
            quantity: parseInt(service.quantity || 1)
          })),
        };
        
        // Add items to the bill
        const itemsResponse = await fetch(`${import.meta.env.VITE_API_URL}/billing/${data.data.bill_id}/items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(billItems),
        });
        
        const itemsData = await itemsResponse.json();
        
        if (itemsData.success && insurancePayments.length > 0) {
          // Add insurance payments to the bill
          const paymentsData = {
            payments: insurancePayments.map(payment => ({
              amount: parseFloat(payment.amount),
              insurance_id: payment.insurance_id,
              payment_date: payment.payment_date,
              status: payment.status,
              payment_method: payment.payment_method
            }))
          };
          
          // Add payments to the bill
          await fetch(`${import.meta.env.VITE_API_URL}/billing/${data.data.bill_id}/payments-list`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(paymentsData),
          });
        }
        
        if (itemsData.success) {
          // Update bill_id in consultations
          const consultationsToUpdate = formData.services
            .filter(service => service.item_type === 'consultation' && service.consult_id)
            .map(service => service.consult_id);
            
          for (const consultId of consultationsToUpdate) {
            await fetch(`${import.meta.env.VITE_API_URL}/consultations/update/${consultId}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ bill_id: data.data.bill_id }),
            });
          }
          
          alert('Bill added successfully!');
          
          // Reset form
          setFormData({
            patient_id: '',
            total_amount: '0.00',
            services: []
          });
          setInsurancePayments([]);
          
          // Refresh patient data if needed
          if (formData.patient_id) {
            fetchPatientData(formData.patient_id);
          }
        } else {
          alert('Failed to add bill items: ' + (itemsData.message || 'Unknown error'));
        }
      } else {
        alert('Failed to create bill: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error("Error adding bill:", error);
      alert('Error adding bill. Please try again.');
    }
  };

  // Show relevant fields based on item type
  const renderDynamicFields = () => {
    switch(currentService.item_type) {
      case 'room_charge':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Room:</label>
            <select
              name="room_id"
              value={currentService.room_id}
              onChange={handleServiceChange}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">Select a room</option>
              {availableRooms.map(room => (
                <option key={room._id} value={room._id}>
                  {room.room_number} - {room.room_type} 
                </option>
              ))}
            </select>
            
            {/* Optional: Auto-fill price when room is selected */}
         
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 bg-white w-full h-full">
      <h2 className="text-xl font-semibold mb-6">Add Bills</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Patient ID:</label>
            <input
              type="text"
              name="patient_id"
              value={formData.patient_id}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Display total amount prominently */}
          <div>
            <label className="block text-lg font-medium mb-2">Total Amount:</label>
            <div className="text-2xl font-bold text-teal-600">${formData.total_amount}</div>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center my-6">
            <div className="animate-pulse text-gray-500">Loading patient data...</div>
          </div>
        )}

        {/* Bill Items Section - Shows selected services */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">Bill Items</h3>
          
          {formData.services.length > 0 ? (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="p-2 text-left">Type</th>
                    <th className="p-2 text-left">Description</th>
                    <th className="p-2 text-center">Quantity</th>
                    <th className="p-2 text-right">Price</th>
                    <th className="p-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.services.map((service, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2 capitalize">{service.item_type}</td>
                      <td className="p-2">{service.item_description}</td>
                      <td className="p-2 text-center">{service.quantity || 1}</td>
                      <td className="p-2 text-right">
                        <input
                          type="number"
                          value={service.price}
                          onChange={(e) => handleServicePriceChange(index, e.target.value)}
                          className="w-24 p-1 border border-gray-300 rounded text-right"
                          step="0.01"
                          min="0"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeService(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-gray-50 p-6 rounded-lg mb-6 text-center">
              <p className="text-gray-600">No items added to the bill yet. Select items from below or add custom services.</p>
            </div>
          )}
        </div>
        <div className="mb-6">
  <h3 className="text-lg font-medium mb-4">Insurance Coverage</h3>
  
  {insurancePayments.length > 0 && (
    <div className="bg-gray-50 p-4 rounded-lg mb-4">
      <h4 className="text-md font-medium mb-2">Insurance Payments:</h4>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 text-left">Provider</th>
            <th className="p-2 text-left">Policy Number</th>
            <th className="p-2 text-right">Amount Covered</th>
            <th className="p-2 text-center">Date</th>
          </tr>
        </thead>
        <tbody>
          {insurancePayments.map((payment, index) => (
            <tr key={index} className="border-b">
              <td className="p-2">{payment.insurance_provider}</td>
              <td className="p-2">{payment.policy_number}</td>
              <td className="p-2 text-right">${payment.amount}</td>
              <td className="p-2 text-center">{new Date(payment.payment_date).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
  
  {patientInsurance.length > 0 ? (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h4 className="text-md font-medium mb-2">Available Insurance:</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {patientInsurance.map(insurance => (
          <div 
            key={insurance.insurance_provider} 
            className={`p-4 border rounded-lg bg-white cursor-pointer ${selectedInsurance && selectedInsurance.insurance_provider === insurance.insurance_provider ? 'ring-2 ring-blue-500' : 'hover:bg-blue-50'}`}
            onClick={() => handleInsuranceSelect(insurance)}
          >
            <h4 className="font-medium">{insurance.insurance_provider}</h4>
            <p className="text-sm text-gray-600">Policy: {insurance.policy_number}</p>
            <p className="text-sm text-gray-600">
              Valid until: {new Date(insurance.policy_end_date).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
      
      <div className="mt-4 flex justify-end">
        <button 
          type="button"
          onClick={handleCallInsurance}
          disabled={!selectedInsurance}
          className={`px-4 py-2 rounded text-white ${!selectedInsurance ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
        >
          Call Insurance
        </button>
      </div>
    </div>
  ) : (
    <div className="bg-gray-50 p-6 rounded-lg text-center">
      <p className="text-gray-600">No insurance providers found for this patient.</p>
    </div>
  )}
</div>

        {/* Billable Items Section */}
        {formData.patient_id && !loading && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4">Billable Items</h3>
            
            {/* Unbilled Consultations */}
            {billableItems.consultations.length > 0 && (
              <div className="mb-4">
                <h4 className="text-md font-medium mb-2">Unbilled Consultations:</h4>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="grid grid-cols-1 gap-4">
                    {billableItems.consultations.map(consultation => (
                      <div 
                        key={consultation._id} 
                        className="p-4 border rounded-lg bg-white cursor-pointer hover:bg-blue-50"
                        onClick={() => handleConsultationSelect(consultation)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">
                              {new Date(consultation.booked_date_time).toLocaleDateString()} - {consultation.doctor?.name || 'Doctor'}
                            </h4>
                            <p className="text-sm text-gray-600">Reason: {consultation.reason || 'General consultation'}</p>
                            <p className="text-sm text-gray-600">Status: {consultation.status}</p>
                          </div>
                          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            Unbilled
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Unbilled Reports */}
            {billableItems.reports.length > 0 && (
              <div className="mb-4">
                <h4 className="text-md font-medium mb-2">Unbilled Reports:</h4>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {billableItems.reports.map(report => (
                      <div 
                        key={report._id} 
                        className="p-4 border rounded-lg bg-white cursor-pointer hover:bg-blue-50"
                        onClick={() => handleReportSelect(report)}
                      >
                        <h4 className="font-medium">{report.title || 'Medical Test'}</h4>
                        <p className="text-sm text-gray-600">
                          From consultation on {new Date(report.consultationDate).toLocaleDateString()}
                        </p>
                        <span className="mt-2 inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          {report.status}
                        </span>
                        <span className="mt-2 inline-block bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          Unbilled
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Unbilled Prescriptions */}
            {billableItems.prescriptions.length > 0 && (
              <div className="mb-4">
                <h4 className="text-md font-medium mb-2">Unbilled Prescriptions:</h4>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {billableItems.prescriptions.map(prescription => (
                      <div 
                        key={prescription._id} 
                        className="p-4 border rounded-lg bg-white cursor-pointer hover:bg-blue-50"
                        onClick={() => handlePrescriptionSelect(prescription)}
                      >
                        <h4 className="font-medium">Prescription #{prescription.displayId}</h4>
                        <p className="text-sm text-gray-600">
                          From consultation on {new Date(prescription.consultationDate).toLocaleDateString()}
                        </p>
                        {prescription.prescriptionData && prescription.prescriptionData.status && (
                          <p className="text-sm text-gray-600">
                            Status: {prescription.prescriptionData.status}
                          </p>
                        )}
                        {prescription.prescriptionData && prescription.prescriptionData.entries && (
                          <p className="text-sm text-gray-600">
                            Medications: {prescription.prescriptionData.entries.length}
                          </p>
                        )}
                        <span className="mt-2 inline-block bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          Unbilled
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* No billable items message */}
            {!loading && billableItems.consultations.length === 0 && 
             billableItems.reports.length === 0 && 
             billableItems.prescriptions.length === 0 && (
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <p className="text-gray-600">No unbilled items found for this patient.</p>
              </div>
            )}
          </div>
        )}
        
        {/* Add Custom Services Section */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">Add Custom Services</h3>
          
          <div className="bg-gray-100 p-4 rounded-lg mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Item Type:</label>
                <select
                  name="item_type"
                  value={currentService.item_type}
                  onChange={handleServiceChange}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="procedure">Procedure</option>
                  <option value="room_charge">Room Charge</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Price:</label>
                <input
                  type="number"
                  name="price"
                  value={currentService.price}
                  onChange={handleServiceChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  step="0.01"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Quantity:</label>
                <input
                  type="number"
                  name="quantity"
                  value={currentService.quantity}
                  onChange={handleServiceChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  min="1"
                />
              </div>
            </div>

            {renderDynamicFields()}

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Item Description:</label>
              <textarea
                name="item_description"
                value={currentService.item_description}
                onChange={handleServiceChange}
                className="w-full p-2 border border-gray-300 rounded h-24"
                placeholder="Enter service details here..."
              />
            </div>

            <div className="flex justify-end">
              <button 
                type="button"
                onClick={addService}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Add Service
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-center md:justify-start">
          <button 
            type="submit" 
            className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-2 rounded transition duration-200"
            disabled={formData.services.length === 0}
          >
            Save Bill
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddBills;