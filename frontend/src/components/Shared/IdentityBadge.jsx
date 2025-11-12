import React from 'react';
import { Link } from 'react-router-dom';

const IdentityBadge = ({ identity, author }) => {
  // identity: { type, fullName, handle, slug, avatarUrl }
  // fall back to author (populated User) if identity missing
  const id = identity || {};
  const fall = author || {};
  const fullName = id.fullName || fall.name || 'Guest';
  const avatar = id.avatarUrl || fall.avatarUrl || '';
  const handle = id.handle || (fall.handle ? `@${fall.handle}` : undefined);
  const slug = id.slug || undefined;
  const role = id.role || (fall.role === 'owner' ? 'owner' : 'visitor');

  const to = slug ? (role === 'owner' ? `/o/${slug}` : `/v/${slug}`) : '#';

  return (
    <div className="identity-badge" style={{ display: 'flex', alignItems: 'center' }}>
      <img src={avatar || '/default-avatar.png'} alt={fullName} style={{ width: 40, height: 40, borderRadius: '50%', marginRight: 8 }} />
      <div>
        {slug ? (
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
