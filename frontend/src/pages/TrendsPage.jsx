import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import { BsTelephone } from 'react-icons/bs';
import { IoLocationOutline } from 'react-icons/io5';

const TrendsPage = () => {
  return (
    <div className="page-container">
      <nav className="navbar">
        <div className="logo">
          <img src="/shield-icon.png" alt="HMIS Logo" />
          <span>HMIS</span>
        </div>
        <div className="nav-links">
          <Link to="/features">Features</Link>
          <Link to="/community">Community</Link>
          <Link to="/trends" className="active">Trends</Link>
          <Link to="/about">About Us</Link>
        </div>
        <button 
          className="mobile-menu-toggle"
          aria-label="Toggle mobile menu"
        >
          ☰
        </button>
      </nav>

      <header className="page-header">
        <h1>Healthcare Trends</h1>
        <p>Stay informed about the latest innovations and developments in healthcare technology</p>
      </header>

      <section className="trends-featured">
        <div className="featured-article">
          <img src="/trends/ai-healthcare.png" alt="AI in Healthcare" />
          <div className="featured-content">
            <span className="tag">Featured</span>
            <h2>The Rise of AI in Hospital Management</h2>
            <p>Artificial intelligence is revolutionizing hospital operations, from predictive analytics for patient admissions to automated diagnostic support. Learn how HMIS integrates cutting-edge AI technology to improve clinical outcomes and operational efficiency.</p>
            <Link to="/trends/ai-healthcare" className="btn">READ MORE</Link>
          </div>
        </div>
      </section>

      <section className="trends-grid">
        <div className="trend-card">
          <img src="/trends/telemedicine.png" alt="Telemedicine Expansion" />
          <div className="trend-content">
            <span className="tag">Telehealth</span>
            <h3>Telemedicine: Beyond the Pandemic</h3>
            <p>How virtual care is becoming a permanent fixture in healthcare delivery systems worldwide.</p>
            <Link to="/trends/telemedicine" className="read-more">Read More →</Link>
          </div>
        </div>

        <div className="trend-card">
          <img src="/trends/data-security.png" alt="Data Security" />
          <div className="trend-content">
            <span className="tag">Security</span>
            <h3>Advanced Data Protection in Healthcare</h3>
            <p>New approaches to securing patient data while maintaining accessibility for care providers.</p>
            <Link to="/trends/data-security" className="read-more">Read More →</Link>
          </div>
        </div>

        <div className="trend-card">
          <img src="/trends/interoperability.png" alt="Interoperability" />
          <div className="trend-content">
            <span className="tag">Integration</span>
            <h3>The Interoperability Revolution</h3>
            <p>How healthcare systems are breaking down data silos to create seamless patient experiences.</p>
            <Link to="/trends/interoperability" className="read-more">Read More →</Link>
          </div>
        </div>

        <div className="trend-card">
          <img src="/trends/precision-medicine.png" alt="Precision Medicine" />
          <div className="trend-content">
            <span className="tag">Treatment</span>
            <h3>Precision Medicine and HMIS</h3>
            <p>Leveraging patient data to deliver personalized treatment plans and improve outcomes.</p>
            <Link to="/trends/precision-medicine" className="read-more">Read More →</Link>
          </div>
        </div>

        <div className="trend-card">
          <img src="/trends/remote-monitoring.png" alt="Remote Monitoring" />
          <div className="trend-content">
            <span className="tag">Monitoring</span>
            <h3>Remote Patient Monitoring Advancements</h3>
            <p>New technologies enabling continuous care beyond hospital walls and reducing readmissions.</p>
            <Link to="/trends/remote-monitoring" className="read-more">Read More →</Link>
          </div>
        </div>

        <div className="trend-card">
          <img src="/trends/blockchain.png" alt="Blockchain" />
          <div className="trend-content">
            <span className="tag">Technology</span>
            <h3>Blockchain in Healthcare Records</h3>
            <p>Exploring the potential of blockchain technology to secure and share medical information.</p>
            <Link to="/trends/blockchain" className="read-more">Read More →</Link>
          </div>
        </div>
      </section>

      <section className="trends-subscribe">
        <div className="subscribe-content">
          <h2>Get Trends Updates</h2>
          <p>Subscribe to receive our monthly healthcare technology insights directly to your inbox.</p>
          <form className="subscribe-form">
            <input type="email" placeholder="Your email address" />
            <button type="submit" className="btn">SUBSCRIBE</button>
          </form>
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

export default TrendsPage;