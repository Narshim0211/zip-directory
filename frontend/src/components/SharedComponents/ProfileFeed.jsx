import React from 'react';
import '../../styles/designSystem.css';

const FeedItem = ({ item }) => {
  const { type, data, createdAt } = item;
  const timeAgo = new Date(createdAt).toLocaleDateString();

  return (
    <div className="feed-item">
      <span className="feed-item__type-badge">{type}</span>

      <div className="feed-item__content">
        {type === 'post' && (
          <>
            <p>{data.content}</p>
            {data.media && data.media.length > 0 && (
              <img
                src={data.media[0]}
                alt="Post media"
                style={{ maxWidth: '100%', borderRadius: '8px', marginTop: '12px' }}
              />
            )}
          </>
        )}

        {type === 'survey' && (
          <>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>{data.title}</h3>
            {data.description && <p>{data.description}</p>}
            {data.options && data.options.length > 0 && (
              <div style={{ marginTop: '12px' }}>
                {data.options.map((option, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '8px 12px',
                      background: '#F2F3F5',
                      borderRadius: '8px',
                      marginBottom: '8px'
                    }}
                  >
                    {typeof option === 'string' ? option : (option.label || option.text || '')}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div className="feed-item__meta">
        {timeAgo}
      </div>
    </div>
  );
};

const ProfileFeed = ({ items, loading, onLoadMore, hasMore }) => {
  if (loading && items.length === 0) {
    return (
      <div className="profile-feed">
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <div className="shimmer" style={{ height: '100px', width: '100%', marginBottom: '16px' }} />
          <div className="shimmer" style={{ height: '100px', width: '100%', marginBottom: '16px' }} />
          <div className="shimmer" style={{ height: '100px', width: '100%' }} />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="profile-feed">
        <div className="empty-state">
          <div className="empty-state__icon">📭</div>
          <p className="empty-state__text">No content yet</p>
          <p style={{ fontSize: '14px', color: '#8A8D91' }}>
            When this user creates content, it will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-feed">
      {items.map((item, index) => (
        <FeedItem key={index} item={item} />
      ))}

      {hasMore && (
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <button
            className="btn btn-secondary"
            onClick={onLoadMore}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileFeed;
