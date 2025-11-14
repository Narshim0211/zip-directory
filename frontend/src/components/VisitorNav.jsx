import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import { useAuth } from '../context/AuthContext';

const links = [
  { label: 'Home', to: '/home' },
  { label: 'Explore', to: '/explore' },
  { label: 'Time Manager', to: '/time/daily' },
  { label: 'Surveys', to: '/surveys' },
  { label: 'Notifications', to: '/notifications' },
  { label: 'Profile', to: '/profile' },
];

const iconMap = {
  Home: '🏠',
  Explore: '🧭',
  'Time Manager': '⏰',
  Surveys: '📊',
  Notifications: '🔔',
  Profile: '👤',
};

const VisitorNav = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="visitor-nav">
      <div className="visitor-nav__logo">SalonHub</div>
      <nav>
        {links.map((link) => (
          <NavLink
            key={link.label}
            to={link.to}
            className={({ isActive }) =>
              `visitor-nav__link${isActive ? ' visitor-nav__link--active' : ''}`
            }
          >
            <span className="visitor-nav__link-icon">{iconMap[link.label]}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="visitor-nav__actions">
        <div className="visitor-nav__bell-wrapper">
          <NotificationBell />
        </div>
        {user && (
          <button type="button" className="visitor-nav__logout" onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
    </div>
  );
};

export default VisitorNav;
