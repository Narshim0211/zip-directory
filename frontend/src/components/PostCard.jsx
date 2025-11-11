import React from 'react';

const PostCard = ({ post }) => (
  <div className="post-card">
    <div className="post-card__header">
      <strong>{post.author?.name || 'Owner'}</strong>
      <span>{new Date(post.createdAt).toLocaleString()}</span>
    </div>
    <p className="post-card__content">{post.content}</p>
    <div className="post-card__footer">
      <span>{(post.comments || []).length} comments</span>
    </div>
  </div>
);

export default PostCard;
