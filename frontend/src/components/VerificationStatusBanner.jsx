import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import './VerificationStatusBanner.css';

const VerificationStatusBanner = ({ businessId }) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!businessId) return;

    const fetchStatus = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/v1/verification/status/${businessId}`);

        if (response.data.success) {
          setStatus(response.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch verification status:', err);
        setError('Unable to load verification status');
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [businessId]);

  if (loading) {
    return (
      <div className="verification-banner verification-banner--loading">
        <div className="verification-banner__spinner"></div>
        <p>Loading verification status...</p>
      </div>
    );
  }

  if (error || !status) {
    return null;
  }

  const tierConfig = {
    unverified: {
      icon: '⚪',
      title: 'Unverified Listing',
      subtitle: 'Complete verification steps below to gain customer trust',
      color: '#94a3b8',
      bgColor: '#f1f5f9',
      borderColor: '#cbd5e1',
    },
    basic: {
      icon: '🥉',
      title: 'Basic Verified',
      subtitle: 'Subscribe to Premium + connect Stripe to unlock top placement',
      color: '#ca8a04',
      bgColor: '#fef3c7',
      borderColor: '#fde047',
    },
    fully_verified: {
      icon: '💎',
      title: 'Premium Verified',
      subtitle: 'Fully trusted + premium boosted. Customers can book and pay online!',
      color: '#7c3aed',
      bgColor: '#f3e8ff',
      borderColor: '#c084fc',
    },
  };

  const currentTier = tierConfig[status.verificationStatus] || tierConfig.unverified;
  const completionPercentage = status.verificationSteps?.profileCompleted || 0;

  return (
    <div
      className="verification-banner"
      style={{
        backgroundColor: currentTier.bgColor,
        borderColor: currentTier.borderColor,
      }}
    >
      <div className="verification-banner__icon">{currentTier.icon}</div>
      <div className="verification-banner__content">
        <h3 style={{ color: currentTier.color }}>{currentTier.title}</h3>
        <p>{currentTier.subtitle}</p>

        {status.verificationStatus === 'unverified' && (
          <div className="verification-banner__progress">
            <div className="progress-ring">
              <svg className="progress-ring__svg" width="60" height="60">
                <circle
                  className="progress-ring__circle-bg"
                  stroke="#e2e8f0"
                  strokeWidth="4"
                  fill="transparent"
                  r="26"
                  cx="30"
                  cy="30"
                />
                <circle
                  className="progress-ring__circle"
                  stroke={currentTier.color}
                  strokeWidth="4"
                  fill="transparent"
                  r="26"
                  cx="30"
                  cy="30"
                  strokeDasharray={`${completionPercentage * 1.63} 163`}
                  strokeDashoffset="0"
                />
              </svg>
              <div className="progress-ring__text">{completionPercentage}%</div>
            </div>
            <span className="verification-banner__progress-label">
              Profile completion
            </span>
          </div>
        )}
      </div>

      {status.verificationStatus !== 'fully_verified' && (
        <div className="verification-banner__cta">
          <span className="verification-banner__cta-text">
            {status.verificationStatus === 'unverified'
              ? 'Start verifying below ↓'
              : 'Almost there! Complete all steps ↓'}
          </span>
        </div>
      )}
    </div>
  );
};

export default VerificationStatusBanner;
