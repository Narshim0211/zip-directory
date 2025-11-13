import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

/**
 * Wrapper component that redirects to the Facebook-style profile page
 * using the current user's handle/slug
 */
const VisitorMyProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Fetch current user's visitor profile to get their slug/handle
        const { data } = await axios.get('/api/v1/visitor-profiles/me');
        setProfile(data);
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="profile-page">
        <div className="shimmer" style={{ height: '200px', marginBottom: '16px' }} />
        <div className="shimmer" style={{ height: '400px' }} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!profile || !profile.slug) {
    // Fallback to toolkit if no slug
    return <Navigate to="/visitor/toolkit" replace />;
  }

  // Redirect to Facebook-style profile page
  return <Navigate to={`/v/${profile.slug}`} replace />;
};

export default VisitorMyProfile;
