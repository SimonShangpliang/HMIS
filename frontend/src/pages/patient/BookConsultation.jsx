import React, { useState, useEffect } from "react";
import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../../styles/patient/BookConsultation.css";
import { Search } from "lucide-react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

function calculateExperience(dateOfJoining) {
  // Convert the dateOfJoining string to a Date object
  const joiningDate = new Date(dateOfJoining);

  // Check if the dateOfJoining string is a valid Date
  if (isNaN(joiningDate)) {
    return '00';  // Return '00' if the date string is not valid
  }

  const currentDate = new Date();

  // Calculate years of experience
  const yearsDifference = currentDate.getFullYear() - joiningDate.getFullYear();

  // Check if the doctor has had their birthday this year
  const hasHadBirthdayThisYear = (currentDate.getMonth() > joiningDate.getMonth()) ||
    (currentDate.getMonth() === joiningDate.getMonth() && currentDate.getDate() >= joiningDate.getDate());

  // Adjust years of experience if the birthday hasn't happened yet this year
  const experienceInYears = hasHadBirthdayThisYear ? yearsDifference : yearsDifference - 1;

  return experienceInYears.toString();  // Return the years of experience as a string
}


const BookConsultation = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [selectedDoctors, setSelectedDoctors] = useState([]);
  const {axiosInstance } = useAuth();

  // Fetch doctors from the API
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`${import.meta.env.VITE_API_URL}/patients/doctors`);
        setDoctors(response.data);
        setFilteredDoctors(response.data);
        // console.log(response.data); // Log the response data for debugging
        // Extract unique departments
        const uniqueDepartments = [...new Set(response.data.map(doctor =>
          doctor.department_id?.dept_name || 'Unknown Department'))];
        console.log(uniqueDepartments);
        setDepartments(uniqueDepartments);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching doctors:', err);
        setError('Failed to fetch doctors. Please try again later.');
      }
      finally{
        if (!window._authFailed) {
          setLoading(false);
        }
      }
      
    };

    fetchDoctors();
  }, []);

  // Filter doctors based on search query and location
  useEffect(() => {
    if (doctors.length > 0) {
      let filtered = [...doctors];

      // Filter by location/department if selected
      if (location) {
        filtered = filtered.filter(doctor =>
          doctor.department_id?.dept_name === location
        );
      }

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(doctor =>
          doctor.employee_id?.name?.toLowerCase().includes(query) ||
          doctor.specialization?.toLowerCase().includes(query)
        );
      }

      setFilteredDoctors(filtered);
    }
  }, [doctors, location, searchQuery]);

  const handleDoctorSelection = (doctorId) => {
    setSelectedDoctors(prev => {
      if (prev.includes(doctorId)) {
        return prev.filter(id => id !== doctorId);
      } else {
        return [...prev, doctorId];
      }
    });
  };

  // Navigate to doctor appointment page
  const handleDoctorClick = (doctorId) => {
    navigate(`/patient/doctor/${doctorId}`);
  };

  // Group doctors by specialization
  const getSpecialtyDoctors = () => {
    const specialties = {};

    doctors.forEach(doctor => {
      if (doctor.specialization) {
        if (!specialties[doctor.specialization]) {
          specialties[doctor.specialization] = [];
        }
        specialties[doctor.specialization].push(doctor);
      }
    });

    return Object.entries(specialties);
  };

  return (
    <div className="book-consultation">
      <header className="consultations-header">
        <h2>Book Consultation</h2>
        <Home className="home-icon cursor-pointer" onClick={() => navigate("/patient/profile")}/>
      </header>
      <div className="consultation-search">
        <p className="search-title">I'm looking for</p>
        <div className="search-controls">
          <select
            className="location-dropdown"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map((dept, index) => (
              <option key={index} value={dept}>
                {dept}
              </option>
            ))}
          </select>
          <div className="search-box">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Enter Doctor's Name / Specialty / Condition"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <hr />

      <div className="doctor-list">
        {loading ? (
          <p>Loading doctors...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : filteredDoctors.length > 0 ? (
          filteredDoctors.map((doctor) => (
            <div key={doctor._id} className="doctor-item-container">
              <label className="doctor-item">
                <div
                  className="doctor-info"
                  onClick={() => handleDoctorClick(doctor._id)}
                >
                  <span className="doctor-name">
                    {doctor.employee_id?.name || 'Unknown Doctor'}
                  </span>
                  <span className="doctor-specialty">
                  {
                    doctor.specialization || doctor.department_id?.dept_name || 'Unknown Department' ? (
                      <>
                        {doctor.specialization && doctor.specialization + ' '} 
                        {doctor.specialization && doctor.department_id?.dept_name && '| '}
                        {doctor.department_id?.dept_name || 'Unknown Department'}
                      </>
                    ) : null
                  }
                  </span>
                  <span className="doctor-qualification">
                  {
                    doctor.qualification ? (
                      <>
                        {doctor.qualification} • {doctor.experience || calculateExperience(doctor.employee_id.date_of_joining)}
                      </>
                    ) : (
                      doctor.experience || calculateExperience(doctor.employee_id.date_of_joining) // Only show the experience if no qualification
                    )
                  } years experience
                  </span>
                  <div className="doctor-rating">
                    Rating: {doctor.rating.toFixed(1)}/5 ({doctor.num_ratings} ratings)
                  </div>
                </div>
              </label>
              <button
                className="book-now-button"
                onClick={() => handleDoctorClick(doctor._id)}
              >
                Book Now
              </button>
            </div>
          ))
        ) : (
          <p>No doctors match your search criteria.</p>
        )}
      </div>

      <div className="specialty-section">
        <p className="section-title">Doctors with specialty in</p>
        <div className="specialties">
          {getSpecialtyDoctors().map(([specialty, doctors], index) => (
            <div key={index} className="specialty-card" onClick={() => setSearchQuery(specialty)}>
              <Search className="icon" />
              <div className="specialty-info">
                <span className="specialty-name">{specialty}</span>
                <span className="specialty-count">{doctors.length} doctor(s)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BookConsultation;