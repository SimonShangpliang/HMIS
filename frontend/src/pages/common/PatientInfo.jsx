import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PatientInfo = () => {
  const role = localStorage.getItem("role");
  const [inputValue, setInputValue] = useState('');
  const [patientId, setPatientId] = useState('');
  const [patientDetails, setPatientDetails] = useState(null);
  const [tests, setTests] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [lastConsultation, setLastConsultation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDispenseDialog, setShowDispenseDialog] = useState(false);
  const [selectedDispense, setSelectedDispense] = useState(null);
  const [dispenseQuantity, setDispenseQuantity] = useState('');

  const handleDispenseMedicine = async (prescriptionId, entryId, currentDispensedQty, totalQty) => {
    setSelectedDispense({ prescriptionId, entryId, currentDispensedQty, totalQty });
    setDispenseQuantity('');
    setShowDispenseDialog(true);
  };

  const handleConfirmDispense = async () => {
    try {
      const qty = parseInt(dispenseQuantity);
      if (isNaN(qty) || qty <= 0) {
        alert('Please enter a valid quantity');
        return;
      }

      if (qty + selectedDispense.currentDispensedQty > selectedDispense.totalQty) {
        alert('Dispensing quantity exceeds the total prescribed quantity');
        return;
      }

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/pharmacists/prescription/${selectedDispense.prescriptionId}/entry/${selectedDispense.entryId}`,
        {
          dispensed_qty: selectedDispense.currentDispensedQty + qty
        }
      );

      // Refresh the prescriptions data
      const searchResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/pharmacists/prescriptions/search`,
        {
          params: {
            searchById: patientId,
            dispense: false
          }
        }
      );
      setPrescriptions(searchResponse.data.prescriptions || []);
      setShowDispenseDialog(false);

    } catch (error) {
      console.error("Error dispensing medicine:", error);
      alert('Failed to dispense medicine. Please try again.\n ' + error.response.data.message);
    }
  };

  const fetchPrescribedTests = async (patientId) => {
    return new Promise(async (resolve) => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/pathologists/searchById`, {
          params: {
            searchById: patientId
          }
        });
        return resolve(response.data);
      } catch (error) {
        console.error("Error fetching prescribed tests:", error);
        resolve({ patient: null, tests: [], lastConsultation: null });
      }
    });
  };

  const fetchPrescribedMedicines = async (patientId) => {
    return new Promise(async (resolve) => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/pharmacists/prescriptions/search`, {
          params: {
            searchById: patientId,
            dispense: false
          }
        });
        return resolve({
          patient: response.data.patient,
          prescriptions: response.data.prescriptions || [],
          lastConsultation: response.data.lastConsultation || null
        });
      } catch (error) {
        console.error("Error fetching prescribed medicines:", error);
        resolve({ patient: null, prescriptions: [], lastConsultation: null });
      }
    });
  };

  useEffect(() => {
    const getPatientData = async () => {
      if (!patientId) return;

      setLoading(true);
      try {
        if (role === 'pathologist') {
          const data = await fetchPrescribedTests(patientId);
          console.log(data);
          setPatientDetails(data.patient);
          const consultations = data.consultations || [];
          setTests(consultations.map(consultation => consultation.reports).flat() || []);
          setLastConsultation(data.consultations[0]);
        } else if (role === 'pharmacist') {
          const data = await fetchPrescribedMedicines(patientId);
          setPatientDetails(data.patient || null);
          setPrescriptions(data.prescriptions || []);
          setLastConsultation(data.consultations[0]);
        }
      } catch (error) {
        console.error("Error fetching patient data:", error);
      } finally {
        setLoading(false);
      }
    };

    getPatientData();
  }, [patientId, role]);

  const getMedicineStatusColor = (dispensed, total) => {
    if (dispensed === 0) return 'text-red-500';
    if (dispensed === total) return 'text-green-600';
    return 'text-yellow-500';
  };

  const getMedicineStatusText = (dispensed, total) => {
    if (dispensed === 0) return 'Not Dispensed';
    if (dispensed === total) return 'Fully Dispensed';
    return 'Partially Dispensed';
  };

  const getPrescriptionStatusColor = (status) => {
    switch (status) {
      case 'dispensed':
        return 'text-green-600';
      case 'partially_dispensed':
        return 'text-yellow-500';
      default:
        return 'text-red-500';
    }
  };

  return (
    <div className='p-5 pt-10 flex flex-col justify-center items-center space-y-6'>
      <div className='flex items-center'>
        <p className='mr-2 font-bold'>Enter the Patient Id:</p>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className='border-2 border-black p-2 rounded w-80 mr-2'
        />
        <button
          onClick={() => {
            const trimmedId = inputValue.trim();
            if (trimmedId) {
              setPatientId(trimmedId);
            }
          }}
          className={`ml-2 px-4 py-2 bg-[#4C7E75] text-white font-bold rounded ${loading ? 'cursor-not-allowed bg-gray-400' : 'cursor-pointer'}`}
        >
          ENTER
        </button>
      </div>

      {loading && <p className="text-blue-600 font-semibold">Loading patient data...</p>}

      <div className='border-t border-gray-300 w-full pt-4'>
        <p className='font-bold pb-3'>Patient Details</p>
        {patientDetails ? (
          <div className="space-y-2 text-black">
            <p><span className="font-medium text-black">Name:</span> {patientDetails.name || "John Doe"}</p>
            <p><span className="font-medium text-black">Age:</span> {patientDetails.patient_info.age || "25"}</p>
            <p><span className="font-medium text-black">Blood Group:</span> {patientDetails.patient_info.bloodGrp || "O+"}</p>
            <p><span className="font-medium text-black">Phone Number:</span> {patientDetails.phone_number || "9856231411"}</p>
          </div>
        ) : (
          <p className="">Patient data not available.</p>
        )}
      </div>

      {lastConsultation && (
        <div className='border-t border-gray-300 w-full pt-4'>
          <p className='font-bold pb-3'>Last Consultation</p>
          <div className="bg-gray-50 p-4 rounded-md shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <p><span className="font-medium">Date:</span> {new Date(lastConsultation.createdAt).toLocaleDateString() || new Date().toLocaleDateString()}</p>
              <p><span className="font-medium">Doctor ID:</span> {lastConsultation.doctor_id.employee_id.name || "Dr. Prem Singhania"}</p>
              <p><span className="font-medium">Reason:</span> {lastConsultation.reason || "Regular Checkup"}</p>
              <p>
                <span className="font-medium">Status:</span>
                <span className={`ml-2 ${lastConsultation.status === 'Completed' ? 'text-green-600' :
                  lastConsultation.status === 'Scheduled' ? 'text-blue-600' :
                    'text-yellow-600'
                  }`}>
                  {lastConsultation.status}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {role === 'pathologist' && (
        <div className='border-t border-gray-300 w-full pt-4'>
          <p className='font-bold pb-3'>Pending Reports</p>
          {tests.length > 0 ? (
            <div>
              <table className='table-auto w-full border border-gray-700'>
                <thead>
                  <tr className='bg-gray-100'>
                    <th className='px-4 py-2 border border-gray-700 text-center'>Report Type</th>
                    <th className='px-4 py-2 border border-gray-700 text-center'>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tests.map((test, index) => (
                    <tr key={index}>
                      <td className='px-4 py-2 border border-gray-700 text-center'>{test.title}</td>
                      <td className={`px-4 py-2 border border-gray-700 text-center font-semibold ${test.status === 'pending' ? 'text-red-500' : 'text-green-500'
                        }`}>
                        {test.status === 'pending' ? 'Report Pending' : 'Report Complete'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="">No pending reports.</p>
          )}
        </div>
      )}

      {role === 'pharmacist' && (
        <div className='border-t border-gray-300 w-full pt-4'>
          <p className='font-bold pb-3'>Prescribed Medicines</p>
          {prescriptions.length > 0 ? (
            <div className="space-y-8">
              {prescriptions.map((prescription, index) => (
                <div key={prescription.prescription_id} className="bg-white shadow-lg rounded-lg overflow-hidden">
                  <div className="p-4 bg-gray-50 border-b">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">Prescription Date: {new Date(prescription.prescription_date).toLocaleDateString()}</p>
                        <p className={`${getPrescriptionStatusColor(prescription.status)} font-medium`}>
                          Status: {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1).replace('_', ' ')}
                        </p>
                      </div>
                      <p className="text-gray-600">#{prescription.prescription_id}</p>
                    </div>
                  </div>

                  <div className="p-4 space-y-4">
                    {prescription.entries.map((entry, entryIndex) => (
                      <div key={entry.entry_id} className="border-b last:border-b-0 pb-4 last:pb-0">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="font-semibold">Medicine: {entry.medicine_name}</p>
                            <p>Manufacturer: {entry.manufacturer}</p>
                            <p>Dosage: {entry.dosage}</p>
                            <p>Frequency: {entry.frequency}</p>
                          </div>
                          <div>
                            <p>Duration: {entry.duration}</p>
                            <p>Quantity: {entry.quantity}</p>
                            <p>Dispensed: {entry.dispensed_qty} of {entry.quantity}</p>
                            <p className={`font-semibold ${getMedicineStatusColor(entry.dispensed_qty, entry.quantity)}`}>
                              Status: {getMedicineStatusText(entry.dispensed_qty, entry.quantity)}
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleDispenseMedicine(
                              prescription.prescription_id,
                              entry.entry_id,
                              entry.dispensed_qty,
                              entry.quantity
                            )}
                            disabled={entry.dispensed_qty >= entry.quantity}
                            className={`px-4 py-2 rounded ${entry.dispensed_qty >= entry.quantity
                              ? 'bg-gray-300 cursor-not-allowed'
                              : 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
                              }`}
                          >
                            {entry.dispensed_qty >= entry.quantity ? 'Already Dispensed' : 'Dispense'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No prescriptions found.</p>
          )}
        </div>
      )}

      {/* Dispense Dialog */}
      {showDispenseDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Enter Quantity to Dispense</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity (Remaining: {selectedDispense.totalQty - selectedDispense.currentDispensedQty})
              </label>
              <input
                type="number"
                value={dispenseQuantity}
                onChange={(e) => setDispenseQuantity(e.target.value)}
                min="1"
                max={selectedDispense.totalQty - selectedDispense.currentDispensedQty}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDispenseDialog(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDispense}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientInfo;
