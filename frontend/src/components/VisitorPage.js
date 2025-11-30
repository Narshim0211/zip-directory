import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import BlogList from "./blog/BlogList";
import "../styles/VisitorPage.css";

const CATEGORIES = [
  "All",
  "Salon",
  "Spa",
  "Hair Salon",
  "Beauty Salon",
  "Braiding",
  "Locs",
  "Natural Hair",
  "Nail Salon",
  "Makeup Artist",
  "Esthetician"
];

const SORT_OPTIONS = [
  { value: "rating", label: "Highest Rated" },
  { value: "distance", label: "Closest First" }
];

const VisitorPage = () => {
  const [listings, setListings] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("rating");
  const [results, setResults] = useState([]);
  const [usingGeo, setUsingGeo] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState("idle"); // idle, requesting, granted, denied
  const [searchMeta, setSearchMeta] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Request browser geolocation on mount
  useEffect(() => {
    if ("geolocation" in navigator) {
      setLocationStatus("requesting");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationStatus("granted");
          console.log("📍 Location granted:", position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.log("📍 Location denied or unavailable:", error.message);
          setLocationStatus("denied");
          // Will use default DFW location on backend
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
      );
    } else {
      setLocationStatus("denied");
    }
  }, []);

  // Fetch all listings on mount (fallback)
  const fetchListings = useCallback(async () => {
    try {
      const res = await api.get("/businesses");
      setListings(res.data);
    } catch (error) {
      console.error("Error fetching businesses:", error);
    }
  }, []);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Auto-search when location is available or sort changes
  useEffect(() => {
    if (locationStatus === "granted" || locationStatus === "denied") {
      runSmartSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationStatus, sort]);

  // Smart search with geolocation and sorting
  const runSmartSearch = async (searchQuery = search) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();

      // Add search query if provided
      if (searchQuery?.trim()) {
        params.set("q", searchQuery.trim());
      }

      // Add user location if available
      if (userLocation) {
        params.set("lat", userLocation.lat);
        params.set("lng", userLocation.lng);
      }

      // Add sort preference
      params.set("sort", sort);

      // Add category filter
      if (category && category !== "All") {
        params.set("category", category);
      }

      const { data } = await api.get(`/public/directory/search?${params.toString()}`);

      // Map the response to match expected format
      const searchResults = data?.data || [];
      const mappedResults = searchResults.map(biz => ({
        _id: biz.id,
        name: biz.name,
        city: biz.city,
        state: biz.state,
        zip: biz.zip,
        category: biz.category,
        coverPhotoUrl: biz.heroImage,
        // Include photos array for carousel - use heroImage as fallback if no photos
        photos: biz.photos?.length > 0 ? biz.photos : (biz.heroImage ? [biz.heroImage] : []),
        ratingAverage: biz.rating,
        ratingsCount: biz.reviewCount,
        distance: biz.distance,
        location: biz.location,
        verificationStatus: biz.verificationStatus,
        listingType: biz.listingType,
      }));

      setResults(mappedResults);
      setSearchMeta(data?.meta || null);
      setUsingGeo(true);
    } catch (e) {
      console.error("Search error:", e);
      setResults([]);
      setSearchMeta(null);
      setUsingGeo(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search button click
  const handleSearch = () => {
    runSmartSearch(search);
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      runSmartSearch(search);
    }
  };

  // Handle category change
  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    // Re-run search with new category
    setTimeout(() => runSmartSearch(search), 0);
  };

  // Handle sort change
  const handleSortChange = (newSort) => {
    setSort(newSort);
    // Search will auto-run via useEffect
  };

  // Reset to show all
  const handleShowAll = () => {
    setSearch("");
    setCategory("All");
    runSmartSearch("");
  };

  // Filter local listings (fallback when not using API search)
  const filtered = listings.filter((b) => {
    const hay = `${b.name} ${b.city} ${b.category}`.toLowerCase();
    const q = search.trim().toLowerCase();
    const matchesText = q === "" || hay.includes(q);
    const matchesCategory = category === "All" || b.category === category;
    return matchesText && matchesCategory;
  });

  const renderBizCard = (biz) => {
    // Get the main photo from photos array or coverPhotoUrl
    const mainPhoto = biz.photos?.[0] || biz.coverPhotoUrl || "";
    const photoCount = biz.photos?.length || (biz.coverPhotoUrl ? 1 : 0);

    return (
      <div key={biz._id} className="explore-card">
        <div className="explore-card__image">
          <img
            src={mainPhoto || "https://via.placeholder.com/300x200/9333ea/ffffff?text=No+Photo"}
            alt={biz.name}
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/300x200/9333ea/ffffff?text=No+Photo";
            }}
          />
          {/* Photo count badge */}
          {photoCount > 1 && (
            <span className="explore-card__photo-count">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21,15 16,10 5,21"/>
              </svg>
              {photoCount}
            </span>
          )}
          {biz.verificationStatus === 'fully_verified' && (
            <span className="explore-card__badge explore-card__badge--verified">Verified</span>
          )}
          {biz.listingType === 'premium' && (
            <span className="explore-card__badge explore-card__badge--premium">Premium</span>
          )}
        </div>
        <div className="explore-card__content">
          <h3 className="explore-card__name">{biz.name}</h3>
          <p className="explore-card__location">{biz.city}{biz.state ? `, ${biz.state}` : ''}</p>
          <div className="explore-card__meta">
            {biz.ratingsCount > 0 ? (
              <span className="explore-card__rating">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#fbbf24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                {(Number(biz.ratingAverage || 0)).toFixed(1)}
                <span className="explore-card__reviews">({biz.ratingsCount} Google reviews)</span>
              </span>
            ) : (
              <span className="explore-card__new">New Listing</span>
            )}
            {typeof biz.distance === "number" && (
              <span className="explore-card__distance">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                {biz.distance.toFixed(1)} mi
              </span>
            )}
          </div>
          <span className="explore-card__category">{biz.category}</span>
          <Link to={`/business/${biz._id}/preview`} className="explore-card__btn">
            View Details
          </Link>
        </div>
      </div>
    );
  };

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
                placeholder="Search by name, city, or zip..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            <button className="search-button" onClick={handleSearch} disabled={isLoading}>
              {isLoading ? "..." : "Search"}
            </button>
          </div>

          {/* Location status indicator */}
          <div className="location-status">
            {locationStatus === "requesting" && (
              <span className="location-status__text location-status__text--requesting">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
                Detecting your location...
              </span>
            )}
            {locationStatus === "granted" && (
              <span className="location-status__text location-status__text--granted">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                Using your location for personalized results
              </span>
            )}
            {locationStatus === "denied" && (
              <span className="location-status__text location-status__text--denied">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                Showing results for DFW area
              </span>
            )}
          </div>
        </section>

        <section className="explore-page__results">
          <div className="explore-page__results-header">
            <h2>Explore Listings</h2>
            <div className="explore-page__filters">
              {/* Sort Dropdown */}
              <select
                className="explore-filter-select explore-sort-select"
                value={sort}
                onChange={(e) => handleSortChange(e.target.value)}
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>

              {/* Category Filter */}
              <select
                className="explore-filter-select"
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              {/* Show All Button */}
              <button
                className="explore-show-all-btn"
                onClick={handleShowAll}
              >
                Show All
              </button>
            </div>
          </div>

          {/* Smart search message */}
          <div className="explore-page__meta">
            {isLoading ? (
              <p className="explore-page__count">Searching...</p>
            ) : searchMeta ? (
              <p className="explore-page__count">
                {searchMeta.expandedSearch && (
                  <span className="explore-page__expanded-notice">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="16" x2="12" y2="12"/>
                      <line x1="12" y1="8" x2="12.01" y2="8"/>
                    </svg>
                  </span>
                )}
                {searchMeta.message}
                {category !== "All" && ` in ${category}`}
                {search && ` matching "${search}"`}
                <span className="explore-page__sort-info">
                  • Sorted by {sort === "rating" ? "rating" : "distance"}
                </span>
              </p>
            ) : (
              <p className="explore-page__count">
                Showing {listingsToShow.length} {listingsToShow.length === 1 ? 'business' : 'businesses'}
                {category !== "All" && ` in ${category}`}
                {search && ` matching "${search}"`}
              </p>
            )}
          </div>

          <div className="explore-card-grid">
            {isLoading ? (
              <div className="explore-loading">
                <div className="explore-loading__spinner"></div>
                <p>Finding the best matches...</p>
              </div>
            ) : listingsToShow.length === 0 ? (
              <div className="explore-empty-state">
                <div className="explore-empty-state__icon">🔍</div>
                <h3>No businesses found</h3>
                <p>Try adjusting your search or filters</p>
                <button className="explore-show-all-btn" onClick={handleShowAll}>
                  Show All Businesses
                </button>
              </div>
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
