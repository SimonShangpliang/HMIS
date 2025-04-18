import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PatientInfo = () => {
  // Get current user role from localStorage
  const role = localStorage.getItem("role");

  // for saving the context of the fetched data
  const [inputValue, setInputValue] = useState('');
  const [patientId, setPatientId] = useState('');
  const [patientDetails, setPatientDetails] = useState(null);
  const [tests, setTests] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [lastConsultation, setLastConsultation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null); 
  const [editedQuantity, setEditedQuantity] = useState(''); 

  const handleEdit = (index, currentQty) => {
    setEditingIndex(index);
    setEditedQuantity(currentQty);
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setEditedQuantity('');
  };

  const handleSave = async (prescriptionId, entryId) => {
    const med = medicines.find(med => med.prescription_id === prescriptionId && med.entry_id === entryId);
    if (!med) {
      alert("Medicine not found.");
      return;
    }

    // const remainingQty = med.quantity - med.dispensed_qty;
    const enteredQty = Number(editedQuantity);

    // valid quantity should be present
    if (!editedQuantity || enteredQty <= 0) {
      alert('Please enter a valid quantity.');
      return;
    }

    if (enteredQty > med.quantity) {
      alert(`You cannot dispense more than the total quantity.`);
      return;
    }

    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/pharmacists/prescriptions/${prescriptionId}/entries/${entryId}`, {
        dispensed_qty: enteredQty
      });

      // Update local state immediately
      setMedicines(prevMeds => prevMeds.map(m => {
        if (m.prescription_id === prescriptionId && m.entry_id === entryId) {
          const updated_dispensed = enteredQty;
          const total_quantity = m.quantity;

          const updated_status = updated_dispensed === total_quantity ? 'dispensed' : (updated_dispensed > 0 ? 'partially_dispensed' : 'pending');

          return {
            ...m,
            dispensed_qty: updated_dispensed,
            prescription_status: updated_status
          };
        }
        return m;
      }));

      setEditingIndex(null);
      setEditedQuantity('');
    } catch (error) {
  console.error("Failed to update medicine:", error);

  if (error.response) {
    console.error("Server responded with status:", error.response.status);
    console.error("Server error message:", error.response.data);
    alert(`Failed to save: ${error.response.data.message || 'Unknown server error'}`);
  } else if (error.request) {
    console.error("No response received:", error.request);
    alert("No response from server. Please check your internet connection.");
  } else {
    console.error("Error setting up the request:", error.message);
    alert(`Request error: ${error.message}`);
  }

  setEditingIndex(null);
  setEditedQuantity('');
}

  }
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
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/pharmacists/prescriptions`, {
          params: {
            searchById: patientId,
            dispense: false
          }
        });
        // console.log(response.data);
        return resolve({
          patient: response.data.patient,
          prescribed_medicines: response.data.prescribed_medicines || [],
          lastConsultation: response.data.consultation || null
        });
      } catch (error) {
        console.error("Error fetching prescribed medicines:", error);
        resolve({ patient: null, prescribed_medicines: [], lastConsultation: null });
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
          setPatientDetails(data.patient);
          setTests(data.tests || []);
          setLastConsultation(data.lastConsultation);
        } else if (role === 'pharmacist') {
          const data = await fetchPrescribedMedicines(patientId);
          setPatientDetails(data.patient);
          setMedicines(data.prescribed_medicines || []);
          setLastConsultation(data.lastConsultation);
        }
      } catch (error) {
        console.error("Error fetching patient data:", error);
      } finally {
        setLoading(false);
      }
    };

    getPatientData();
  }, [patientId, role]);

  return (
    <div className='p-5 pt-10 flex flex-col justify-center items-center space-y-6'>
      <div className='flex items-center'>
        <p className='mr-2 font-bold'>Enter the Patient Id:</p>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
          }}
          className='border-2 border-black p-2 rounded w-80 mr-2'
        />
        <button
          onClick={() => {
            const trimmedId = inputValue.trim();
            if (trimmedId) {
              setPatientId(inputValue);
              // console.log(inputValue);
              // setInputValue('');
            }
          }}
          // disabled={loading}
          className={`ml-2 px-4 py-2 bg-[#4C7E75] text-white font-bold rounded ${loading ? 'cursor-not-allowed bg-gray-400' : 'cursor-pointer'
            }`}
        >
          ENTER</button>
      </div>
      {/* to show loading state while data being fetched */}
      {loading && <p className="text-blue-600 font-semibold">Loading patient data...</p>}
      <div className='border-t border-gray-300 w-full pt-4'>
        <p className='font-bold pb-3'>Patient Details</p>
        {patientDetails ?
          (
            <div className="space-y-2 text-black">
              <p><span className="font-medium text-black">Name:</span> {patientDetails.name}</p>
              <p><span className="font-medium text-black">Age:</span> {patientDetails.patient_info.age}</p>
              <p><span className="font-medium text-black">Blood Group:</span> {patientDetails.patient_info.bloodGrp}</p>
              <p><span className="font-medium text-black">Phone Number:</span> {patientDetails.phone_number}</p>
            </div>
          ) : (
            <p className="">No patient selected.</p>
          )}
      </div>
      {/* Last Consultation Section */}
      {lastConsultation && (
        <div className='border-t border-gray-300 w-full pt-4'>
          <p className='font-bold pb-3'>Last Consultation</p>
          <div className="bg-gray-50 p-4 rounded-md shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <p><span className="font-medium">Date:</span> {new Date(lastConsultation.date).toLocaleDateString()}</p>
              <p><span className="font-medium">Doctor ID:</span> {lastConsultation.doctorId}</p>
              <p><span className="font-medium">Reason:</span> {lastConsultation.reason}</p>
              <p><span className="font-medium">Status:</span>
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
          <p className='font-bold pb-3'>Prescribed Tests</p>
          {tests.length > 0 ?
            (
              <div>
                <table className='table-auto w-full border border-gray-700'>
                  <thead>
                    <tr className='bg-gray-100'>
                      <th className='px-4 py-2 border border-gray-700 text-center'>Test Name</th>
                      <th className='px-4 py-2 border border-gray-700 text-center'>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tests.map((test, index) => (
                      <tr key={index}>
                        <td className='px-4 py-2 border border-gray-700 text-center'> {test.title} </td>
                        <td className={`px-4 py-2 border border-gray-700 text-center font-semibold ${test.status === 'pending' ? 'text-red-500' : 'text-black'
                          }`}
                        > {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                        </td>
                      </tr>))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="">No test there.</p>
            )}
        </div>
      )}
      {role === 'pharmacist' && (
        <div className='border-t border-gray-300 w-full pt-4'>
          <p className='font-bold pb-3'>Prescribed Medicines</p>
          {medicines.length > 0 ? (
            <div>
              <table className='table-auto w-full border border-gray-700'>
                <thead>
                  <tr className='bg-gray-100'>
                    <th className='px-4 py-2 border border-gray-700 text-center'>Medicine Name</th>
                    <th className='px-4 py-2 border border-gray-700 text-center'>Dosage</th>
                    <th className='px-4 py-2 border border-gray-700 text-center'>Frequency</th>
                    <th className='px-4 py-2 border border-gray-700 text-center'>Quantity</th>
                    <th className='px-4 py-2 border border-gray-700 text-center'>Dispensed</th>
                    <th className='px-4 py-2 border border-gray-700 text-center'>Status</th>
                    <th className='px-4 py-2 border border-gray-700 text-center'>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {medicines.map((med, index) => (
                    <tr key={index}>
                      <td className='px-4 py-2 border border-gray-700 text-center'>{med.medicine_name}</td>
                      <td className='px-4 py-2 border border-gray-700 text-center'>{med.dosage}</td>
                      <td className='px-4 py-2 border border-gray-700 text-center'>{med.frequency}</td>
                      <td className='px-4 py-2 border border-gray-700 text-center'>{med.quantity}</td>
                      <td className='px-4 py-2 border border-gray-700 text-center'>
                        {editingIndex === index ? (
                          <input
                            type="number"
                            value={editedQuantity}
                            onChange={(e) => setEditedQuantity(e.target.value)}
                            className="w-20 text-center border rounded border-black"
                          />
                        ) : (
                          med.dispensed_qty
                        )}
                      </td>
                      <td className={`px-4 py-2 border border-gray-700 text-center font-semibold ${med.prescription_status === 'dispensed' ? 'text-green-600' :
                        med.prescription_status === 'partially_dispensed' ? 'text-yellow-500' :
                          'text-red-500'
                        }`}>
                        {med.prescription_status}
                      </td>
                      <td className='px-4 py-2 border border-gray-700 text-center'>
                        {editingIndex === index ? (
                          <>
                            <button onClick={() => handleSave(med.prescription_id,med.entry_id)} className="text-green-600 mr-2 cursor-pointer">Save</button>
                            <button onClick={handleCancel} className="text-red-600  cursor-pointer">Cancel</button>
                          </>
                        ) : (
                          <button 
                            onClick={() => handleEdit(index, med.dispensed_qty)} 
                            className={`text-blue-600 cursor-pointer ${med.dispensed_qty === med.quantity ? 'cursor-not-allowed text-gray-500' : ''}`} 
                            disabled={med.dispensed_qty === med.quantity}
                          >
                            Edit
                          </button>
                          )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No medicine data available.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PatientInfo;
