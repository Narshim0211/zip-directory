import React from 'react';

const AnalyticsOverviewCard = ({ label, value, caption, tone = 'blue' }) => {
  return (
    <div className={`analytics-card analytics-card--${tone}`}>
      <div className="analytics-card__label">{label}</div>
      <div className="analytics-card__value">{typeof value === 'number' ? value.toLocaleString() : value}</div>
      {caption && <div className="analytics-card__caption">{caption}</div>}
    </div>
  );
};

export default AnalyticsOverviewCard;
