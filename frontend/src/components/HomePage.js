import React from "react";
import { Link } from "react-router-dom";
import "../styles/HomePage.css";

const HomePage = () => {
  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="hero-content">
          <h1>
            Connecting <span>Salons</span>, <span>Stylists</span>, and <span>Clients</span> in One Beautiful Place
          </h1>
          <p>
            Discover top-rated hair and beauty professionals, manage your salon presence, and grow your business effortlessly.
          </p>
          <div className="hero-buttons">
            <Link to="/visitor" className="btn explore">Explore Salons</Link>
            <Link to="/owner" className="btn add">Join as a Business</Link>
            <Link to="/business/000000000000000000000001" className="btn">View Example Business</Link>
          </div>
        </div>
      </section>

      <section className="features">
        <h2>Why Choose SalonHub?</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <img src="https://cdn-icons-png.flaticon.com/512/2920/2920244.png" alt="Search" />
            <h3>Discover Nearby Salons</h3>
            <p>Search by city or category and find the perfect stylist or spa for your needs.</p>
          </div>
          <div className="feature-card">
            <img src="https://cdn-icons-png.flaticon.com/512/1754/1754675.png" alt="Reviews" />
            <h3>Read & Leave Reviews</h3>
            <p>See what others say about their experience and share your own feedback.</p>
          </div>
          <div className="feature-card">
            <img src="https://cdn-icons-png.flaticon.com/512/3050/3050525.png" alt="Growth" />
            <h3>Grow Your Salon Brand</h3>
            <p>Showcase services, photos, and client reviews in one place.</p>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2>Ready to Get Started?</h2>
        <p>Whether you're booking your next appointment or showcasing your salon, SalonHub connects the beauty world together.</p>
        <div className="hero-buttons">
          <Link to="/visitor" className="btn explore">Start Exploring</Link>
          <Link to="/owner" className="btn add">Join as a Business</Link>
        </div>
      </section>

      <footer className="footer">© 2025 SalonHub — Built for the Beauty Industry</footer>
    </div>
  );
};

export default HomePage;

