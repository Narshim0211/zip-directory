import React from 'react';
import IdentityBadge from './Shared/IdentityBadge';

const PostCard = ({ post }) => (
  <div className="post-card">
    <div className="post-card__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <IdentityBadge identity={post.identity} author={post.author} />
      <span>{new Date(post.createdAt).toLocaleString()}</span>
    </div>
    <p className="post-card__content">{post.content}</p>
    <div className="post-card__footer">
      <span>{(post.comments || []).length} comments</span>
    </div>
  </div>
);

export default PostCard;
