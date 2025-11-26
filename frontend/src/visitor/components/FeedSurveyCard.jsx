import React, { useState } from "react";
import { Link } from "react-router-dom";
import IdentityBadge from "../../components/SharedComponents/IdentityBadge";
import FollowButton from "../../components/FollowButton";
import SurveyEngagementBar from "../../components/engagement/SurveyEngagementBar";
import VerificationBadgeInline from "../../components/VerificationBadgeInline";
import SurveyOfTheDayBadge from "../../components/SurveyOfTheDayBadge";
import CommentSection from "../../components/CommentSection";
import { toggleReaction } from "../../api/engagementApi";
import { useAuth } from "../../context/AuthContext";
import v1Client from "../../api/v1";
import "./../../styles/loveFeed.css";
import "./../../styles/feedAnimations.css";

/**
 * FeedSurveyCard - Survey card for visitor feed
 *
 * Follow state is now managed globally by FollowContext.
 * No more local follow state - all surveys from same user update together!
 *
 * ENHANCED: Now supports both poll and love-only survey types
 * - poll: traditional multi-option voting (existing behavior)
 * - love-only: single Love button with instant feedback
 *
 * PHASE 2: Added ripple reward animations on vote/love actions
 * PHASE 3: Added visual hierarchy - follow glow and premium orbit
 * PHASE 4: Added Survey of the Day badge for featured surveys
 *
 * OPTIMIZED with React.memo - prevents re-renders when props haven't changed
 */
const FeedSurveyCard = React.memo(function FeedSurveyCard({ survey }) {
  // Get current user from AuthContext
  const { user: currentUser } = useAuth();

  // Determine visual hierarchy classes
  const isFollowed = survey._isFollowed || false;
  const isPremium = survey._isPremium || (survey.author?.isPremium) || false;
  const isSurveyOfTheDay = survey._isSurveyOfTheDay || false;
  const [voting, setVoting] = useState(false);
  const [selected, setSelected] = useState(null);
  const [voted, setVoted] = useState(false);
  const [localSurvey, setLocalSurvey] = useState(survey);
  const [error, setError] = useState("");

  // Love-only state
  const [userReaction, setUserReaction] = useState(null);
  const [loveReactions, setLoveReactions] = useState({
    like: 0,
    love: 0,
    total: 0
  });

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

  const submitVote = async () => {
    if (!selected || voting) return;

    setVoting(true);
    setError("");

    try {
      const response = await v1Client.visitor.surveys.vote(localSurvey._id, selected);

      if (response?.success && response?.survey) {
        setLocalSurvey(response.survey);
        setVoted(true);
        setError("");
      }
    } catch (err) {
      if (err.response?.status === 409) {
        setError("You already voted on this survey");
        setVoted(true);
      } else {
        setError(err.response?.data?.message || "Failed to submit vote");
      }
    } finally {
      setVoting(false);
    }
  };

  // Handle Love reaction for love-only surveys
  const handleLove = async () => {
    if (voting || userReaction === 'love') return; // Already loved

    setVoting(true);
    setError("");

    try {
      const response = await toggleReaction('survey', localSurvey._id, 'love');
      const data = response?.data || response;

      if (data) {
        setUserReaction(data.userReaction);
        setLoveReactions(data.reactions || { like: 0, love: 0, total: 0 });
        setVoted(true);
        setError("");
      }
    } catch (err) {
      console.error('Error loving survey:', err);
      setError(err.response?.data?.message || "Failed to submit Love");
    } finally {
      setVoting(false);
    }
  };

  const totalVotes = localSurvey.totalVotes || 0;
  const surveyType = localSurvey.surveyType || 'poll';

  // LOVE-ONLY SURVEY RENDERING
  if (surveyType === 'love-only') {
    const lovePercentage = loveReactions.total > 0
      ? Math.round((loveReactions.love / loveReactions.total) * 100)
      : 0;
    const yourImpact = loveReactions.total > 0 && userReaction === 'love'
      ? Math.round((1 / loveReactions.total) * 100)
      : 0;

    // Build dynamic class names for visual hierarchy
    const cardClasses = `feed-card feed-card--love-only ${
      isFollowed ? 'feed-card--followed' : ''
    } ${
      isPremium ? 'feed-card--premium' : ''
    }`.trim();

    return (
      <article className={cardClasses}>
        {/* Premium orbit effect */}
        {isPremium && <div className="premium-orbit"></div>}

        {/* Survey of the Day badge */}
        {isSurveyOfTheDay && (
          <div style={{ marginBottom: '12px' }}>
            <SurveyOfTheDayBadge />
          </div>
        )}

        <header className="feed-card__header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Link
                  to={`/profile/${survey.author?._id}`}
                  state={{ from: 'feed' }}
                  style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}
                >
                  <IdentityBadge identity={survey.identity} author={survey.author} />
                  {survey.author?.role === 'owner' && survey.business?.verificationStatus && (
                    <VerificationBadgeInline status={survey.business.verificationStatus} />
                  )}
                </Link>
                <span style={{
                  display: 'inline-block',
                  padding: '2px 8px',
                  fontSize: '11px',
                  fontWeight: '600',
                  borderRadius: '4px',
                  backgroundColor: survey.author?.role === 'owner' ? '#dbeafe' : '#f3e8ff',
                  color: survey.author?.role === 'owner' ? '#1e40af' : '#6b21a8',
                  textTransform: 'uppercase'
                }}>
                  {survey.author?.role === 'owner' ? 'Owner' : 'Visitor'}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                {new Date(localSurvey.createdAt).toLocaleString()}
              </p>
            </div>
            <FollowButton
              targetId={survey.author?._id}
              targetType={survey.author?.role || 'owner'}
            />
          </div>
        </header>

        {/* Love-only Question */}
        <h2 className="love-question">{localSurvey.question}</h2>

        {/* Image if provided */}
        {localSurvey.imageUrl && (
          <div className="love-image-container">
            <img src={localSurvey.imageUrl} alt="Survey visual" className="love-image" />
          </div>
        )}

        {/* Love Button or Results */}
        {!voted && userReaction !== 'love' ? (
          <button
            className={`love-button ripple-container ${voting ? 'love-button--voting' : ''}`}
            onClick={(e) => {
              createRipple(e);
              handleLove();
            }}
            disabled={voting}
          >
            {voting ? '💗 Loving...' : '♥ Love'}
          </button>
        ) : (
          <div className="love-results fade-in slide-up">
            <div className="love-stats">
              <p className="love-percentage">{lovePercentage}%</p>
              <p className="love-label">loved this</p>
            </div>
            {yourImpact > 0 && (
              <p className="your-impact">+{yourImpact}% from your vote</p>
            )}

            {/* Author Note (if provided) */}
            {localSurvey.authorNote && (
              <div className="author-note">
                <p className="author-note__text">"{localSurvey.authorNote}"</p>
                <p className="author-note__author">— {survey.author?.firstName || 'Author'}</p>
              </div>
            )}
          </div>
        )}

        {error && <p className="feed-card__error">{error}</p>}

        {/* Engagement metrics */}
        <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #eee' }}>
          <SurveyEngagementBar
            surveyId={localSurvey._id}
          />
        </div>

        {/* Comment Section */}
        <CommentSection contentType="survey" contentId={localSurvey._id} />
      </article>
    );
  }

  // TRADITIONAL POLL SURVEY RENDERING (existing behavior)
  // Build dynamic class names for visual hierarchy
  const cardClasses = `feed-card feed-card--survey ${
    isFollowed ? 'feed-card--followed' : ''
  } ${
    isPremium ? 'feed-card--premium' : ''
  }`.trim();

  return (
    <article className={cardClasses}>
      {/* Premium orbit effect */}
      {isPremium && <div className="premium-orbit"></div>}

      {/* Survey of the Day badge */}
      {isSurveyOfTheDay && (
        <div style={{ marginBottom: '12px' }}>
          <SurveyOfTheDayBadge />
        </div>
      )}

      <header className="feed-card__header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <IdentityBadge identity={survey.identity} author={survey.author} />
                {survey.author?.role === 'owner' && survey.business?.verificationStatus && (
                  <VerificationBadgeInline status={survey.business.verificationStatus} />
                )}
              </div>
              <span style={{
                display: 'inline-block',
                padding: '2px 8px',
                fontSize: '11px',
                fontWeight: '600',
                borderRadius: '4px',
                backgroundColor: survey.author?.role === 'owner' ? '#dbeafe' : '#f3e8ff',
                color: survey.author?.role === 'owner' ? '#1e40af' : '#6b21a8',
                textTransform: 'uppercase'
              }}>
                {survey.author?.role === 'owner' ? 'Owner' : 'Visitor'}
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>{new Date(localSurvey.createdAt).toLocaleString()}</p>
          </div>
          <FollowButton
            targetId={survey.author?._id}
            targetType={survey.author?.role || 'owner'}
          />
        </div>
      </header>
      <p className="feed-card__content">{localSurvey.question}</p>

      {!voted ? (
        <div className="feed-card__options">
          {(localSurvey.options || []).map((opt) => (
            <label key={opt.id} className="feed-card__option-label">
              <input
                type="radio"
                name={`survey-${localSurvey._id}`}
                value={opt.id}
                checked={selected === opt.id}
                onChange={() => setSelected(opt.id)}
                disabled={voting}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      ) : (
        <div className="feed-card__results vote-success">
          {(localSurvey.options || []).map((opt) => {
            const percentage = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
            return (
              <div key={opt.id} className="feed-card__result-option">
                <div className="feed-card__result-label">
                  <span>{opt.label}</span>
                  <span>{percentage}%</span>
                </div>
                <div className="feed-card__result-bar">
                  <div
                    className="feed-card__result-fill"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
          <p className="feed-card__total-votes">Total votes: {totalVotes}</p>
        </div>
      )}

      {!voted && (
        <button
          onClick={(e) => {
            createRipple(e);
            submitVote();
          }}
          disabled={!selected || voting}
          className="feed-card__vote-btn ripple-container"
        >
          {voting ? "Submitting..." : "Vote"}
        </button>
      )}

      {error && <p className="feed-card__error">{error}</p>}

      {/* Engagement metrics always visible */}
      <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #eee' }}>
        <SurveyEngagementBar
          surveyId={localSurvey._id}
        />
      </div>

      {/* Comment Section */}
      <CommentSection contentType="survey" contentId={localSurvey._id} />
    </article>
  );
});

export default FeedSurveyCard;
