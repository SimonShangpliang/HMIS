import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EmployeeForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    profile_pic: '',
    role: '',
    dept_id: '',
    phone_number: '',
    emergency_phone: '',
    address: '',
    date_of_birth: '',
    date_of_joining: '',
    gender: '',
    blood_group: '',
    salary: '',
    basic_salary: '',
    allowance: '',
    deduction: '',
    aadhar_id: '',
    bank_details: {
      bank_name: '',
      account_number: '',
      ifsc_code: '',
      branch_name: ''
    }
  });

  // State for departments data
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [profilePreview, setProfilePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);

  // Fetch departments when component mounts
  useEffect(() => {
    const fetchDepartments = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/get-departments`);
        setDepartments(response.data.departments);
      } catch (err) {
        console.error('Error fetching departments:', err);
        setError('Failed to load departments. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  // Calculate total salary when basic salary, allowance, or deduction changes
  useEffect(() => {
    const basic = parseFloat(formData.basic_salary) || 0;
    const allowance = parseFloat(formData.allowance) || 0;
    const deduction = parseFloat(formData.deduction) || 0;

    const totalSalary = basic + allowance - deduction;

    if (totalSalary >= 0) {
      setFormData(prev => ({
        ...prev,
        salary: totalSalary.toString()
      }));
    }
  }, [formData.basic_salary, formData.allowance, formData.deduction]);

  const handleChange = (e) => {
    const { name, value } = e.target;

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
  };

  const handleImageUpload = (file) => {
    if (file) {
      setFormData((prev) => ({
        ...prev,
        profile_pic: file
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeStaff = async (id) => {
    try {
      const response = await axios.delete(`${import.meta.env.VITE_API_URL}/admin/delete-staff/${id}`);
      setMessage({ type: 'success', text: response.data.message || 'Staff removed successfully!' });
      setModalOpen(false);
      
    } catch (error) {
      console.error('Error removing staff:', error);
      setMessage({ type: 'error', text: 'Failed to remove staff. Please try again.' });
    } finally {
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();

    // Append simple fields
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'bank_details') {
        Object.entries(value).forEach(([bk, bv]) => {
          data.append(`bank_details[${bk}]`, bv);
        });
      } else if (key === 'profile_pic' && value instanceof File) {
        data.append(key, value);
      } else {
        data.append(key, value);
      }
    });

    setIsSubmitting(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/admin/add-staff`, data, {
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
        dept_id: '',
        phone_number: '',
        emergency_phone: '',
        address: '',
        date_of_birth: '',
        date_of_joining: '',
        gender: '',
        blood_group: '',
        salary: '',
        basic_salary: '',
        allowance: '',
        deduction: '',
        aadhar_id: '',
        bank_details: {
          bank_name: '',
          account_number: '',
          ifsc_code: '',
          branch_name: ''
        }
      });
      setProfilePreview(null);

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
  };

  const inputStyles = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500";
  const labelStyles = "block text-sm font-medium text-gray-700 mb-1";
  const selectStyles = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500";

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Remove Staff</h2>
            <p className="mb-4">Enter the ID of the staff member you want to remove:</p>
            <input
              type="text"
              id="remove_staff_id"
              name="remove_staff_id"
              placeholder="Staff ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 mb-4"
            />
            <div className="flex justify-end">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md mr-2"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const staffId = document.getElementById('remove_staff_id').value;
                  if (staffId) {
                    removeStaff(staffId);
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
          
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add Staff</h1>
      {message && (
        <div className={`mb-6 p-4 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-md bg-red-100 text-red-800">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-gray-100 rounded-md p-6">
        <div className="flex flex-col md:flex-row gap-6 mb-6">
          {/* Profile Picture section with image preview */}
          <div className="w-40">
            <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture</label>
            <div
              className="border border-dashed border-gray-300 h-48 w-40 bg-gray-50 rounded-md relative flex items-center justify-center text-center text-sm text-gray-500 cursor-pointer"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) handleImageUpload(file);
              }}
              onClick={() => document.getElementById('imageInput').click()}
            >
              {profilePreview ? (
                <div className="relative h-full w-full">
                  <img src={profilePreview} alt="Preview" className="w-full h-full object-cover rounded-md" />
                  <button
                    type="button"
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full px-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setProfilePreview(null);
                      setFormData((prev) => ({ ...prev, profile_pic: '' }));
                    }}
                  >×</button>
                </div>
              ) : (
                <label htmlFor="profile_pic" className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                  <svg className="w-8 h-8 mb-2 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                  </svg>
                  <p className="mb-1 text-sm text-gray-500 text-center"><span className="font-semibold">Drag & Drop or Click to Upload</span></p>
                </label>
              )}
              <input
                type="file"
                accept="image/*"
                id="imageInput"
                onChange={(e) => handleImageUpload(e.target.files[0])}
                className="hidden"
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
                max = {new Date().toISOString().split("T")[0]}
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
                disabled={isLoading}
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.dept_name}
                  </option>
                ))}
              </select>
              {isLoading && <p className="text-sm text-gray-500 mt-1">Loading departments...</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="date_of_joining" className={labelStyles}>Date of Joining:</label>
              <input
                type="date"
                defaultValue={new Date().toISOString().split("T")[0]}
                id="date_of_joining"
                name="date_of_joining"
                value={formData.date_of_joining}
                onChange={handleChange}
                className={inputStyles}
                required
              />
            </div>
            <div>
              <label htmlFor="address" className={labelStyles}>Address:</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500"
              ></textarea>
            </div>
          </div>

          {/* Salary Breakdown Section */}
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-lg font-medium mb-4">Salary Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="basic_salary" className={labelStyles}>Basic Salary:</label>
                <input
                  type="number"
                  id="basic_salary"
                  name="basic_salary"
                  value={formData.basic_salary}
                  onChange={handleChange}
                  className={inputStyles}
                  required
                />
              </div>
              <div>
                <label htmlFor="allowance" className={labelStyles}>Allowance:</label>
                <input
                  type="number"
                  id="allowance"
                  name="allowance"
                  value={formData.allowance}
                  onChange={handleChange}
                  className={inputStyles}
                  required
                />
              </div>
              <div>
                <label htmlFor="deduction" className={labelStyles}>Deduction:</label>
                <input
                  type="number"
                  id="deduction"
                  name="deduction"
                  value={formData.deduction}
                  onChange={handleChange}
                  className={inputStyles}
                  required
                />
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="salary" className={labelStyles}>Total Salary:</label>
              <input
                type="number"
                id="salary"
                name="salary"
                value={formData.salary}
                className={`${inputStyles} bg-gray-100`}
                readOnly
              />
              <p className="text-sm text-gray-500 mt-1">
                Automatically calculated (Basic + Allowance - Deduction)
              </p>
            </div>
          </div>

          {/* Bank Details Section */}
          <div className="pt-4 border-t border-gray-200">
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
              disabled={isSubmitting}
              className={`px-8 py-3 bg-teal-600 text-white font-medium rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 uppercase ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'SUBMITTING...' : 'SUBMIT'}
            </button>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="ml-4 px-8 py-3 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 uppercase"
            >
              Remove Staff
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EmployeeForm;