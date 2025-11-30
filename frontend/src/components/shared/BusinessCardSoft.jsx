import React, { useState } from 'react';
import PromotionSearchTag from '../promotions/PromotionSearchTag';
import './BusinessCardSoft.css';

/**
 * Business Card Soft Profile
 * Shows limited public information to entice sign-up
 * Includes: name, photos, ratings, category, distance
 * Does NOT include: phone, address, website (login required)
 */
const BusinessCardSoft = ({ business, onViewProfile }) => {
  const {
    id,
    name,
    city,
    zip,
    category,
    heroImage,
    photos = [],
    distance,
    rating,
    reviewCount,
    promotion
  } = business;

  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const defaultImage = 'https://via.placeholder.com/400x250/9333ea/ffffff?text=No+Image';

  // Get all available photos (up to 5)
  const allPhotos = photos.length > 0 ? photos : (heroImage ? [heroImage] : []);
  const displayPhotos = allPhotos.slice(0, 5);
  const currentPhoto = displayPhotos[currentPhotoIndex] || heroImage || defaultImage;

  const handlePrevPhoto = (e) => {
    e.stopPropagation();
    setCurrentPhotoIndex((prev) =>
      prev === 0 ? displayPhotos.length - 1 : prev - 1
    );
  };

  const handleNextPhoto = (e) => {
    e.stopPropagation();
    setCurrentPhotoIndex((prev) =>
      prev === displayPhotos.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="business-card-soft" style={{ position: 'relative' }}>
      <PromotionSearchTag promotion={promotion} />

      <div className="business-card-soft__image">
        <img
          src={currentPhoto}
          alt={name}
          onError={(e) => {
            e.target.src = defaultImage;
          }}
        />

        {/* Photo navigation arrows - only show if multiple photos */}
        {displayPhotos.length > 1 && (
          <>
            <button
              className="business-card-soft__photo-nav business-card-soft__photo-nav--prev"
              onClick={handlePrevPhoto}
              aria-label="Previous photo"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <button
              className="business-card-soft__photo-nav business-card-soft__photo-nav--next"
              onClick={handleNextPhoto}
              aria-label="Next photo"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>

            {/* Photo indicators */}
            <div className="business-card-soft__photo-dots">
              {displayPhotos.map((_, idx) => (
                <span
                  key={idx}
                  className={`business-card-soft__photo-dot ${idx === currentPhotoIndex ? 'active' : ''}`}
                />
              ))}
            </div>
          </>
        )}

        {/* Photo count badge */}
        {displayPhotos.length > 1 && (
          <div className="business-card-soft__photo-count">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            {displayPhotos.length}
          </div>
        )}

        {/* Distance badge */}
        {distance !== undefined && (
          <div className="business-card-soft__badge">
            {typeof distance === 'number' ? distance.toFixed(1) : distance} mi
          </div>
        )}
      </div>

      <div className="business-card-soft__content">
        <h3 className="business-card-soft__name">{name}</h3>

        {/* Rating and reviews - prominent display */}
        <div className="business-card-soft__rating-row">
          {reviewCount > 0 ? (
            <>
              <div className="business-card-soft__stars">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill={i < Math.round(rating) ? '#fbbf24' : 'none'}
                    stroke="#fbbf24"
                    strokeWidth="1.5"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>
              <span className="business-card-soft__rating-text">
                {rating?.toFixed(1)}
              </span>
              <span className="business-card-soft__review-count">
                ({reviewCount} Google {reviewCount === 1 ? 'review' : 'reviews'})
              </span>
            </>
          ) : (
            <span className="business-card-soft__new-badge">New Business</span>
          )}
        </div>

        <div className="business-card-soft__location">
          <span className="location-icon">📍</span>
          <span>{city}{zip && `, ${zip}`}</span>
        </div>

        <div className="business-card-soft__category">
          <span className="category-badge">{category}</span>
        </div>

        {/* CTA Button - entices sign-up */}
        <button
          className="business-card-soft__cta"
          onClick={() => onViewProfile(id)}
        >
          <span>View Phone & Details</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>

        {/* Sign-up teaser */}
        <p className="business-card-soft__teaser">
          Free sign-up to see contact info
        </p>
      </div>
    </div>
  );
};

export default BusinessCardSoft;
