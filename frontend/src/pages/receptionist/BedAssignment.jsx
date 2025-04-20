import React, { useState, useEffect } from 'react';
import axios from 'axios'; 

const BedAssignment = () => {
  const [selectedRoom, setSelectedRoom] = useState(1);
  const [beds, setBeds] = useState({});

  const [selectedBed, setSelectedBed] = useState(null);
  const [patientForm, setPatientForm] = useState({ patientId: '',  nurseId:''});
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState('assign');
  const [roomList, setRoomList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);


  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 5000); // 3 seconds
  
      return () => clearTimeout(timer); // cleanup on unmount or if error changes again
    }
  }, [error]);
  
  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true); // Start loading
      setError(''); // Clear previous errors
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/reception/rooms`);
        setRoomList(response.data); // each room will have room_number and room_type
        // Set default selected room to first one
        if (response.data.length > 0) {
          setSelectedRoom(response.data[0].room_number);
        }
      } catch (err) {
        console.error('Error fetching room list:', err);
        setError('Failed to fetch room list.');
      }
      finally {
        setLoading(false); // End loading even on error
      }
    };
    fetchRooms();
  }, []);
  
useEffect(() => {
    const fetchRoomBeds = async () => {
      if (!selectedRoom || loading) return; // Wait until room is selected and rooms are fetched
      setError(''); // Clear previous error
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/reception/beds?room=${selectedRoom}`);
        const data = response.data;
        // Transform to match your bed structure
        const transformed = {};
        data.beds.forEach(bed => {
          transformed[bed.bedNumber] = {
            occupied: bed.status === 'occupied',
            patientId: bed.patient?.patientId || null,
            nurseId:bed.nurse?.nurseId || null
          };
        });
        console.log(transformed);
        setBeds(transformed);
      } catch (err) {
        console.error('Error fetching bed data:', err);
        setError('Failed to fetch bed information for the selected room.');
        setBeds({}); // fallback to empty
      }
    };

    fetchRoomBeds();
  }, [selectedRoom,loading]);


  const handleBedClick = (bedId) => {
    setSelectedBed(bedId);
    const bed = beds[bedId];
    if (bed.occupied) {
      setModalAction('discharge');
      setPatientForm({
        patientId: bed.patientId,
        nurseId: bed.nurseId
      });
    } else {
      setModalAction('assign');
      setPatientForm({ patientId: '', nurseId: '' });
    }
    setShowModal(true);
  };
  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPatientForm({ ...patientForm, [name]: value });
  };

  const handleAssignBed = async () => {
    const { patientId, nurseId } = patientForm;
    if (selectedBed && patientId && nurseId ) {
      setActionLoading(true); // Start button spinner
      try {
        await axios.post(`${import.meta.env.VITE_API_URL}/reception/assign-bed`, {
          bedId: selectedBed,
          room: selectedRoom,
          patientId,
          nurseId
        });
  
        setBeds({
          ...beds,
          [selectedBed]: {
            occupied: true,
            patientId,
            nurseId
          },
        });
        setSelectedBed(null);
      } catch (err) {
        console.error('Error assigning bed:', err);
        setError(err.response?.data?.error || 'Failed to assign bed. Please try again.');
      }
      finally{
        setShowModal(false);
        setActionLoading(false); // Stop button spinner
      }
      
    }
  };
  
  const handleDischargeBed = async () => {
    const { patientId,nurseId } = patientForm;
    if (selectedBed) {
      setActionLoading(true);
      try {
        await axios.post(`${import.meta.env.VITE_API_URL}/reception/discharge-bed`, {
          bedId: selectedBed,
          room: selectedRoom,
          patientId,
          nurseId
        });
  
        setBeds({
          ...beds,
          [selectedBed]: {
            occupied: false,
            patientId: null,
            nurseId: null,
          },
        });
  
        setSelectedBed(null);
      } catch (err) {
        console.error('Error discharging bed:', err);
        setError('Failed to discharge patient. Please try again.');
      }
      finally{
        setShowModal(false);
        setActionLoading(false);
      }
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-500"></div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Bed Mapping</h2>
        <select
          value={selectedRoom}
          onChange={(e) => setSelectedRoom(parseInt(e.target.value))}
          className="border border-gray-300 px-3 py-1 rounded-md"
        >
          {roomList.map((room) => (
            <option key={room.room_number} value={room.room_number}>
              Room {room.room_number} ({room.room_type})
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="text-red-600 mb-4 text-center font-medium">
          {error}
        </div>
      )}

      {/* Bed Grid */}
      <div className="grid grid-cols-5 gap-4 max-w-4xl mx-auto">
        {Object.keys(beds).map((bedId) => (
          <div
            key={bedId}
            onClick={() => handleBedClick(bedId)}
            className={`
              p-4 rounded-md text-center font-medium cursor-pointer
              ${beds[bedId].occupied ? 'bg-cyan-200 hover:bg-cyan-300' : 'bg-gray-200 hover:bg-gray-300'}
              transition-colors duration-200
            `}
          >
            {bedId}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-8 flex items-center justify-center gap-6">
        <div className="flex items-center">
          <div className="w-6 h-6 bg-gray-200 mr-2"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center">
          <div className="w-6 h-6 bg-cyan-200 mr-2"></div>
          <span>Occupied</span>
        </div>
      </div>

      {/* Assignment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">
              {modalAction === 'assign' ? 'Assign Patient to Bed' : 'Discharge Patient'} {selectedBed}
            </h3>

            {modalAction === 'assign' ? (
              <>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Patient ID:</label>
                  <input
                    type="text"
                    name="patientId"
                    value={patientForm.patientId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Nurse ID:</label>
                  <input
                    type="text"
                    name="nurseId"
                    value={patientForm.nurseId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div className="flex justify-end">
                    <button 
                      onClick={() => setShowModal(false)} 
                      className="mr-2 px-4 py-2 bg-gray-300 rounded-md"
                      disabled={actionLoading}
                    >
                      Cancel
                    </button>

                    <button 
                      onClick={handleAssignBed} 
                      disabled={actionLoading}
                      className={`px-4 py-2 text-white rounded-md ${
                        actionLoading ? 'bg-teal-400 cursor-not-allowed' : 'bg-teal-600'
                      }`}
                    >
                      {actionLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full mr-2"></div>
                          Assigning...
                        </div>
                      ) : (
                        'Assign'
                      )}
                    </button>
                  </div>

              </>
            ) : (
              <>
                <p><strong>Patient ID:</strong> {patientForm.patientId}</p>
                <p><strong>Nurse ID:</strong> {patientForm.nurseId}</p>
                <div className="flex justify-end mt-4">
                    <button 
                      onClick={() => setShowModal(false)} 
                      className="mr-2 px-4 py-2 bg-gray-300 rounded-md"
                      disabled={actionLoading}
                    >
                      Cancel
                    </button>

                    <button 
                      onClick={handleDischargeBed} 
                      className={`px-4 py-2 text-white rounded-md ${
                        actionLoading ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600'
                      }`}
                      disabled={actionLoading}
                    >
                      {actionLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full mr-2"></div>
                          Discharging...
                        </div>
                      ) : (
                        'Discharge'
                      )}
                    </button>
                  </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BedAssignment;
