import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ownerItems = [
  { label: 'Dashboard', path: '/owner/dashboard' },
  { label: 'My Business', path: '/owner/my-business' },
  { label: 'My Profile', path: '/owner/profile/me' },
  { label: 'Explore', path: '/owner/explore' },
  { label: 'Surveys', path: '/owner/surveys' },
  { label: 'Time Manager', path: '/owner/time' },
  { label: 'Notifications', path: '/owner/notifications' },
];

export default function OwnerSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="owner-sidebar">
      <div className="owner-sidebar__logo">SalonHub Owner</div>
      <nav className="owner-sidebar__links">
        {ownerItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `owner-sidebar__link${isActive ? ' owner-sidebar__link--active' : ''}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      {user && (
        <button type="button" className="owner-sidebar__logout" onClick={handleLogout}>
          Logout
        </button>
      )}
    </div>
  );
}
