import React, { useEffect, useState } from 'react';
import v1Client from '../api/v1';
import followService from '../visitor/services/followService';
import FeedPostCard from '../visitor/components/FeedPostCard';
import FeedSurveyCard from '../visitor/components/FeedSurveyCard';
import SearchSection from '../visitor/components/SearchSection';
import '../styles/visitorHomePage.css';

const VisitorHome = () => {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [followingOwners, setFollowingOwners] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch feed - this should always work (no auth required)
        const feedResponse = await v1Client.feed.getFeed({ limit: 30 });
        setFeed(feedResponse.items || []);

        // Try to fetch following list, but don't fail if auth expires
        try {
          const following = await followService.getFollowing();
          setFollowingOwners(following.filter((item) => item.role === 'owner'));
        } catch (followErr) {
          console.warn('Could not fetch following list (auth may have expired):', followErr);
          // Continue showing feed even if following list fails
          setFollowingOwners([]);
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

  return (
    <div className="visitor-home-page">
      <div className="visitor-home-page__container">
        <header className="visitor-home-page__hero">
          <h1 className="visitor-home-page__title">Welcome to SalonHub</h1>
          <p className="visitor-home-page__subtitle">
            Discover salons, trends, and connect with beauty creators.
          </p>
        </header>

        <SearchSection />

        {loading && <p className="visitor-home-page__status">Loading your feed...</p>}
        {error && <p className="visitor-home-page__status-error">{error}</p>}

        {!loading && !error && feed.length === 0 && (
          <div className="visitor-home-page__empty">
            <p>No posts or surveys yet. Start following salons to see their updates!</p>
          </div>
        )}

        <div className="visitor-home-page__feed">
          {feed.map((item) => {
            // v1 API returns { type, data } format
            if (item.type === 'post') {
              return (
                <FeedPostCard
                  key={item.data._id || item.data.id}
                  post={item.data}
                  followingOwners={followingOwners}
                />
              );
            } else if (item.type === 'survey') {
              return <FeedSurveyCard key={item.data._id || item.data.id} survey={item.data} />;
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
};

export default VisitorHome;
