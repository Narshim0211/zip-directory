import React, { useEffect, useState } from 'react';
import v1Client from '../api/v1';
import FeedPostCard from '../visitor/components/FeedPostCard';
import FeedSurveyCard from '../visitor/components/FeedSurveyCard';
import SearchSection from '../visitor/components/SearchSection';
import CreateSurveyModal from './CreateSurveyModal';
import '../styles/ownerDashboard.css';

const OwnerDashboard = () => {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ following: 0, followers: 0, surveys: 0 });
  const [showSurveyModal, setShowSurveyModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch feed with owner authentication (will show followed owners first)
        const feedResponse = await v1Client.feed.getFeed({ limit: 30 });
        setFeed(feedResponse.items || []);

        // Fetch owner stats (following/followers)
        try {
          const [followingRes, followersRes] = await Promise.all([
            v1Client.owner.getFollowing({ limit: 1 }),
            v1Client.owner.getFollowers({ limit: 1 })
          ]);
          setStats({
            following: followingRes.pagination?.total || 0,
            followers: followersRes.pagination?.total || 0,
            surveys: 0 // Will be populated later
          });
        } catch (statsErr) {
          console.warn('Could not fetch stats:', statsErr);
        }
      } catch (err) {
        console.error('Feed loading failed', err);
        setError('Unable to load your feed right now.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCreateSurvey = async (surveyData) => {
    try {
      await v1Client.owner.surveys.create(surveyData);
      // Refresh feed
      const feedResponse = await v1Client.feed.getFeed({ limit: 30 });
      setFeed(feedResponse.items || []);
    } catch (err) {
      console.error('Failed to create survey:', err);
      throw err;
    }
  };

  return (
    <div className="owner-dashboard">
      <div className="owner-dashboard__container">
        <header className="owner-dashboard__hero">
          <h1 className="owner-dashboard__title">Welcome to Your Dashboard</h1>
          <p className="owner-dashboard__subtitle">
            Discover trends, connect with other salon owners, and grow your business.
          </p>
        </header>

        {/* Stats Bar */}
        <div className="owner-dashboard__stats">
          <div className="stat-card">
            <span className="stat-value">{stats.following}</span>
            <span className="stat-label">Following</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.followers}</span>
            <span className="stat-label">Followers</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.surveys}</span>
            <span className="stat-label">Surveys Created</span>
          </div>
        </div>

        <SearchSection />

        {loading && <p className="owner-dashboard__status">Loading your feed...</p>}
        {error && <p className="owner-dashboard__status-error">{error}</p>}

        {!loading && !error && feed.length === 0 && (
          <div className="owner-dashboard__empty">
            <p>No posts or surveys yet. Start following other salon owners to see their updates!</p>
          </div>
        )}

        <div className="owner-dashboard__feed">
          {feed.map((item) => {
            if (item.type === 'post') {
              return (
                <FeedPostCard
                  key={item.data._id || item.data.id}
                  post={item.data}
                  followingOwners={[]} // Owner-specific following list
                />
              );
            } else if (item.type === 'survey') {
              return <FeedSurveyCard key={item.data._id || item.data.id} survey={item.data} />;
            }
            return null;
          })}
        </div>
      </div>

      {/* Floating Create Button */}
      <button
        className="fab"
        onClick={() => setShowSurveyModal(true)}
        title="Create Survey"
      >
        +
      </button>

      {/* Create Survey Modal */}
      <CreateSurveyModal
        isOpen={showSurveyModal}
        onClose={() => setShowSurveyModal(false)}
        onSubmit={handleCreateSurvey}
        role="owner"
      />
    </div>
  );
};

export default OwnerDashboard;
