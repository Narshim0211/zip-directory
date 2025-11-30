import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import v1Client from '../../api/v1';
import FeedPostCard from '../../visitor/components/FeedPostCard';
import FeedSurveyCard from '../../visitor/components/FeedSurveyCard';
import SearchSection from '../../visitor/components/SearchSection';
import CreateSurveyModal from '../../components/CreateSurveyModal';
import CreatePostModal from '../../components/CreatePostModal';
import SurveyInsightsPanel from './components/SurveyInsightsPanel';
import TrendingWeekPanel from './components/TrendingWeekPanel';
import TrendingMobileSection from './components/TrendingMobileSection';
import ProfileAvatar from '../../components/ProfileAvatar';
import '../../styles/ownerHome.css';

/**
 * OwnerHome Page
 * Main home page for owner accounts with social feed
 * Same UX as Visitor Home but for owners
 *
 * Follow state is now managed globally by FollowContext - no need to fetch it here!
 */
const OwnerHome = () => {
  const { user } = useAuth();
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch feed - same feed system as visitor
        const feedResponse = await v1Client.feed.getFeed({ limit: 30 });
        setFeed(feedResponse.items || []);
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

  const handleCreatePost = async (postData) => {
    try {
      await v1Client.owner.posts.create(postData);
      // Refresh feed
      const feedResponse = await v1Client.feed.getFeed({ limit: 30 });
      setFeed(feedResponse.items || []);
    } catch (err) {
      console.error('Failed to create post:', err);
      throw err;
    }
  };

  return (
    <div className="owner-home-page">
      {/* Profile Avatar - Instagram/TikTok style */}
      {user && <ProfileAvatar user={user} isPremium={user.role === 'owner'} />}

      <div className="owner-home-page__grid">
        {/* Left Sidebar - Survey Insights */}
        <aside className="owner-home-page__sidebar-left">
          <SurveyInsightsPanel />
        </aside>

        {/* Main Content Area */}
        <div className="owner-home-page__container">
          <header className="owner-home-page__hero">
            <h1 className="owner-home-page__title">SalonHub Owner</h1>
            <p className="owner-home-page__subtitle">
              Connect with other salon owners, share insights, and grow your business.
            </p>
          </header>

          <SearchSection />

          {/* Mobile Trending Section - Shows only on tablet/mobile */}
          <TrendingMobileSection />

          {loading && <p className="owner-home-page__status">Loading your feed...</p>}
          {error && <p className="owner-home-page__status-error">{error}</p>}

          {!loading && !error && feed.length === 0 && (
            <div className="owner-home-page__empty">
              <p>No posts or surveys yet. Start following salons to see their updates!</p>
            </div>
          )}

          <div className="owner-home-page__feed">
            {feed.map((item) => {
              // v1 API returns { type, data } format
              if (item.type === 'post') {
                return (
                  <FeedPostCard
                    key={item.data._id || item.data.id}
                    post={item.data}
                  />
                );
              } else if (item.type === 'survey') {
                return (
                  <FeedSurveyCard
                    key={item.data._id || item.data.id}
                    survey={item.data}
                  />
                );
              }
              return null;
            })}
          </div>
        </div>

        {/* Right Sidebar - Trending Week */}
        <aside className="owner-home-page__sidebar-right">
          <TrendingWeekPanel />
        </aside>
      </div>

      {/* Floating Create Buttons */}
      <button
        className="fab fab-survey"
        onClick={() => setShowSurveyModal(true)}
        title="Create Survey"
        style={{ bottom: '90px' }}
      >
        📊
      </button>

      <button
        className="fab fab-post"
        onClick={() => setShowPostModal(true)}
        title="Create Post"
        style={{ bottom: '30px' }}
      >
        ✏️
      </button>

      {/* Modals */}
      <CreateSurveyModal
        isOpen={showSurveyModal}
        onClose={() => setShowSurveyModal(false)}
        onSubmit={handleCreateSurvey}
        role="owner"
      />

      <CreatePostModal
        isOpen={showPostModal}
        onClose={() => setShowPostModal(false)}
        onSubmit={handleCreatePost}
        role="owner"
      />
    </div>
  );
};

export default OwnerHome;
