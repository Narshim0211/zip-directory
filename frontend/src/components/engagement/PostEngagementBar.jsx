import React, { useEffect, useState } from 'react';
import { postAnalytics } from '../../api/analytics';
import './EngagementBar.css';

/**
 * PostEngagementBar Component
 * Shows owner post engagement metrics: views, reactions
 * Simple X/Twitter-style compact bar
 * NO duplication - used ONLY on post cards
 */
const PostEngagementBar = ({ postId, onReact }) => {
  const [engagement, setEngagement] = useState({
    views: 0,
    reactions: { like: 0, love: 0, total: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [userReaction, setUserReaction] = useState(null);

  useEffect(() => {
    if (!postId) {
      setLoading(false);
      return;
    }

    fetchEngagement();
  }, [postId]);

  const fetchEngagement = async () => {
    try {
      setLoading(true);
      const response = await postAnalytics.getEngagement(postId);
      
      if (response.success) {
        setEngagement(response.data);
      }
    } catch (err) {
      console.error('Error fetching post engagement:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReaction = async (reactionType) => {
    try {
      // Optimistic update
      setUserReaction(reactionType);
      
      const response = await postAnalytics.addReaction(postId, reactionType);
      
      if (response.success) {
        setEngagement(response.data);
        if (onReact) onReact(reactionType);
      }
    } catch (err) {
      console.error('Error adding reaction:', err);
      // Revert optimistic update on error
      setUserReaction(null);
    }
  };

  if (!postId) return null;
  
  if (loading) {
    return <div className="engagement-bar loading">Loading...</div>;
  }

  return (
    <div className="engagement-bar post">
      <div className="engagement-stat">
        <span className="stat-icon">👁</span>
        <span className="stat-value">{engagement.views}</span>
      </div>
      
      <div className="engagement-divider">•</div>
      
      <div className="engagement-reactions">
        <button
          className={`reaction-btn ${userReaction === 'like' ? 'active' : ''}`}
          onClick={() => handleReaction('like')}
          title="Like"
        >
          👍 {engagement.reactions.like}
        </button>
        
        <button
          className={`reaction-btn ${userReaction === 'love' ? 'active' : ''}`}
          onClick={() => handleReaction('love')}
          title="Love"
        >
          ❤️ {engagement.reactions.love}
        </button>
      </div>
    </div>
  );
};

export default PostEngagementBar;
