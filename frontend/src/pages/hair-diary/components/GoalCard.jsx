import React from 'react';

/**
 * GoalCard - Beautiful card for selecting a hair goal
 */
const GoalCard = ({ goal, isSelected, onClick }) => {
  return (
    <div
      className={`goal-card ${isSelected ? 'goal-card--selected' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && onClick()}
    >
      <span className="goal-card__emoji">{goal.emoji}</span>
      <h3 className="goal-card__title">{goal.title}</h3>
      <p className="goal-card__description">{goal.description}</p>
    </div>
  );
};

export default GoalCard;
