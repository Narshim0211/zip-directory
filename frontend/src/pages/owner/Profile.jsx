import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../shared/components/LoadingSpinner';
import api from '../../api/axios';
import InviteModal from '../../components/InviteModal';
import '../../styles/profileOwner.css';

/**
 * Owner Profile Page
 * ✅ Now using unified axios instance
 */
export default function OwnerProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get('/v2/owner-profiles/me');
        if (!mounted) return;
        setProfile(res.data?.data || res.data);
      } catch (e) {
        if (mounted) {
          setError(e.response?.data?.message || e.message || 'Failed to load profile');
        }
      } finally {
        if (mounted) setLoading(false);
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
          <button
            className="btn-primary"
            onClick={() => setShowInviteModal(true)}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              marginLeft: '8px'
            }}
          >
            ✨ Invite Clients & Friends
          </button>
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

      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
      />
    </div>
  );
}



