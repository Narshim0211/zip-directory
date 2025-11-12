import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import IdentityBadge from '../components/Shared/IdentityBadge';
import FollowButton from '../components/FollowButton';
import PostCard from '../components/PostCard';
import ProfileTabs from '../components/Shared/ProfileTabs';
import AboutCard from '../components/Shared/AboutCard';
import { useAuth } from '../context/AuthContext';

export default function PublicOwnerProfile() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [timeline, setTimeline] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [featuredBusinesses, setFeaturedBusinesses] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: p } = await api.get(`/v1/owner-profiles/${slug}`);
        setProfile(p);

        // Load featured businesses with details
        if (p.featuredBusinesses && p.featuredBusinesses.length > 0) {
          setFeaturedBusinesses(p.featuredBusinesses);
        }

        // determine if current user is following this profile
        try {
          const { data: followStatus } = await api.get(`/v1/owner-profiles/${p._id}/is-following`);
          setInitialFollowing(followStatus.following);
        } catch (e) {
          // ignore if not authenticated or API returns error
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
          const { data: t } = await api.get(`/v1/owner-profiles/${slug}/timeline${tabParam}`);
          setTimeline(t);
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadTimeline();
  }, [profile, activeTab, slug]);

  const [pinnedPost, setPinnedPost] = useState(null);
  useEffect(() => {
    if (!profile) return;
    (async () => {
      try {
        const pinId = (profile.pinnedPostIds && profile.pinnedPostIds[0]) || null;
        if (!pinId) return;
        const { data } = await api.get(`/posts/${pinId}`);
        setPinnedPost(data);
      } catch (e) {
        // ignore
      }
    })();
  }, [profile]);

  const [initialFollowing, setInitialFollowing] = React.useState(false);

  if (loading) return <div className="shimmer" />;
  if (!profile) return <div className="empty">Profile not found</div>;

  const isOwnProfile = user && user._id === profile.userId;

  return (
    <div className="public-owner-profile">
      <header className="panel" style={{ position: 'relative', overflow: 'hidden' }}>
        {profile.headerImageUrl ? (
          <div style={{ height: 160, backgroundImage: `url(${profile.headerImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        ) : <div style={{ height: 80, backgroundColor: '#f6f6f6' }} />}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 12 }}>
          <IdentityBadge identity={{ ...profile, role: 'owner', profileId: profile._id }} />
          <div>
            <h2>{profile.displayName || `${profile.firstName} ${profile.lastName}`}</h2>
            <div className="muted">@{profile.handle}</div>
            <p>{profile.bio}</p>
            <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
              {!isOwnProfile && (
                <FollowButton targetId={profile._id} targetType="owner" initialFollowing={initialFollowing} />
              )}
              {isOwnProfile && (
                <Link to="/owner/me/edit" className="btn btn-secondary">
                  Edit Profile
                </Link>
              )}
            </div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div><strong>{profile.counts?.followers ?? profile.followersCount ?? 0}</strong> followers</div>
            <div><strong>{profile.counts?.posts ?? 0}</strong> posts</div>
            <div><strong>{profile.counts?.surveys ?? 0}</strong> surveys</div>
          </div>
        </div>
      </header>

      {pinnedPost && (
        <section className="panel">
          <h3>Pinned Post</h3>
          <PostCard post={pinnedPost} />
        </section>
      )}

      <ProfileTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={{
          posts: profile.counts?.posts ?? 0,
          surveys: profile.counts?.surveys ?? 0
        }}
      />

      {activeTab === 'about' ? (
        <AboutCard
          profile={profile}
          role="owner"
          businesses={featuredBusinesses}
        />
      ) : (
        <section className="panel">
          <h3>{activeTab === 'posts' ? 'Posts' : 'Surveys'}</h3>
          {(!timeline || !timeline.items || timeline.items.length === 0) ? (
            <div className="empty">No {activeTab} yet.</div>
          ) : (
            <div>
              {timeline.items.map((it, idx) => (
                <div key={idx} className="card">
                  <div className="muted">{it.type.toUpperCase()}</div>
                  <div>{it.data.title || it.data.content || ''}</div>
                </div>
              ))}
              {timeline.nextCursor && (
                <div style={{ textAlign: 'center', marginTop: 12 }}>
                  <button className="primary-btn" onClick={async () => {
                    try {
                      const { data } = await api.get(`/v1/owner-profiles/${slug}/timeline?tab=${activeTab}&limit=10&cursor=${encodeURIComponent(timeline.nextCursor)}`);
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
