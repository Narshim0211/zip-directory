import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

/**
 * Analytics API Client
 * Clean, predictable functions for all engagement endpoints
 * NO duplication - single source of truth
 */

// Create axios instance with default config
const analyticsClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1/analytics`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests if available
analyticsClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * PROFILE INSIGHTS API (Business Listing Analytics)
 */
export const profileAnalytics = {
  /**
   * Record a profile view
   * @param {string} ownerId - The owner's user ID
   */
  recordView: async (ownerId) => {
    try {
      const response = await analyticsClient.post(`/profile/view/${ownerId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to record profile view:', error);
      throw error;
    }
  },

  /**
   * Get profile insights
   * @param {string} ownerId - The owner's user ID
   * @returns {Object} { today, last7Days, total }
   */
  getInsights: async (ownerId) => {
    try {
      const response = await analyticsClient.get(`/profile/${ownerId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch profile insights:', error);
      throw error;
    }
  }
};

/**
 * SURVEY ENGAGEMENT API
 */
export const surveyAnalytics = {
  /**
   * Record a survey view
   * @param {string} surveyId - The survey ID
   */
  recordView: async (surveyId) => {
    try {
      const response = await analyticsClient.post(`/survey/view/${surveyId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to record survey view:', error);
      throw error;
    }
  },

  /**
   * Record a survey response
   * @param {string} surveyId - The survey ID
   */
  recordResponse: async (surveyId) => {
    try {
      const response = await analyticsClient.post(`/survey/respond/${surveyId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to record survey response:', error);
      throw error;
    }
  },

  /**
   * Add or update reaction
   * @param {string} surveyId - The survey ID
   * @param {string} reactionType - 'like' or 'love'
   */
  addReaction: async (surveyId, reactionType) => {
    try {
      const response = await analyticsClient.post(`/survey/react/${surveyId}`, {
        reactionType
      });
      return response.data;
    } catch (error) {
      console.error('Failed to add survey reaction:', error);
      throw error;
    }
  },

  /**
   * Get survey engagement metrics
   * @param {string} surveyId - The survey ID
   * @returns {Object} { views, responses, reactions: { like, love, total } }
   */
  getEngagement: async (surveyId) => {
    try {
      const response = await analyticsClient.get(`/survey/${surveyId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch survey engagement:', error);
      throw error;
    }
  }
};

/**
 * POST ENGAGEMENT API
 */
export const postAnalytics = {
  /**
   * Record a post view
   * @param {string} postId - The post ID
   */
  recordView: async (postId) => {
    try {
      const response = await analyticsClient.post(`/post/view/${postId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to record post view:', error);
      throw error;
    }
  },

  /**
   * Add or update reaction
   * @param {string} postId - The post ID
   * @param {string} reactionType - 'like' or 'love'
   */
  addReaction: async (postId, reactionType) => {
    try {
      const response = await analyticsClient.post(`/post/react/${postId}`, {
        reactionType
      });
      return response.data;
    } catch (error) {
      console.error('Failed to add post reaction:', error);
      throw error;
    }
  },

  /**
   * Get post engagement metrics
   * @param {string} postId - The post ID
   * @returns {Object} { views, reactions: { like, love, total } }
   */
  getEngagement: async (postId) => {
    try {
      const response = await analyticsClient.get(`/post/${postId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch post engagement:', error);
      throw error;
    }
  }
};

export default {
  profile: profileAnalytics,
  survey: surveyAnalytics,
  post: postAnalytics
};
