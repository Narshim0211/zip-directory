import React, { useState } from "react";
import { Link } from "react-router-dom";
import IdentityBadge from "../../components/SharedComponents/IdentityBadge";
import FollowButton from "../../components/FollowButton";
import SurveyEngagementBar from "../../components/engagement/SurveyEngagementBar";
import VerificationBadgeInline from "../../components/VerificationBadgeInline";
import v1Client from "../../api/v1";

/**
 * FeedSurveyCard - Survey card for visitor feed
 *
 * Follow state is now managed globally by FollowContext.
 * No more local follow state - all surveys from same user update together!
 *
 * OPTIMIZED with React.memo - prevents re-renders when props haven't changed
 */
const FeedSurveyCard = React.memo(function FeedSurveyCard({ survey }) {
  const [voting, setVoting] = useState(false);
  const [selected, setSelected] = useState(null);
  const [voted, setVoted] = useState(false);
  const [localSurvey, setLocalSurvey] = useState(survey);
  const [error, setError] = useState("");

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

  const totalVotes = localSurvey.totalVotes || 0;

  return (
    <article className="feed-card feed-card--survey">
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
        <div className="feed-card__results">
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
          onClick={submitVote}
          disabled={!selected || voting}
          className="feed-card__vote-btn"
        >
          {voting ? "Submitting..." : "Vote"}
        </button>
      )}

      {error && <p className="feed-card__error">{error}</p>}

      {/* Engagement metrics always visible */}
      <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #eee' }}>
        <SurveyEngagementBar surveyId={localSurvey._id} />
      </div>
    </article>
  );
});

export default FeedSurveyCard;
