import React from 'react';
import PromotionSearchTag from '../promotions/PromotionSearchTag';
import './BusinessCardSoft.css';

/**
 * Business Card Soft Profile
 * Shows limited public information only
 * Shared component - used ONLY in public search results
 * NO duplication with full profile cards
 */
const BusinessCardSoft = ({ business, onViewProfile }) => {
  const { id, name, city, zip, category, heroImage, distance, promotion } = business;

  const defaultImage = 'https://via.placeholder.com/400x250/667eea/ffffff?text=No+Image';

  return (
    <div className="business-card-soft" style={{ position: 'relative' }}>
      <PromotionSearchTag promotion={promotion} />

      <div className="business-card-soft__image">
        <img
          src={heroImage || defaultImage}
          alt={name}
          onError={(e) => {
            e.target.src = defaultImage;
          }}
        />
        {distance !== undefined && (
          <div className="business-card-soft__badge">
            {distance} mi
          </div>
        )}
      </div>

      <div className="business-card-soft__content">
        <h3 className="business-card-soft__name">{name}</h3>
        
        <div className="business-card-soft__location">
          <span className="location-icon">📍</span>
          <span>{city}{zip && `, ${zip}`}</span>
        </div>

        <div className="business-card-soft__category">
          <span className="category-badge">{category}</span>
        </div>

        <button
          className="business-card-soft__cta"
          onClick={() => onViewProfile(id)}
        >
          View Profile
        </button>
      </div>
    </div>
  );
};

export default BusinessCardSoft;
