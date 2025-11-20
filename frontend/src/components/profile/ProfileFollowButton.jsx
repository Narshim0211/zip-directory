/**
 * ProfileFollowButton - World-class follow/unfollow button
 * Instagram-style with smooth animations and instant feedback
 *
 * Now uses global FollowContext - when you follow on a profile,
 * ALL posts/surveys from that user update automatically!
 */
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFollow } from '../../context/FollowContext';
import './ProfileFollowButton.css';

/**
 * ProfileFollowButton
 * Shows Follow/Following button with correct role logic.
 * - Visitors can follow anyone
 * - Owners can follow only owners
 * - Owners CANNOT follow visitors (shows toast)
 */
const ProfileFollowButton = ({ profileUser, onFollowChange }) => {
  const { user } = useAuth();
  const { isFollowing: checkIsFollowing, toggleFollow, loading } = useFollow();
  const [error, setError] = useState('');

  // Get profile user ID (handle both _id and userId)
  const getProfileUserId = () => {
    return profileUser?.userId || profileUser?._id;
  };

  const profileUserId = getProfileUserId();

  // Read follow state from global context
  const isFollowing = checkIsFollowing(profileUserId);

  // Determine if follow is allowed
  // Everyone can follow everyone (better engagement)
  const canFollow = () => {
    if (!user || !profileUser || !profileUserId || user._id === profileUserId) return false;
    return true;
  };

  const handleToggleFollow = async () => {
    if (!canFollow() || loading) return;

    setError('');

    const result = await toggleFollow(profileUserId);

    if (result.success) {
      // Refresh profile in parent component to update follower counts
      if (onFollowChange) {
        await onFollowChange();
      }
    } else {
      setError(result.error || 'Failed to update follow status.');
      setTimeout(() => setError(''), 2500);
    }
  };

  // Don't render if no user, no profileUserId, or viewing own profile
  if (!user || !profileUserId || user._id === profileUserId) return null;

  return (
    <div className="profile-follow-button">
      {error && (
        <div className="profile-follow-button__error">{error}</div>
      )}
      {isFollowing ? (
        <button
          onClick={handleToggleFollow}
          disabled={loading}
          className="profile-follow-button__btn profile-follow-button__btn--following"
        >
          {loading ? 'Loading...' : 'Following'}
        </button>
      ) : (
        <button
          onClick={handleToggleFollow}
          disabled={loading}
          className="profile-follow-button__btn profile-follow-button__btn--follow"
        >
          {loading ? 'Loading...' : 'Follow'}
        </button>
      )}
    </div>
  );
};

export default ProfileFollowButton;
