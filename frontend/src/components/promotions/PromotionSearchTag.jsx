import React from 'react';
import './PromotionSearchTag.css';

/**
 * PromotionSearchTag - Small badge for search results/business cards
 *
 * Features:
 * - Compact pink tag that appears in corner of business cards
 * - Shows promotion title or generic "Special Offer"
 * - Subtle pulse animation to draw attention
 * - Mobile optimized
 * - Only shows if promotion is active and not expired
 *
 * Usage:
 * <div className="business-card" style={{ position: 'relative' }}>
 *   <PromotionSearchTag promotion={business.promotion} />
 *   <img src={business.image} />
 *   <h3>{business.name}</h3>
 * </div>
 */
const PromotionSearchTag = ({ promotion }) => {
  // Check if promotion is active and not expired
  const isActive = () => {
    if (!promotion) return false;
    if (!promotion.isActive) return false;
    if (!promotion.expiresAt) return false;

    const now = new Date();
    const expiryDate = new Date(promotion.expiresAt);

    return expiryDate > now;
  };

  // Don't render if promotion is not active
  if (!isActive()) {
    return null;
  }

  // Truncate long titles for the tag
  const getDisplayText = () => {
    if (!promotion.title) return 'Special Offer';

    // If title is short, use it directly
    if (promotion.title.length <= 20) {
      return promotion.title;
    }

    // Otherwise truncate
    return promotion.title.substring(0, 18) + '...';
  };

  return (
    <div className="promotion-tag">
      <div className="promotion-tag-content">
        <span className="promotion-tag-icon">⚡</span>
        <span className="promotion-tag-text">{getDisplayText()}</span>
      </div>
    </div>
  );
};

export default PromotionSearchTag;
