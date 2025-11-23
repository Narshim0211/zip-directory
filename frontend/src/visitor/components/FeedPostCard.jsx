import React from "react";
import { Link } from "react-router-dom";
import IdentityBadge from "../../components/SharedComponents/IdentityBadge";
import FollowButton from "../../components/FollowButton";
import PostEngagementBar from "../../components/engagement/PostEngagementBar";
import VerificationBadgeInline from "../../components/VerificationBadgeInline";

/**
 * FeedPostCard - Post card for visitor feed
 *
 * Follow state is now managed globally by FollowContext.
 * No more local follow state - all posts from same user update together!
 *
 * PHASE 3: Added visual hierarchy - follow glow and premium orbit
 *
 * OPTIMIZED with React.memo - prevents re-renders when props haven't changed
 */
const FeedPostCard = React.memo(function FeedPostCard({ post }) {
  // Determine visual hierarchy classes
  const isFollowed = post._isFollowed || false;
  const isPremium = post._isPremium || (post.author?.isPremium) || false;

  // Build dynamic class names for visual hierarchy
  const cardClasses = `feed-card ${
    isFollowed ? 'feed-card--followed' : ''
  } ${
    isPremium ? 'feed-card--premium' : ''
  }`.trim();

  return (
    <article className={cardClasses}>
      {/* Premium orbit effect */}
      {isPremium && <div className="premium-orbit"></div>}
      <header className="feed-card__header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link
                to={`/profile/${post.author?._id}`}
                state={{ from: 'feed' }}
                style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
              >
                <IdentityBadge identity={post.identity} author={post.author} />
                {post.author?.role === 'owner' && post.business?.verificationStatus && (
                  <VerificationBadgeInline status={post.business.verificationStatus} />
                )}
              </Link>
              <span style={{
                display: 'inline-block',
                padding: '2px 8px',
                fontSize: '11px',
                fontWeight: '600',
                borderRadius: '4px',
                backgroundColor: post.author?.role === 'owner' ? '#dbeafe' : '#f3e8ff',
                color: post.author?.role === 'owner' ? '#1e40af' : '#6b21a8',
                textTransform: 'uppercase'
              }}>
                {post.author?.role === 'owner' ? 'Owner' : 'Visitor'}
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>{new Date(post.createdAt).toLocaleString()}</p>
          </div>
          <FollowButton targetId={post.author?._id} targetType={post.author?.role || 'owner'} />
        </div>
      </header>
      <p className="feed-card__content">{post.content}</p>
      {post.media?.length > 0 && (
        <div className="feed-card__media">
          <img src={post.media[0]} alt="post media" />
        </div>
      )}

      {/* Engagement metrics always visible */}
      <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #eee' }}>
        <PostEngagementBar postId={post._id} />
      </div>
    </article>
  );
});

export default FeedPostCard;

