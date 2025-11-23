import React, { useState, useEffect } from 'react';
import './PromotionBanner.css';

/**
 * PromotionBanner - Display active promotion on business profile page
 *
 * Features:
 * - Pink-purple gradient background
 * - Real-time countdown timer
 * - Mobile responsive
 * - Smooth animations
 * - Only shows if promotion is active and not expired
 *
 * Usage:
 * <PromotionBanner
 *   promotion={business.promotion}
 *   onBookNow={() => navigate('/book')}
 * />
 */
const PromotionBanner = ({ promotion, onBookNow }) => {
  const [timeLeft, setTimeLeft] = useState('');

  // Calculate if promotion is active
  const isActive = () => {
    if (!promotion) return false;
    if (!promotion.isActive) return false;
    if (!promotion.expiresAt) return false;

    const now = new Date();
    const expiryDate = new Date(promotion.expiresAt);

    return expiryDate > now;
  };

  // Update countdown timer
  useEffect(() => {
    if (!isActive() || !promotion.expiresAt) {
      return;
    }

    const updateCountdown = () => {
      const now = new Date().getTime();
      const expiry = new Date(promotion.expiresAt).getTime();
      const distance = expiry - now;

      if (distance < 0) {
        setTimeLeft('Expired');
        return;
      }

      // Calculate time units
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

      // Format display
      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m`);
      }
    };

    // Initial update
    updateCountdown();

    // Update every minute
    const interval = setInterval(updateCountdown, 60000);

    return () => clearInterval(interval);
  }, [promotion]);

  // Don't render if promotion is not active
  if (!isActive()) {
    return null;
  }

  return (
    <div className="promotion-banner">
      <div className="promotion-banner-bg-effect"></div>

      <div className="promotion-banner-content">
        <div className="promotion-header">
          <span className="limited-time-badge">LIMITED TIME OFFER</span>
          <div className="countdown-timer">
            <span className="countdown-icon">⏰</span>
            <span className="countdown-text">
              {timeLeft ? `Ends in ${timeLeft}` : 'Ending soon'}
            </span>
          </div>
        </div>

        <h2 className="promotion-title">
          <span className="promotion-emoji">🎁</span>
          {promotion.title}
        </h2>

        {promotion.description && (
          <p className="promotion-description">{promotion.description}</p>
        )}

        {onBookNow && (
          <button className="promotion-cta" onClick={onBookNow}>
            📅 Book Now & Save
          </button>
        )}
      </div>
    </div>
  );
};

export default PromotionBanner;
