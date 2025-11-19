import React from 'react';
import './RoleBadge.css';

/**
 * RoleBadge Component
 *
 * Displays a visual badge indicating the user's role (Owner or Visitor)
 * Used in feed items, profiles, and any place where role distinction is important.
 *
 * Props:
 * - role: string - "owner" or "visitor"
 * - size: string - "small", "medium", "large" (default: "medium")
 * - variant: string - "pill", "square" (default: "pill")
 */
const RoleBadge = ({ role, size = 'medium', variant = 'pill' }) => {
  if (!role) return null;

  const normalizedRole = role.toLowerCase();
  const isOwner = normalizedRole === 'owner';

  const displayText = isOwner ? 'Salon Owner' : 'Visitor';
  const iconEmoji = isOwner ? '\u{1F48E}' : '\u{1F464}'; // 💎 for owner, 👤 for visitor

  return (
    <span
      className={`role-badge role-badge--${normalizedRole} role-badge--${size} role-badge--${variant}`}
      role="img"
      aria-label={displayText}
    >
      <span className="role-badge__icon">{iconEmoji}</span>
      <span className="role-badge__text">{displayText}</span>
    </span>
  );
};

export default RoleBadge;
