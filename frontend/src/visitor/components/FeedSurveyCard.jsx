import React, { useState } from "react";
import IdentityBadge from "../../components/Shared/IdentityBadge";
import FollowButton from "../../components/FollowButton";
import v1Client from "../../api/v1";

export default function FeedSurveyCard({ survey, followingOwners = [] }) {
  const [voting, setVoting] = useState(false);
  const [selected, setSelected] = useState(null);
  const [voted, setVoted] = useState(false);
  const [localSurvey, setLocalSurvey] = useState(survey);
  const [error, setError] = useState("");

  const isFollowing = Boolean(followingOwners.find((owner) => String(owner._id) === String(survey.author?._id)));

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
            <IdentityBadge identity={survey.identity} author={survey.author} />
            <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>{new Date(localSurvey.createdAt).toLocaleString()}</p>
          </div>
          {survey.identity && (
            <FollowButton
              targetId={survey.identity.profileId}
              targetType={survey.identity.role}
              initialFollowing={isFollowing}
            />
          )}
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
    </article>
  );
}
