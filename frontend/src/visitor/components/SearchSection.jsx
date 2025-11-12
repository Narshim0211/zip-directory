import React, { useState } from 'react';
import '../../styles/searchSection.css';

const US_STATES = [
  'All States', 'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI',
  'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND',
  'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA',
  'WA', 'WV', 'WI', 'WY'
];

const CATEGORIES = [
  'All',
  'Salon',
  'Spa',
  'Barbershop',
  'Freelance Stylist'
];

const SearchSection = ({ onSearch }) => {
  const [searchParams, setSearchParams] = useState({
    keyword: '',
    city: '',
    state: 'All States',
    zip: '',
    category: 'All'
  });

  const handleInputChange = (field, value) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();

    // Build query parameters
    const params = new URLSearchParams();

    if (searchParams.keyword.trim()) {
      params.append('query', searchParams.keyword.trim());
    }
    if (searchParams.city.trim()) {
      params.append('city', searchParams.city.trim());
    }
    if (searchParams.state !== 'All States' && searchParams.state) {
      params.append('state', searchParams.state);
    }
    if (searchParams.zip.trim()) {
      params.append('zip', searchParams.zip.trim());
    }
    if (searchParams.category !== 'All') {
      params.append('category', searchParams.category);
    }

    // Call parent callback or navigate
    if (onSearch) {
      onSearch(params.toString());
    } else {
      window.location.href = `/explore?${params.toString()}`;
    }
  };

  return (
    <div className="search-section">
      <form onSubmit={handleSearch} className="search-section__form">
        <div className="search-section__grid">
          {/* Keyword Search */}
          <div className="search-section__field">
            <input
              type="text"
              placeholder="Search salons, stylists, or trends..."
              className="search-section__input search-section__input--main"
              value={searchParams.keyword}
              onChange={(e) => handleInputChange('keyword', e.target.value)}
            />
          </div>

          {/* City */}
          <div className="search-section__field">
            <input
              type="text"
              placeholder="City"
              className="search-section__input"
              value={searchParams.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
            />
          </div>

          {/* State */}
          <div className="search-section__field">
            <select
              className="search-section__select"
              value={searchParams.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
            >
              {US_STATES.map(state => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          {/* Zip Code */}
          <div className="search-section__field">
            <input
              type="text"
              placeholder="Zip"
              className="search-section__input search-section__input--zip"
              value={searchParams.zip}
              onChange={(e) => {
                // Only allow numbers for zip
                const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                handleInputChange('zip', value);
              }}
              maxLength="5"
            />
          </div>

          {/* Category */}
          <div className="search-section__field">
            <select
              className="search-section__select"
              value={searchParams.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Search Button */}
          <div className="search-section__field">
            <button type="submit" className="search-section__button">
              <svg
                className="search-section__icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Search
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SearchSection;
