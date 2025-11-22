import React, { useState, useEffect } from 'react';
import axios from 'axios';
import VerificationBadge from './VerificationBadge';
import './VerificationProgress.css';

/**
 * VerificationProgress Component
 *
 * Displays detailed verification progress for business owners
 * Shows:
 * - Current verification tier
 * - Completion percentage
 * - Checklist of verification steps
 * - Benefits of upgrading
 * - Next recommended actions
 *
 * Usage:
 *   <VerificationProgress businessId="123..." />
 */
const VerificationProgress = ({ businessId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    if (!businessId) return;

    const fetchProgress = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `/api/v1/verification/progress/${businessId}`
        );

        if (response.data.success) {
          setProgress(response.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load verification progress');
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [businessId]);

  if (loading) {
    return (
      <div className="verification-progress-loading">
        <div className="spinner"></div>
        <p>Loading verification status...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="verification-progress-error">
        <p>{error}</p>
      </div>
    );
  }

  if (!progress) return null;

  const { currentTier, profileCompletion, steps, nextSteps, benefits } = progress;

  return (
    <div className="verification-progress">
      {/* Header with Current Tier */}
      <div className="verification-header">
        <div className="verification-title">
          <h2>Verification Status</h2>
          <VerificationBadge status={currentTier} size="large" showLabel={true} />
        </div>
        <div className="profile-completion">
          <div className="completion-bar">
            <div
              className="completion-fill"
              style={{ width: `${profileCompletion}%` }}
            ></div>
          </div>
          <p className="completion-text">{profileCompletion}% Complete</p>
        </div>
      </div>

      {/* Verification Steps Checklist */}
      <div className="verification-steps">
        <h3>Verification Checklist</h3>
        <div className="steps-grid">
          {Object.entries(steps).map(([key, step]) => (
            <div
              key={key}
              className={`step-card ${step.completed ? 'completed' : 'pending'}`}
            >
              <div className="step-icon">
                {step.completed ? '✓' : '○'}
              </div>
              <div className="step-content">
                <h4>{step.title}</h4>
                <p>{step.description}</p>
                {step.current !== undefined && (
                  <div className="step-progress">
                    <span>
                      {step.current} / {step.required}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Next Steps */}
      {nextSteps && nextSteps.length > 0 && (
        <div className="next-steps">
          <h3>Next Steps</h3>
          <div className="next-steps-list">
            {nextSteps.map((step, index) => (
              <div key={index} className={`next-step priority-${step.priority}`}>
                <div className="priority-badge">{step.priority}</div>
                <div className="next-step-content">
                  <h4>{step.title}</h4>
                  <p>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Benefits */}
      <div className="verification-benefits">
        <h3>Your Current Benefits</h3>
        <ul className="benefits-list">
          {benefits && benefits.map((benefit, index) => (
            <li key={index}>
              <span className="benefit-icon">✓</span>
              {benefit}
            </li>
          ))}
        </ul>
      </div>

      {/* Upgrade CTA */}
      {currentTier !== 'fully_verified' && (
        <div className="upgrade-cta">
          <h3>
            {currentTier === 'unverified'
              ? 'Get Verified to Stand Out'
              : 'Upgrade to Fully Verified'}
          </h3>
          <p>
            {currentTier === 'unverified'
              ? 'Complete verification steps to gain customer trust and improve your search ranking.'
              : 'Connect Stripe to accept online payments and unlock premium features.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default VerificationProgress;
