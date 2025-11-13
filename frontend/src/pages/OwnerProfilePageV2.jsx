import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ProfileHeader from '../components/Shared/ProfileHeader';
import ProfileTabs from '../components/Shared/ProfileTabs';
import ProfileFeed from '../components/Shared/ProfileFeed';
import CreateSection from '../components/Shared/CreateSection';
import AboutCard from '../components/Shared/AboutCard';
import ErrorBoundary from '../components/Shared/ErrorBoundary';
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
        const { data } = await axios.get(endpoint);
        setProfile(data);

        if (data.featuredBusinesses) {
          setFeaturedBusinesses(data.featuredBusinesses);
        }

        // Check follow status if not own profile
        if (!viewingOwnProfile && user && String(user._id) !== String(data.userId)) {
          try {
            const { data: followData } = await axios.get(`${API_BASE}/${data._id}/is-following`);
            setIsFollowing(followData.following);
          } catch (err) {
            console.error('Failed to check follow status:', err);
          }
        }
      } catch (error) {
        console.error('Failed to load profile:', error);

        // If 404 on /me, try to initialize profile
        if (viewingOwnProfile && error.response?.status === 404) {
          try {
            const { data } = await axios.post(`${API_BASE}/init`);
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
        const { data } = await axios.get(`${API_BASE}/${feedSlug}/feed?tab=${activeTab}&limit=10`);
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
      const { data } = await axios.get(
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
      await axios.post(`${API_BASE}/${profile._id}/follow`);
      setIsFollowing(true);
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
      await axios.delete(`${API_BASE}/${profile._id}/follow`);
      setIsFollowing(false);
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
      await axios.post('/api/v1/owner/posts', postData);
      // Reload feed
      const { data } = await axios.get(`${API_BASE}/${slug}/feed?tab=posts&limit=10`);
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
      await axios.post('/api/v1/owner/surveys', surveyData);
      // Reload feed
      const { data } = await axios.get(`${API_BASE}/${slug}/feed?tab=surveys&limit=10`);
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
          profile={profile}
          role="owner"
          isOwnProfile={isOwnProfile}
          isFollowing={isFollowing}
          onFollow={handleFollow}
          onUnfollow={handleUnfollow}
        />
      </ErrorBoundary>

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
    </div>
  );
};

export default OwnerProfilePageV2;
