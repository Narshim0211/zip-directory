/**
 * ProfileTabs Component
 * Tab navigation for profile content: About, Surveys, Posts
 * World-class UX with smooth transitions
 */
import React, { useEffect, useState } from 'react';
import { getProfileById } from '../../api/profileApi';
import SurveyCard from '../content/SurveyCard';
import PostCard from '../content/PostCard';
import './ProfileTabs.css';

const ProfileTabs = ({ userId, role, activeTab, onTabChange }) => {
  const [tabContent, setTabContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadTabContent = async () => {
      if (activeTab === 'about') {
        // Load user profile details for About tab
        try {
          setLoading(true);
          const profileData = await getProfileById(userId);
          setTabContent({ type: 'about', data: profileData });
        } catch (err) {
          console.error('Failed to load about:', err);
          setError('Unable to load profile details');
        } finally {
          setLoading(false);
        }
      } else if (activeTab === 'surveys') {
        // TODO: Load surveys
        setTabContent({ type: 'surveys', data: [] });
      } else if (activeTab === 'posts' && role === 'owner') {
        // TODO: Load posts
        setTabContent({ type: 'posts', data: [] });
      }
    };

    loadTabContent();
  }, [activeTab, userId, role]);

  return (
    <div className="profile-tabs">
      {/* Tab Navigation */}
      <div className="profile-tabs__nav">
        <button
          className={`profile-tabs__tab ${activeTab === 'about' ? 'active' : ''}`}
          onClick={() => onTabChange('about')}
        >
          About
        </button>
        <button
          className={`profile-tabs__tab ${activeTab === 'surveys' ? 'active' : ''}`}
          onClick={() => onTabChange('surveys')}
        >
          Surveys
        </button>
        {role === 'owner' && (
          <button
            className={`profile-tabs__tab ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => onTabChange('posts')}
          >
            Posts
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="profile-tabs__content">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#666' }}>
            Loading...
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#e53e3e' }}>
            {error}
          </div>
        ) : (
          <TabContentRenderer content={tabContent} />
        )}
      </div>
    </div>
  );
};

const TabContentRenderer = ({ content }) => {
  if (!content) return null;

  if (content.type === 'about') {
    return (
      <div className="profile-about">
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>About</h3>
        <p style={{ color: '#555', lineHeight: '1.6' }}>
          {content.data?.bio || content.data?.about || 'No bio available.'}
        </p>
        {content.data?.email && (
          <p style={{ marginTop: '16px', color: '#666' }}>
            <strong>Email:</strong> {content.data.email}
          </p>
        )}
      </div>
    );
  }

  if (content.type === 'surveys') {
    return (
      <div className="profile-surveys">
        {content.data && content.data.length > 0 ? (
          content.data.map(survey => (
            <SurveyCard key={survey._id} survey={survey} />
          ))
        ) : (
          <p style={{ textAlign: 'center', color: '#666', padding: '32px 0' }}>
            No surveys yet.
          </p>
        )}
      </div>
    );
  }

  if (content.type === 'posts') {
    return (
      <div className="profile-posts">
        {content.data && content.data.length > 0 ? (
          content.data.map(post => (
            <PostCard key={post._id} post={post} />
          ))
        ) : (
          <p style={{ textAlign: 'center', color: '#666', padding: '32px 0' }}>
            No posts yet.
          </p>
        )}
      </div>
    );
  }

  return null;
};

export default ProfileTabs;
