import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import v1Client from '../../api/v1';
import followService from '../../visitor/services/followService';
import OwnerHomeHeader from '../../components/owner/OwnerHomeHeader';
import CreateContentSection from '../../components/owner/CreateContentSection';
import UnifiedFeed from '../../components/SharedComponents/UnifiedFeed';
import ErrorBoundary from '../../components/SharedComponents/ErrorBoundary';
import './OwnerHome.css';

/**
 * OwnerHome Page
 * Main home page for owner accounts with social feed
 * Separate from owner dashboard (business analytics)
 */
const OwnerHome = () => {
  const { user } = useAuth();
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [followingOwners, setFollowingOwners] = useState([]);

  const loadFeed = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch owner-specific feed
      const feedResponse = await v1Client.feed.getOwnerFeed({ limit: 30 });
      setFeed(feedResponse.items || []);

      // Fetch following list (optional - for UI state)
      try {
        const following = await followService.getFollowing();
        setFollowingOwners(following.filter((item) => item.role === 'owner'));
      } catch (followErr) {
        console.warn('Could not fetch following list:', followErr);
        setFollowingOwners([]);
      }
    } catch (err) {
      console.error('Failed to load feed:', err);
      setError('Unable to load your feed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, []);

  const handleContentCreated = async (contentType) => {
    console.log(`${contentType} created, refreshing feed...`);
    // Refresh feed after creating content
    await loadFeed();
  };

  return (
    <ErrorBoundary>
      <div className="owner-home-page">
        <div className="owner-home-page__container">
          <ErrorBoundary>
            <OwnerHomeHeader />
          </ErrorBoundary>

          <ErrorBoundary>
            <CreateContentSection onContentCreated={handleContentCreated} />
          </ErrorBoundary>

          <div className="owner-home-page__feed-section">
            <h2 className="owner-home-page__feed-title">Community Feed</h2>
            <p className="owner-home-page__feed-subtitle">
              Latest posts and surveys from owners and visitors you follow
            </p>

            <ErrorBoundary>
              <UnifiedFeed
                feedItems={feed}
                loading={loading}
                error={error}
                followingList={followingOwners}
                role="owner"
                emptyMessage="No posts or surveys yet. Follow other owners to see their updates!"
              />
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default OwnerHome;
