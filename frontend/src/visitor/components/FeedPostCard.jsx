import React from "react";
import IdentityBadge from "../../components/Shared/IdentityBadge";
import FollowButton from "../../components/FollowButton";

export default function FeedPostCard({ post, followingOwners = [] }) {
  const isFollowing = Boolean(followingOwners.find((owner) => String(owner._id) === String(post.author?._id)));

  return (
    <article className="feed-card">
      <header className="feed-card__header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div>
            <IdentityBadge identity={post.identity} author={post.author} />
            <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>{new Date(post.createdAt).toLocaleString()}</p>
          </div>
          <FollowButton targetId={post.identity?.profileId || post.author?._id} targetType={post.identity?.role || 'owner'} initialFollowing={isFollowing} />
        </div>
      </header>
      <p className="feed-card__content">{post.content}</p>
      {post.media?.length > 0 && (
        <div className="feed-card__media">
          <img src={post.media[0]} alt="post media" />
        </div>
      )}
    </article>
  );
}
