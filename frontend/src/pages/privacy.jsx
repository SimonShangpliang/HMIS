import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import { BsTelephone } from 'react-icons/bs';
import { IoLocationOutline } from 'react-icons/io5';
import '../styles/policy.css';
import { useState, useEffect } from 'react';

const PrivacyPolicyPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
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

      <header className="policy-page-header">
        <h1>Privacy Policy</h1>
        <p>Last Updated: April 1, 2025</p>
      </header>

      <section className="policy-page-content">
        <div className="policy-page-container-box">
          <div className="policy-page-section">
            <h2>1. Introduction</h2>
            <p>At HMIS ("we," "our," or "us"), we are committed to protecting your privacy and the security of your personal and health information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Hospital Management Information System, website, and related services (collectively, the "Services").</p>
            <p>We adhere to all applicable data protection laws, including HIPAA (Health Insurance Portability and Accountability Act) in the United States and GDPR (General Data Protection Regulation) in the European Union, and other regional privacy laws as applicable.</p>
          </div>

          <div className="policy-page-section">
            <h2>2. Information We Collect</h2>
            
            <h3>2.1. Information You Provide to Us</h3>
            <p>We may collect the following types of information that you voluntarily provide to us:</p>
            <ul>
              <li><strong>Account Information:</strong> When you register for an account, we collect your name, email address, professional credentials, employment information, and password.</li>
              <li><strong>Profile Information:</strong> Information you add to your profile, such as your photo, professional background, and contact details.</li>
              <li><strong>Patient Data:</strong> As a healthcare provider using our system, you may input patient health information, including medical histories, treatment plans, medications, test results, and demographic information.</li>
              <li><strong>Communication Data:</strong> Information you provide when contacting us for support, participating in surveys, or subscribing to our newsletters.</li>
              <li><strong>Payment Information:</strong> If you subscribe to our paid services, we collect billing information and payment details (processed through secure third-party payment processors).</li>
            </ul>

            <h3>2.2. Information We Collect Automatically</h3>
            <p>When you use our Services, we automatically collect certain information, including:</p>
            <ul>
              <li><strong>Usage Data:</strong> How you interact with our Services, features you use, and time spent on the platform.</li>
              <li><strong>Device Information:</strong> Information about your device, including IP address, browser type, operating system, and device identifiers.</li>
              <li><strong>Log Data:</strong> Server logs, error reports, and activity information.</li>
              <li><strong>Cookies and Similar Technologies:</strong> We use cookies and similar tracking technologies to collect information about your browsing activities.</li>
            </ul>
          </div>

          <div className="policy-page-section">
            <h2>3. How We Use Your Information</h2>
            <p>We use the information we collect for the following purposes:</p>
            <ul>
              <li>To provide, maintain, and improve our Services</li>
              <li>To process and complete transactions</li>
              <li>To respond to your comments, questions, and requests</li>
              <li>To send administrative information, such as updates, security alerts, and support messages</li>
              <li>To comply with legal obligations and enforce our terms</li>
              <li>To monitor and analyze trends, usage, and activities in connection with our Services</li>
              <li>To detect, prevent, and address technical issues and fraudulent activities</li>
              <li>To personalize your experience and provide content and features relevant to your needs</li>
              <li>To facilitate patient care and healthcare operations (for healthcare providers)</li>
            </ul>
          </div>

          <div className="policy-page-section">
            <h2>4. How We Share Your Information</h2>
            <p>We may share your information in the following circumstances:</p>
            <ul>
              <li><strong>With Your Consent:</strong> We share information when you direct us to do so.</li>
              <li><strong>Service Providers:</strong> We share information with third-party vendors who perform services on our behalf, such as data hosting, analytics, customer service, and payment processing.</li>
              <li><strong>Healthcare Partners:</strong> With your permission, we may share information with other healthcare providers, insurance companies, or health systems for treatment, payment, or healthcare operations.</li>
              <li><strong>Compliance and Protection:</strong> We may share information to comply with applicable laws, regulations, or legal processes, and to protect the rights, property, and safety of our users, ourselves, or others.</li>
              <li><strong>Business Transfers:</strong> If we are involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.</li>
            </ul>
            <p>We do not sell your personal information to third parties for their marketing purposes.</p>
          </div>

          <div className="policy-page-section">
            <h2>5. Data Security</h2>
            <p>We implement appropriate technical and organizational measures to protect your information from unauthorized access, disclosure, alteration, and destruction. Our security practices include:</p>
            <ul>
              <li>Encryption of sensitive data in transit and at rest</li>
              <li>Regular security assessments and penetration testing</li>
              <li>Access controls and authentication requirements</li>
              <li>Employee training on data security and privacy</li>
              <li>Physical and environmental safeguards for our servers</li>
            </ul>
            <p>While we strive to protect your information, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security.</p>
          </div>

          <div className="policy-page-section">
            <h2>6. Your Rights and Choices</h2>
            <p>Depending on your location, you may have certain rights regarding your personal information:</p>
            <ul>
              <li><strong>Access and Portability:</strong> You can request a copy of your personal information.</li>
              <li><strong>Correction:</strong> You can request correction of inaccurate or incomplete information.</li>
              <li><strong>Deletion:</strong> You can request deletion of your personal information in certain circumstances.</li>
              <li><strong>Restriction and Objection:</strong> You can request restriction of processing or object to processing in certain cases.</li>
              <li><strong>Withdrawal of Consent:</strong> You can withdraw consent previously provided for specific processing activities.</li>
            </ul>
            <p>To exercise these rights, please contact us at privacy@hmis.com. We will respond to your request within the timeframe required by applicable law.</p>
          </div>

          <div className="policy-page-section">
            <h2>7. Data Retention</h2>
            <p>We retain your information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. For patient health information, we follow applicable medical record retention laws and regulations.</p>
          </div>

          <div className="policy-page-section">
            <h2>8. International Data Transfers</h2>
            <p>We may transfer, store, and process your information in countries other than your own. When we transfer information across borders, we implement appropriate safeguards to protect your information in compliance with applicable laws.</p>
          </div>

          <div className="policy-page-section">
            <h2>9. Children's Privacy</h2>
            <p>Our Services are not directed to children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.</p>
          </div>

          <div className="policy-page-section">
            <h2>10. Changes to This Privacy Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page and updating the "Last Updated" date. We encourage you to review this Privacy Policy periodically.</p>
          </div>

          <div className="policy-page-section">
            <h2>11. Contact Us</h2>
            <p>If you have any questions or concerns about this Privacy Policy or our privacy practices, please contact us at:</p>
            <p>HMIS Privacy Office<br />
            123 Main Street<br />
            City, Country<br />
            Email: privacy@hmis.com<br />
            Phone: +1 (555) 123-4567</p>
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
            <Link to="/privacy" className="active">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicyPage;