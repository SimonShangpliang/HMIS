import React, { useState } from 'react';

const AddStaff = () => {
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    bloodGroup: '',
    mobile: '',
    aadharId: '',
    gender: '',
    email: '',
    emergencyMobile: '',
    additionalInfo: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Staff data submitted:', formData);
    // Here you would typically send the data to your backend API
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Add Staff</h2>
      
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit}>
          <div className="bg-gray-200 p-6 rounded-md">
            {/* Name and Aadhar ID */}
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1">
                <label htmlFor="name" className="block mb-1 font-medium">Name:</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="aadharId" className="block mb-1 font-medium">Aadhar ID:</label>
                <input
                  type="text"
                  id="aadharId"
                  name="aadharId"
                  value={formData.aadharId}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* DOB and Gender */}
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1">
                <label htmlFor="dob" className="block mb-1 font-medium">DOB:</label>
                <input
                  type="date"
                  id="dob"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="gender" className="block mb-1 font-medium">Gender:</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Blood Group and Email */}
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1">
                <label htmlFor="bloodGroup" className="block mb-1 font-medium">Blood Group:</label>
                <select
                  id="bloodGroup"
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <div className="flex-1">
                <label htmlFor="email" className="block mb-1 font-medium">Email:</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Mobile and Emergency Mobile */}
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1">
                <label htmlFor="mobile" className="block mb-1 font-medium">Mobile:</label>
                <input
                  type="tel"
                  id="mobile"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="emergencyMobile" className="block mb-1 font-medium">Emergency Mobile:</label>
                <input
                  type="tel"
                  id="emergencyMobile"
                  name="emergencyMobile"
                  value={formData.emergencyMobile}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Additional Information */}
            <div className="mb-6">
              <p className="text-xs text-center font-medium mb-2">
                ADDITIONAL INFORMATION THAT ARE REQUIRED TO BE STORED
                ACCORDING TO THE STAFF DB DEFINITIONS
              </p>
              <textarea
                id="additionalInfo"
                name="additionalInfo"
                value={formData.additionalInfo}
                onChange={handleChange}
                rows="4"
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                className="bg-teal-700 hover:bg-teal-800 text-white py-2 px-8 rounded uppercase tracking-wider font-medium"
              >
                SUBMIT
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStaff;
