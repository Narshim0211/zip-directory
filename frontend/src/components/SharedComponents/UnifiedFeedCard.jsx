import React from 'react';
import { Link } from 'react-router-dom';
import RoleBadge from './RoleBadge';
import ErrorBoundary from './ErrorBoundary';
import './UnifiedFeedCard.css';

/**
 * UnifiedFeedCard Component
 *
 * Displays a unified card for posts and surveys from both Owners and Visitors
 * Shows role badges to clearly distinguish between "Salon Owner" and "Visitor"
 *
 * Props:
 * - item: object - Feed item with { type, authorRole, author, content, ... }
 * - onVote: function - Callback for survey voting (optional)
 * - onReact: function - Callback for post reactions (optional)
 */
const UnifiedFeedCard = ({ item, onVote, onReact }) => {
  if (!item) return null;

  const { type, authorRole, author, createdAt } = item;

  // Determine profile link based on role
  const profileSlug = author?.slug || author?.handle;
  const profileLink = profileSlug ? (authorRole === 'owner' ? `/o/${profileSlug}` : `/v/${profileSlug}`) : null;

  // Format timestamp
  const timeAgo = createdAt ? new Date(createdAt).toLocaleDateString() : '';

  return (
    <ErrorBoundary>
      <div className="unified-feed-card">
        {/* Header */}
        <div className="unified-feed-card__header">
          <div className="unified-feed-card__author">
            {/* Avatar */}
            {profileLink ? (
              <Link to={profileLink} className="unified-feed-card__avatar">
                <img
                  src={author?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(author?.firstName || 'U')}`}
                  alt={`${author?.firstName} ${author?.lastName}`}
                />
              </Link>
            ) : (
              <div className="unified-feed-card__avatar">
                <img
                  src={author?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(author?.firstName || 'U')}`}
                  alt={`${author?.firstName} ${author?.lastName}`}
                />
              </div>
            )}

            {/* Author info */}
            <div className="unified-feed-card__author-info">
              <div className="unified-feed-card__author-name">
                {profileLink ? (
                  <Link to={profileLink}>
                    {author?.displayName || `${author?.firstName || ''} ${author?.lastName || ''}`.trim()}
                  </Link>
                ) : (
                  <span>{author?.displayName || `${author?.firstName || ''} ${author?.lastName || ''}`.trim()}</span>
                )}
              </div>
              <div className="unified-feed-card__meta">
                <RoleBadge role={authorRole} size="small" />
                <span className="unified-feed-card__timestamp">{timeAgo}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="unified-feed-card__content">
          {type === 'post' && <PostContent item={item} onReact={onReact} />}
          {type === 'survey' && <SurveyContent item={item} onVote={onVote} />}
        </div>
      </div>
    </ErrorBoundary>
  );
};

/**
 * PostContent - Displays post-specific content
 */
const PostContent = ({ item, onReact }) => {
  const { content, media, reactions, commentsCount } = item;

  return (
    <>
      <p className="unified-feed-card__text">{content}</p>

      {/* Media */}
      {media && media.length > 0 && (
        <div className="unified-feed-card__media">
          {media.map((url, idx) => (
            <img key={idx} src={url} alt={`Media ${idx + 1}`} />
          ))}
        </div>
      )}

      {/* Engagement */}
      <div className="unified-feed-card__engagement">
        <button
          className="unified-feed-card__action"
          onClick={() => onReact && onReact(item._id, 'like')}
        >
          ❤️ {reactions?.likes || reactions?.like?.length || 0}
        </button>
        <button className="unified-feed-card__action">
          💬 {commentsCount || 0}
        </button>
      </div>
    </>
  );
};

/**
 * SurveyContent - Displays survey-specific content
 */
const SurveyContent = ({ item, onVote }) => {
  const { question, options, totalVotes, category } = item;

  return (
    <>
      {category && <div className="unified-feed-card__category">{category}</div>}
      <h3 className="unified-feed-card__survey-question">{question}</h3>

      {/* Options */}
      <div className="unified-feed-card__survey-options">
        {options && options.map((option) => {
          const percentage = totalVotes > 0 ? ((option.votes / totalVotes) * 100).toFixed(1) : 0;

          return (
            <button
              key={option.id}
              className="unified-feed-card__survey-option"
              onClick={() => onVote && onVote(item._id, option.id)}
            >
              <div className="unified-feed-card__survey-option-bar" style={{ width: `${percentage}%` }} />
              <div className="unified-feed-card__survey-option-content">
                <span>{option.label}</span>
                <span>{percentage}%</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Total votes */}
      <div className="unified-feed-card__survey-total">
        {totalVotes || 0} {totalVotes === 1 ? 'vote' : 'votes'}
      </div>
    </>
  );
};

export default UnifiedFeedCard;
