import React from 'react';
import '../styles/surveyOfTheDayBadge.css';

/**
 * SurveyOfTheDayBadge Component
 *
 * Displays a prominent "Survey of the Day" badge with shimmer effect
 * Used to highlight the featured survey in the feed
 *
 * Features:
 * - Shimmer animation (eye-catching)
 * - Gold gradient colors (premium feel)
 * - Responsive design
 * - Accessible (reduced motion support)
 */
const SurveyOfTheDayBadge = () => {
  return (
    <div className="survey-of-the-day-badge shimmer">
      <span className="badge-icon">⭐</span>
      <span className="badge-text">Survey of the Day</span>
    </div>
  );
};

export default SurveyOfTheDayBadge;
