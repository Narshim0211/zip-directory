import api from './axios';

/**
 * Profile API Client
 * ✅ All routes now use /v1 prefix for consistency
 */

// Get profile by handle (works for both Owner and Visitor)
export const getProfileByHandle = async (handle) => {
  const { data } = await api.get(`/v1/profile/${handle}`);
  return data;
};

// Get profile by userId (works for both Owner and Visitor)
export const getProfileById = async (userId) => {
  const { data} = await api.get(`/v1/profile/id/${userId}`);
  return data;
};

// Get owner profile by slug
export const getOwnerProfile = async (slug) => {
  const { data } = await api.get(`/v1/owner-profiles/${slug}`);
  return data;
};

// Get visitor profile by slug
export const getVisitorProfile = async (slug) => {
  const { data } = await api.get(`/v1/visitor-profiles/${slug}`);
  return data;
};

// Get surveys for owner profile
export const getOwnerSurveys = async (slug) => {
  const { data } = await api.get(`/v1/owner-profiles/${slug}/surveys`);
  return data;
};

// Get posts for owner profile
export const getOwnerPosts = async (slug) => {
  const { data } = await api.get(`/v1/owner-profiles/${slug}/posts`);
  return data;
};
