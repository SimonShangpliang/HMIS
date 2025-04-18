import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import { BsTelephone } from 'react-icons/bs';
import { IoLocationOutline } from 'react-icons/io5';
import '../styles/policy.css';
import { useState, useEffect } from 'react';

const TermsPage = () => {
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

      <header className="policy-page-header">
        <h1>Terms of Service</h1>
        <p>Last Updated: April 1, 2025</p>
      </header>

      <section className="policy-page-content">
        <div className="policy-page-container-box">
          <div className="policy-page-section">
            <h2>1. Introduction</h2>
            <p>Welcome to HMIS. These Terms of Service ("Terms") govern your access to and use of the HMIS platform, website, and related services (collectively, the "Services"). By accessing or using our Services, you agree to be bound by these Terms and our Privacy Policy.</p>
            <p>Please read these Terms carefully before using our Services. If you do not agree to these Terms, you may not access or use our Services.</p>
          </div>

          <div className="policy-page-section">
            <h2>2. Definitions</h2>
            <p>In these Terms:</p>
            <ul>
              <li>"HMIS," "we," "our," or "us" refers to Hospital Management Information System, its subsidiaries, and affiliates.</li>
              <li>"You" and "your" refer to the individual or entity accessing or using our Services.</li>
              <li>"User" refers to any individual who accesses or uses our Services, including administrators, healthcare providers, staff, and patients.</li>
              <li>"Content" refers to all text, images, data, software, and other materials uploaded, downloaded, or appearing on our Services.</li>
            </ul>
          </div>

          <div className="policy-page-section">
            <h2>3. Eligibility and Account Registration</h2>
            <p>To use our Services, you must:</p>
            <ul>
              <li>Be at least 18 years of age</li>
              <li>Complete the registration process accurately</li>
              <li>Provide and maintain current, complete, and accurate information</li>
              <li>Be authorized to act on behalf of any entity you represent</li>
              <li>Comply with all local, state, national, and international laws and regulations</li>
            </ul>
            <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account or any other breach of security.</p>
          </div>

          <div className="policy-page-section">
            <h2>4. Subscription and Payment Terms</h2>
            <p>4.1. <strong>Subscription Plans</strong>: We offer various subscription plans for our Services. Details regarding features, functionality, and pricing are available on our website.</p>
            <p>4.2. <strong>Payment</strong>: You agree to pay all fees associated with your subscription plan. All payments are non-refundable unless otherwise specified or required by law.</p>
            <p>4.3. <strong>Billing Cycle</strong>: Subscription fees are billed in advance on a recurring basis, depending on your selected billing cycle (monthly, annually, or as otherwise indicated).</p>
            <p>4.4. <strong>Changes to Fees</strong>: We reserve the right to change our fees at any time. We will provide advance notice of any fee changes through our Services or via email.</p>
            <p>4.5. <strong>Taxes</strong>: You are responsible for all applicable taxes related to your use of the Services.</p>
          </div>

          <div className="policy-page-section">
            <h2>5. Acceptable Use</h2>
            <p>When using our Services, you agree not to:</p>
            <ul>
              <li>Violate any applicable laws, regulations, or third-party rights</li>
              <li>Submit inaccurate, false, or misleading information</li>
              <li>Upload or transmit viruses, malware, or other malicious code</li>
              <li>Engage in unauthorized access to our Services or systems</li>
              <li>Interfere with or disrupt the integrity or performance of our Services</li>
              <li>Attempt to gain unauthorized access to other users' accounts</li>
              <li>Use automated means to access or collect data from our Services without our prior consent</li>
              <li>Reverse engineer, decompile, or disassemble our software</li>
              <li>Remove, alter, or obscure any proprietary notices</li>
              <li>Use our Services in any manner that could harm, disable, or impair our Services</li>
            </ul>
          </div>

          <div className="policy-page-section">
            <h2>6. Patient Data and HIPAA Compliance</h2>
            <p>6.1. <strong>Business Associate Agreement</strong>: If you are a covered entity under HIPAA and use our Services to process, store, or transmit protected health information (PHI), you must enter into a Business Associate Agreement with us.</p>
            <p>6.2. <strong>HIPAA Compliance</strong>: We implement appropriate administrative, physical, and technical safeguards to protect PHI in accordance with HIPAA requirements.</p>
            <p>6.3. <strong>Your Responsibilities</strong>: You are responsible for ensuring that your use of our Services complies with all applicable healthcare laws and regulations, including obtaining necessary consents from patients for the use and disclosure of their information.</p>
          </div>

          <div className="policy-page-section">
            <h2>7. Intellectual Property Rights</h2>
            <p>7.1. <strong>Our Intellectual Property</strong>: The Services, including all content, features, functionality, and underlying technology, are owned by HMIS or our licensors and are protected by copyright, trademark, patent, and other intellectual property laws.</p>
            <p>7.2. <strong>Limited License</strong>: We grant you a limited, non-exclusive, non-transferable, revocable license to access and use our Services for their intended purpose, subject to these Terms.</p>
            <p>7.3. <strong>Your Content</strong>: You retain ownership of any content you upload or submit to our Services. By submitting content, you grant us a worldwide, royalty-free license to use, reproduce, modify, and display your content solely for the purpose of providing and improving our Services.</p>
            <p>7.4. <strong>Feedback</strong>: If you provide feedback or suggestions about our Services, we may use this information without restriction or compensation to you.</p>
          </div>

          <div className="policy-page-section">
            <h2>8. Disclaimers and Limitations of Liability</h2>
            <p>8.1. <strong>Disclaimer of Warranties</strong>: OUR SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.</p>
            <p>8.2. <strong>Healthcare Disclaimer</strong>: OUR SERVICES ARE DESIGNED TO ASSIST HEALTHCARE PROVIDERS BUT ARE NOT INTENDED TO REPLACE PROFESSIONAL MEDICAL JUDGMENT. YOU ARE SOLELY RESPONSIBLE FOR ANY MEDICAL DECISIONS MADE USING OUR SERVICES.</p>
            <p>8.3. <strong>Limitation of Liability</strong>: TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL HMIS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATING TO YOUR USE OF OR INABILITY TO USE OUR SERVICES.</p>
            <p>8.4. <strong>Cap on Liability</strong>: OUR TOTAL LIABILITY TO YOU FOR ANY AND ALL CLAIMS ARISING FROM OR RELATED TO THESE TERMS OR OUR SERVICES SHALL NOT EXCEED THE AMOUNT PAID BY YOU TO US DURING THE TWELVE (12) MONTHS PRECEDING THE EVENT GIVING RISE TO THE LIABILITY.</p>
          </div>

          <div className="policy-page-section">
            <h2>9. Indemnification</h2>
            <p>You agree to indemnify, defend, and hold harmless HMIS and our officers, directors, employees, agents, and affiliates from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to your violation of these Terms or your use of our Services.</p>
          </div>

          <div className="policy-page-section">
            <h2>10. Term and Termination</h2>
            <p>10.1. <strong>Term</strong>: These Terms will remain in effect until terminated by either you or us.</p>
            <p>10.2. <strong>Termination by You</strong>: You may terminate your account at any time by following the instructions on our Services or by contacting us.</p>
            <p>10.3. <strong>Termination by Us</strong>: We may suspend or terminate your access to our Services at any time, with or without cause, and with or without notice.</p>
            <p>10.4. <strong>Effect of Termination</strong>: Upon termination, your right to use our Services will immediately cease. All provisions of these Terms that by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, indemnity, and limitations of liability.</p>
          </div>

          <div className="policy-page-section">
            <h2>11. Governing Law and Dispute Resolution</h2>
            <p>11.1. <strong>Governing Law</strong>: These Terms shall be governed by and construed in accordance with the laws of [Jurisdiction], without regard to its conflict of law principles.</p>
            <p>11.2. <strong>Dispute Resolution</strong>: Any dispute arising from or relating to these Terms or our Services shall be resolved through binding arbitration conducted by [Arbitration Body] in accordance with their rules. The arbitration shall take place in [Location].</p>
            <p>11.3. <strong>Class Action Waiver</strong>: You agree to resolve any disputes on an individual basis and waive any right to participate in a class action lawsuit or arbitration.</p>
          </div>

          <div className="policy-page-section">
            <h2>12. Changes to Terms</h2>
            <p>We may modify these Terms at any time by posting the revised Terms on our website. Your continued use of the Services after the effective date of the revised Terms constitutes your acceptance of them.</p>
          </div>

          <div className="policy-page-section">
            <h2>13. General Provisions</h2>
            <p>13.1. <strong>Entire Agreement</strong>: These Terms constitute the entire agreement between you and HMIS regarding your use of our Services and supersede all prior agreements and understandings.</p>
            <p>13.2. <strong>Severability</strong>: If any provision of these Terms is held to be invalid or unenforceable, the remaining provisions shall remain in full force and effect.</p>
            <p>13.3. <strong>Waiver</strong>: Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.</p>
            <p>13.4. <strong>Assignment</strong>: You may not assign or transfer these Terms without our prior written consent. We may assign our rights and obligations under these Terms without restriction.</p>
          </div>

          <div className="policy-page-section">
            <h2>14. Contact Information</h2>
            <p>If you have any questions about these Terms, please contact us at:</p>
            <p>HMIS Legal Department<br />
            123 Main Street<br />
            City, Country<br />
            Email: legal@hmis.com<br />
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
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms" className="active">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TermsPage;