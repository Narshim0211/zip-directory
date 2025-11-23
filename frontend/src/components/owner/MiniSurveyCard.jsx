import React from 'react';
import '../../styles/miniSurveyCard.css';

/**
 * MiniSurveyCard Component
 * Compact survey card for trending panels
 *
 * @param {Object} survey - Survey data
 * @param {string} variant - 'survey-of-day' | 'trending-today' | 'trending-week'
 * @param {number} rank - Ranking number (for trending week)
 * @param {function} onClick - Click handler
 */
const MiniSurveyCard = ({ survey, variant = 'default', rank, onClick }) => {
  if (!survey) return null;

  const { question, author, category, loveCount, totalVotes, _id } = survey;

  const handleClick = () => {
    if (onClick) {
      onClick(survey);
    } else {
      // Default: Navigate to survey or open modal
      // TODO: Implement navigation to full survey view
      console.log('Open survey:', _id);
    }
  };

  // Get display name
  const authorName = author?.name || author?.email?.split('@')[0] || 'Anonymous';
  const authorAvatar = author?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=9B5FFF&color=fff`;

  return (
    <div
      className={`mini-survey-card mini-survey-card--${variant}`}
      onClick={handleClick}
      data-rank={rank}
      data-premium={author?.isPremium ? 'true' : 'false'}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && handleClick()}
    >
      {/* Rank Badge (for trending week) */}
      {rank && (
        <div className="mini-survey-card__rank">#{rank}</div>
      )}

      {/* Author Header */}
      <div className="mini-survey-card__header">
        <img
          src={authorAvatar}
          alt={authorName}
          className="mini-survey-card__avatar"
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=9B5FFF&color=fff`;
          }}
        />
        <div className="mini-survey-card__author">
          <span className="mini-survey-card__author-name">
            @{authorName}
            {author?.isPremium && (
              <span className="mini-survey-card__premium-badge" title="Premium Member">⭐</span>
            )}
          </span>
        </div>
      </div>

      {/* Question */}
      <p className="mini-survey-card__question" title={question}>
        {question}
      </p>

      {/* Footer with Category & Stats */}
      <div className="mini-survey-card__footer">
        {category && (
          <span className="mini-survey-card__category">
            {category}
          </span>
        )}
        <div className="mini-survey-card__stats">
          <span title="Loves">💜 {loveCount || 0}</span>
          <span title="Total Votes">📊 {totalVotes || 0}</span>
        </div>
      </div>
    </div>
  );
};

export default MiniSurveyCard;
