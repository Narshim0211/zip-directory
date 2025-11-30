import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * BusinessHero Component
 *
 * Full-width hero banner with cover photo, business info, rating, and verified badge.
 * Marketplace-style 2025 design inspired by Booksy/Fresha.
 *
 * @param {Object} business - Business data object
 */
const BusinessHero = ({ business }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    // Go back to previous page, or default to explore
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/visitor/explore');
    }
  };

  if (!business) return null;

  const {
    name,
    category,
    city,
    state,
    ratingAverage = 0,
    ratingsCount = 0,
    coverPhotoUrl,
    logoUrl,
    verificationStatus,
    photos = []
  } = business;

  // Use cover photo, first gallery photo, or gradient fallback
  const heroImage = coverPhotoUrl || photos[0]?.url || null;
  const isVerified = verificationStatus === 'basic' || verificationStatus === 'fully_verified';
  const isFullyVerified = verificationStatus === 'fully_verified';

  return (
    <div className="bp-hero">
      {/* Back Button */}
      <button className="bp-hero__back" onClick={handleBack} aria-label="Go back">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        <span>Back</span>
      </button>

      {/* Background Image or Gradient */}
      <div className="bp-hero__background">
        {heroImage ? (
          <img
            src={heroImage}
            alt={name}
            className="bp-hero__image"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : null}
        <div className="bp-hero__overlay" />
      </div>

      {/* Content */}
      <div className="bp-hero__content">
        <div className="bp-hero__container">
          {/* Logo */}
          {logoUrl && (
            <div className="bp-hero__logo">
              <img src={logoUrl} alt={`${name} logo`} />
            </div>
          )}

          {/* Business Info */}
          <div className="bp-hero__info">
            <div className="bp-hero__badges">
              <span className="bp-hero__category">{category}</span>
              {isVerified && (
                <span className={`bp-hero__verified ${isFullyVerified ? 'bp-hero__verified--full' : ''}`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                  </svg>
                  {isFullyVerified ? 'Verified' : 'Basic Verified'}
                </span>
              )}
            </div>

            <h1 className="bp-hero__title">{name}</h1>

            <div className="bp-hero__meta">
              {/* Rating */}
              <div className="bp-hero__rating">
                <span className="bp-hero__stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`bp-hero__star ${star <= Math.round(ratingAverage) ? 'bp-hero__star--filled' : ''}`}
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                </span>
                <span className="bp-hero__rating-text">
                  {ratingAverage.toFixed(1)}
                </span>
                <span className="bp-hero__reviews">
                  ({ratingsCount} Google {ratingsCount === 1 ? 'review' : 'reviews'})
                </span>
              </div>

              {/* Location */}
              <div className="bp-hero__location">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <span>{city}{state ? `, ${state}` : ''}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessHero;
