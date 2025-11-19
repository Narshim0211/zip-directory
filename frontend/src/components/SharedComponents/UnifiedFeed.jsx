import React, { useEffect, useState } from 'react';
import FeedPostCard from '../../visitor/components/FeedPostCard';
import FeedSurveyCard from '../../visitor/components/FeedSurveyCard';
import ErrorBoundary from './ErrorBoundary';
import '../../styles/visitorHomePage.css';

/**
 * UnifiedFeed Component
 * Role-agnostic feed component that displays posts and surveys
 * Can be used by both visitors and owners
 * 
 * @param {Object} props
 * @param {Array} props.feedItems - Array of feed items {type: 'post'|'survey', data: {}}
 * @param {boolean} props.loading - Loading state
 * @param {string} props.error - Error message
 * @param {Array} props.followingList - List of followed users for follow button state
 * @param {string} props.role - 'visitor' or 'owner'
 * @param {string} props.emptyMessage - Custom message when feed is empty
 */
const UnifiedFeed = ({ 
  feedItems = [], 
  loading = false, 
  error = null,
  followingList = [],
  role = 'visitor',
  emptyMessage = 'No posts or surveys yet. Start following accounts to see their updates!'
}) => {
  
  if (loading) {
    return (
      <div className="unified-feed__loading">
        <p>Loading your feed...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="unified-feed__error">
        <p>❌ {error}</p>
      </div>
    );
  }

  if (!feedItems || feedItems.length === 0) {
    return (
      <div className="unified-feed__empty">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="unified-feed">
        {feedItems.map((item, index) => {
          const itemKey = item.data?._id || item.data?.id || `${item.type}-${index}`;
          
          try {
            if (item.type === 'post') {
              return (
                <ErrorBoundary key={itemKey}>
                  <FeedPostCard
                    post={item.data}
                    followingOwners={followingList}
                  />
                </ErrorBoundary>
              );
            } else if (item.type === 'survey') {
              return (
                <ErrorBoundary key={itemKey}>
                  <FeedSurveyCard
                    survey={item.data}
                    followingOwners={followingList}
                  />
                </ErrorBoundary>
              );
            }
            return null;
          } catch (err) {
            console.error('Error rendering feed item:', err);
            return null;
          }
        })}
      </div>
    </ErrorBoundary>
  );
};

export default UnifiedFeed;
