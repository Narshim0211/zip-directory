import React from 'react';
import './VerificationBadge.css';

/**
 * VerificationBadge Component
 *
 * Displays business verification status with 3 tiers:
 * - unverified: Gray badge, "Not verified yet"
 * - basic: Silver badge with checkmark
 * - fully_verified: Gold badge with "Recommended" label
 *
 * Usage:
 *   <VerificationBadge status="fully_verified" size="medium" showLabel={true} />
 */
const VerificationBadge = ({
  status = 'unverified',
  size = 'medium',
  showLabel = true,
  className = ''
}) => {
  const badges = {
    unverified: {
      icon: '○',
      label: 'Not verified',
      color: '#94a3b8', // slate-400
      bgColor: '#f1f5f9', // slate-100
      borderColor: '#cbd5e1' // slate-300
    },
    basic: {
      icon: '✓',
      label: 'Verified',
      color: '#64748b', // slate-600
      bgColor: '#f8fafc', // slate-50
      borderColor: '#94a3b8' // slate-400
    },
    fully_verified: {
      icon: '★',
      label: 'Recommended',
      color: '#ca8a04', // yellow-600
      bgColor: '#fef9c3', // yellow-100
      borderColor: '#eab308' // yellow-500
    }
  };

  const badge = badges[status] || badges.unverified;

  const sizeClasses = {
    small: 'badge-small',
    medium: 'badge-medium',
    large: 'badge-large'
  };

  return (
    <div
      className={`verification-badge ${sizeClasses[size]} ${className}`}
      style={{
        backgroundColor: badge.bgColor,
        borderColor: badge.borderColor,
        color: badge.color
      }}
      title={badge.label}
    >
      <span className="badge-icon" style={{ color: badge.color }}>
        {badge.icon}
      </span>
      {showLabel && (
        <span className="badge-label">{badge.label}</span>
      )}
    </div>
  );
};

export default VerificationBadge;
