import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import NewsFeed from "./NewsFeed";
import PopularSalons from "./HomePage/PopularSalons";
import SearchHero from "./SearchHero";

const VisitorHome = () => {
  const [results, setResults] = useState([]);

  const handleSearch = async (city, category) => {
    const params = new URLSearchParams();
    if (city) params.set("city", city);
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
    <div className="home-page" style={{ paddingBottom: 24 }}>
      <section className="home-hero">
        <div className="hero-content">
          <h1>Find Your Perfect Salon or Stylist ✂️</h1>
          <p>Search by city and discover top-rated stylists near you.</p>
          <SearchHero onSearch={handleSearch} />
        </div>
      </section>

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
                  <p className="category">{biz.category}</p>
                  <Link to={`/business/${biz._id}`} className="view-btn">View Details</Link>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      <NewsFeed />
      <PopularSalons />
    </div>
  );
};

export default VisitorHome;
