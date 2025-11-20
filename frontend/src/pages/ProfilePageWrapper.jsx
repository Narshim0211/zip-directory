import React from 'react';
import { useAuth } from '../context/AuthContext';
import VisitorSidebar from '../visitor/components/VisitorSidebar';
import TrendingNewsSidebar from '../visitor/components/TrendingNewsSidebar';
import OwnerSidebar from '../components/OwnerSidebar';
import ProfilePage from './ProfilePage';
import '../styles/visitorLayout.css';

/**
 * ProfilePageWrapper - Wraps ProfilePage in the appropriate layout based on user role
 * Ensures profile pages appear inside the main site layout (with sidebars)
 */
const ProfilePageWrapper = () => {
  const { user } = useAuth();

  // If user is a visitor, use VisitorLayout structure (left nav + trending news)
  if (user?.role === 'visitor') {
    return (
      <div className="visitor-layout">
        <aside className="visitor-layout__sidebar">
          <VisitorSidebar />
        </aside>

        <main className="visitor-layout__main">
          <section className="visitor-layout__content">
            <ProfilePage />
          </section>

          <div className="visitor-layout__news">
            <TrendingNewsSidebar />
          </div>
        </main>
      </div>
    );
  }

  // If user is an owner, use OwnerLayout structure
  if (user?.role === 'owner' || user?.role === 'admin') {
    return (
      <div className="owner-layout">
        <aside className="owner-layout__sidebar">
          <OwnerSidebar />
        </aside>

        <main className="owner-layout__main">
          <ProfilePage />
        </main>
      </div>
    );
  }

  // If no user (public view), use VisitorLayout as default
  return (
    <div className="visitor-layout">
      <aside className="visitor-layout__sidebar">
        <VisitorSidebar />
      </aside>

      <main className="visitor-layout__main">
        <section className="visitor-layout__content">
          <ProfilePage />
        </section>

        <div className="visitor-layout__news">
          <TrendingNewsSidebar />
        </div>
      </main>
    </div>
  );
};

export default ProfilePageWrapper;
