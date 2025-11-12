import React from 'react';
import './ProfileTabs.css';

const ProfileTabs = ({ activeTab, onTabChange, counts = {} }) => {
  const tabs = [
    { id: 'posts', label: 'Posts', count: counts.posts || 0 },
    { id: 'surveys', label: 'Surveys', count: counts.surveys || 0 },
    { id: 'about', label: 'About' }
  ];

  return (
    <div className="profile-tabs">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`profile-tabs__tab ${activeTab === tab.id ? 'profile-tabs__tab--active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
          {tab.count !== undefined && tab.count > 0 && (
            <span className="profile-tabs__count">({tab.count})</span>
          )}
        </button>
      ))}
    </div>
  );
};

export default ProfileTabs;
