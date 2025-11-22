import React from 'react';
import './PlanSelectionCard.css';

const PlanSelectionCard = ({ onSelectPlan, currentPlan }) => {
  return (
    <div className="plan-selection">
      <div className="plan-selection__header">
        <h2>Choose Your Listing Type</h2>
        <p>Select how you want to appear in the directory</p>
      </div>

      <div className="plan-selection__cards">
        {/* FREE LISTING CARD */}
        <div
          className={`plan-card ${currentPlan === 'free' ? 'plan-card--selected' : ''}`}
          onClick={() => onSelectPlan('free')}
        >
          <div className="plan-card__badge plan-card__badge--free">Free</div>
          <h3>Free Listing</h3>
          <div className="plan-card__price">
            <span className="plan-card__amount">$0</span>
            <span className="plan-card__period">/month</span>
          </div>
          <ul className="plan-card__features">
            <li className="plan-card__feature plan-card__feature--included">
              <span className="plan-card__icon">✓</span>
              <span>Basic business profile</span>
            </li>
            <li className="plan-card__feature plan-card__feature--included">
              <span className="plan-card__icon">✓</span>
              <span>Public directory listing</span>
            </li>
            <li className="plan-card__feature plan-card__feature--included">
              <span className="plan-card__icon">✓</span>
              <span>Upload photos</span>
            </li>
            <li className="plan-card__feature plan-card__feature--excluded">
              <span className="plan-card__icon">✗</span>
              <span>Online booking & payments</span>
            </li>
            <li className="plan-card__feature plan-card__feature--excluded">
              <span className="plan-card__icon">✗</span>
              <span>Premium verification badge</span>
            </li>
            <li className="plan-card__feature plan-card__feature--excluded">
              <span className="plan-card__icon">✗</span>
              <span>Priority search placement</span>
            </li>
          </ul>
          <button
            className="plan-card__button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectPlan('free');
            }}
          >
            Choose Free
          </button>
        </div>

        {/* PREMIUM LISTING CARD */}
        <div
          className={`plan-card plan-card--premium ${currentPlan === 'premium' ? 'plan-card--selected' : ''}`}
          onClick={() => onSelectPlan('premium')}
        >
          <div className="plan-card__badge plan-card__badge--premium">Recommended</div>
          <h3>Premium Listing</h3>
          <div className="plan-card__price">
            <span className="plan-card__amount">$29</span>
            <span className="plan-card__period">/month</span>
          </div>
          <ul className="plan-card__features">
            <li className="plan-card__feature plan-card__feature--premium">
              <span className="plan-card__icon">✓</span>
              <span>Everything in Free, plus:</span>
            </li>
            <li className="plan-card__feature plan-card__feature--premium">
              <span className="plan-card__icon">💳</span>
              <span>Accept online payments</span>
            </li>
            <li className="plan-card__feature plan-card__feature--premium">
              <span className="plan-card__icon">💎</span>
              <span>Premium verified badge</span>
            </li>
            <li className="plan-card__feature plan-card__feature--premium">
              <span className="plan-card__icon">⭐</span>
              <span>Top search placement</span>
            </li>
            <li className="plan-card__feature plan-card__feature--premium">
              <span className="plan-card__icon">📊</span>
              <span>Advanced analytics</span>
            </li>
            <li className="plan-card__feature plan-card__feature--premium">
              <span className="plan-card__icon">🎯</span>
              <span>Priority customer support</span>
            </li>
          </ul>
          <button
            className="plan-card__button plan-card__button--premium"
            onClick={(e) => {
              e.stopPropagation();
              onSelectPlan('premium');
            }}
          >
            Choose Premium
          </button>
        </div>
      </div>

      <div className="plan-selection__footer">
        <p>You can upgrade or downgrade your plan anytime from your business settings.</p>
      </div>
    </div>
  );
};

export default PlanSelectionCard;
