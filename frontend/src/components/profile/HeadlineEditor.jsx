import React from 'react';

/**
 * HeadlineEditor Component
 * Edits name, handle, title and displays stats/badges
 *
 * @param {Object} props
 * @param {Object} props.profile - User profile data
 * @param {boolean} props.isOwner - Whether user is an owner
 * @param {Function} props.onChange - Change handler
 */
export default function HeadlineEditor({ profile, isOwner, onChange }) {
  const isPremium = profile?.premium || false;
  const isVerified = profile?.verified || false;

  // Stats
  const followers = isOwner ? profile?.counts?.followers || 0 : profile?.followersCount || 0;
  const following = isOwner ? profile?.counts?.following || 0 : profile?.followingCount || 0;
  const posts = profile?.counts?.posts || 0;
  const surveys = profile?.counts?.surveys || 0;

  return (
    <div>
      <span className="card-label">
        {isOwner ? '🏆 Business Identity' : '⭐ Your Identity'}
      </span>

      {/* Name Input */}
      <div className="profile-input-group">
        <label className="profile-input-label">
          {isOwner ? 'Business Name' : 'First Name'}
        </label>
        <input
          type="text"
          className="profile-input large"
          value={profile?.firstName || ''}
          onChange={(e) => onChange('firstName', e.target.value)}
          placeholder={isOwner ? 'Bella Braids' : 'Nitesh'}
        />
      </div>

      {/* Last Name (if not owner) */}
      {!isOwner && (
        <div className="profile-input-group">
          <label className="profile-input-label">Last Name</label>
          <input
            type="text"
            className="profile-input large"
            value={profile?.lastName || ''}
            onChange={(e) => onChange('lastName', e.target.value)}
            placeholder="Siwakoti"
          />
        </div>
      )}

      {/* Handle */}
      <div className="profile-input-group">
        <label className="profile-input-label">Handle</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#6b7280', fontSize: '20px', fontWeight: '700' }}>
            @
          </span>
          <input
            type="text"
            className="profile-input"
            value={profile?.handle || ''}
            onChange={(e) => onChange('handle', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            placeholder={isOwner ? 'bellabraids' : 'niteesh'}
          />
        </div>
      </div>

      {/* Title / Tagline */}
      <div className="profile-input-group">
        <label className="profile-input-label">
          {isOwner ? 'Tagline' : 'Title / Role'}
        </label>
        <input
          type="text"
          className="profile-input"
          value={profile?.title || ''}
          onChange={(e) => onChange('title', e.target.value)}
          placeholder={isOwner ? 'Top Salon in Dallas' : 'Braid Queen'}
          maxLength={100}
        />
      </div>

      {/* Badges */}
      {isOwner && (isPremium || isVerified) && (
        <div className="profile-badges">
          {isVerified && (
            <span className="badge verified">
              ✓ Verified
            </span>
          )}
          {isPremium && (
            <span className="badge premium">
              ★ Premium
            </span>
          )}
        </div>
      )}

      {/* Stats (Read-only) */}
      <div className="profile-stats">
        <div className="stat-item">
          <span className="stat-value">{followers.toLocaleString()}</span>
          <span className="stat-label">Followers</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{following.toLocaleString()}</span>
          <span className="stat-label">Following</span>
        </div>
        {isOwner && (
          <>
            <div className="stat-item">
              <span className="stat-value">{posts}</span>
              <span className="stat-label">Posts</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{surveys}</span>
              <span className="stat-label">Surveys</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
