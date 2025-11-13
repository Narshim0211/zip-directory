import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/designSystem.css';

const ProfileHeader = ({
  profile,
  role, // 'owner' or 'visitor'
  isOwnProfile,
  isFollowing,
  onFollow,
  onUnfollow
}) => {
  const {
    firstName,
    lastName,
    handle,
    avatarUrl,
    bio,
    followersCount = 0,
    followingCount = 0,
    counts = {}
  } = profile;

  const fullName = `${firstName} ${lastName}`;
  const displayHandle = handle ? `@${handle}` : '';

  // Stats based on role
  const stats = role === 'owner'
    ? [
        { label: 'Followers', value: counts.followers || followersCount },
        { label: 'Following', value: counts.following || followingCount },
        { label: 'Posts', value: counts.posts || 0 },
        { label: 'Surveys', value: counts.surveys || 0 }
      ]
    : [
        { label: 'Followers', value: followersCount },
        { label: 'Following', value: followingCount },
        { label: 'Surveys', value: profile.surveysCount || 0 }
      ];

  const editPath = role === 'owner' ? '/owner/me/edit' : '/visitor/profile/edit';

  return (
    <div className="profile-header">
      <div className="profile-header__content">
        <img
          src={avatarUrl || '/default-avatar.png'}
          alt={fullName}
          className="profile-header__avatar"
        />

        <div className="profile-header__info">
          <h1 className="profile-header__name">{fullName}</h1>
          {displayHandle && (
            <p className="profile-header__handle">{displayHandle}</p>
          )}
          {bio && <p className="profile-header__bio">{bio}</p>}

          <div className="profile-header__stats">
            {stats.map((stat, index) => (
              <div key={index} className="profile-header__stat">
                <span className="profile-header__stat-value">{stat.value}</span>
                <span className="profile-header__stat-label">{stat.label}</span>
              </div>
            ))}
          </div>

          <div className="profile-header__actions">
            {isOwnProfile ? (
              <Link to={editPath} className="btn btn-secondary">
                Edit Profile
              </Link>
            ) : (
              <button
                className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}
                onClick={isFollowing ? onUnfollow : onFollow}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
