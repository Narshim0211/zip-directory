import api from './axios';

// Follow/unfollow for owner-to-owner
export const followOwner = async (targetOwnerId) => {
  await api.post(`/v1/owner/follow/${targetOwnerId}`);
};

export const unfollowOwner = async (targetOwnerId) => {
  await api.delete(`/v1/owner/follow/${targetOwnerId}`);
};

// Follow/unfollow for visitor/owner (by profile type)
export const followProfile = async (profileType, profileId) => {
  await api.post(`/v1/${profileType}/${profileId}/follow`);
};

export const unfollowProfile = async (profileType, profileId) => {
  await api.delete(`/v1/${profileType}/${profileId}/follow`);
};

// Get follow stats (followers/following count)
export const getFollowStats = async (userId) => {
  const { data } = await api.get(`/v1/follow/check/${userId}`);
  // The check endpoint returns { success, isFollowing, followersCount, followingCount }
  return {
    followersCount: data.followersCount || 0,
    followingCount: data.followingCount || 0
  };
};

// Unified follow/unfollow (works for all user types)
export const followUser = async (targetId) => {
  await api.post(`/v1/follow/${targetId}`);
};

export const unfollowUser = async (targetId) => {
  await api.delete(`/v1/follow/${targetId}`);
};

// Check if current user is following target user
export const checkFollowStatus = async (targetId) => {
  const { data } = await api.get(`/v1/follow/check/${targetId}`);
  return data;
};

// Get list of users current user is following
export const getFollowing = async () => {
  const { data } = await api.get(`/v1/follow/following`);
  return data.data || []; // Return the data array, default to empty array
};

// Get list of users following current user
export const getFollowers = async () => {
  const { data } = await api.get(`/v1/follow/followers`);
  return data.data || []; // Return the data array, default to empty array
};

// Unified follow/unfollow using v1 API
export const follow = async (targetUserId) => {
  const { data } = await api.post(`/v1/follow/${targetUserId}`);
  return data;
};

export const unfollow = async (targetUserId) => {
  const { data } = await api.delete(`/v1/follow/${targetUserId}`);
  return data;
};

// Default export for FollowContext
export default {
  follow,
  unfollow,
  followUser,
  unfollowUser,
  getFollowing,
  getFollowers,
  checkFollowStatus,
  getFollowStats
};
