import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import v1Client from '../../api/v1';
import './OwnerHomeHeader.css';

/**
 * OwnerHomeHeader Component
 * Displays owner profile picture, welcome message, and stats bar
 */
const OwnerHomeHeader = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    followers: 0,
    following: 0,
    posts: 0,
    surveys: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?._id) return;
      
      try {
        setLoading(true);
        setError(null);
        const response = await v1Client.get(`/users/${user._id}/stats`);
        
        if (response.data?.success && response.data?.stats) {
          setStats(response.data.stats);
        }
      } catch (err) {
        console.error('Failed to load stats:', err);
        setError('Unable to load statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  const displayName = user?.name || 'Owner';

  return (
    <div className="owner-home-header">
      <div className="owner-home-header__profile">
        <img 
          src={user?.avatarUrl || '/default-avatar.png'} 
          alt={displayName}
          className="owner-home-header__avatar"
          onError={(e) => { e.target.src = '/default-avatar.png'; }}
        />
        <div className="owner-home-header__info">
          <h1 className="owner-home-header__title">Welcome back, {displayName}! 👋</h1>
          <p className="owner-home-header__subtitle">
            Manage your content, connect with the community, and grow your presence.
          </p>
        </div>
      </div>

      {error && (
        <div className="owner-home-header__error">
          <p>⚠️ {error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="owner-home-header__stats">
          <div className="stat-card">
            <div className="stat-card__value">{stats.followers}</div>
            <div className="stat-card__label">Followers</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__value">{stats.following}</div>
            <div className="stat-card__label">Following</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__value">{stats.posts}</div>
            <div className="stat-card__label">Posts</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__value">{stats.surveys}</div>
            <div className="stat-card__label">Surveys</div>
          </div>
        </div>
      )}

      {loading && (
        <div className="owner-home-header__stats owner-home-header__stats--loading">
          <div className="stat-card stat-card--skeleton">
            <div className="stat-card__value">—</div>
            <div className="stat-card__label">Loading...</div>
          </div>
          <div className="stat-card stat-card--skeleton">
            <div className="stat-card__value">—</div>
            <div className="stat-card__label">Loading...</div>
          </div>
          <div className="stat-card stat-card--skeleton">
            <div className="stat-card__value">—</div>
            <div className="stat-card__label">Loading...</div>
          </div>
          <div className="stat-card stat-card--skeleton">
            <div className="stat-card__value">—</div>
            <div className="stat-card__label">Loading...</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerHomeHeader;
