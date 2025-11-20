// PostCard.jsx
import React from 'react';
import PostEngagementBar from '../engagement/PostEngagementBar';

const PostCard = ({ post }) => (
  <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 16, marginBottom: 16 }}>
    {/* ...existing post content... */}
    <div style={{ fontWeight: 600 }}>{post.title}</div>
    <div style={{ color: '#888', marginBottom: 8 }}>{post.body}</div>
    {/* Engagement bar always visible */}
    <PostEngagementBar postId={post._id} />
  </div>
);
export default PostCard;
