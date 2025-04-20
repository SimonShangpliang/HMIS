import { useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Pencil, User, Briefcase, Phone, Mail, MapPin, Calendar, Building, Award, Save, X } from "lucide-react";
import axios from 'axios';

const ProfileDashboard = () => {
  const { role } = useParams();
  const [userData, setUserData] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);
  const [error, setError] = useState(null);
  const [isImageUploading, setIsImageUploading] = useState(false);

  // List of authorized roles
  const authorizedRoles = ["doctor", "receptionist", "nurse", "admin", "pathologist", "pharmacist"];

  // Get current user role from localStorage
  const userId = localStorage.getItem("user_id");
  const currentUserRole = localStorage.getItem("role");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/common/profile/${currentUserRole}/${userId}`);
        const data = response.data;

        // Store original dates and add display format
        setUserData({
          ...data,
          date_of_birth_display: new Date(data.date_of_birth).toLocaleDateString(),
          date_of_joining_display: new Date(data.date_of_joining).toLocaleDateString(),
        });
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleProfilePicChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const previewURL = URL.createObjectURL(file);
    setPreviewImage(previewURL);

    const formData = new FormData();
    formData.append("profile_pic", file);
    setIsImageUploading(true); // start loading
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/common/upload-photo/${userData._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const { profile_pic } = response.data;

      // Set the uploaded image from Cloudinary
      setUserData((prevData) => ({ ...prevData, profile_pic }));

    } catch (error) {
      console.error("Error uploading profile picture:", error);
    }
    finally {
      setIsImageUploading(false); // stop loading
    }
  };

  const handleEditClick = () => {
    fileInputRef.current.click();
  };

  const handleEdit = () => {
    const editableData = {
      ...userData,
      date_of_birth: userData.date_of_birth?.split('T')[0] || ''
    };
    setEditData(editableData);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditData(null);
    setIsEditing(false);
    setError(null);
  };

  const handleChange = (field, value, section = 'main') => {
    // Add date validation for date_of_birth
    if (field === 'date_of_birth') {
      const selectedDate = new Date(value);
      const today = new Date();
      if (selectedDate > today) {
        return; // Don't update if future date
      }
    }

    setEditData(prev => {
      switch (section) {
        case 'bank':
          return {
            ...prev,
            bank_details: {
              ...prev.bank_details,
              [field]: value
            }
          };
        case 'role_details':
          return {
            ...prev,
            role_details: {
              ...prev.role_details,
              [field]: value
            }
          };
        default:
          return {
            ...prev,
            [field]: value
          };
      }
    });
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/common/profile/${currentUserRole}/${userId}`,
        editData
      );

      const updatedUser = response.data.user;

      // Update userData with both original dates and display formats
      setUserData({
        ...updatedUser,
        date_of_birth_display: new Date(updatedUser.date_of_birth).toLocaleDateString(),
        date_of_joining_display: new Date(updatedUser.date_of_joining).toLocaleDateString()
      });

      setIsEditing(false);
      setEditData(null);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Error updating profile');
    }
  };

  // Structure data for display based on role
  const getPersonalInfo = (data) => [
    { key: "Employee ID", value: data._id, icon: <User size={20} /> },
    { key: "Email", value: data.email, icon: <Mail size={20} /> },
    { key: "Phone", value: data.phone_number, icon: <Phone size={20} /> },
    { key: "Address", value: data.address, icon: <MapPin size={20} /> },
    { key: "Date of Birth", value: data.date_of_birth_display, icon: <Calendar size={20} /> },
    { key: "Blood Group", value: data.bloodGrp, icon: <Award size={20} /> }
  ];

  const getEmploymentDetails = (data) => [
    {
      key: "Department",
      value: data?.dept_id?.dept_name ?
        `${data.dept_id.dept_name} (${data.dept_id.dept_id})` :
        data?.role_details?.department_id?.dept_name ?
          `${data.role_details.department_id.dept_name} (${data.role_details.department_id.dept_id})` :
          "Not Assigned",
      icon: <Building size={20} />
    },
    { key: "Join Date", value: data.date_of_joining_display, icon: <Calendar size={20} /> },
    { key: "Role", value: data.role?.charAt(0).toUpperCase() + data.role?.slice(1), icon: <Briefcase size={20} /> }
  ];

  const getRoleSpecificDetails = (data) => {
    if (!data?.role_details) return [];

    switch (data.role) {
      case 'doctor':
        return [
          {
            key: "Department",
            value: data?.role_details?.department_id?.dept_name ?
              `${data.role_details.department_id.dept_name} (${data.role_details.department_id.dept_id})` :
              "Not Assigned"
          },
          { key: "Specialization", value: data.role_details.specialization },
          { key: "Qualification", value: data.role_details.qualification },
          { key: "Experience", value: `${data.role_details.experience} years` },
          { key: "Room Number", value: data.role_details.room_num },
          {
            key: "Rating", value: data.role_details.rating ?
              `${data.role_details.rating}/5 (${data.role_details.num_ratings || 0} reviews)` :
              "No ratings yet"
          }
        ];
      case 'nurse':
        return [
          {
            key: "Assigned Department",
            value: data?.role_details?.assigned_dept?.dept_name ?
              `${data.role_details.assigned_dept.dept_name} (${data.role_details.assigned_dept.dept_id})` :
              "Not Assigned"
          },
          { key: "Location", value: data.role_details.location },
          { key: "Assigned Room", value: data.role_details.assigned_room || "Not Assigned" }
        ];
      // Add other role-specific details as needed
      default:
        return [];
    }
  };

  // Role-specific editable fields
  const getRoleEditableFields = (data) => {
    if (!data?.role_details) return [];

    switch (data.role) {
      case 'doctor':
        return [
          { key: "room_num", label: "Room Number", type: "number" },
          { key: "qualification", label: "Qualification", type: "text" },
          { key: "experience", label: "Experience (years)", type: "number" }
        ];
      case 'nurse':
        return [
          {
            key: "location", label: "Location", type: "select",
            options: ["ward", "icu", "ot", "emergency"]
          }
        ];
      // Add other roles as needed
      default:
        return [];
    }
  };

  const getEditableFields = () => {
    const commonFields = [
      { key: "name", label: "Name", type: "text" },
      { key: "phone_number", label: "Phone Number", type: "text" },
      { key: "emergency_contact", label: "Emergency Contact", type: "text" },
      { key: "address", label: "Address", type: "textarea" },
      { key: "gender", label: "Gender", type: "select", options: ["male", "female"] },
      {
        key: "bloodGrp", label: "Blood Group", type: "select",
        options: ["A+", "B+", "AB+", "O+", "A-", "B-", "AB-", "O-"]
      },
      { key: "date_of_birth", label: "Date of Birth", type: "date" }
    ];

    const bankFields = [
      { key: "bank_name", label: "Bank Name", type: "text" },
      { key: "ifsc_code", label: "IFSC Code", type: "text" },
      { key: "branch_name", label: "Branch Name", type: "text" }
    ];

    return { commonFields, bankFields };
  };

  const renderRoleFields = () => {
    if (!getRoleEditableFields(editData).length) return null;

    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Role Information</h3>
        <div className="space-y-4">
          {getRoleEditableFields(editData).map((field) => (
            <div key={field.key} className="space-y-2">
              <label className="text-sm font-medium text-gray-600">{field.label}</label>
              {field.type === 'select' ? (
                <select
                  value={editData.role_details?.[field.key] || ''}
                  onChange={(e) => handleChange(field.key, e.target.value, 'role_details')}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select {field.label}</option>
                  {field.options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  value={editData.role_details?.[field.key] || ''}
                  onChange={(e) => handleChange(field.key, e.target.value, 'role_details')}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderEditForm = () => (
    <div className="w-full space-y-6">
      {/* Personal Information Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 w-full">
        <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {getEditableFields().commonFields.map((field) => (
            <div key={field.key} className={`space-y-2 ${field.key === 'address' ? 'md:col-span-2' : ''}`}>
              <label className="text-sm font-medium text-gray-600">{field.label}</label>
              {field.type === 'select' ? (
                <select
                  value={editData[field.key] || ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select {field.label}</option>
                  {field.options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : field.type === 'date' ? (
                <input
                  type="date"
                  value={editData[field.key] || ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              ) : field.type === 'textarea' ? (
                <textarea
                  value={editData[field.key] || ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              ) : (
                <input
                  type={field.type}
                  value={editData[field.key] || ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Update the Information Grid section to use full width */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {/* Bank Details */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Bank Details</h3>
          <div className="space-y-4">
            {getEditableFields().bankFields.map((field) => (
              <div key={field.key} className="space-y-2">
                <label className="text-sm font-medium text-gray-600">{field.label}</label>
                <input
                  type="text"
                  value={editData.bank_details?.[field.key] || ''}
                  onChange={(e) => handleChange(field.key, e.target.value, 'bank')}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Role Specific Fields */}
        {renderRoleFields()}
      </div>
    </div>
  );

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : userData ? (
          <div className="space-y-8">
            {/* Profile Header */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-32 relative">
              <div className="absolute -bottom-16 left-8">
                <div className="relative group">
                  <div
                    className={`w-32 h-32 rounded-full bg-white p-1 shadow-lg transition-transform duration-300 ease-in-out ${
                      isImageUploading ? "cursor-not-allowed opacity-70" : "group-hover:scale-105"
                    }`}
                  >
                    <div
                      className={`w-full h-full rounded-full bg-gray-200 flex items-center justify-center overflow-hidden relative ${
                        isImageUploading ? "cursor-not-allowed" : "cursor-pointer"
                      }`}
                      onClick={() => {
                        if (!isImageUploading) fileInputRef.current.click();
                      }}
                    >
                      {/* Spinner */}
                      {isImageUploading && (
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                          <div className="w-6 h-6 border-2 border-t-white border-r-white border-b-transparent border-l-transparent rounded-full animate-spin" />
                        </div>
                      )}

                      {/* Profile Image or Default Icon */}
                      {previewImage || userData?.profile_pic ? (
                        <img
                          src={previewImage || userData.profile_pic}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={40} className="text-gray-400" />
                      )}

                      {/* Hover text */}
                      {!isImageUploading && (
                        <div className="absolute inset-0 bg-black bg-opacity-30 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          Click to change
                        </div>
                      )}
                    </div>

                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={handleProfilePicChange}
                    />
                  </div>
                </div>
              </div>
            </div>



              <div className="pt-16 pb-6 px-8 flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{userData.name}</h1>
                  <p className="text-gray-500">{userData.role?.charAt(0).toUpperCase() + userData.role?.slice(1)}</p>
                </div>
                {!isEditing ? (
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    <Pencil size={16} />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSubmit}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                    >
                      <Save size={16} />
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                    >
                      <X size={16} />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                {error}
              </div>
            )}

            {/* Information Grid */}
            <div className="grid gap-8">
              {isEditing ? (
                renderEditForm()
              ) : (
                <>
                  {/* Personal Information */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h2>
                    <div className="space-y-4">
                      {getPersonalInfo(userData).map((item, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className="text-gray-400">{item.icon}</div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-500">{item.key}</p>
                            <p className="text-gray-900">{item.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Employment Details */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Employment Details</h2>
                    <div className="space-y-4">
                      {getEmploymentDetails(userData).map((item, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className="text-gray-400">{item.icon}</div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-500">{item.key}</p>
                            <p className="text-gray-900">{item.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Role Specific Details */}
                  {getRoleSpecificDetails(userData).length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm p-6 md:col-span-2">
                      <h2 className="text-lg font-semibold text-gray-900 mb-6">Role Information</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {getRoleSpecificDetails(userData).map((item, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <div className="flex-1">
                              <p className="text-sm text-gray-500">{item.key}</p>
                              <p className="text-gray-900">{item.value}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center text-red-500">
            No profile data available
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileDashboard;