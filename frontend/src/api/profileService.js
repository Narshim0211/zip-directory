import api from './axios';

/**
 * Profile Microservice API Client
 * Calls main backend proxy at /api/profiles-service/*
 * Per PRD Section 8: Frontend → Main Backend → Microservices
 */

const profileService = {
  // ==================== Profile Management ====================

  /**
   * Upsert (create or update) user profile
   * @param {Object} profileData - Profile data
   */
  upsertProfile: async (profileData) => {
    const response = await api.patch('/profiles-service/', profileData);
    return response.data;
  },

  /**
   * Get my profile
   */
  getMyProfile: async () => {
    const response = await api.get('/profiles-service/me');
    return response.data;
  },

  /**
   * Get profile by user ID
   * @param {string} userId - User ID
   */
  getProfileById: async (userId) => {
    const response = await api.get(`/profiles-service/${userId}`);
    return response.data;
  },

  // ==================== Social Features ====================

  /**
   * Follow a user
   * @param {string} userId - User ID to follow
   */
  followUser: async (userId) => {
    const response = await api.post(`/profiles-service/${userId}/follow`);
    return response.data;
  },

  /**
   * Unfollow a user
   * @param {string} userId - User ID to unfollow
   */
  unfollowUser: async (userId) => {
    const response = await api.delete(`/profiles-service/${userId}/follow`);
    return response.data;
  },

  /**
   * Get user's followers
   * @param {string} userId - User ID
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   */
  getFollowers: async (userId, page = 1, limit = 20) => {
    const response = await api.get(`/profiles-service/${userId}/followers`, {
      params: { page, limit },
    });
    return response.data;
  },

  /**
   * Get users followed by user
   * @param {string} userId - User ID
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   */
  getFollowing: async (userId, page = 1, limit = 20) => {
    const response = await api.get(`/profiles-service/${userId}/following`, {
      params: { page, limit },
    });
    return response.data;
  },

  // ==================== Timeline ====================

  /**
   * Create timeline post (post or survey)
   * @param {Object} postData - Post data
   */
  createTimelinePost: async (postData) => {
    const response = await api.post('/profiles-service/timeline', postData);
    return response.data;
  },

  /**
   * Get user's timeline
   * @param {string} userId - User ID
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   */
  getTimeline: async (userId, page = 1, limit = 20) => {
    const response = await api.get(`/profiles-service/${userId}/timeline`, {
      params: { page, limit },
    });
    return response.data;
  },

  // ==================== Owner Business Info ====================

  /**
   * Update business information (owners only)
   * @param {Object} businessData - Business data
   */
  updateBusinessInfo: async (businessData) => {
    const response = await api.patch('/profiles-service/business', businessData);
    return response.data;
  },

  /**
   * Get owner business information
   * @param {string} ownerId - Owner ID
   */
  getBusinessInfo: async (ownerId) => {
    const response = await api.get(`/profiles-service/${ownerId}/business`);
    return response.data;
  },

  // ==================== Health Check ====================

  /**
   * Check if profile service is healthy
   */
  healthCheck: async () => {
    const response = await api.get('/profiles-service/health');
    return response.data;
  },
};

export default profileService;
