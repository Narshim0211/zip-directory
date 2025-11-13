import React from 'react';
import { Link, useLocation } from 'react-router-dom';

/**
 * Microservices Navigation Component
 * 
 * Add this to your OwnerLayout or VisitorLayout navigation menu
 * to provide quick access to microservices features
 */
const MicroservicesNav = ({ className = '' }) => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  const navItems = [
    {
      path: '/microservices',
      label: 'Dashboard',
      icon: '📊',
      description: 'Overview of all services'
    },
    {
      path: '/microservices/profile',
      label: 'Profile',
      icon: '👤',
      description: 'Manage your profile'
    },
    {
      path: '/microservices/services',
      label: 'Services',
      icon: '✂️',
      description: 'Manage your services'
    },
    {
      path: '/microservices/bookings',
      label: 'Bookings',
      icon: '📅',
      description: 'Manage appointments'
    },
    {
      path: '/microservices/payments',
      label: 'Payments',
      icon: '💳',
      description: 'Financial management'
    }
  ];

  return (
    <div className={`microservices-nav ${className}`}>
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Microservices
        </h3>
      </div>
      <nav className="space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`
              flex items-center px-3 py-2 text-sm font-medium rounded-md
              transition-colors duration-150
              ${
                isActive(item.path)
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }
            `}
            title={item.description}
          >
            <span className="mr-3 text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default MicroservicesNav;

/**
 * Usage in OwnerLayout.jsx or VisitorLayout.jsx:
 * 
 * import MicroservicesNav from '../components/microservices/MicroservicesNav';
 * 
 * // In your sidebar navigation:
 * <aside className="sidebar">
 *   {/* Existing navigation items *\/}
 *   <div className="my-4 border-t border-gray-200"></div>
 *   <MicroservicesNav />
 * </aside>
 */

/**
 * Compact Version for Horizontal Navbar:
 */
export const MicroservicesNavHorizontal = ({ className = '' }) => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { path: '/microservices', label: 'MS Dashboard', icon: '📊' },
    { path: '/microservices/profile', label: 'Profile', icon: '👤' },
    { path: '/microservices/services', label: 'Services', icon: '✂️' },
    { path: '/microservices/bookings', label: 'Bookings', icon: '📅' },
    { path: '/microservices/payments', label: 'Payments', icon: '💳' }
  ];

  return (
    <div className={`flex space-x-4 ${className}`}>
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`
            flex items-center px-3 py-2 text-sm font-medium rounded-md
            transition-colors duration-150
            ${
              isActive(item.path)
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }
          `}
        >
          <span className="mr-2">{item.icon}</span>
          <span className="hidden md:inline">{item.label}</span>
        </Link>
      ))}
    </div>
  );
};
