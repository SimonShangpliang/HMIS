import React, { useState, useEffect, useRef } from "react";
import { Pencil, ArrowRight, Check, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../../styles/patient/PatientDashboard.css";
import axios from 'axios';
import { useAuth } from "../../context/AuthContext";

const calculateAge = dob => {
  const birth = new Date(dob);
  const now = new Date();

  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  const days = now.getDate() - birth.getDate();

  if (days < 0) {
    months--;
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  return `${years}Y ${months}M`;
};

const PatientDashboard = () => {
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [appointments, setAppointments] = useState(null);
  const [insurances, setInsurances] = useState([]);
  const [availableInsurances, setAvailableInsurances] = useState([]);
  const [selectedInsurance, setSelectedInsurance] = useState("");
  const [policyNumber, setPolicyNumber] = useState("");
  const [policyEndDate, setPolicyEndDate] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState("");

  // Modal states
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [editedDetails, setEditedDetails] = useState({
    name: "",
    bloodGrp: "",
    height: "",
    weight: "",
    phone_number: "",
    email: "",
    emergency_contact: "",
    address: "",
    date_of_birth: "",
    aadhar_number: "",
    gender: ""
  });


  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { setUser,axiosInstance } = useAuth();

  const patientId = localStorage.getItem("user_id");

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsImageUploading(true);
    const formData = new FormData();
    formData.append("profile_pic", file);
    try {
      const res = await axiosInstance.post(
        `${import.meta.env.VITE_API_URL}/patients/upload-photo/${patientId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      const newProfilePicUrl = res.data.profile_pic;
      setProfilePhoto(newProfilePicUrl);
      setUser((prev) => ({ ...prev, profile_pic: newProfilePicUrl }));
    } catch (err) {
      setErrorMessage(`Upload Failed: ${err}`);
      setShowErrorModal(true);
    } finally {
      if (!window._authFailed) setIsImageUploading(false); 
    }
  };

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const response = await axiosInstance.get(`${import.meta.env.VITE_API_URL}/patients/profile/${patientId}`);
        setPatientData(response.data);
        setProfilePhoto(response.data.profile_pic);
        if (response.data) {
          setEditedDetails(prev => ({
            ...prev,
            name: response.data.name || "",
            phone_number: response.data.phone_number || "",
            email: response.data.email || "",
            emergency_contact: response.data.emergency_contact || "",
            address: response.data.address || "",
            gender: response.data.gender || "",
            date_of_birth: response.data.date_of_birth || "",
            aadhar_number: response.data.aadhar_number || "",
            bloodGrp: response.data.patient_info.bloodGrp || "",
            height: response.data.patient_info.height || "",
            weight: response.data.patient_info.weight || "",
          }));
        }
      } catch (error) {
        setErrorMessage('Failed to fetch patient data:', error);
        setShowErrorModal(true);
      }
    };

    fetchPatientData();

    const fetchPatientInsurances = async () => {
      try {
        const response = await axiosInstance.get(`${import.meta.env.VITE_API_URL}/insurance/${patientId}/insurances`);
        setInsurances(response.data);
      } catch (error) {
        setErrorMessage(`Failed to fetch patient insurances: ${error}`);
        setShowErrorModal(true);
        setInsurances([]);
      }
    };

    fetchPatientInsurances();
  }, [patientId]);

  useEffect(() => {
    const fetchAvailableInsurances = async () => {
      try {
        const response = await axiosInstance.get(`${import.meta.env.VITE_API_URL}/insurance/insurance-providers`);
        const patientInsuranceProviders = insurances.map(ins => ins.insurance_provider);
        const filtered = response.data.filter(ins => !patientInsuranceProviders.includes(ins.insurance_provider));
        setAvailableInsurances(filtered);
      } catch (error) {
        setErrorMessage(`Failed to fetch available insurances: ${error}`)
        setShowErrorModal(true);
        setAvailableInsurances([]);
      }
    };

    fetchAvailableInsurances();
  }, [insurances]);

  const handleVerifyInsurance = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    setVerificationMessage("");

    try {
      const response = await axiosInstance.post(`${import.meta.env.VITE_API_URL}/insurance/${patientId}/verify-insurance`, {
        insurance_provider: selectedInsurance,
        policy_number: policyNumber,
        policy_end_date: policyEndDate
      });

      if (response.status === 200) {
        setVerificationMessage("Insurance verified successfully!");
        setInsurances([...insurances, response.data]);
        setSelectedInsurance("");
        setPolicyNumber("");
        setPolicyEndDate("");
      }
    } catch (error) {
      setErrorMessage(`Failed to verify insurance: ${error}`);
      setShowErrorModal(true);
      setVerificationMessage("Failed to verify insurance. Please try again.");
    } finally {
      if (!window._authFailed) setIsVerifying(false);
    }
  };

  const handleEditToggle = async () => {
    if (isEditing) {
      try {
        const response = await axios.put(
          `${import.meta.env.VITE_API_URL}/patients/profile/${patientId}`,
          editedDetails
        );
  
        // Check if the response contains a message that indicates an error
        if (response.data?.message && response.status !== 200) {
          setErrorMessage(`Update failed: ${response.data.message}`);
          setShowErrorModal(true);
          return;
        }
  
        setPatientData((prev) => ({
          ...prev,
          ...editedDetails,
        }));
  
        setIsEditing(false);
        window.location.reload(); // Optional: consider removing this to keep it SPA-friendly
      } catch (err) {
        setErrorMessage(err.response?.data?.message || "Failed to update patient details.");
        setShowErrorModal(true);
      }
    } else {
      setIsEditing(true);
    }
  };  

  if (!patientData) return <div className="text-center p-8">Loading...</div>;

  const patient_info = patientData.patient_info;

  return (
    <div className="patient-dashboard">
      {/* Profile Section */}
      <div className="profile-section">
        <div
          className={`relative w-40 h-40 rounded-full overflow-hidden border border-gray-300 transform transition-transform duration-300 ${
            isImageUploading ? "cursor-not-allowed opacity-60" : "cursor-pointer group hover:scale-105"
          }`}
          onClick={() => {
            if (!isImageUploading) fileInputRef.current.click();
          }}
        >

        {isImageUploading ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-600 text-sm">
            Uploading...
          </div>
        ) : profilePhoto ? (
          <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600 bg-gray-100">
            Profile Photo
          </div>
        )}


        {/* Hover overlay with label */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center text-white text-sm font-medium">
          Click to change
        </div>

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>


        <div className="patient-info">
          {isEditing ? (
            <>
              <div className="input-group">
                <label>Name:</label>
                <input
                  type="text"
                  value={editedDetails.name}
                  onChange={(e) => setEditedDetails({ ...editedDetails, name: e.target.value })}
                  className="input-field"
                />
              </div>
              <div className="input-group">
                <label>Blood Group:</label>
                <input
                  type="text"
                  value={editedDetails.bloodGrp}
                  onChange={(e) => setEditedDetails({ ...editedDetails, bloodGrp: e.target.value })}
                  className="input-field"
                />
              </div>
              <div className="input-group">
                <label>Height (cm):</label>
                <input
                  type="number"
                  value={editedDetails.height}
                  onChange={(e) => setEditedDetails({ ...editedDetails, height: e.target.value })}
                  className="input-field"
                />
              </div>
              <div className="input-group">
                <label>Weight (kg):</label>
                <input
                  type="number"
                  value={editedDetails.weight}
                  onChange={(e) => setEditedDetails({ ...editedDetails, weight: e.target.value })}
                  className="input-field"
                />
              </div>
              <button className="cancel-button bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
            </>
          ) : (
            <>
              <h1 className="mb-0 pb-0">{patientData.name}</h1>
              <div className="patient-detail"><label>Patient ID:</label><span>{patientData._id}</span></div>
              <div className="patient-detail"><label>Age:</label><span>{calculateAge(patientData.date_of_birth)}</span></div>
              <div className="patient-detail"><label>Blood Group:</label><span>{patient_info.bloodGrp}</span></div>
              <div className="patient-detail"><label>Height:</label><span>{patient_info.height} cm</span></div>
              <div className="patient-detail"><label>Weight:</label><span>{patient_info.weight} kg</span></div>
              <div className="patient-detail"><label>Bed No:</label><span>{patient_info.bedNo}</span></div>
              <div className="patient-detail"><label>Room No:</label><span>{patient_info.roomNo}</span></div>
            </>
          )}

          <button className="edit-button bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600" onClick={handleEditToggle}>
            {isEditing ? "Save" : "Edit"}
          </button>
        </div>

      </div>

      {/* Patient Details Section */}
      <div className="patient-details-section">
        <div className="flex justify-between items-center">
          <h2 className="details-heading">Patient Details</h2>
        </div>

        <div className="detail-cards-container">
          {/* Contact Info */}
          <div className="detail-card">
            <h3 className="detail-card-title">Contact Information</h3>
            <div className="detail-card-content">
              {isEditing ? (
                <>
                  <div className="input-group">
                    <label>Phone Number:</label>
                    <input
                      type="text"
                      value={editedDetails.phone_number}
                      onChange={(e) => setEditedDetails({ ...editedDetails, phone_number: e.target.value })}
                      placeholder="Phone Number"
                      className="input-field"
                    />
                  </div>
                  <div className="input-group">
                    <label>Email:</label>
                    <input
                      type="email"
                      value={editedDetails.email}
                      onChange={(e) => setEditedDetails({ ...editedDetails, email: e.target.value })}
                      placeholder="Email"
                      className="input-field"
                    />
                  </div>
                  <div className="input-group">
                    <label>Emergency Contact:</label>
                    <input
                      type="text"
                      value={editedDetails.emergency_contact}
                      onChange={(e) => setEditedDetails({ ...editedDetails, emergency_contact: e.target.value })}
                      placeholder="Emergency Contact"
                      className="input-field"
                    />
                  </div>
                </>
              ) : (
                <>
                  <p>Phone: {patientData.phone_number}</p>
                  <p>Email: {patientData.email}</p>
                  <p>Emergency Contact: {patientData.emergency_contact}</p>
                </>
              )}
            </div>
          </div>

          {/* Personal Info */}
          <div className="detail-card">
            <h3 className="detail-card-title">Personal Information</h3>
            <div className="detail-card-content">
              {isEditing ? (
                <>
                  <div className="input-group">
                    <div className="input-group">
                      <label>Gender:</label>
                      <div className="radio-group">
                        <label>
                          <input
                            type="radio"
                            value="male"
                            checked={editedDetails.gender === "male"}
                            onChange={() => setEditedDetails({ ...editedDetails, gender: "male" })}
                          />
                          Male
                        </label>
                        <label>
                          <input
                            type="radio"
                            value="female"
                            checked={editedDetails.gender === "female"}
                            onChange={() => setEditedDetails({ ...editedDetails, gender: "female" })}
                          />
                          Female
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="input-group">
                    <label>Date of Birth:</label>
                    <input
                      type="date"
                      max = {new Date().toISOString().split("T")[0]}
                      value={editedDetails.date_of_birth || ''}
                      onChange={(e) =>
                        setEditedDetails({ ...editedDetails, date_of_birth: e.target.value })
                      }
                      placeholder="Date of Birth"
                      className="input-field"
                    />
                  </div>
                  <div className="input-group">
                    <label>Aadhar Number:</label>
                    <input
                      type="text"
                      value={editedDetails.aadhar_number || ''}
                      onChange={(e) =>
                        setEditedDetails({ ...editedDetails, aadhar_number: e.target.value })
                      }
                      placeholder="Aadhar Number"
                      className="input-field"
                    />
                  </div>
                </>
              ) : (
                <>
                  <p>Gender: {patientData.gender.charAt(0).toUpperCase() + patientData.gender.slice(1)}</p>
                  <p>Date of Birth: {new Date(patientData.date_of_birth).toLocaleDateString()}</p>
                  <p>Aadhar: {patientData.aadhar_number}</p>
                </>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="detail-card">
            <h3 className="detail-card-title">Address</h3>
            <div className="detail-card-content">
              {isEditing ? (
                <div className="input-group">
                  <textarea
                    value={editedDetails.address}
                    onChange={(e) => setEditedDetails({ ...editedDetails, address: e.target.value })}
                    placeholder="Address"
                    className="input-field"
                  />
                </div>
              ) : (
                <p>{patientData.address}</p>
              )}
            </div>
          </div>

          {/* Medical History */}
          <div className="detail-card">
            <h3 className="detail-card-title">Medical History</h3>
            <div className="detail-card-content">
              <p>Family History: {patient_info.familyHistory || 'None'}</p>
              <p>Other: {patient_info.other || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Insurance Section */}
      <div className="insurance-section">
        <h2 className="insurance-heading" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Shield /> My Insurance
        </h2>

        <div className="current-insurances">
          <h3>Current Insurance Plans</h3>
          {insurances.length > 0 ? (
            insurances.map((insurance, index) => (
              <div key={index} className="insurance-card">
                <div className="insurance-provider">
                  <Check className="text-green-500" />
                  <span className="font-bold">{insurance.insurance_provider}</span>
                </div>
                <div className="insurance-details">
                  <p>Policy #: {insurance.policy_number}</p>
                  <p>Expires: {new Date(insurance.policy_end_date).toLocaleDateString()}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No insurance plans verified yet.</p>
          )}
        </div>

        <div className="verify-insurance">
          <h3>Verify New Insurance</h3>
          <form onSubmit={handleVerifyInsurance}>
            <div className="form-group">
              <label htmlFor="insurance-provider">Insurance Provider</label>
              <select
                id="insurance-provider"
                value={selectedInsurance}
                onChange={(e) => setSelectedInsurance(e.target.value)}
                required
                className="form-control"
              >
                <option value="">Select an insurance provider</option>
                {availableInsurances.map((insurance, index) => (
                  <option key={index} value={insurance.insurance_provider}>
                    {insurance.insurance_provider}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="policy-number">Policy Number</label>
              <input
                type="text"
                id="policy-number"
                value={policyNumber}
                onChange={(e) => setPolicyNumber(e.target.value)}
                required
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="policy-end-date">Policy End Date</label>
              <input
                type="date"
                min = {new Date().toISOString().split("T")[0]}
                id="policy-end-date"
                value={policyEndDate}
                onChange={(e) => setPolicyEndDate(e.target.value)}
                required
                className="form-control"
              />
            </div>

            <button type="submit" disabled={isVerifying} className="btn btn-primary">
              {isVerifying ? 'Verifying...' : 'Verify Insurance'}
            </button>

            {verificationMessage && <p>{verificationMessage}</p>}
          </form>
        </div>
      </div>
      
      {/* Error Modal */}
      {showErrorModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Error</h3>
            <p>{errorMessage}</p>
            <div className="modal-actions">
              <button className="confirm-modal-btn" onClick={() => setShowErrorModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
        
      )}
    </div>
  );
};

export default PatientDashboard;
