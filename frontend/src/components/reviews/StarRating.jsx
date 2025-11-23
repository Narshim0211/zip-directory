import React from 'react';
import '../../styles/starRating.css';

/**
 * ⭐ STAR RATING COMPONENT
 *
 * Reusable component for displaying and inputting star ratings.
 *
 * Props:
 * - rating: number (0-5) - Current rating value
 * - onChange: function - Callback when rating changes (null for read-only)
 * - size: string - 'small', 'medium', or 'large'
 *
 * Usage:
 * - Read-only: <StarRating rating={4.5} size="medium" />
 * - Editable: <StarRating rating={rating} onChange={setRating} size="large" />
 */
export default function StarRating({ rating, onChange, size = 'medium' }) {
  const stars = [1, 2, 3, 4, 5];
  const isEditable = onChange !== null && onChange !== undefined;

  const handleClick = (value) => {
    if (isEditable) {
      onChange(value);
    }
  };

  const handleKeyPress = (e, value) => {
    if (isEditable && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onChange(value);
    }
  };

  return (
    <div className={`star-rating star-rating--${size}`} role="img" aria-label={`Rating: ${rating} out of 5 stars`}>
      {stars.map(star => {
        const isFilled = rating >= star;
        const isHalf = rating >= star - 0.5 && rating < star;

        return (
          <span
            key={star}
            className={`star ${isFilled ? 'star--filled' : isHalf ? 'star--half' : 'star--empty'} ${isEditable ? 'star--clickable' : ''}`}
            onClick={() => handleClick(star)}
            onKeyPress={(e) => handleKeyPress(e, star)}
            tabIndex={isEditable ? 0 : -1}
            role={isEditable ? 'button' : 'presentation'}
            aria-label={isEditable ? `Rate ${star} stars` : undefined}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}
