import { Link } from 'react-router-dom';
import '../styles/RegistrationPage.css';

const Register = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Add registration logic here
  };

  return (
    <div className="registration-container">
      <div className="registration-header">
        <Link to="/" className="back-button">
          <img src="/back-arrow.png" alt="Back" />
        </Link>
        <h1>New Registration</h1>
        <Link to="/" className="home-button">
          <img src="/home-icon.png" alt="Home" />
        </Link>
      </div>
      
      <form className="registration-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="patientName">Patient Name:</label>
            <input
              type="text"
              id="patientName"
              className="form-control"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="aadharId">Aadhar ID:</label>
            <input
              type="text"
              id="aadharId"
              className="form-control"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="patientDOB">Patient DOB:</label>
            <input
              type="date"
              id="patientDOB"
              className="form-control"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="patientGender">Patient Gender:</label>
            <select id="patientGender" className="form-control" required>
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="bloodGroup">Blood Group:</label>
            <select id="bloodGroup" className="form-control" required>
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
          <div className="form-group">
            <label htmlFor="emailAddress">Email Address:</label>
            <input
              type="email"
              id="emailAddress"
              className="form-control"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="mobile">Mobile:</label>
            <input
              type="tel"
              id="mobile"
              className="form-control"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="emergencyContact">Emergency Contact:</label>
            <input
              type="tel"
              id="emergencyContact"
              className="form-control"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="password">Enter Password:</label>
            <input
              type="password"
              id="password"
              className="form-control"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <input
              type="password"
              id="confirmPassword"
              className="form-control"
              required
            />
          </div>
        </div>

        <div className="form-submit">
          <button type="submit" className="btn-submit">SUBMIT</button>
        </div>
      </form>
    </div>
  );
};

export default Register;

