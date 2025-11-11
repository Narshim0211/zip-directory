import React from 'react';

const FollowerTrend = ({ data = [] }) => {
  const highlight = data.slice(-1)[0];
  return (
    <div className="follower-trend">
      <div className="follower-trend__header">
        <span>Follower trend</span>
        <small>Unique visitors by day</small>
      </div>
      <div className="follower-trend__today">
        <strong>{highlight ? highlight.uniqueFollowers : 0}</strong>
        <span>new visitors today</span>
      </div>
      {data.length === 0 ? (
        <div className="follower-trend__empty">Visits will appear here as people explore your profile.</div>
      ) : (
        <div className="follower-trend__grid">
          {data.map((item) => (
            <div key={item.date} className="follower-trend__card">
              <span>{item.date.slice(5)}</span>
              <strong>{item.uniqueFollowers || 0}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FollowerTrend;
