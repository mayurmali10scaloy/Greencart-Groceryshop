import "../Assets/style/Footer.css";
import { Link } from "react-router-dom";
const Footer = () => {
  const handleSubscribe = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    if (email) {
      alert(`Thank you for subscribing with: ${email}`);
      e.target.reset();
    }
  };

  return (
    <footer className="groco-footer">
      <div className="footer-content">
        {/* Contact Info Section */}
        <div className="footer-section">
          <h2 className="footer-heading">Groco</h2>
          <h3 className="footer-subheading">Contact Info</h3>
          <p className="footer-text">
            Feel Free To Follow Us On Our Social Media Handlers All The Links Are Given Below.
          </p>

          <div className="contact-item">
            <i className="fas fa-phone footer-icon"></i>
            <span>+123-456-7890</span>
          </div>

          <div className="contact-item">
            <i className="fas fa-phone footer-icon"></i>
            <span>+111-222-3333</span>
          </div>

          <div className="contact-item">
            <i className="fas fa-envelope footer-icon"></i>
            <Link href="mailto:Example@Gmail.Com" className="footer-link">Example@Gmail.Com</Link>
          </div>

          <div className="contact-item">
            <i className="fas fa-map-marker-alt footer-icon"></i>
            <span>Pune, India - 400104</span>
          </div>

          <div className="social-icons">
            <Link to="" className="social-link facebook"><i className="fab fa-facebook-f"></i></Link>
            <Link to="" className="social-link twitter"><i className="fab fa-twitter"></i></Link>
            <Link to="" className="social-link instagram"><i className="fab fa-instagram"></i></Link>
            <Link to="" className="social-link linkedin"><i className="fab fa-linkedin-in"></i></Link>
          </div>
        </div>

        {/* Quick Links Section */}
        <div className="footer-section">
          <h3 className="footer-subheading">Quick Links</h3>
          <ul className="link-list">
            <li className="list-item">
              <i className="fas fa-home footer-icon"></i>
              <Link to="" className="footer-link">Home</Link>
            </li>
            <li className="list-item">
              <i className="fas fa-star footer-icon"></i>
              <Link to="" className="footer-link">Features</Link>
            </li>
            <li className="list-item">
              <i className="fas fa-box footer-icon"></i>
              <Link to="" className="footer-link">Products</Link>
            </li>
            <li className="list-item">
              <i className="fas fa-list footer-icon"></i>
              <Link to="" className="footer-link">Categories</Link>
            </li>
            <li className="list-item">
              <i className="fas fa-comment footer-icon"></i>
              <Link to="" className="footer-link">Review</Link>
            </li>
            <li className="list-item">
              <i className="fas fa-blog footer-icon"></i>
              <Link to="" className="footer-link">Blogs</Link>
            </li>
          </ul>
        </div>

        {/* Newsletter Section */}
        <div className="footer-section">
          <h3 className="footer-subheading">Newsletter</h3>
          <p className="footer-text">Subscribe For Latest Updates</p>
          <form className="newsletter-form" onSubmit={handleSubscribe}>
            <input
              type="email"
              name="email"
              placeholder="your email"
              className="newsletter-input"
            />
            <button type="submit" className="subscribe-btn">
              Subscribe
            </button>
          </form>

          <div className="payment-methods">
            <div className="payment-icon">
              <img
                src="https://cdn.iconscout.com/icon/free/png-256/free-visa-icon-svg-download-png-711807.png"
                alt="Visa"
              />
            </div>
            <div className="payment-icon">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
                alt="MasterCard"
              />
            </div>
            <div className="payment-icon">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo.svg"
                alt="Amex"
              />
            </div>
            <div className="payment-icon">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg"
                alt="PayPal"
              />
            </div>
          </div>


        </div>
      </div>

      {/* Copyright Section */}
      <div className="copyright">
        <p>© 2026 Trendly E-Commerce | All Rights Reserved | Created By Cyber Warriors</p>
      </div>
    </footer>
  );
};

export default Footer;
