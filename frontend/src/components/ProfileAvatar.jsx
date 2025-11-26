import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/ProfileAvatar.css';

/**
 * ProfileAvatar - Instagram/TikTok style avatar for home pages
 *
 * Features:
 * - Circular avatar with gradient fallback
 * - Displays user's uploaded photo or initials
 * - Smooth hover effects
 * - Links to user's profile
 * - Premium ring animation (optional)
 */
const ProfileAvatar = ({ user, isPremium = false, className = '' }) => {
  if (!user) return null;

  const { firstName = '', lastName = '', avatarUrl, handle } = user;
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';
  const profileLink = user.role === 'owner' ? '/owner/profile/me' : '/visitor/profile';

  // Add cache-busting parameter to force reload when avatar changes
  const avatarUrlWithCache = avatarUrl ? `${avatarUrl}${avatarUrl.includes('?') ? '&' : '?'}t=${Date.now()}` : null;

  return (
    <Link to={profileLink} className={`profile-avatar-link ${className}`}>
      <div className={`profile-avatar ${isPremium ? 'profile-avatar--premium' : ''}`}>
        {/* Premium ring animation */}
        {isPremium && (
          <div className="profile-avatar__premium-ring" />
        )}

        {/* Avatar content */}
        <div className="profile-avatar__content">
          {avatarUrlWithCache ? (
            <img
              src={avatarUrlWithCache}
              alt={`${firstName} ${lastName}`}
              className="profile-avatar__image"
            />
          ) : (
            <div className="profile-avatar__initials">
              {initials}
            </div>
          )}
        </div>

        {/* Hover tooltip */}
        <div className="profile-avatar__tooltip">
          <div className="profile-avatar__tooltip-name">
            {firstName} {lastName}
          </div>
          {handle && (
            <div className="profile-avatar__tooltip-handle">
              @{handle}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProfileAvatar;
