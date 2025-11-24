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
import InviteModal from '../components/InviteModal';
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
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Check if viewing own profile
  const isOwnProfile = user && profile && String(user._id) === String(profile.userId);

  // Load profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`${API_BASE}/${slug}`);
        setProfile(data);

        // Check follow status if not own profile
        if (user && String(user._id) !== String(data.userId)) {
          try {
            const { data: followData } = await api.get(`${API_BASE}/${data._id}/is-following`);
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
        const { data } = await api.get(`${API_BASE}/${slug}/feed?limit=10`);
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
      const { data } = await api.get(
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
      await api.post(`${API_BASE}/${profile._id}/follow`);
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
      await api.delete(`${API_BASE}/${profile._id}/follow`);
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
      await api.post('/v1/visitor/surveys', surveyData);
      // Reload feed
      const { data } = await api.get(`${API_BASE}/${slug}/feed?limit=10`);
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
            ✨ Invite Friends to SalonHub
          </button>
        </div>
      )}

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

      {/* Invite Modal */}
      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
      />
    </div>
  );
};

export default VisitorProfilePageV2;

