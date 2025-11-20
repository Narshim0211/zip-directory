import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useFollow } from '../context/FollowContext';

/**
 * FollowButton - Uses global follow state from FollowContext
 *
 * When this button is clicked, ALL posts/surveys from the same user
 * will automatically update to show "Following" state.
 *
 * No more inconsistent follow states across the feed!
 */
const FollowButton = ({ targetId, targetType, initialFollowing = false, onChange }) => {
  const { user } = useAuth();
  const { isFollowing, toggleFollow, loading } = useFollow();

  // Don't show follow button if not logged in or if it's the user's own content
  if (!user || !targetId || user._id === targetId) {
    return null;
  }

  // Read follow state from global context (not local state)
  const following = isFollowing(targetId);

  const toggle = async () => {
    if (loading) return;

    const result = await toggleFollow(targetId);

    if (result.success) {
      // Call onChange callback if provided
      onChange?.(targetId, !following);
    } else {
      // Show error to user
      alert(result.error || 'Failed to update follow status');
    }
  };

  return (
    <button className={`btn ${following ? 'outline' : ''}`} type="button" onClick={toggle} disabled={loading}>
      {following ? 'Following' : 'Follow'}
    </button>
  );
};

export default FollowButton;
