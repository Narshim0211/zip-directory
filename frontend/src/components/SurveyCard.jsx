import React, { useMemo, useState } from 'react';
import api from '../api/axios';
import FollowButton from './FollowButton';
import '../styles/surveyCard.css';

const SurveyCard = ({ survey, onVote, showFollow, following, onFollow }) => {
  const [busy, setBusy] = useState(false);

  const totalVotes = useMemo(() => {
    if (typeof survey.totalVotes === 'number' && survey.totalVotes > 0) return survey.totalVotes;
    return survey.options.reduce((sum, opt) => sum + (opt.votes || 0), 0);
  }, [survey]);

  const surveyId = survey._id || survey.id;
  const handleVote = async (index) => {
    if (busy) return;
    setBusy(true);
    try {
      const { data } = await api.post(`/surveys/${surveyId}/vote`, { optionIndex: index });
      onVote?.(data);
    } catch (error) {
      alert('Unable to submit vote.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="survey-card">
      <div className="survey-card__header">
        <div>
          <strong>{survey.question}</strong>
          {survey.category && (
            <span className="survey-card__category">{survey.category}</span>
          )}
          <span className="survey-card__meta">
            by {survey.author?.name || 'Guest'} · {new Date(survey.createdAt).toLocaleDateString()}
          </span>
        </div>
        {showFollow && survey.author?._id && (
          <FollowButton
            targetId={survey.author._id}
            initialFollowing={following}
            onChange={(id, value) => onFollow?.(id, value)}
          />
        )}
      </div>
      <div className="survey-card__options">
        {survey.options.map((option, index) => {
          const percent = totalVotes ? Math.round(((option.votes || 0) / totalVotes) * 100) : 0;
          return (
            <div key={option.text} className="survey-option">
              <button type="button" onClick={() => handleVote(index)} disabled={busy}>
                {option.text}
              </button>
              <div className="survey-option__bar">
                <span style={{ width: `${percent}%` }} />
              </div>
              <div className="survey-option__meta">
                <span>{percent}%</span>
                <span>{option.votes || 0} votes</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SurveyCard;
