import React from 'react';

const TopPostsTable = ({ posts = [] }) => {
  return (
    <div className="top-posts-panel">
      <div className="top-posts-panel__title">Top reviews</div>
      {posts.length === 0 ? (
        <div className="top-posts-panel__empty">No posts to highlight yet.</div>
      ) : (
        posts.map((post) => (
          <div key={post.id} className="top-post">
            <div className="top-post__header">
              <span>{post.business?.name || 'Business'}</span>
              <strong>{post.rating?.toFixed(1) || '–'}★</strong>
            </div>
            <p>{post.text?.length > 120 ? `${post.text.slice(0, 120)}…` : post.text}</p>
            <div className="top-post__meta">
              <span>{post.author?.name || 'Visitor'}</span>
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="top-post__actions">
              {post.business?.id && (
                <a className="btn outline" href={`/business/${post.business.id}`}>View business</a>
              )}
              {post.link && (
                <a className="btn" href={post.link}>Read review</a>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default TopPostsTable;
