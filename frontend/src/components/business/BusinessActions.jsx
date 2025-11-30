import React, { useState } from 'react';

/**
 * BusinessActions Component
 *
 * Quick action bar with Book Now, Save, Message, Directions, Share buttons.
 * Marketplace-style 2025 design with instant feedback.
 *
 * @param {Object} business - Business data object
 * @param {Function} onMessage - Callback when message button clicked
 * @param {Function} onBook - Callback when book button clicked
 * @param {boolean} canMessage - Whether messaging is available (premium)
 * @param {boolean} canBook - Whether booking is enabled for this business
 */
const BusinessActions = ({ business, onMessage, onBook, canMessage = false, canBook = false }) => {
  const [isSaved, setIsSaved] = useState(false);
  const [showCopied, setShowCopied] = useState(false);

  if (!business) return null;

  const { name, address, city, state, zipCode } = business;

  // Build full address for directions
  const fullAddress = [address, city, state, zipCode].filter(Boolean).join(', ');
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;

  // Handle save/bookmark
  const handleSave = () => {
    setIsSaved(!isSaved);
    // TODO: Persist to backend/localStorage
  };

  // Handle directions
  const handleDirections = () => {
    window.open(mapsUrl, '_blank');
  };

  // Handle share
  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: name,
      text: `Check out ${name} on SalonHub!`,
      url: shareUrl
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareUrl);
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 2000);
      }
    } catch (err) {
      // User cancelled or error
      console.log('Share failed:', err);
    }
  };

  return (
    <div className="bp-actions">
      {/* Book Now Button (Primary CTA) */}
      {canBook && (
        <button
          className="bp-actions__btn bp-actions__btn--book"
          onClick={onBook}
          aria-label="Book appointment"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <span>Book Now</span>
        </button>
      )}

      {/* Save Button */}
      <button
        className={`bp-actions__btn ${isSaved ? 'bp-actions__btn--active' : ''}`}
        onClick={handleSave}
        aria-label={isSaved ? 'Remove from saved' : 'Save business'}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill={isSaved ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>
        <span>{isSaved ? 'Saved' : 'Save'}</span>
      </button>

      {/* Message Button */}
      <button
        className={`bp-actions__btn bp-actions__btn--primary ${!canMessage ? 'bp-actions__btn--disabled' : ''}`}
        onClick={canMessage ? onMessage : undefined}
        disabled={!canMessage}
        aria-label="Message business"
        title={!canMessage ? 'Messaging available for premium businesses' : 'Send a message'}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <span>Message</span>
      </button>

      {/* Directions Button */}
      <button
        className="bp-actions__btn"
        onClick={handleDirections}
        aria-label="Get directions"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="3 11 22 2 13 21 11 13 3 11"/>
        </svg>
        <span>Directions</span>
      </button>

      {/* Share Button */}
      <button
        className="bp-actions__btn"
        onClick={handleShare}
        aria-label="Share business"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="18" cy="5" r="3"/>
          <circle cx="6" cy="12" r="3"/>
          <circle cx="18" cy="19" r="3"/>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
        </svg>
        <span>{showCopied ? 'Copied!' : 'Share'}</span>
      </button>
    </div>
  );
};

export default BusinessActions;
