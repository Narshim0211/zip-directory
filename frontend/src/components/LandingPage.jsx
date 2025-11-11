import React from "react";
import { Link, useNavigate } from "react-router-dom";
import SearchHero from "./SearchHero";
import "../styles/HomePage.css";

const LandingPage = () => {
  const navigate = useNavigate();
  const handleSearch = (city, category) => {
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (category) params.set("category", category);
    navigate(`/explore?${params.toString()}`);
  };

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="hero-content">
          <h1>Find the best salons near you</h1>
          <p>Search by city and category to discover trusted professionals.</p>
          <SearchHero onSearch={handleSearch} />
          <div style={{ marginTop: 16 }}>
            <Link to="/register?role=owner" className="btn add">Join as a Business</Link>
          </div>
        </div>
      </section>

      {/* Per PRD: no News Feed on Landing */}

      <section className="features">
        <h2>Why Join SalonHub?</h2>
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

      <footer className="footer">(c) 2025 SalonHub - Built for the Beauty Industry</footer>
    </div>
  );
};

export default LandingPage;
