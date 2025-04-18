import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import { BsTelephone } from 'react-icons/bs';
import { IoLocationOutline } from 'react-icons/io5';
import '../styles/AboutPage.css';
import { useState, useEffect } from 'react';


const AboutPage = () => {
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
        <h1>About Us</h1>
        <p>Pioneering healthcare management solutions for a better tomorrow</p>
      </header>

      <section className="about-mission">
        <div className="mission-content">
          <div className="mission-text">
            <h2>Our Mission</h2>
            <p>At HMIS, our mission is to revolutionize healthcare management by providing intuitive, secure, and comprehensive solutions that empower healthcare providers to deliver exceptional patient care. We strive to reduce administrative burdens, enhance operational efficiency, and improve clinical outcomes through innovative technology.</p>
          </div>
          <div className="mission-image">
            <img src="/about/mission.png" alt="HMIS Mission" />
          </div>
        </div>
      </section>

      <section className="about-story">
        <div className="story-content">
          <div className="story-image">
            <img src="/about/story.png" alt="Our Story" />
          </div>
          <div className="story-text">
            <h2>Our Story</h2>
            <p>HMIS was founded in 2012 by a team of healthcare professionals and technology experts who recognized the need for a more efficient, integrated approach to hospital management. What began as a solution for a single local hospital has grown into a comprehensive platform serving healthcare institutions worldwide.</p>
            <p>Over the years, we've collaborated closely with medical professionals, administrators, and patients to continuously refine our system, ensuring it addresses real-world challenges in healthcare delivery. Today, HMIS is trusted by thousands of healthcare providers across 40+ countries.</p>
          </div>
        </div>
      </section>

      <section className="about-values">
        <h2>Our Core Values</h2>
        <div className="values-grid">
          <div className="value-card">
            <div className="value-icon">
              <img src="/about/innovation.png" alt="Innovation" />
            </div>
            <h3>Innovation</h3>
            <p>We constantly push boundaries to develop forward-thinking solutions that address emerging healthcare challenges.</p>
          </div>

          <div className="value-card">
            <div className="value-icon">
              <img src="/about/integrity.png" alt="Integrity" />
            </div>
            <h3>Integrity</h3>
            <p>We operate with transparency, honesty, and the highest ethical standards in all our interactions.</p>
          </div>

          <div className="value-card">
            <div className="value-icon">
              <img src="/about/security.png" alt="Security" />
            </div>
            <h3>Security</h3>
            <p>We prioritize the protection of sensitive healthcare data through rigorous security measures and compliance.</p>
          </div>

          <div className="value-card">
            <div className="value-icon">
              <img src="/about/accessibility.png" alt="Accessibility" />
            </div>
            <h3>Accessibility</h3>
            <p>We design inclusive solutions that serve healthcare providers of all sizes and technical capabilities.</p>
          </div>
        </div>
      </section>

      <section className="about-team">
        <h2>Our Leadership Team</h2>
        <div className="team-grid">
          <div className="team-member">
            <img src="/team/ceo.png" alt="Dr. PK Das" />
            <h3>Dr. PK Das</h3>
            <p className="title">Chief Executive Officer</p>
            <p className="bio">Former hospital administrator with 20+ years of healthcare experience and a vision for technology-enabled care.</p>
          </div>

          <div className="team-member">
            <img src="/team/cto.jpeg" alt="Sarah Williams" />
            <h3>Sarah Williams</h3>
            <p className="title">Chief Technology Officer</p>
            <p className="bio">Healthcare IT pioneer with expertise in secure systems architecture and interoperability solutions.</p>
          </div>

          <div className="team-member">
            <img src="/team/cmo.jpeg" alt="Dr. James Peterson" />
            <h3>Dr. James Peterson</h3>
            <p className="title">Chief Medical Officer</p>
            <p className="bio">Practicing physician focused on ensuring HMIS meets real clinical needs and improves patient outcomes.</p>
          </div>

          <div className="team-member">
            <img src="/team/cpo.jpeg" alt="Rachel Garcia" />
            <h3>Rachel Garcia</h3>
            <p className="title">Chief Product Officer</p>
            <p className="bio">User experience expert dedicated to creating intuitive healthcare interfaces that reduce cognitive burden.</p>
          </div>
        </div>
      </section>

      <section className="about-achievements">
        <div className="achievements-content">
          <h2>Our Achievements</h2>
          <div className="achievement-stats">
            <div className="stat">
              <span className="number">2,500+</span>
              <span className="label">Healthcare Facilities</span>
            </div>
            <div className="stat">
              <span className="number">40+</span>
              <span className="label">Countries</span>
            </div>
            <div className="stat">
              <span className="number">15M+</span>
              <span className="label">Patients Managed</span>
            </div>
            <div className="stat">
              <span className="number">99.9%</span>
              <span className="label">Uptime</span>
            </div>
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

export default AboutPage;