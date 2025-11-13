import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ProfileHeader from '../components/Shared/ProfileHeader';
import ProfileTabs from '../components/Shared/ProfileTabs';
import ProfileFeed from '../components/Shared/ProfileFeed';
import CreateSection from '../components/Shared/CreateSection';
import AboutCard from '../components/Shared/AboutCard';
import ErrorBoundary from '../components/Shared/ErrorBoundary';
import '../styles/designSystem.css';

/**
 * Main visitor profile page for logged-in visitor viewing their own profile
 * This shows the Facebook-style layout directly (no redirect needed)
 */
const VisitorProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [feed, setFeed] = useState([]);
  const [activeTab, setActiveTab] = useState('surveys');
  const [loading, setLoading] = useState(true);
  const [feedLoading, setFeedLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);

  // Load current user's profile
  useEffect(() => {
    console.log('[VisitorProfilePage] Component mounted, user:', user);

    const loadProfile = async () => {
      try {
        setLoading(true);
        console.log('[VisitorProfilePage] Fetching profile from /v1/visitor-profiles/me');
        // Fetch own profile from v1 endpoint (api already has /api prefix)
        const { data } = await api.get('/v1/visitor-profiles/me');
        console.log('[VisitorProfilePage] Profile loaded:', data);
        setProfile(data);
      } catch (error) {
        console.error('[VisitorProfilePage] Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadProfile();
    } else {
      console.log('[VisitorProfilePage] No user, skipping profile load');
      setLoading(false);
    }
  }, [user]);

  // Load feed when profile or tab changes
  useEffect(() => {
    if (!profile || !profile.slug || activeTab === 'about') return;

    const loadFeed = async () => {
      try {
        setFeedLoading(true);
        const { data } = await api.get(`/v2/visitor-profiles/${profile.slug}/feed?limit=10`);
        setFeed(data.items || []);
        setNextCursor(data.nextCursor);
      } catch (error) {
        console.error('Failed to load feed:', error);
      } finally {
        setFeedLoading(false);
      }
    };

    loadFeed();
  }, [profile, activeTab]);

  // Load more feed items
  const handleLoadMore = async () => {
    if (!nextCursor || feedLoading || !profile) return;

    try {
      setFeedLoading(true);
      const { data } = await api.get(
        `/v2/visitor-profiles/${profile.slug}/feed?limit=10&cursor=${nextCursor}`
      );
      setFeed(prev => [...prev, ...(data.items || [])]);
      setNextCursor(data.nextCursor);
    } catch (error) {
      console.error('Failed to load more:', error);
    } finally {
      setFeedLoading(false);
    }
  };

  // Create survey handler
  const handleCreateSurvey = async (surveyData) => {
    try {
      await api.post('/v1/visitor/surveys', surveyData);
      // Reload feed
      if (profile && profile.slug) {
        const { data } = await api.get(`/v2/visitor-profiles/${profile.slug}/feed?limit=10`);
        setFeed(data.items || []);
        setNextCursor(data.nextCursor);
      }
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
    const hasToken = localStorage.getItem('token');
    return (
      <div className="profile-page">
        <div className="empty-state">
          <div className="empty-state__icon">⚠️</div>
          <p className="empty-state__text">Unable to load your profile</p>
          <p className="empty-state__subtext">Please try refreshing the page</p>
          <p className="empty-state__subtext" style={{marginTop: '20px', color: 'red', fontSize: '12px'}}>
            Debug Info:<br/>
            • User: {user ? '✅ Logged in' : '❌ Not logged in'}<br/>
            • Token: {hasToken ? '✅ Found in localStorage' : '❌ Missing'}<br/>
            • Check browser console (F12) for errors
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Debug marker - remove after confirming it works */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '20px',
        textAlign: 'center',
        fontSize: '18px',
        fontWeight: 'bold',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
      }}>
        ✅ FACEBOOK-STYLE PROFILE PAGE IS ACTIVE!
        <br/>
        <small style={{fontSize: '14px', opacity: 0.9}}>Profile: {profile.firstName} {profile.lastName} (@{profile.handle || 'no-handle'})</small>
      </div>

      <ErrorBoundary>
        <ProfileHeader
          profile={profile}
          role="visitor"
          isOwnProfile={true}
          isFollowing={false}
          onFollow={() => {}}
          onUnfollow={() => {}}
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
          <ErrorBoundary>
            <CreateSection
              role="visitor"
              onCreateSurvey={handleCreateSurvey}
            />
          </ErrorBoundary>

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

export default VisitorProfilePage;
