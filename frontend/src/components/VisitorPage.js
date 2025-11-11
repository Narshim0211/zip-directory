import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
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
              <option value="Freelance Stylist">Hair Stylist</option>
              <option value="Spa">Spa</option>
              <option value="Barbershop">Barbershop</option>
            </select>
            <select value={radius} onChange={(e) => setRadius(e.target.value)}>
              <option value="5000">5 km</option>
              <option value="10000">10 km</option>
              <option value="15000">15 km</option>
              <option value="25000">25 km</option>
              <option value="50000">50 km</option>
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="distance">Distance</option>
              <option value="rating">Rating</option>
              <option value="newest">Newest</option>
            </select>
            <button onClick={runGeoSearch}>Search</button>
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

        <footer className="explore-page__footer">(c) 2025 SalonHub | All Rights Reserved</footer>
      </div>
    </>
  );
};

export default VisitorPage;
