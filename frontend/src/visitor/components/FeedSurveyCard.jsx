import React from "react";

export default function FeedSurveyCard({ survey }) {
  return (
    <article className="feed-card feed-card--survey">
      <header className="feed-card__header">
        <div>
          <h3>{survey.author?.name || "Community"}</h3>
          <p>{new Date(survey.createdAt).toLocaleString()}</p>
        </div>
      </header>
      <p className="feed-card__content">{survey.question}</p>
      <div className="feed-card__options">
        {(survey.options || []).map((opt) => (
          <span key={opt.value} className="feed-card__option">
            {opt.label}
          </span>
        ))}
      </div>
    </article>
  );
}
