import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import "../styles/VisitorPage.css";

const VisitorPage = () => {
  const [listings, setListings] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const res = await api.get("/businesses");
      setListings(res.data);
    } catch (error) {
      console.error("Error fetching businesses:", error);
    }
  };

  const filtered = listings.filter(
    (b) => b.name.toLowerCase().includes(search.toLowerCase()) && (category === "" || b.category === category)
  );

  return (
    <div className="visitor-page">
      <section className="hero">
        <div className="hero-text">
          <h1>
            Discover Top-Rated <span>Salons & Spas</span>
          </h1>
          <p>Browse trusted local professionals near you. Simple. Fast. Free.</p>

          <div className="search-box">
            <input
              type="text"
              placeholder="Search by name or city"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All Categories</option>
              <option value="Salon">Salon</option>
              <option value="Spa">Spa</option>
              <option value="Barbershop">Barbershop</option>
            </select>
            <button onClick={fetchListings}>Search</button>
          </div>
        </div>
      </section>

      <section className="results-section">
        <h2>✨ Explore Listings</h2>
        <div className="card-grid">
          {filtered.length === 0 ? (
            <p>No listings found.</p>
          ) : (
            filtered.map((biz) => (
              <div key={biz._id} className="card">
                <img src={biz.images?.[0] || "https://via.placeholder.com/300"} alt={biz.name} />
                <h3>{biz.name}</h3>
                <p>{biz.city}</p>
                <p className="category">{biz.category}</p>
                <Link to={`/business/${biz._id}`} className="view-btn">
                  View Details →
                </Link>
              </div>
            ))
          )}
        </div>
      </section>

      <footer>© 2025 SalonHub | All Rights Reserved</footer>
    </div>
  );
};

export default VisitorPage;

