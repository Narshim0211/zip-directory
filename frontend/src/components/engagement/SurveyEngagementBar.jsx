import React, { useEffect, useState } from 'react';
import { getSurveyEngagement, toggleReaction, sendImpression } from '../../api/engagementApi';
import { useImpressionTracking } from '../../hooks/useImpressionTracking';
import './EngagementBar.css';

/**
 * SurveyEngagementBar Component
 * Shows survey engagement metrics: views, responses, reactions
 * Simple X/Twitter-style compact bar with PROPER toggle behavior
 * NO duplication - used ONLY on survey cards
 */
const SurveyEngagementBar = ({ surveyId, onReact }) => {
  const [engagement, setEngagement] = useState({
    views: 0,
    responses: 0,
    reactions: { like: 0, love: 0, total: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [userReaction, setUserReaction] = useState(null);

  // Track impression when component enters viewport
  const handleImpression = async (contentType, contentId) => {
    try {
      const response = await sendImpression(contentType, contentId);
      console.log('✅ [Impression] Sent successfully:', response);

      // Update local view count
      if (response?.data?.impressions !== undefined) {
        setEngagement(prev => ({
          ...prev,
          views: response.data.impressions
        }));
      }
    } catch (err) {
      console.error('❌ [Impression] Failed to send:', err);
    }
  };

  const cardRef = useImpressionTracking(surveyId, 'survey', handleImpression);

  useEffect(() => {
    if (!surveyId) {
      setLoading(false);
      return;
    }

    fetchEngagement();
  }, [surveyId]);

  const fetchEngagement = async () => {
    try {
      setLoading(true);
      const response = await getSurveyEngagement(surveyId);

      // Handle response - API may return { success, data } or just data
      const data = response?.data || response;

      if (data) {
        setEngagement({
          views: data.views ?? 0,
          reactions: {
            like: data.reactions?.like ?? 0,
            love: data.reactions?.love ?? 0,
            total: (data.reactions?.like ?? 0) + (data.reactions?.love ?? 0)
          },
          responses: data.responses ?? 0
        });
        // IMPORTANT: Set user's current reaction from backend
        setUserReaction(data.userReaction || null);
      }
    } catch (err) {
      console.error('Error fetching survey engagement:', err);
      // Set defaults on error
      setEngagement({
        views: 0,
        responses: 0,
        reactions: { like: 0, love: 0, total: 0 }
      });
      setUserReaction(null);
    } finally {
      setLoading(false);
    }
  };

  const handleReaction = async (reactionType) => {
    console.log('🔵 [Survey] handleReaction called:', { surveyId, reactionType, currentUserReaction: userReaction });
    try {
      // Call toggle API - backend handles add/remove/switch logic
      console.log('🔵 [Survey] Calling toggleReaction API...');
      const response = await toggleReaction('survey', surveyId, reactionType);
      console.log('🟢 [Survey] API response received:', response);

      // Handle response - API returns { success, data }
      const data = response?.data || response;
      console.log('🟢 [Survey] Extracted data:', data);

      if (data) {
        // Update UI with server response (no optimistic updates - use real data)
        console.log('🟢 [Survey] Updating state with:', {
          userReaction: data.userReaction,
          reactions: data.reactions
        });
        setUserReaction(data.userReaction); // null, 'like', or 'love'
        setEngagement(prev => ({
          ...prev,
          reactions: {
            like: data.reactions?.like ?? 0,
            love: data.reactions?.love ?? 0,
            total: data.reactions?.total ?? 0
          }
        }));

        if (onReact) onReact(data.userReaction);
      } else {
        console.warn('⚠️ [Survey] No data in response');
      }
    } catch (err) {
      console.error('🔴 [Survey] Error toggling reaction:', err);
      console.error('🔴 [Survey] Error details:', err.response?.data || err.message);
      // Refresh to get accurate server state on error
      await fetchEngagement();
    }
  };

  if (!surveyId) return null;
  
  if (loading) {
    return <div className="engagement-bar loading">Loading...</div>;
  }

  return (
    <div ref={cardRef} className="engagement-bar survey">
      <div className="engagement-stat">
        <span className="stat-icon">👁</span>
        <span className="stat-value">{engagement.views}</span>
      </div>
      
      <div className="engagement-divider">•</div>
      
      <div className="engagement-stat">
        <span className="stat-icon">💬</span>
        <span className="stat-value">{engagement.responses}</span>
        <span className="stat-label">responses</span>
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

export default SurveyEngagementBar;
