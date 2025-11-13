import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../shared/components/LoadingSpinner';
import '../../styles/profileOwner.css';

export default function OwnerProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/v2/owner-profiles/me`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          }
        });
        const data = await res.json();
        if (!mounted) return;
        if (!res.ok) throw new Error(data?.message || 'Failed to load profile');
        setProfile(data?.data || data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return <LoadingSpinner message="Loading profile..." />;
  if (error) return <div className="error-message">{error}</div>;
  if (!profile) return null;

  return (
    <div className="owner-profile-page">
      <div className="owner-profile__header">
        <img className="owner-profile__avatar" src={profile.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.firstName || 'O')}+${encodeURIComponent(profile.lastName || '')}`} alt="avatar" />
        <div>
          <h2>{profile.firstName} {profile.lastName}</h2>
          <div className="owner-profile__handle">@{profile.handle}</div>
          <div className="owner-profile__stats">
            <span>{profile.followersCount || 0} followers</span>
            <span>{profile.followingCount || 0} following</span>
          </div>
        </div>
        <div className="owner-profile__actions">
          <a className="btn-primary" href="/owner/me/edit">Edit Profile</a>
        </div>
      </div>

      <div className="owner-profile__grid">
        <section className="tm-card">
          <div className="tm-card__title">Featured Businesses</div>
          {Array.isArray(profile.featuredBusinesses) && profile.featuredBusinesses.length > 0 ? (
            <ul className="owner-featured">
              {profile.featuredBusinesses.map((b) => (
                <li key={b._id}>{b.name} — {b.city}</li>
              ))}
            </ul>
          ) : (
            <div className="empty">No featured businesses yet.</div>
          )}
        </section>

        <section className="tm-card">
          <div className="tm-card__title">Compose</div>
          <div className="empty">Post an update or create a survey (coming soon).</div>
        </section>

        <section className="tm-card" style={{ gridColumn: '1 / -1' }}>
          <div className="tm-card__title">Recent Activity</div>
          <div className="empty">Posts and surveys will appear here (coming soon).</div>
        </section>
      </div>
    </div>
  );
}
