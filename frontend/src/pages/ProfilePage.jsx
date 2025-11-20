/**
 * ProfilePage - Unified Profile View
 * World-class, Instagram-style user profile
 * Works for both Visitors and Owners
 * Route: /profile/:userId
 */
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { getProfileById } from '../api/profileApi';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileStats from '../components/profile/ProfileStats';
import ProfileFollowButton from '../components/profile/ProfileFollowButton';
import ProfileTabs from '../components/profile/ProfileTabs';
import ErrorBoundary from '../components/SharedComponents/ErrorBoundary';

const ProfilePage = () => {
  const { userId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('about');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getProfileById(userId);
      // Backend returns { success: true, data: {...} }
      const profileData = response.data || response;
      setProfile(profileData);
    } catch (e) {
      console.error('Profile fetch error:', e);
      setError('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (loading) {
    return (
      <div className="profile-page" style={{ maxWidth: 700, margin: '0 auto', padding: '20px 24px' }}>
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <div style={{ fontSize: '16px', color: '#666' }}>Loading profile...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page" style={{ maxWidth: 700, margin: '0 auto', padding: '20px 24px' }}>
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <p style={{ color: '#e53e3e', fontSize: '16px' }}>{error}</p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const showBackButton = location.state?.from === 'feed';

  return (
    <ErrorBoundary>
      <div className="profile-page" style={{ maxWidth: 700, margin: '0 auto', padding: '20px 24px' }}>
        {showBackButton && (
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              marginBottom: '16px',
              background: 'transparent',
              border: '1px solid #ddd',
              borderRadius: '8px',
              color: '#333',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = '#f5f5f5'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <span style={{ fontSize: '16px' }}>←</span>
            Back to Feed
          </button>
        )}
        <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '32px' }}>
          <ErrorBoundary>
            <ProfileHeader profile={profile} />
          </ErrorBoundary>

          <ErrorBoundary>
            <ProfileStats profile={profile} />
          </ErrorBoundary>

          <ErrorBoundary>
            <ProfileFollowButton profileUser={profile} onFollowChange={fetchProfile} />
          </ErrorBoundary>

          <ErrorBoundary>
            <ProfileTabs
              userId={userId}
              role={profile.role}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </ErrorBoundary>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default ProfilePage;
