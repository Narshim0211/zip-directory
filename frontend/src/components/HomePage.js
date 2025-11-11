import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/HomePage.css";
import NewsFeed from "./NewsFeed";
import PopularSalons from "./HomePage/PopularSalons";
import api from "../api/axios";

const HomePage = () => {
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [category, setCategory] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    const params = new URLSearchParams();
    const fullLocation = [address, city, zip].filter(Boolean).join(", ");
    if (fullLocation) params.set("location", fullLocation);
    if (category) params.set("category", category);
    try {
      const { data } = await api.get(`/businesses/search?${params.toString()}`);
      setResults(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setResults([]);
    }
  };

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="hero-content">
          <h1>
            Connecting <span>Salons</span>, <span>Stylists</span>, and <span>Clients</span> in One Beautiful Place
          </h1>
          <p>
            Discover top-rated hair and beauty professionals in your city.
          </p>
          {/* Search-focused hero */}
          <div className="search-box" style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr auto', gap: 10, marginTop: 16 }}>
            <input
              type="text"
              placeholder="Street address (optional)"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <input
              type="text"
              placeholder="City (required)"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <input
              type="text"
              placeholder="ZIP (optional)"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
            />
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All Categories</option>
              <option value="Salon">Salon</option>
              <option value="Freelance Stylist">Hair Stylist</option>
              <option value="Spa">Spa</option>
              <option value="Barbershop">Barbershop</option>
            </select>
            <button className="btn explore" onClick={handleSearch}>Search</button>
          </div>
        </div>
      </section>

      {/* Inline search results */}
      <section className="results-section" style={{ maxWidth: 1100, margin: '0 auto', padding: '0 16px' }}>
        {results.length > 0 && (
          <>
            <h2>Results</h2>
            <div className="card-grid">
              {results.map((biz) => (
                <div key={biz._id} className="card">
                  <img src={biz.images?.[0] || "https://via.placeholder.com/300"} alt={biz.name} />
                  <h3>{biz.name}</h3>
                  <p>{biz.city}</p>
                  <p style={{ color:'#475569' }}>
                    {biz.ratingsCount > 0 ? (
                      <>
                        ★ {(Number(biz.ratingAverage || 0)).toFixed(1)} · {biz.ratingsCount} {biz.ratingsCount === 1 ? 'review' : 'reviews'}
                      </>
                    ) : (
                      'No ratings yet'
                    )}
                  </p>
                  {typeof biz.distance === 'number' && (
                    <p style={{ color: '#475569' }}>{(biz.distance / 1000).toFixed(1)} km away</p>
                  )}
                  <p className="category">{biz.category}</p>
                  <Link to={`/business/${biz._id}`} className="view-btn">View Details</Link>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      <section className="panel" style={{ margin: '32px auto', maxWidth: 1100 }}>
        <div className="panel-head">
          <div>
            <div className="panel-title">Beauty News</div>
            <div className="panel-sub">Latest articles, trends, and tips for your next visit</div>
          </div>
        </div>
        <NewsFeed />
      </section>
      <PopularSalons />

      <footer className="footer">(c) 2025 SalonHub - Built for the Beauty Industry</footer>
    </div>
  );
};

export default HomePage;

