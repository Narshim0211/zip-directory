import React from 'react';

const EngagementChart = ({ data = [] }) => {
  if (!data.length) {
    return <div className="engagement-chart__empty">No activity yet.</div>;
  }

  const stats = [
    { label: 'Views', value: data.reduce((acc, item) => acc + (item.views || 0), 0), color: '#2563eb' },
    { label: 'Comments', value: data.reduce((acc, item) => acc + (item.comments || 0), 0), color: '#9333ea' },
    { label: 'Likes', value: data.reduce((acc, item) => acc + (item.likes || 0), 0), color: '#f97316' },
    { label: 'Reviews', value: data.reduce((acc, item) => acc + (item.reviews || 0), 0), color: '#10b981' },
  ];
  const maxValue = Math.max(...data.map((item) => item.views + item.comments + item.likes + item.reviews), 1);

  return (
    <div className="engagement-chart engagement-chart--summary">
      <div className="engagement-chart__grid">
        {stats.map((stat) => (
          <div key={stat.label} className="engagement-chart__stat">
            <span>{stat.label}</span>
            <strong>{stat.value.toLocaleString()}</strong>
            <div className="engagement-chart__stat-bar" style={{ background: stat.color }} />
          </div>
        ))}
      </div>
      <div className="engagement-chart__sparkline">
        <span className="engagement-chart__sparkline-label">Weekly trend</span>
        <div className="engagement-chart__sparkline-bars">
          {data.map((item) => {
            const total = item.views + item.comments + item.likes + item.reviews;
            const height = Math.round((total / maxValue) * 100);
            return (
              <div key={item.date} className="engagement-chart__sparkline-bar">
                <div className="engagement-chart__sparkline-fill" style={{ height: `${height}%` }} />
                <span>{item.date.slice(5)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EngagementChart;
