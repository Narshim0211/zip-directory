// ProfileHeader.jsx
import React from 'react';
import { getDisplayName, getAvatarUrl } from '../../utils/userUtils';

const ProfileHeader = ({ profile }) => {
  if (!profile) return null;

  const displayName = getDisplayName(profile);
  const avatarUrl = getAvatarUrl(profile);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 16 }}>
      <img
        src={avatarUrl}
        alt={displayName}
        style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '2px solid #eee' }}
      />
      <div>
        <div style={{ fontSize: 24, fontWeight: 700 }}>{displayName}</div>
        <div style={{ fontSize: 16, color: '#888', fontWeight: 500 }}>{profile.role === 'owner' ? 'Owner' : 'Visitor'}</div>
      </div>
    </div>
  );
};

export default ProfileHeader;
