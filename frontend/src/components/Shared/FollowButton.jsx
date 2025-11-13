import React, { useState } from 'react';
import './FollowButton.css';

/**
 * FollowButton Component
 *
 * Permission Logic:
 * - Owner CANNOT follow Visitor (button hidden)
 * - Visitor CAN follow Owner
 * - Visitor CAN follow Visitor
 * - Owner CAN follow Owner
 * - Cannot follow yourself (button hidden)
 *
 * Props:
 * - targetUserId: string - ID of user to follow/unfollow
 * - targetUserRole: string - Role of target user ('owner' | 'visitor')
 * - currentUserId: string - ID of current logged-in user
 * - currentUserRole: string - Role of current user ('owner' | 'visitor')
 * - isFollowing: boolean - Initial following state
 * - onFollowChange: function - Callback when follow state changes (optional)
 * - size: string - Button size ('small' | 'medium' | 'large')
 * - variant: string - Button style ('default' | 'outline' | 'text')
 */
const FollowButton = ({
  targetUserId,
  targetUserRole,
  currentUserId,
  currentUserRole,
  isFollowing: initialIsFollowing = false,
  onFollowChange,
  size = 'medium',
  variant = 'default'
}) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Permission check: Owner CANNOT follow Visitor
  const canFollow = () => {
    if (!currentUserId || !currentUserRole || !targetUserRole) return false;
    if (currentUserId === targetUserId) return false; // Cannot follow yourself
    if (currentUserRole === 'owner' && targetUserRole === 'visitor') return false;
    return true;
  };

  // Don't render button if permission check fails
  if (!canFollow()) {
    return null;
  }

  const handleFollowClick = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const endpoint = isFollowing ? '/api/follow/unfollow' : '/api/follow';
      const method = isFollowing ? 'DELETE' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          targetUserId,
          targetUserRole
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update follow status');
      }

      const data = await response.json();

      // Update local state
      setIsFollowing(!isFollowing);

      // Notify parent component
      if (onFollowChange) {
        onFollowChange(!isFollowing);
      }
    } catch (err) {
      console.error('[FollowButton] Error:', err);
      setError(err.message);

      // Revert optimistic update if needed
      // (we're not doing optimistic updates here, so this is just for safety)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="follow-button-wrapper">
      <button
        className={`follow-button follow-button--${size} follow-button--${variant} ${
          isFollowing ? 'follow-button--following' : 'follow-button--not-following'
        } ${isLoading ? 'follow-button--loading' : ''}`}
        onClick={handleFollowClick}
        disabled={isLoading}
        aria-label={isFollowing ? 'Unfollow' : 'Follow'}
      >
        {isLoading ? (
          <span className="follow-button__spinner">⏳</span>
        ) : (
          <span className="follow-button__text">
            {isFollowing ? 'Following' : 'Follow'}
          </span>
        )}
      </button>

      {/* Error message */}
      {error && (
        <div className="follow-button__error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

export default FollowButton;
