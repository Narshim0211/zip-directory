import api from '../axios';

/**
 * V1 API Client
 * Clean, versioned API endpoints for the unified feed system
 */

const v1Client = {
  // Feed endpoints
  feed: {
    /**
     * Get unified feed (posts + surveys)
     */
    getFeed: async (params = {}) => {
      const { limit = 30 } = params;
      const response = await api.get('/v1/feed', { params: { limit } });
      return response.data;
    },
    /**
     * Get owner-specific feed (authenticated, role-aware)
     */
    getOwnerFeed: async (params = {}) => {
      const { limit = 30 } = params;
      const response = await api.get('/v1/feed/owner', { params: { limit } });
      return response.data;
    },
  },

  // User stats
  get: async (endpoint) => {
    const response = await api.get(`/v1${endpoint}`);
    return response;
  },

  // Visitor survey endpoints
  visitor: {
    surveys: {
      /**
       * Create a new survey
       */
      create: async (surveyData) => {
        const response = await api.post('/v1/visitor/surveys', surveyData);
        return response.data;
      },
      /**
       * Vote on a survey
       */
      vote: async (surveyId, optionId) => {
        const response = await api.post(`/v1/visitor/surveys/${surveyId}/vote`, {
          optionId,
        });
        return response.data;
      },
    },
  },

  // Owner endpoints
  owner: {
    surveys: {
      /**
       * Create a new survey
       */
      create: async (surveyData) => {
        const response = await api.post('/v1/owner/surveys', surveyData);
        return response.data;
      },
    },
    posts: {
      /**
       * Create a new post
       */
      create: async (postData) => {
        const response = await api.post('/v1/owner/posts', postData);
        return response.data;
      },
    },
    /**
     * Follow another owner
     */
    followOwner: async (targetOwnerId) => {
      const response = await api.post(`/v1/owner/follow/${targetOwnerId}`);
      return response.data;
    },
    /**
     * Unfollow an owner
     */
    unfollowOwner: async (targetOwnerId) => {
      const response = await api.delete(`/v1/owner/follow/${targetOwnerId}`);
      return response.data;
    },
    /**
     * Get list of owners current user is following
     */
    getFollowing: async (params = {}) => {
      const response = await api.get('/v1/owner/follow/following', { params });
      return response.data;
    },
    /**
     * Get list of followers
     */
    getFollowers: async (params = {}) => {
      const response = await api.get('/v1/owner/follow/followers', { params });
      return response.data;
    },
    /**
     * Check if following a specific owner
     */
    checkFollowStatus: async (targetOwnerId) => {
      const response = await api.get(`/v1/owner/follow/check/${targetOwnerId}`);
      return response.data;
    },
  },

  // Profile follow endpoints (visitor-profiles, owner-profiles)
  profiles: {
    /**
     * Follow a profile (visitor or owner)
     */
    follow: async (profileType, profileId) => {
      const response = await api.post(`/v1/${profileType}/${profileId}/follow`);
      return response.data;
    },
    /**
     * Unfollow a profile (visitor or owner)
     */
    unfollow: async (profileType, profileId) => {
      const response = await api.delete(`/v1/${profileType}/${profileId}/follow`);
      return response.data;
    },
    /**
     * Check if following a profile
     */
    checkFollowStatus: async (profileType, profileId) => {
      const response = await api.get(`/v1/${profileType}/${profileId}/is-following`);
      return response.data;
    },
  },
};

export default v1Client;
