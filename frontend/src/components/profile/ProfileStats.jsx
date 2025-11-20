// ProfileStats.jsx
import React from 'react';

const ProfileStats = ({ profile }) => {
  if (!profile || !profile.stats) return null;

  return (
    <div style={{ display: 'flex', gap: 32, marginBottom: 16, fontSize: 16 }}>
      <div><b>Followers:</b> {profile.stats.followers ?? 0}</div>
      <div><b>Following:</b> {profile.stats.following ?? 0}</div>
      <div><b>Surveys:</b> {profile.stats.surveys ?? 0}</div>
      {profile.role === 'owner' && (
        <div><b>Posts:</b> {profile.stats.posts ?? 0}</div>
      )}
    </div>
  );
};

export default ProfileStats;
