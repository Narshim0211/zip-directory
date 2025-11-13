import React from 'react';

const GoalCard = ({ goal = {} }) => {
  const progress = goal.targetValue ? Math.min(100, Math.round((goal.currentProgress / goal.targetValue) * 100)) : 0;

  return (
    <div className="goal-card" style={{ border: '1px solid #eee', padding: 12, borderRadius: 8 }}>
      <h4 style={{ margin: 0 }}>{goal.title}</h4>
      {goal.description && <p style={{ margin: '6px 0' }}>{goal.description}</p>}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <small style={{ color: '#666' }}>{goal.category || 'General'}</small>
        <div style={{ minWidth: 140 }}>
          <div style={{ background: '#f1f1f1', height: 8, borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: '#4caf50' }} />
          </div>
          <small style={{ color: '#666' }}>{progress}%</small>
        </div>
      </div>
    </div>
  );
};

export default GoalCard;
