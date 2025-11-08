import React, { useState } from "react";
import api from "../api/axios";
import "../styles/OwnerPage.css";

const OwnerPage = () => {
  const [form, setForm] = useState({ name: "", city: "", category: "", description: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((f) => ({ ...f, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const token = localStorage.getItem("token");
      await api.post("/businesses", form, { headers: { Authorization: `Bearer ${token}` } });
      setMessage("Listing submitted successfully! Waiting for approval.");
      setForm({ name: "", city: "", category: "", description: "" });
    } catch (err) {
      console.error(err);
      setMessage("Failed to submit. Please log in first.");
    }
  };

  return (
    <div className="owner-page">
      <section className="owner-hero-premium">
        <div className="overlay" />
        <div className="hero-content">
          <h2>
            Grow Your <span>Salon Business</span>
          </h2>
          <p>Join hundreds of beauty professionals who reach more clients every day.</p>
        </div>
      </section>

      <section className="owner-form-wrapper">
        <div className="owner-form-card">
          <h3>Add Your Listing</h3>
          <p className="subtitle">Get discovered by thousands of nearby clients.</p>

          <form onSubmit={handleSubmit}>
            <input id="name" type="text" placeholder="Business Name" value={form.name} onChange={handleChange} required />
            <input id="city" type="text" placeholder="City" value={form.city} onChange={handleChange} required />
            <select id="category" value={form.category} onChange={handleChange} required>
              <option value="">Category</option>
              <option value="Salon">Salon</option>
              <option value="Spa">Spa</option>
              <option value="Barbershop">Barbershop</option>
            </select>
            <textarea id="description" placeholder="Describe your business..." value={form.description} onChange={handleChange} />
            <button type="submit" className="primary-btn">
              Submit Listing
            </button>
          </form>

          {message && <div className="success-message">{message}</div>}
        </div>
      </section>

      <footer>(c) 2025 SalonHub | Empowering Beauty Entrepreneurs</footer>
    </div>
  );
};

export default OwnerPage;










