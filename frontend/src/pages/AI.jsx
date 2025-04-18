import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import { BsTelephone } from 'react-icons/bs';
import { IoLocationOutline } from 'react-icons/io5';
import '../styles/Additional.css';

const AIHealthcarePage = () => {
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

      <div className="article-container">
        <div className="article-header">
          <span className="article-tag">AI & Technology</span>
          <h1>The Rise of AI in Hospital Management</h1>
          <div className="article-meta">
            <span>Published: June 15, 2023</span>
            <span>By Dr. Sarah Williams</span>
          </div>
        </div>

    

        <div className="article-content">
          <h2>Introduction</h2>
          <p>
            Artificial Intelligence is revolutionizing the healthcare industry, transforming everything from patient care to administrative processes. In this comprehensive analysis, we explore how AI is reshaping hospital management and improving healthcare delivery.
          </p>

          <h2>Key Areas of AI Implementation</h2>
          
          <h3>1. Predictive Analytics</h3>
          <p>
            AI-powered predictive analytics are helping hospitals forecast patient admissions, optimize staffing levels, and manage inventory more effectively. By analyzing historical data and identifying patterns, these systems can predict peak periods and potential resource shortages before they occur.
          </p>

          <h3>2. Diagnostic Support</h3>
          <p>
            Machine learning algorithms are now assisting healthcare professionals in diagnosis, analyzing medical images, and identifying patterns that might be missed by the human eye. This technology is particularly valuable in radiology and pathology.
          </p>

          <h3>3. Administrative Automation</h3>
          <p>
            AI is streamlining administrative tasks, from appointment scheduling to documentation, allowing healthcare providers to focus more time on patient care. Natural Language Processing (NLP) is being used to improve medical documentation accuracy and efficiency.
          </p>

          <div className="info-box">
            <h4>Key Statistics</h4>
            <ul>
              <li>40% reduction in administrative tasks through AI automation</li>
              <li>30% improvement in diagnostic accuracy</li>
              <li>25% decrease in patient wait times</li>
              <li>50% better prediction of hospital bed demand</li>
            </ul>
          </div>

          <h2>Implementation Challenges</h2>
          <p>
            While AI offers tremendous potential, hospitals face several challenges in implementation:
          </p>
          <ul>
            <li>Data privacy and security concerns</li>
            <li>Integration with existing systems</li>
            <li>Staff training and adaptation</li>
            <li>Initial investment costs</li>
          </ul>

          <h2>Future Prospects</h2>
          <p>
            The future of AI in healthcare looks promising, with emerging technologies like:
          </p>
          <ul>
            <li>Advanced robotics for surgery</li>
            <li>Personalized treatment recommendations</li>
            <li>Real-time patient monitoring systems</li>
            <li>Automated drug discovery processes</li>
          </ul>

          <div className="article-cta">
            <h3>Want to Learn More?</h3>
            <p>Discover how HMIS is incorporating AI technology to improve healthcare delivery.</p>
            <Link to="/contact" className="btn">Contact Us</Link>
          </div>
        </div>
      </div>

      <footer className="footer">
        {/* Same footer as other pages */}
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

export default AIHealthcarePage;