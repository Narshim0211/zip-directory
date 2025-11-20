import axios from './axios';

// Get profile by handle (works for both Owner and Visitor)
export const getProfileByHandle = async (handle) => {
  const { data } = await axios.get(`/profile/${handle}`);
  return data;
};

// Get profile by userId (works for both Owner and Visitor)
export const getProfileById = async (userId) => {
  const { data} = await axios.get(`/profile/id/${userId}`);
  return data;
};

// Get owner profile by slug
export const getOwnerProfile = async (slug) => {
  const { data } = await axios.get(`/api/v1/owner-profiles/${slug}`);
  return data;
};

// Get visitor profile by slug
export const getVisitorProfile = async (slug) => {
  const { data } = await axios.get(`/api/v1/visitor-profiles/${slug}`);
  return data;
};

// Get surveys for owner profile
export const getOwnerSurveys = async (slug) => {
  const { data } = await axios.get(`/api/v1/owner-profiles/${slug}/surveys`);
  return data;
};

// Get posts for owner profile
export const getOwnerPosts = async (slug) => {
  const { data } = await axios.get(`/api/v1/owner-profiles/${slug}/posts`);
  return data;
};
