import React, { useState } from "react";

// Reusable search hero for Landing + Visitor pages
// Props:
// - onSearch(city, category, address?, zip?): function to call when user submits
// - initialCity, initialCategory: optional defaults
// - ctaLabel: button label (default: "Search")
const SearchHero = ({ onSearch, initialCity = "", initialCategory = "", ctaLabel = "Search" }) => {
  const [city, setCity] = useState(initialCity);
  const [category, setCategory] = useState(initialCategory);
  const [address, setAddress] = useState("");
  const [zip, setZip] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (typeof onSearch === "function") onSearch(city, category, address, zip);
  };

  return (
    <form onSubmit={submit} className="search-box" style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr auto', gap: 10, marginTop: 16 }}>
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
      <button type="submit" className="btn explore">{ctaLabel}</button>
    </form>
  );
};

export default SearchHero;
