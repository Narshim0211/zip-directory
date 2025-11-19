import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import v1Client from '../api/v1';

/**
 * SmartFollowButton - Intelligent follow button that uses the correct API based on roles
 * 
 * Rules:
 * - Visitor → Visitor: Use v1 visitor-profiles follow API
 * - Visitor → Owner: Use v1 visitor-profiles follow API
 * - Owner → Owner: Use v1 owner follow API (new system)
 * - Owner → Visitor: Not allowed (will show error)
 */
const SmartFollowButton = ({ 
  targetUserId, 
  targetRole, 
  initialFollowing = false, 
  onChange,
  className = ''
}) => {
  const { user } = useAuth();
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setFollowing(initialFollowing);
  }, [initialFollowing]);

  // Check if current user is owner trying to follow visitor (not allowed)
  const isOwnerFollowingVisitor = user?.role === 'owner' && targetRole === 'visitor';

  const handleToggle = async () => {
    if (loading) return;
    if (isOwnerFollowingVisitor) {
      setError('Owners can only follow other owners');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (user?.role === 'owner' && targetRole === 'owner') {
        // Owner → Owner: Use new owner follow system
        if (following) {
          await v1Client.owner.unfollowOwner(targetUserId);
          setFollowing(false);
          onChange?.(targetUserId, false);
        } else {
          await v1Client.owner.followOwner(targetUserId);
          setFollowing(true);
          onChange?.(targetUserId, true);
        }
      } else {
        // Visitor → Anyone OR Owner → Owner (legacy): Use profile follow API
        const profileType = targetRole === 'owner' ? 'owner-profiles' : 'visitor-profiles';
        
        if (following) {
          await v1Client.profiles.unfollow(profileType, targetUserId);
          setFollowing(false);
          onChange?.(targetUserId, false);
        } else {
          await v1Client.profiles.follow(profileType, targetUserId);
          setFollowing(true);
          onChange?.(targetUserId, true);
        }
      }
    } catch (err) {
      console.error('Follow error:', err);
      setError(err.response?.data?.message || 'Failed to update follow status');
    } finally {
      setLoading(false);
    }
  };

  if (isOwnerFollowingVisitor) {
    return (
      <button 
        className={`btn btn-disabled ${className}`}
        disabled
        title="Owners can only follow other owners"
      >
        Cannot Follow
      </button>
    );
  }

  return (
    <>
      <button
        className={`btn ${following ? 'btn-secondary' : 'btn-primary'} ${className}`}
        onClick={handleToggle}
        disabled={loading}
      >
        {loading ? 'Loading...' : following ? 'Following' : 'Follow'}
      </button>
      {error && <p className="error-text" style={{ marginTop: '8px', fontSize: '14px', color: '#e74c3c' }}>{error}</p>}
    </>
  );
};

export default SmartFollowButton;
