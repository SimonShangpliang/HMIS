import React, { useState } from 'react';
import axios from 'axios';

const EmployeeForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    profile_pic: '',
    role: '',
    dept_id: '67f565394f3afafa19aa8f23',
    phone_number: '',
    emergency_phone: '',
    address: '',
    date_of_birth: '',
    date_of_joining: '',
    gender: '',
    blood_group: '',
    salary: '',
    aadhar_id: '',
    bank_details: {
      bank_name: '',
      account_number: '',
      ifsc_code: '',
      branch_name: ''
    }
  });

  const [profilePreview, setProfilePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(name, value);
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    console.log(formData);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        profile_pic: file
      }));
      console.log(formData);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  
  const handleSubmit = async(e) => {
    e.preventDefault();
    const data= new FormData();
  // Append simple fields
  Object.entries(formData).forEach(([key, value]) => {
    if (key === 'bank_details') {
      Object.entries(value).forEach(([bk, bv]) => {
        data.append(`bank_details[${bk}]`, bv); // Send as nested keys or convert to JSON
      });
    } else if (key === 'profile_pic' && value instanceof File) {
      data.append(key, value);
    } else {
      data.append(key, value);
    }
  });   
  setIsSubmitting(true); 
  try {
    const response = await axios.post('http://localhost:5000/api/admin/add-staff', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  
    const data1 = response.data;
  
    setMessage({ type: 'success', text: data1.message || 'Staff registered successfully!' });
  
    // Reset form
    setFormData({
      name: '',
      email: '',
      profile_pic: '',
      role: '',
      dept_id: '67f565394f3afafa19aa8f23',
      phone_number: '',
      emergency_phone: '',
      address: '',
      date_of_birth: '',
      date_of_joining: '',
      gender: '',
      blood_group: '',
      salary: '',
      aadhar_id: '',
      bank_details: {
        bank_name: '',
        account_number: '',
        ifsc_code: '',
        branch_name: ''
      }
    });
    setProfilePreview(null);
  
    // Optionally navigate
    // navigate("/receptionist/profile");
  
  } catch (error) {
    console.error('Registration error:', error);
  
    if (error.response && error.response.data && error.response.data.message) {
      setMessage({ type: 'error', text: error.response.data.message });
    } else {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    }
  
  } finally {
    setIsSubmitting(false);
    setTimeout(() => setMessage(null), 5000);
  }
  

    // Here you would send the data to your API
  };

  const inputStyles = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500";
  const labelStyles = "block text-sm font-medium text-gray-700 mb-1";
  const selectStyles = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500";

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add Staff</h1>
      {message && (
        <div className={`mb-6 p-4 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-gray-100 rounded-md p-6">
        <div className="flex flex-col md:flex-row gap-6 mb-6">
          {/* Profile Picture section with image preview */}
          <div className="w-full md:w-1/5">
            <label htmlFor="profile_pic" className={labelStyles}>Profile Picture:</label>
            <div className="h-48 w-40 border-2 border-teal-300 border-dashed rounded-lg bg-gray-50 hover:bg-gray-100 overflow-hidden">
              {profilePreview ? (
                <div className="relative h-full w-full">
                  <img 
                    src={profilePreview} 
                    alt="Profile preview" 
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setProfilePreview(null); // Reset the preview image
                      setFormData((prev) => ({
                        ...prev,
                        profile_pic: '' // Clear the file from formData
                      }));
                    }}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs"
                    title="Remove image"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label htmlFor="profile_pic" className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                  <svg className="w-8 h-8 mb-2 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                  </svg>
                  <p className="mb-1 text-sm text-gray-500 text-center"><span className="font-semibold">Upload</span></p>
                  <p className="text-xs text-gray-500">Passport size</p>
                </label>
              )}
              <input 
                type="file" 
                id="profile_pic" 
                name="profile_pic" 
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>
          </div>
          
          <div className="w-full md:w-4/5">
            <div className="mt-8">
              <label htmlFor="name" className={labelStyles}>Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={inputStyles}
                required
              />
            </div>
            
            <div className="mt-6">
              <label htmlFor="aadhar_id" className={labelStyles}>Aadhar ID:</label>
              <input
                type="text"
                id="aadhar_id"
                name="aadhar_id"
                value={formData.aadhar_id}
                onChange={handleChange}
                className={inputStyles}
              />
            </div>



          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="dob" className={labelStyles}>DOB:</label>
              <input
                type="date"
                id="dob"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                className={inputStyles}
                required
              />
            </div>
            <div>
              <label htmlFor="gender" className={labelStyles}>Gender:</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={selectStyles}
                required
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="blood_group" className={labelStyles}>Blood Group:</label>
              <select
                id="blood_group"
                name="blood_group"
                value={formData.blood_group}
                onChange={handleChange}
                className={selectStyles}
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
            <div>
              <label htmlFor="email" className={labelStyles}>Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={inputStyles}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="phone_number" className={labelStyles}>Mobile:</label>
              <input
                type="tel"
                id="phone_number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                className={inputStyles}
                required
              />
            </div>
            <div>
              <label htmlFor="emergency_phone" className={labelStyles}>Emergency Mobile:</label>
              <input
                type="tel"
                id="emergency_phone"
                name="emergency_phone"
                value={formData.emergency_phone}
                onChange={handleChange}
                className={inputStyles}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="role" className={labelStyles}>Role:</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={selectStyles}
                required
              >
                <option value="">Select Role</option>
                <option value="doctor">Doctor</option>
                <option value="nurse">Nurse</option>
                <option value="pharmacist">Pharmacist</option>
                <option value="receptionist">Receptionist</option>
                <option value="admin">Admin</option>
                <option value="pathologist">Pathologist</option>
                <option value="driver">Driver</option>
              </select>
            </div>
            <div>
              <label htmlFor="department" className={labelStyles}>Department:</label>
              <select
                id="department"
                name="dept_id"
                value={formData.dept_id}
                onChange={handleChange}
                className={selectStyles}
                required
              >
                <option value="">Select Department</option>
                <option value="67f565394f3afafa19aa8f23">Cardiology</option>
                <option value="67f565394f3afafa19aa8f23">Neurology</option>  
                {/* Department options would be populated from API */}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="date_of_joining" className={labelStyles}>Date of Joining:</label>
              <input
                type="date"
                id="date_of_joining"
                name="date_of_joining"
                value={formData.date_of_joining}
                onChange={handleChange}
                className={inputStyles}
                required
              />
            </div>
            <div>
              <label htmlFor="salary" className={labelStyles}>Salary:</label>
              <input
                type="number"
                id="salary"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                className={inputStyles}
                required
              />
            </div>
          </div>

<div>
  <label htmlFor="address" className={labelStyles}>Address:</label>
  <textarea
    id="address"
    name="address"
    value={formData.address}
    onChange={handleChange}
    rows="2"
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500"
  ></textarea>
</div>


          
          {/* Bank Details Section */}
          <div className="pt-4">
            <h3 className="text-lg font-medium mb-4">Bank Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="bank_name" className={labelStyles}>Bank Name:</label>
                <input
                  type="text"
                  id="bank_name"
                  name="bank_details.bank_name"
                  value={formData.bank_details.bank_name}
                  onChange={handleChange}
                  className={inputStyles}
                />
              </div>
              <div>
                <label htmlFor="account_number" className={labelStyles}>Account Number:</label>
                <input
                  type="number"
                  id="account_number"
                  name="bank_details.account_number"
                  value={formData.bank_details.account_number}
                  onChange={handleChange}
                  className={inputStyles}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label htmlFor="ifsc_code" className={labelStyles}>IFSC Code:</label>
                <input
                  type="text"
                  id="ifsc_code"
                  name="bank_details.ifsc_code"
                  value={formData.bank_details.ifsc_code}
                  onChange={handleChange}
                  className={inputStyles}
                />
              </div>
              <div>
                <label htmlFor="branch_name" className={labelStyles}>Branch Name:</label>
                <input
                  type="text"
                  id="branch_name"
                  name="bank_details.branch_name"
                  value={formData.bank_details.branch_name}
                  onChange={handleChange}
                  className={inputStyles}
                />
              </div>
            </div>
          </div>

          <div className="pt-6 flex justify-center">
            <button
              type="submit"
              className="px-8 py-3 bg-teal-600 text-white font-medium rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 uppercase"
            >
              SUBMIT
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EmployeeForm;