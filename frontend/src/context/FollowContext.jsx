/**
 * FollowContext - Global Follow State Management
 *
 * Provides a single source of truth for follow relationships.
 * When a user follows/unfollows someone, ALL components update automatically.
 *
 * This ensures that:
 * - All posts from the same user show consistent follow state
 * - No duplicate "Follow" and "Following" buttons for the same user
 * - Instant UI updates across feed, profile, surveys, etc.
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import followApi from '../api/followApi';

const FollowContext = createContext();

export const useFollow = () => {
  const context = useContext(FollowContext);
  if (!context) {
    throw new Error('useFollow must be used within FollowProvider');
  }
  return context;
};

export const FollowProvider = ({ children }) => {
  const { user } = useAuth();
  const [followingList, setFollowingList] = useState([]);
  const [loading, setLoading] = useState(false);

  /**
   * Fetch the list of users the current user is following
   * This is called once on mount and after every follow/unfollow action
   */
  const fetchFollowingList = useCallback(async () => {
    if (!user) {
      setFollowingList([]);
      return;
    }

    try {
      const response = await followApi.getFollowing();
      // Backend returns array of follow objects with following/followingId
      const data = response.data || response;

      // Extract user IDs from the response
      const userIds = data.map(f => {
        // The API returns Follow documents with populated followingId/following fields
        // We need to extract the user ID from the populated object
        return f.followingId?._id || f.following?._id || f.followingId || f.following;
      }).filter(Boolean);

      setFollowingList(userIds);

      if (process.env.NODE_ENV === 'development') {
        console.log('[FollowContext] Fetched following list:', userIds.length, 'users');
      }
    } catch (error) {
      console.error('[FollowContext] Failed to fetch following list:', error);
      setFollowingList([]);
    }
  }, [user]);

  /**
   * Check if the current user is following a specific user
   */
  const isFollowing = useCallback((userId) => {
    if (!userId) return false;
    return followingList.includes(userId);
  }, [followingList]);

  /**
   * Follow a user and refresh the global follow list
   */
  const followUser = useCallback(async (userId) => {
    if (!userId || loading) return;

    setLoading(true);
    try {
      await followApi.follow(userId);

      // Optimistically update the list
      setFollowingList(prev => [...prev, userId]);

      // Refresh from backend to ensure consistency
      await fetchFollowingList();

      return { success: true };
    } catch (error) {
      console.error('[FollowContext] Failed to follow user:', error);

      // Revert optimistic update on error
      setFollowingList(prev => prev.filter(id => id !== userId));

      return {
        success: false,
        error: error.response?.data?.message || 'Failed to follow user'
      };
    } finally {
      setLoading(false);
    }
  }, [loading, fetchFollowingList]);

  /**
   * Unfollow a user and refresh the global follow list
   */
  const unfollowUser = useCallback(async (userId) => {
    if (!userId || loading) return;

    setLoading(true);
    try {
      await followApi.unfollow(userId);

      // Optimistically update the list
      setFollowingList(prev => prev.filter(id => id !== userId));

      // Refresh from backend to ensure consistency
      await fetchFollowingList();

      return { success: true };
    } catch (error) {
      console.error('[FollowContext] Failed to unfollow user:', error);

      // Revert optimistic update on error
      setFollowingList(prev => [...prev, userId]);

      return {
        success: false,
        error: error.response?.data?.message || 'Failed to unfollow user'
      };
    } finally {
      setLoading(false);
    }
  }, [loading, fetchFollowingList]);

  /**
   * Toggle follow state (follow if not following, unfollow if following)
   */
  const toggleFollow = useCallback(async (userId) => {
    const currentlyFollowing = isFollowing(userId);

    if (currentlyFollowing) {
      return await unfollowUser(userId);
    } else {
      return await followUser(userId);
    }
  }, [isFollowing, followUser, unfollowUser]);

  // Fetch following list when user logs in
  useEffect(() => {
    if (user) {
      fetchFollowingList();
    } else {
      setFollowingList([]);
    }
  }, [user, fetchFollowingList]);

  const value = {
    followingList,
    isFollowing,
    followUser,
    unfollowUser,
    toggleFollow,
    refreshFollowingList: fetchFollowingList,
    loading
  };

  return (
    <FollowContext.Provider value={value}>
      {children}
    </FollowContext.Provider>
  );
};
