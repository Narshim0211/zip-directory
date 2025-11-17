import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ownerItems = [
  { label: 'Dashboard', path: '/owner/dashboard' },
  { label: 'My Business', path: '/owner/my-business' },
  { label: 'My Profile', path: '/owner/profile/me' },
  { label: 'Explore', path: '/owner/explore' },
  { label: 'Surveys', path: '/owner/surveys' },
  { label: 'Time Manager', path: '/owner/time' },
  { 
    label: 'Booking Manager', 
    path: '/owner/booking',
    submenu: [
      { label: 'Dashboard', path: '/owner/booking' },
      { label: 'Booking Public Profile', path: '/owner/booking/public-profile' },
    ]
  },
  { label: 'Notifications', path: '/owner/notifications' },
];

export default function OwnerSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({});

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSubmenu = (label) => {
    setExpandedMenus(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const isSubmenuActive = (submenu) => {
    return submenu.some(item => location.pathname === item.path);
  };

  return (
    <div className="owner-sidebar">
      <div className="owner-sidebar__logo">SalonHub Owner</div>
      <nav className="owner-sidebar__links">
        {ownerItems.map((item) => (
          <div key={item.path}>
            {item.submenu ? (
              <>
                <div
                  className={`owner-sidebar__link owner-sidebar__link--parent${
                    isSubmenuActive(item.submenu) ? ' owner-sidebar__link--active' : ''
                  }`}
                  onClick={() => toggleSubmenu(item.label)}
                >
                  {item.label}
                  <span className="owner-sidebar__arrow">
                    {expandedMenus[item.label] ? '▼' : '▶'}
                  </span>
                </div>
                {expandedMenus[item.label] && (
                  <div className="owner-sidebar__submenu">
                    {item.submenu.map((subItem) => (
                      <NavLink
                        key={subItem.path}
                        to={subItem.path}
                        className={({ isActive }) =>
                          `owner-sidebar__link owner-sidebar__link--sub${
                            isActive ? ' owner-sidebar__link--active' : ''
                          }`
                        }
                      >
                        {subItem.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `owner-sidebar__link${isActive ? ' owner-sidebar__link--active' : ''}`
                }
              >
                {item.label}
              </NavLink>
            )}
          </div>
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
