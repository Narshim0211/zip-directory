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

const API_BASE = '/api/v2/visitor-profiles';

const VisitorProfilePageV2 = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [feed, setFeed] = useState([]);
  const [activeTab, setActiveTab] = useState('surveys');
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [feedLoading, setFeedLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);

  // Check if viewing own profile
  const isOwnProfile = user && profile && String(user._id) === String(profile.userId);

  // Load profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${API_BASE}/${slug}`);
        setProfile(data);

        // Check follow status if not own profile
        if (user && String(user._id) !== String(data.userId)) {
          try {
            const { data: followData } = await axios.get(`${API_BASE}/${data._id}/is-following`);
            setIsFollowing(followData.following);
          } catch (err) {
            console.error('Failed to check follow status:', err);
          }
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [slug, user]);

  // Load feed when profile or tab changes
  useEffect(() => {
    if (!profile || activeTab === 'about') return;

    const loadFeed = async () => {
      try {
        setFeedLoading(true);
        const { data } = await axios.get(`${API_BASE}/${slug}/feed?limit=10`);
        setFeed(data.items || []);
        setNextCursor(data.nextCursor);
      } catch (error) {
        console.error('Failed to load feed:', error);
      } finally {
        setFeedLoading(false);
      }
    };

    loadFeed();
  }, [profile, slug, activeTab]);

  // Load more feed items
  const handleLoadMore = async () => {
    if (!nextCursor || feedLoading) return;

    try {
      setFeedLoading(true);
      const { data } = await axios.get(
        `${API_BASE}/${slug}/feed?limit=10&cursor=${nextCursor}`
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
        followersCount: (prev.followersCount || 0) + 1
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
        followersCount: Math.max((prev.followersCount || 0) - 1, 0)
      }));
    } catch (error) {
      console.error('Failed to unfollow:', error);
    }
  };

  // Create survey handler
  const handleCreateSurvey = async (surveyData) => {
    try {
      await axios.post('/api/v1/visitor/surveys', surveyData);
      // Reload feed
      const { data } = await axios.get(`${API_BASE}/${slug}/feed?limit=10`);
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
          role="visitor"
          isOwnProfile={isOwnProfile}
          isFollowing={isFollowing}
          onFollow={handleFollow}
          onUnfollow={handleUnfollow}
        />
      </ErrorBoundary>

      <ProfileTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        role="visitor"
      />

      {activeTab === 'about' ? (
        <ErrorBoundary>
          <div className="profile-feed">
            <AboutCard
              profile={profile}
              role="visitor"
            />
          </div>
        </ErrorBoundary>
      ) : (
        <>
          {isOwnProfile && (
            <ErrorBoundary>
              <CreateSection
                role="visitor"
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

export default VisitorProfilePageV2;
