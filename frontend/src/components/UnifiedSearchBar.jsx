/**
 * Unified Smart Search Bar
 *
 * World-class minimalist search component that accepts:
 * - Service names ("braids", "nails")
 * - City names ("Dallas", "Fort Worth")
 * - ZIP codes ("75001")
 * - Full addresses ("123 Main St, Dallas, TX")
 * - Combined ("braids in Dallas 75001")
 *
 * Features:
 * - One input field (not 6!)
 * - Smart autocomplete
 * - Instant suggestions
 * - Mobile-first design
 * - Beautiful PRD-compliant UI
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import searchApi from '../api/searchApi';
import '../styles/unifiedSearch.css';

const UnifiedSearchBar = ({
  placeholder = "Braids, Dallas, 75001...",
  autoFocus = false,
  onSearch,
  size = "large" // "large" | "medium" | "small"
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceTimer = useRef(null);
  const navigate = useNavigate();

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced autocomplete
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions(null);
      setShowSuggestions(false);
      return;
    }

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer (250ms debounce)
    debounceTimer.current = setTimeout(async () => {
      try {
        setIsLoading(true);
        const response = await searchApi.getSuggestions(query);

        if (response.success) {
          setSuggestions(response);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error('[SEARCH] Autocomplete error:', error);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query]);

  // Handle search submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!query.trim()) return;

    setShowSuggestions(false);

    // If custom onSearch provided, use it
    if (onSearch) {
      onSearch(query);
      return;
    }

    // Otherwise, parse and navigate
    try {
      const parsed = await searchApi.parseQuery(query);

      if (parsed.success) {
        const { service, city, zip } = parsed.parsed;

        // Build query params
        const params = new URLSearchParams();
        if (service) params.append('q', service);
        if (city) params.append('city', city);
        if (zip) params.append('zip', zip);

        // Navigate to search results
        navigate(`/directory/search?${params.toString()}`);
      }
    } catch (error) {
      console.error('[SEARCH] Parse error:', error);
      // Fallback: just use raw query
      navigate(`/directory/search?q=${encodeURIComponent(query)}`);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    if (suggestion.type === 'service') {
      setQuery(suggestion.value);
      setShowSuggestions(false);
      // Auto-submit
      setTimeout(() => {
        navigate(`/directory/search?q=${encodeURIComponent(suggestion.value)}`);
      }, 100);
    } else if (suggestion.type === 'business') {
      // Navigate to business detail - use id or _id (API may return either)
      const businessId = suggestion.id || suggestion._id;
      if (businessId) {
        navigate(`/visitor/business/${businessId}`);
      }
    } else if (suggestion.type === 'city') {
      setQuery(suggestion.value);
      setShowSuggestions(false);
      setTimeout(() => {
        navigate(`/directory/search?city=${encodeURIComponent(suggestion.value)}`);
      }, 100);
    }
  };

  return (
    <div className={`unified-search unified-search--${size}`}>
      <form onSubmit={handleSubmit} className="unified-search__form">
        <div className="unified-search__input-wrapper">
          {/* Search Icon */}
          <svg
            className="unified-search__icon"
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

          {/* Input Field */}
          <input
            ref={inputRef}
            type="text"
            className="unified-search__input"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length >= 2 && setShowSuggestions(true)}
            autoFocus={autoFocus}
            autoComplete="off"
          />

          {/* Loading Spinner */}
          {isLoading && (
            <div className="unified-search__spinner">
              <div className="spinner"></div>
            </div>
          )}

          {/* Clear Button */}
          {query && (
            <button
              type="button"
              className="unified-search__clear"
              onClick={() => {
                setQuery('');
                setShowSuggestions(false);
                inputRef.current?.focus();
              }}
            >
              ×
            </button>
          )}
        </div>

        {/* Submit Button (hidden on mobile, appears on larger screens) */}
        <button type="submit" className="unified-search__submit">
          Search
        </button>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions && (
        <div ref={suggestionsRef} className="unified-search__suggestions">
          {/* Services */}
          {suggestions.suggestions && suggestions.suggestions.length > 0 && (
            <div className="suggestions-group">
              {suggestions.suggestions.filter(s => s.type === 'service').length > 0 && (
                <>
                  <div className="suggestions-group__header">Services</div>
                  {suggestions.suggestions
                    .filter(s => s.type === 'service')
                    .slice(0, 5)
                    .map((item, index) => (
                      <div
                        key={`service-${index}`}
                        className="suggestion-item"
                        onClick={() => handleSuggestionClick(item)}
                      >
                        <span className="suggestion-item__icon">🔸</span>
                        <span className="suggestion-item__text">{item.value}</span>
                      </div>
                    ))}
                </>
              )}

              {/* Businesses */}
              {suggestions.suggestions.filter(s => s.type === 'business').length > 0 && (
                <>
                  <div className="suggestions-group__header">Salons</div>
                  {suggestions.suggestions
                    .filter(s => s.type === 'business')
                    .slice(0, 5)
                    .map((item, index) => (
                      <div
                        key={`business-${index}`}
                        className="suggestion-item suggestion-item--business"
                        onClick={() => handleSuggestionClick(item)}
                      >
                        <span className="suggestion-item__icon">📷</span>
                        <div className="suggestion-item__content">
                          <div className="suggestion-item__name">{item.value}</div>
                          {item.city && (
                            <div className="suggestion-item__meta">
                              {item.category} • {item.city}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </>
              )}

              {/* Cities */}
              {suggestions.suggestions.filter(s => s.type === 'city').length > 0 && (
                <>
                  <div className="suggestions-group__header">Locations</div>
                  {suggestions.suggestions
                    .filter(s => s.type === 'city')
                    .slice(0, 3)
                    .map((item, index) => (
                      <div
                        key={`city-${index}`}
                        className="suggestion-item"
                        onClick={() => handleSuggestionClick(item)}
                      >
                        <span className="suggestion-item__icon">📍</span>
                        <span className="suggestion-item__text">{item.value}</span>
                      </div>
                    ))}
                </>
              )}
            </div>
          )}

          {/* No results */}
          {suggestions.suggestions && suggestions.suggestions.length === 0 && (
            <div className="suggestions-empty">
              No suggestions found. Try "Dallas" or "braids"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UnifiedSearchBar;
