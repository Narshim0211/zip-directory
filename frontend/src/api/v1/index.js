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
  },

  // Visitor survey endpoints
  visitor: {
    surveys: {
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
  },
};

export default v1Client;
