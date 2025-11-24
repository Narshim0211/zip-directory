import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ProfileHeader from '../components/SharedComponents/ProfileHeader';
import ProfileTabs from '../components/SharedComponents/ProfileTabs';
import ProfileFeed from '../components/SharedComponents/ProfileFeed';
import CreateSection from '../components/SharedComponents/CreateSection';
import AboutCard from '../components/SharedComponents/AboutCard';
import ErrorBoundary from '../components/SharedComponents/ErrorBoundary';
import { ProfileInsightBar } from '../components/engagement';
import InviteModal from '../components/InviteModal';
import v1Client from '../api/v1';
import '../styles/designSystem.css';

const API_BASE = '/api/v2/owner-profiles';

const OwnerProfilePageV2 = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [feed, setFeed] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [feedLoading, setFeedLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [featuredBusinesses, setFeaturedBusinesses] = useState([]);
  const [followStats, setFollowStats] = useState({ followers: 0, following: 0 });
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Check if viewing own profile by /me route
  const viewingOwnProfile = slug === 'me';
  const isOwnProfile = viewingOwnProfile || (user && profile && String(user._id) === String(profile.userId));

  // Load profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);

        // Use /me endpoint if viewing own profile
        const endpoint = viewingOwnProfile ? `${API_BASE}/me` : `${API_BASE}/${slug}`;
        const { data } = await api.get(endpoint);
        setProfile(data);

        if (data.featuredBusinesses) {
          setFeaturedBusinesses(data.featuredBusinesses);
        }

        // Check follow status if not own profile
        if (!viewingOwnProfile && user && String(user._id) !== String(data.userId)) {
          try {
            // Use new owner follow system if current user is owner
            if (user.role === 'owner') {
              const followData = await v1Client.owner.checkFollowStatus(data.userId);
              setIsFollowing(followData.isFollowing);
            } else {
              // Visitor checking owner profile - use profile API
              const { data: followData } = await api.get(`${API_BASE}/${data._id}/is-following`);
              setIsFollowing(followData.following);
            }
          } catch (err) {
            console.error('Failed to check follow status:', err);
          }
        }

        // Fetch follower/following stats from OwnerProfile
        try {
          // Get followers count (owners following this owner)
          const followersData = await v1Client.owner.getFollowers({ limit: 1 });
          const followingData = await v1Client.owner.getFollowing({ limit: 1 });
          setFollowStats({
            followers: followersData.total || 0,
            following: followingData.total || 0
          });
        } catch (err) {
          console.error('Failed to fetch follow stats:', err);
        }
      } catch (error) {
        console.error('Failed to load profile:', error);

        // If 404 on /me, try to initialize profile
        if (viewingOwnProfile && error.response?.status === 404) {
          try {
            const { data } = await api.post(`${API_BASE}/init`);
            setProfile(data);
          } catch (initError) {
            console.error('Failed to initialize profile:', initError);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [slug, user, viewingOwnProfile]);

  // Load feed when profile or tab changes
  useEffect(() => {
    if (!profile || activeTab === 'about') return;

    const loadFeed = async () => {
      try {
        setFeedLoading(true);
        // Use profile slug if viewing /me
        const feedSlug = viewingOwnProfile ? profile.slug : slug;
        const { data } = await api.get(`${API_BASE}/${feedSlug}/feed?tab=${activeTab}&limit=10`);
        setFeed(data.items || []);
        setNextCursor(data.nextCursor);
      } catch (error) {
        console.error('Failed to load feed:', error);
      } finally {
        setFeedLoading(false);
      }
    };

    loadFeed();
  }, [profile, slug, activeTab, viewingOwnProfile]);

  // Load more feed items
  const handleLoadMore = async () => {
    if (!nextCursor || feedLoading || !profile) return;

    try {
      setFeedLoading(true);
      const feedSlug = viewingOwnProfile ? profile.slug : slug;
      const { data } = await api.get(
        `${API_BASE}/${feedSlug}/feed?tab=${activeTab}&limit=10&cursor=${nextCursor}`
      );
      setFeed(prev => [...prev, ...(data.items || [])]);
      setNextCursor(data.nextCursor);
    } catch (error) {
      console.error('Failed to load more:', error);
    } finally {
      setFeedLoading(false);
    }
  };

  // Follow/Unfollow handlers
  const handleFollow = async () => {
    try {
      // Use new owner follow system if current user is owner
      if (user?.role === 'owner') {
        await v1Client.owner.followOwner(profile.userId);
      } else {
        // Visitor following owner - use profile API
        await api.post(`${API_BASE}/${profile._id}/follow`);
      }
      setIsFollowing(true);
      setFollowStats(prev => ({ ...prev, followers: prev.followers + 1 }));
      setProfile(prev => ({
        ...prev,
        counts: { ...prev.counts, followers: (prev.counts?.followers || 0) + 1 }
      }));
    } catch (error) {
      console.error('Failed to follow:', error);
    }
  };

  const handleUnfollow = async () => {
    try {
      // Use new owner follow system if current user is owner
      if (user?.role === 'owner') {
        await v1Client.owner.unfollowOwner(profile.userId);
      } else {
        // Visitor unfollowing owner - use profile API
        await api.delete(`${API_BASE}/${profile._id}/follow`);
      }
      setIsFollowing(false);
      setFollowStats(prev => ({ ...prev, followers: Math.max(prev.followers - 1, 0) }));
      setProfile(prev => ({
        ...prev,
        counts: { ...prev.counts, followers: Math.max((prev.counts?.followers || 0) - 1, 0) }
      }));
    } catch (error) {
      console.error('Failed to unfollow:', error);
    }
  };

  // Create post handler
  const handleCreatePost = async (postData) => {
    try {
      await api.post('/v1/owner/posts', postData);
      // Reload feed
      const { data } = await api.get(`${API_BASE}/${slug}/feed?tab=posts&limit=10`);
      setFeed(data.items || []);
      setNextCursor(data.nextCursor);
    } catch (error) {
      console.error('Failed to create post:', error);
      throw error;
    }
  };

  // Create survey handler
  const handleCreateSurvey = async (surveyData) => {
    try {
      await api.post('/v1/owner/surveys', surveyData);
      // Reload feed
      const { data } = await api.get(`${API_BASE}/${slug}/feed?tab=surveys&limit=10`);
      setFeed(data.items || []);
      setNextCursor(data.nextCursor);
    } catch (error) {
      console.error('Failed to create survey:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="shimmer" style={{ height: '200px', marginBottom: '16px' }} />
        <div className="shimmer" style={{ height: '400px' }} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-page">
        <div className="empty-state">
          <div className="empty-state__icon">❌</div>
          <p className="empty-state__text">Profile not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <ErrorBoundary>
        <ProfileHeader
          profile={{ ...profile, followStats }}
          role="owner"
          isOwnProfile={isOwnProfile}
          isFollowing={isFollowing}
          onFollow={handleFollow}
          onUnfollow={handleUnfollow}
        />
      </ErrorBoundary>

      {/* Invite Friends Button - Only show on own profile */}
      {isOwnProfile && (
        <div style={{ padding: '0 16px', marginBottom: '16px' }}>
          <button
            onClick={() => setShowInviteModal(true)}
            style={{
              width: '100%',
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(236, 72, 153, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(236, 72, 153, 0.3)';
            }}
          >
            ✨ Invite Clients & Friends
          </button>
        </div>
      )}

      <ProfileTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        role="owner"
      />

      {activeTab === 'about' ? (
        <ErrorBoundary>
          <div className="profile-feed">
            <AboutCard
              profile={profile}
              role="owner"
              businesses={featuredBusinesses}
            />
            {!isOwnProfile && profile?.userId && (
              <ProfileInsightBar ownerId={profile.userId} />
            )}
          </div>
        </ErrorBoundary>
      ) : (
        <>
          {isOwnProfile && (
            <ErrorBoundary>
              <CreateSection
                role="owner"
                onCreatePost={handleCreatePost}
                onCreateSurvey={handleCreateSurvey}
              />
            </ErrorBoundary>
          )}

          <ErrorBoundary>
            <ProfileFeed
              items={feed}
              loading={feedLoading}
              onLoadMore={handleLoadMore}
              hasMore={!!nextCursor}
            />
          </ErrorBoundary>
        </>
      )}

      {/* Invite Modal */}
      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
      />
    </div>
  );
};

export default OwnerProfilePageV2;

