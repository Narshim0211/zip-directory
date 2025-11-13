import React from 'react';

export default function ProgressAnalytics({ tasks = [] }) {
  const total = tasks.length;
  const completed = tasks.filter(t => (t.completed || t.status === 'completed')).length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="tm-analytics">
      <div className="tm-analytics__meter">
        <div className="tm-analytics__bar" style={{ width: `${pct}%` }} />
      </div>
      <div className="tm-analytics__label">Progress: {completed}/{total} ({pct}%)</div>
    </div>
  );
}
