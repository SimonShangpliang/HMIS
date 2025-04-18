import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import { BsTelephone } from 'react-icons/bs';
import { IoLocationOutline } from 'react-icons/io5';
import '../styles/Additional.css';
import { useState, useEffect } from 'react';

const CommunityPage = () => {
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
        <h1>Community</h1>
        <p>Connect with healthcare professionals using HMIS worldwide</p>
      </header>

      <section className="community-highlights">
        <div className="highlight-card">
          <img src="/community/forum.png" alt="User Forums" />
          <h3>User Forums</h3>
          <p>Join discussions with healthcare professionals around the globe. Share experiences, ask questions, and find solutions together.</p>
          <Link to="/community/forums" className="btn">JOIN THE CONVERSATION</Link>
        </div>

        <div className="highlight-card">
          <img src="/community/events.png" alt="Events & Webinars" />
          <h3>Events & Webinars</h3>
          <p>Attend virtual and in-person events to deepen your HMIS expertise. Learn from industry experts and connect with peers.</p>
          <Link to="/community/events" className="btn">BROWSE EVENTS</Link>
        </div>

        <div className="highlight-card">
          <img src="/community/resources.png" alt="Resources" />
          <h3>Resources</h3>
          <p>Access tutorials, guides, whitepapers, and case studies. Find resources to help you maximize your HMIS implementation.</p>
          <Link to="/community/resources" className="btn">EXPLORE RESOURCES</Link>
        </div>
      </section>

      <section className="testimonials">
        <h2>What Our Community Says</h2>
        <div className="testimonial-grid">
          <div className="testimonial-card">
            <div className="quote">"HMIS has transformed the way our hospital operates. The community support has been invaluable in optimizing our workflows."</div>
            <div className="author">
              <img src="/testimonials/user1.png" alt="Dr. PK Das" />
              <div>
                <h4>Dr. PK Das</h4>
                <p>Chief Medical Officer, City General Hospital</p>
              </div>
            </div>
          </div>

          <div className="testimonial-card">
            <div className="quote">"The HMIS community forums helped us solve implementation challenges quickly. The knowledge sharing is phenomenal."</div>
            <div className="author">
              <img src="/testimonials/user2.jpg" alt="Mark Chen" />
              <div>
                <h4>Mark Chen</h4>
                <p>IT Director, Regional Medical Center</p>
              </div>
            </div>
          </div>

          <div className="testimonial-card">
            <div className="quote">"Being part of the HMIS community connects us with dedicated professionals equally committed to delivering better patient care."</div>
            <div className="author">
              <img src="/testimonials/user3.webp" alt="Dr. Elena Rodriguez" />
              <div>
                <h4>Dr. Elena Rodriguez</h4>
                <p>Head of Pediatrics, Children's Hospital</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="community-newsletter">
        <div className="newsletter-content">
          <h2>Stay Connected</h2>
          <p>Subscribe to our newsletter for community updates, events, and best practices.</p>
          <form className="newsletter-form">
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
              hmis.iitg@gmail.com
            </p>
            <p className="contact-item">
              <BsTelephone className="contact-icon" />
              Call +91 985734581
            </p>
            <p className="contact-item">
              <IoLocationOutline className="contact-icon" />
              IIT Guwahati, Assam, India
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

export default CommunityPage;