
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/HomePage.css';
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import { BsTelephone } from 'react-icons/bs';
import { IoLocationOutline } from 'react-icons/io5';

const Home = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const slides = [
    {
      title: "Secure. Efficient. Intelligent.",
      subtitle: "The future of hospital management"
    },
    {
      title: "Advanced. Reliable. Caring.",
      subtitle: "Healthcare at your fingertips"
    },
    {
      title: "Modern. Connected. Safe.",
      subtitle: "Leading the digital healthcare revolution"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => {
        // Set previous slide class before changing active
        const prevSlideElement = document.querySelector(`.slide.active`);
        if (prevSlideElement) {
          prevSlideElement.classList.add('previous');
          setTimeout(() => {
            prevSlideElement.classList.remove('previous');
          }, 500); // Match transition duration
        }
        
        return (prev + 1) % slides.length;
      });
    }, 5000);
  
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="home-container">
      <nav className="navbar">
        <div className="logo">
        <Link to="/">
          <img src="/shield-icon.png" alt="HMIS Logo" />  </Link>
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

      <header className="hero">
        <div className="hero-content">
          <div className="hero-slider">
            {slides.map((slide, index) => (
              <div
                key={`slide-${index}`}
                className={`slide ${index === activeSlide ? 'active' : ''}`}
              >
                <h1>{slide.title}</h1>
                <p>{slide.subtitle}</p>
              </div>
            ))}
          </div>
          <div className="hero-buttons">
            <Link to="/login" className="btn">LOGIN</Link>
            <Link to="/register" className="btn">SIGN UP</Link>
            <Link to="/public-data" className="btn">PUBLIC DATA</Link>
          </div>
          <div className="hero-dots">
            {slides.map((_, index) => (
              <span
                key={`dot-${index}`}
                className={`dot ${index === activeSlide ? 'active' : ''}`}
                onClick={() => setActiveSlide(index)}
              />
            ))}
          </div>
        </div>
      </header>

      <section className="what-makes-us-different">
        <div className="section-content">
          <div className="image-container">
            <img src="/doctor-patient.png" alt="Doctor and patient" />
          </div>
          <div className="text-container">
            <h2>What Makes Us Different?</h2>
            <p>"At HMIS, we go beyond just treatment—we provide compassionate, patient-centered care powered by cutting-edge technology. Our team of expert doctors, nurses, and specialists are dedicated to delivering personalized healthcare solutions that prioritize your well-being. With state-of-the-art facilities, innovative treatments, and a commitment to excellence, we ensure that every patient receives the best possible care. Because to us, you're not just a patient—you're family."</p>
            <Link to="/about" className="btn read-more">READ MORE</Link>
          </div>
        </div>
      </section>

      <section className="departments">
        <div className="departments-container">
          <div className="departments-content">
            <h2>OUR DEPARTMENTS</h2>
            <p className="departments-description">
              "Our hospital is home to a diverse range of medical departments, each led by experienced specialists committed to excellence in patient care. Whether it's cardiology, orthopedics, neurology, pediatrics, or any other specialty, we bring together advanced technology and compassionate treatment to ensure the best outcomes. No matter your healthcare needs, our dedicated teams are here to provide expert care, every step of the way."
            </p>
            <div className="department-grid">
              {[
                { name: 'GENERAL MEDICINE', icon: '/icons/general-medicine.png', className: 'general-med-img' },
                { name: 'GYNECOLOGY', icon: '/icons/gynecology.png', className: 'gynec-img' },
                { name: 'DERMATOLOGY', icon: '/icons/dermatology.png', className: 'derma-img' },
                { name: 'PAEDOLOGY', icon: '/icons/paedology.png', className: 'paed-img'},
                { name: 'NEUROLOGY', icon: '/icons/neurology.png', className: 'neuro-img' },
                { name: 'GASTROENTEROLOGY', icon: '/icons/gastroenterology.png', className: 'gastro-img' }
              ].map((dept, index) => (
                <div key={`dept-${dept.name}`} className={`department-card ${dept.className}`}>
                  <div className="icon-container">
                    <img src={dept.icon} alt={dept.name} />
                  </div>
                  <p>{dept.name}</p>
                </div>
              ))}
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

export default Home;

