import React from 'react';
import './VerificationBadgeInline.css';

/**
 * VerificationBadgeInline Component
 *
 * Compact inline verification badge for search results, cards, and lists
 * Shows icon-only badge with tooltip
 *
 * Usage:
 *   <VerificationBadgeInline status="basic" />
 *   <VerificationBadgeInline status="fully_verified" />
 */
const VerificationBadgeInline = ({ status = 'unverified', className = '' }) => {
  const badges = {
    unverified: {
      icon: '○',
      label: 'Not verified',
      tooltip: 'This business has not been verified yet',
      color: '#94a3b8',
      bgColor: '#f1f5f9'
    },
    basic: {
      icon: '✓',
      label: 'Verified',
      tooltip: 'Email and phone verified • 2+ photos • Confirmed address',
      color: '#64748b',
      bgColor: '#f8fafc'
    },
    fully_verified: {
      icon: '★',
      label: 'Recommended',
      tooltip: 'Fully verified • Stripe connected • Premium listing',
      color: '#ca8a04',
      bgColor: '#fef9c3'
    }
  };

  const badge = badges[status] || badges.unverified;

  // Don't show anything for unverified (to reduce visual clutter)
  if (status === 'unverified') {
    return null;
  }

  return (
    <span
      className={`verification-badge-inline ${className}`}
      style={{
        backgroundColor: badge.bgColor,
        color: badge.color
      }}
      title={badge.tooltip}
      aria-label={badge.label}
    >
      {badge.icon}
    </span>
  );
};

export default VerificationBadgeInline;
