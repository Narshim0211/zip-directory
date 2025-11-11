import React, { useEffect, useMemo, useState } from 'react';
import feedService from '../visitor/services/feedService';
import followService from '../visitor/services/followService';
import FeedPostCard from '../visitor/components/FeedPostCard';
import FeedSurveyCard from '../visitor/components/FeedSurveyCard';
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
        const [feedData, following] = await Promise.all([
          feedService.getFeed(),
          followService.getFollowing(),
        ]);
        setFeed(feedData);
        setFollowingOwners(following.filter((item) => item.role === 'owner'));
      } catch (err) {
        console.error('Feed loading failed', err);
        setError('Unable to load your feed right now.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const posts = useMemo(() => feed.filter((item) => item.type === 'post'), [feed]);
  const surveys = useMemo(() => feed.filter((item) => item.type === 'survey'), [feed]);

  return (
    <div className="visitor-home-page visitor-home-page--feed">
      <section className="visitor-home-page__content">
        <header className="visitor-home-page__hero">
          <h1>Welcome back to SalonHub</h1>
          <p>Your personalized feed of salon posts and community surveys.</p>
        </header>

        {loading && <p className="visitor-home-page__status">Loading your feed...</p>}
        {error && <p className="visitor-home-page__status-error">{error}</p>}

        <div className="visitor-home-page__feed-grid">
          {posts.map((post) => (
            <FeedPostCard key={post._id || post.id || post.url} post={post} followingOwners={followingOwners} />
          ))}
          {surveys.map((survey) => (
            <FeedSurveyCard key={survey._id || survey.id} survey={survey} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default VisitorHome;
