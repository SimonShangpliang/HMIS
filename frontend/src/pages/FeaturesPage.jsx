import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import { BsTelephone } from 'react-icons/bs';
import { IoLocationOutline } from 'react-icons/io5';
import '../styles/Additional.css';
import { useState, useEffect } from 'react';

const FeaturesPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <div className="page-container">
      <nav className="navbar">
        <div className="logo">
        <Link to="/">
          <img src="/shield-icon.png" alt="HMIS Logo" />
          </Link>
          <span>HMIS</span>
          </div>
        <div className={`nav-links ${mobileMenuOpen ? 'show' : ''}`}>
        <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <Link to="/features" onClick={() => setMobileMenuOpen(false)}>Features</Link>
          <Link to="/community" onClick={() => setMobileMenuOpen(false)}>Community</Link>
          <Link to="/trends" onClick={() => setMobileMenuOpen(false)}>Trends</Link>
          <Link to="/about" onClick={() => setMobileMenuOpen(false)}>About Us</Link>
        </div>
        <button 
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          ☰
        </button>
      </nav>

      <header className="page-header">
        <h1>Our Features</h1>
        <p>Discover how our comprehensive hospital management system enhances healthcare delivery</p>
      </header>

      <section className="features-content">
        <div className="feature-card">
          <div className="feature-icon">
            <img src="/icons/patient-management.png" alt="Patient Management" />
          </div>
          <h3>Patient Management</h3>
          <p>Streamline patient registration, scheduling, and health records with our intuitive interface. Access patient history, medications, allergies, and test results in one secure location.</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <img src="/icons/billing.png" alt="Billing & Insurance" />
          </div>
          <h3>Billing & Insurance</h3>
          <p>Simplify your financial operations with integrated billing, insurance claims processing, and payment tracking. Generate detailed financial reports and manage reimbursements efficiently.</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <img src="/icons/pharmacy.png" alt="Pharmacy Integration" />
          </div>
          <h3>Pharmacy Integration</h3>
          <p>Manage medication dispensing, inventory, and prescription tracking seamlessly. Our system prevents medication errors with built-in alerts for drug interactions and allergies.</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <img src="/icons/laboratory.png" alt="Laboratory Management" />
          </div>
          <h3>Laboratory Management</h3>
          <p>Coordinate lab tests, track specimens, and deliver results efficiently. Generate comprehensive reports and integrate with patient records for complete clinical visibility.</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <img src="/icons/appointment.png" alt="Appointment Scheduling" />
          </div>
          <h3>Appointment Scheduling</h3>
          <p>Optimize clinical workflows with intelligent scheduling that reduces wait times and maximizes provider productivity. Enable patients to book appointments online and receive automatic reminders.</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <img src="/icons/analytics.png" alt="Analytics & Reporting" />
          </div>
          <h3>Analytics & Reporting</h3>
          <p>Leverage powerful data insights to improve clinical outcomes and operational efficiency. Generate customizable reports for quality metrics, financial performance, and regulatory compliance.</p>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to transform your hospital management?</h2>
          <p>Join thousands of healthcare providers who trust HMIS to streamline their operations.</p>
          <div className="cta-buttons">
            <Link to="/register" className="btn">GET STARTED</Link>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <div className="quick-links">
            <h3>QUICK LINKS</h3>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/features">Features</Link></li>
              <li><Link to="/community">Community</Link></li>
              <li><Link to="/trends">Trends</Link></li>
            </ul>
          </div>
          <div className="footer-logo">
            <img src="/shield-icon.png" alt="HMIS Logo" />
            <span>HMIS</span>
          </div>
          <div className="contact-info">
            <h3>GET IN TOUCH</h3>
            <p className="contact-item">
              <MdEmail className="contact-icon" />
              contact@hmis.com
            </p>
            <p className="contact-item">
              <BsTelephone className="contact-icon" />
              Call +1 (555) 123-4567
            </p>
            <p className="contact-item">
              <IoLocationOutline className="contact-icon" />
              123 Main Street, City, Country
            </p>
            <div className="social-icons">
              <a href="https://facebook.com/hmis" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <FaFacebookF />
              </a>
              <a href="https://instagram.com/hmis" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <FaInstagram />
              </a>
              <a href="https://twitter.com/hmis" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <FaTwitter />
              </a>
              <a href="https://youtube.com/hmis" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <FaYoutube />
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()}. HMIS. All rights reserved.</p>
          <div className="footer-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FeaturesPage;