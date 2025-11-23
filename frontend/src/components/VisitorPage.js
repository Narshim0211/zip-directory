import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import BlogList from "./blog/BlogList";
import "../styles/VisitorPage.css";

const VisitorPage = () => {
  const [listings, setListings] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [radius, setRadius] = useState("15000"); // meters
  const [sort, setSort] = useState("distance");
  const [results, setResults] = useState([]); // geo results
  const [usingGeo, setUsingGeo] = useState(false);

  const fetchListings = useCallback(async () => {
    try {
      const res = await api.get("/businesses");
      setListings(res.data);
      if (!usingGeo) setResults([]);
      setUsingGeo(false);
    } catch (error) {
      console.error("Error fetching businesses:", error);
    }
  }, [usingGeo]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const filtered = listings.filter((b) => {
    const hay = `${b.name} ${b.city}`.toLowerCase();
    const q = search.trim().toLowerCase();
    const matchesText = q === "" || hay.includes(q);
    const matchesCategory = category === "" || b.category === category;
    return matchesText && matchesCategory;
  });

  const runGeoSearch = async () => {
    const q = search.trim();
    if (!q) {
      setUsingGeo(false);
      setResults([]);
      await fetchListings();
      return;
    }
    try {
      const params = new URLSearchParams();
      params.set("location", q);
      if (category) params.set("category", category);
      if (radius) params.set("radius", radius);
      if (sort) params.set("sort", sort);
      const { data } = await api.get(`/businesses/search?${params.toString()}`);
      setResults(Array.isArray(data) ? data : []);
      setUsingGeo(true);
    } catch (e) {
      console.error(e);
      setResults([]);
      setUsingGeo(true);
    }
  };

  const renderBizCard = (biz) => (
    <div key={biz._id} className="card">
      <img src={biz.images?.[0] || "https://via.placeholder.com/300"} alt={biz.name} />
      <h3>{biz.name}</h3>
      <p>{biz.city}</p>
      {biz.ratingsCount > 0 && (
        <p className="biz-meta">
          Rating: {(Number(biz.ratingAverage || 0)).toFixed(1)} -{" "}
          {biz.ratingsCount} {biz.ratingsCount === 1 ? "review" : "reviews"}
        </p>
      )}
      {typeof biz.distance === "number" && (
        <p className="biz-meta">{(biz.distance / 1000).toFixed(1)} km away</p>
      )}
      <p className="category">{biz.category}</p>
      <Link to={`/business/${biz._id}`} className="view-btn">
        View Details
      </Link>
    </div>
  );

  const listingsToShow = usingGeo ? results : filtered;

  return (
    <>
      <div className="explore-page">
        <section className="explore-page__hero">
          <div className="hero-text">
            <h1>
              Discover Top-Rated <span>Salons & Spas</span>
            </h1>
            <p>Browse trusted local professionals near you. Simple. Fast. Free.</p>
          </div>

          <div className="search-box-simple">
            <div className="search-input-wrapper">
              <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M19 19L14.65 14.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input
                type="text"
                placeholder="Braids, Dallas, 75001..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && runGeoSearch()}
              />
            </div>
            <button className="search-button" onClick={runGeoSearch}>Search</button>
          </div>
        </section>

        <section className="explore-page__results">
          <h2>Explore Listings</h2>
          <div className="card-grid">
            {listingsToShow.length === 0 ? (
              <p>No listings found.</p>
            ) : (
              listingsToShow.map((biz) => renderBizCard(biz))
            )}
          </div>
        </section>

        {/* Blog Section */}
        <section style={{ padding: '60px 5%', backgroundColor: '#f9fafb' }}>
          <BlogList limit={3} title="Latest Articles" subtitle="Discover beauty tips, trends, and professional advice" />
        </section>

        <footer className="explore-page__footer">(c) 2025 SalonHub | All Rights Reserved</footer>
      </div>
    </>
  );
};

export default VisitorPage;
