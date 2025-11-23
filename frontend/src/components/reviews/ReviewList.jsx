import React, { useState, useEffect } from 'react';
import ReviewCard from './ReviewCard';
import StarRating from './StarRating';
import axios from '../../api/axios';
import '../../styles/reviewList.css';

/**
 * 📋 REVIEW LIST COMPONENT
 *
 * Fetches and displays all reviews for a business with sorting and pagination.
 *
 * Props:
 * - businessId: string - The business ID to fetch reviews for
 */
export default function ReviewList({ businessId }) {
  const [reviews, setReviews] = useState([]);
  const [sort, setSort] = useState('recent');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Stats from API
  const [avgRating, setAvgRating] = useState('0.0');
  const [totalReviews, setTotalReviews] = useState(0);
  const [photoReviewCount, setPhotoReviewCount] = useState(0);

  useEffect(() => {
    if (businessId) {
      loadReviews();
    }
  }, [businessId, sort]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`/reviews/business/${businessId}?sort=${sort}`);

      if (response.data.success) {
        setReviews(response.data.reviews || []);
        setAvgRating(response.data.avgRating || '0.0');
        setTotalReviews(response.data.totalReviews || 0);
        setPhotoReviewCount(response.data.photoReviewCount || 0);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
      setError('Failed to load reviews. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (newSort) => {
    setSort(newSort);
  };

  if (loading) {
    return (
      <div className="review-list">
        <div className="review-list__loading">
          <div className="review-list__spinner"></div>
          <p>Loading reviews...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="review-list">
        <div className="review-list__error">
          <p>{error}</p>
          <button className="review-list__retry-btn" onClick={loadReviews}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (reviews.length === 0) {
    return (
      <div className="review-list">
        <div className="review-list__empty">
          <div className="review-list__empty-icon">⭐</div>
          <h3>No reviews yet</h3>
          <p>Be the first to review! Your glow-up could inspire the next client ✨</p>
        </div>
      </div>
    );
  }

  return (
    <div className="review-list">
      {/* Rating Summary */}
      <div className="review-list__summary">
        <div className="review-list__rating-display">
          <div className="review-list__rating-large">★ {avgRating}</div>
          <div className="review-list__rating-meta">
            <StarRating rating={parseFloat(avgRating)} size="small" />
            <span className="review-list__rating-count">
              {totalReviews} review{totalReviews !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* FIX #2: "Real Results Shown" Badge */}
        {photoReviewCount >= 3 && (
          <div className="review-list__real-results-badge">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 0L9.5 6.5L16 8L9.5 9.5L8 16L6.5 9.5L0 8L6.5 6.5L8 0Z" fill="currentColor"/>
            </svg>
            Real Results Shown
          </div>
        )}
      </div>

      {/* Sort Filters */}
      <div className="review-list__filters">
        <button
          className={`review-list__filter-btn ${sort === 'recent' ? 'review-list__filter-btn--active' : ''}`}
          onClick={() => handleSortChange('recent')}
        >
          Most Recent
        </button>
        <button
          className={`review-list__filter-btn ${sort === 'highest' ? 'review-list__filter-btn--active' : ''}`}
          onClick={() => handleSortChange('highest')}
        >
          Highest Rated
        </button>
        <button
          className={`review-list__filter-btn ${sort === 'lowest' ? 'review-list__filter-btn--active' : ''}`}
          onClick={() => handleSortChange('lowest')}
        >
          Lowest Rated
        </button>
      </div>

      {/* Reviews */}
      <div className="review-list__items">
        {reviews.map((review) => (
          <ReviewCard key={review._id} review={review} />
        ))}
      </div>
    </div>
  );
}
