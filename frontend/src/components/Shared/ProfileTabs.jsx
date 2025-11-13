import React from 'react';
import '../../styles/designSystem.css';

const ProfileTabs = ({ activeTab, onTabChange, role, counts = {} }) => {
  // Different tabs based on role
  const tabs = role === 'owner'
    ? [
        { id: 'posts', label: 'Posts' },
        { id: 'surveys', label: 'Surveys' },
        { id: 'about', label: 'About' }
      ]
    : [
        { id: 'surveys', label: 'Surveys' },
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
        </button>
      ))}
    </div>
  );
};

export default ProfileTabs;
