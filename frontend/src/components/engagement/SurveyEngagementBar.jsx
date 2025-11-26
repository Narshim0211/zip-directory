import { useEffect, useState } from 'react';
import { getSurveyEngagement, toggleReaction } from '../../api/engagementApi';
import './EngagementBar.css';
import '../../styles/feedAnimations.css';

/**
 * SurveyEngagementBar Component
 * Shows survey engagement metrics: views, responses, reactions
 * Simple X/Twitter-style compact bar with PROPER toggle behavior
 * NO duplication - used ONLY on survey cards
 * PHASE 2: Added ripple reward animations on reaction clicks
 */
const SurveyEngagementBar = ({ surveyId, onReact }) => {
  const [engagement, setEngagement] = useState({
    views: 0,
    responses: 0,
    reactions: { like: 0, love: 0, total: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [userReaction, setUserReaction] = useState(null);

  /**
   * Create ripple effect on button click
   * @param {MouseEvent} event - Click event
   */
  const createRipple = (event) => {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.classList.add('ripple');

    button.appendChild(ripple);

    // Remove ripple after animation completes
    setTimeout(() => {
      ripple.remove();
    }, 600);
  };

  // Track impression when component enters viewport
  // TEMPORARILY DISABLED - causing infinite loop
  // const handleImpression = async (contentType, contentId) => {
  //   try {
  //     const response = await sendImpression(contentType, contentId);
  //     console.log('✅ [Impression] Sent successfully:', response);

  //     // Update local view count
  //     if (response?.data?.impressions !== undefined) {
  //       setEngagement(prev => ({
  //         ...prev,
  //         views: response.data.impressions
  //       }));
  //     }
  //   } catch (err) {
  //     console.error('❌ [Impression] Failed to send:', err);
  //   }
  // };

  // const cardRef = useImpressionTracking(surveyId, 'survey', handleImpression);
  const cardRef = null; // Disabled impression tracking

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

  useEffect(() => {
    if (!surveyId) {
      setLoading(false);
      return;
    }

    fetchEngagement();
  }, [surveyId]); // fetchEngagement is now stable since it's defined before useEffect

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
          className={`reaction-btn ripple-container ${userReaction === 'like' ? 'active reaction-btn--liked' : ''}`}
          onClick={(e) => {
            createRipple(e);
            handleReaction('like');
          }}
          title="Like"
        >
          👍 {engagement.reactions.like}
        </button>

        <button
          className={`reaction-btn ripple-container ${userReaction === 'love' ? 'active reaction-btn--loved' : ''}`}
          onClick={(e) => {
            createRipple(e);
            handleReaction('love');
          }}
          title="Love"
        >
          ❤️ {engagement.reactions.love}
        </button>
      </div>
    </div>
  );
};

export default SurveyEngagementBar;
