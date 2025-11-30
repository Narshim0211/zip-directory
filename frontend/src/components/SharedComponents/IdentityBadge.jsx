import React from 'react';
import { Link } from 'react-router-dom';

const IdentityBadge = ({ identity, author }) => {
  // identity: { type, fullName, handle, slug, avatarUrl, profileId }
  // fall back to author (populated User) if identity missing
  const id = identity || {};
  const fall = author || {};

  // Build full name with multiple fallbacks:
  // 1. identity.fullName (from profile firstName + lastName or profile fullName)
  // 2. author's firstName + lastName
  // 3. author's name field (from User model)
  // 4. 'User' as last resort
  const authorFullName = fall.firstName && fall.lastName
    ? `${fall.firstName} ${fall.lastName}`.trim()
    : '';
  const fullName = id.fullName || authorFullName || fall.name || 'User';

  const avatar = id.avatarUrl || fall.avatarUrl || '';
  const handle = id.handle || (fall.handle ? `@${fall.handle}` : undefined);
  const slug = id.slug || undefined;
  const userId = id.profileId || fall._id || undefined;
  const role = id.role || (fall.role === 'owner' ? 'owner' : 'visitor');

  // Priority: Use /profile/:userId for new unified profile route
  // Fallback to slug-based routes for backward compatibility
  const to = userId ? `/profile/${userId}` : slug ? (role === 'owner' ? `/o/${slug}` : `/v/${slug}`) : '#';

  return (
    <div className="identity-badge" style={{ display: 'flex', alignItems: 'center' }}>
      <img src={avatar || '/default-avatar.png'} alt={fullName} style={{ width: 40, height: 40, borderRadius: '50%', marginRight: 8 }} />
      <div>
        {(userId || slug) ? (
            <Link to={to} style={{ fontWeight: '600', color: '#111' }}>{fullName}</Link>
          ) : (
            <div style={{ fontWeight: '600' }}>{fullName}</div>
          )}
        <div style={{ fontSize: 12, color: '#666' }}>{handle || ''}</div>
      </div>
    </div>
  );
};

export default IdentityBadge;
