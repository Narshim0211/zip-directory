import React, { useState } from 'react';
import StarRating from './StarRating';
import '../../styles/reviewCard.css';

/**
 * 💬 REVIEW CARD COMPONENT
 *
 * Displays a single review with user info, rating, message, and optional photo.
 *
 * Props:
 * - review: object - Review data from API
 *   {
 *     _id, rating, message, photoUrl, createdAt,
 *     userId: { name, avatarUrl }
 *   }
 */
export default function ReviewCard({ review }) {
  const [showFullImage, setShowFullImage] = useState(false);
  const user = review.userId || {};

  // Format time since review (e.g., "2 days ago")
  const getTimeSince = (dateString) => {
    const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) {
      const mins = Math.floor(seconds / 60);
      return `${mins} minute${mins !== 1 ? 's' : ''} ago`;
    }
    if (seconds < 86400) {
      const hours = Math.floor(seconds / 3600);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
    if (seconds < 604800) {
      const days = Math.floor(seconds / 86400);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }

    // For older reviews, show date
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Get user initials for placeholder avatar
  const getUserInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="review-card">
      {/* Header: User info + rating */}
      <div className="review-card__header">
        <div className="review-card__user">
          <div className="review-card__avatar">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} />
            ) : (
              <div className="review-card__avatar-placeholder">
                {getUserInitials(user.name)}
              </div>
            )}
          </div>

          <div className="review-card__user-info">
            <div className="review-card__user-name">
              {user.name || 'Anonymous'}
            </div>
            <div className="review-card__meta">
              <StarRating rating={review.rating} size="small" />
              <span className="review-card__dot">•</span>
              <span className="review-card__date">{getTimeSince(review.createdAt)}</span>
              <span className="review-card__verified">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 0L8.5 5.5L14 7L8.5 8.5L7 14L5.5 8.5L0 7L5.5 5.5L7 0Z" fill="#FFD700"/>
                </svg>
                Verified Booking
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Photo (if exists) */}
      {review.photoUrl && (
        <div className="review-card__photo-container">
          <img
            src={review.photoUrl}
            alt="Review"
            className="review-card__photo"
            onClick={() => setShowFullImage(true)}
            loading="lazy"
          />
        </div>
      )}

      {/* Message */}
      <p className="review-card__message">{review.message}</p>

      {/* Lightbox for photo */}
      {showFullImage && review.photoUrl && (
        <div className="review-card__lightbox" onClick={() => setShowFullImage(false)}>
          <div className="review-card__lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="review-card__lightbox-close" onClick={() => setShowFullImage(false)}>
              ×
            </button>
            <img src={review.photoUrl} alt="Review full size" />
          </div>
        </div>
      )}
    </div>
  );
}
