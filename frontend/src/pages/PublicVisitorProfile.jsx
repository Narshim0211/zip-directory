import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import IdentityBadge from '../components/Shared/IdentityBadge';
import FollowButton from '../components/FollowButton';
import ProfileTabs from '../components/Shared/ProfileTabs';
import AboutCard from '../components/Shared/AboutCard';
import { useAuth } from '../context/AuthContext';

export default function PublicVisitorProfile() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [timeline, setTimeline] = useState({ items: [], nextCursor: null });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('surveys');

  useEffect(() => {
    const load = async () => {
      try {
        const { data: p } = await api.get(`/v1/visitor-profiles/${slug}`);
        setProfile(p);

        try {
          const { data: followStatus } = await api.get(`/v1/visitor-profiles/${p._id}/is-following`);
          setInitialFollowing(followStatus.following);
        } catch (e) {
          // ignore
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  // Load timeline when profile or activeTab changes
  useEffect(() => {
    if (!profile) return;
    const loadTimeline = async () => {
      try {
        const tabParam = activeTab === 'about' ? '' : `?tab=${activeTab}&limit=10`;
        if (activeTab !== 'about') {
          const { data: t } = await api.get(`/v1/visitor-profiles/${slug}/timeline${tabParam}`);
          setTimeline(t);
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadTimeline();
  }, [profile, activeTab, slug]);

  const [initialFollowing, setInitialFollowing] = React.useState(false);

  if (loading) return <div className="shimmer" />;
  if (!profile) return <div className="empty">Profile not found</div>;

  const isOwnProfile = user && user._id === profile.userId;

  return (
    <div className="public-visitor-profile">
      <header className="panel" style={{ position: 'relative', overflow: 'hidden' }}>
        {profile.bannerUrl ? (
          <div style={{ height: 160, backgroundImage: `url(${profile.bannerUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        ) : <div style={{ height: 80, backgroundColor: '#f6f6f6' }} />}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 12 }}>
          <IdentityBadge identity={{ ...profile, role: 'visitor', profileId: profile._id }} />
          <div>
            <h2>{profile.firstName} {profile.lastName}</h2>
            <div className="muted">@{profile.handle}</div>
            <p>{profile.bio}</p>
            <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
              {!isOwnProfile && (
                <FollowButton targetId={profile._id} targetType="visitor" initialFollowing={initialFollowing} />
              )}
              {isOwnProfile && (
                <Link to="/visitor/profile/edit" className="btn btn-secondary">
                  Edit Profile
                </Link>
              )}
            </div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div><strong>{profile.followersCount ?? 0}</strong> followers</div>
            <div><strong>{profile.followingCount ?? 0}</strong> following</div>
          </div>
        </div>
      </header>

      <ProfileTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={{
          posts: 0, // Visitors don't create posts
          surveys: timeline.items?.length ?? 0
        }}
      />

      {activeTab === 'about' ? (
        <AboutCard
          profile={profile}
          role="visitor"
        />
      ) : (
        <section className="panel">
          <h3>Surveys</h3>
          {(!timeline || !timeline.items || timeline.items.length === 0) ? (
            <div className="empty">No surveys yet.</div>
          ) : (
            <div>
              {timeline.items.map((it, idx) => (
                <div key={idx} className="card">
                  <div className="muted">SURVEY</div>
                  <div>{it.data.title || ''}</div>
                </div>
              ))}
              {timeline.nextCursor && (
                <div style={{ textAlign: 'center', marginTop: 12 }}>
                  <button className="primary-btn" onClick={async () => {
                    try {
                      const { data } = await api.get(`/v1/visitor-profiles/${slug}/timeline?tab=${activeTab}&limit=10&cursor=${encodeURIComponent(timeline.nextCursor)}`);
                      setTimeline(prev => ({ items: [...prev.items, ...data.items], nextCursor: data.nextCursor }));
                    } catch (e) {
                      console.error(e);
                    }
                  }}>Load more</button>
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
