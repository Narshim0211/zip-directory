/**
 * Smart Search API Client
 *
 * Provides methods to interact with the unified search backend
 */

import axios from './axios';

const searchApi = {
  /**
   * Get autocomplete suggestions
   * @param {string} query - Search query (min 2 characters)
   * @returns {Promise} - Suggestions response
   */
  getSuggestions: async (query) => {
    const response = await axios.get(`/search/suggest`, {
      params: { q: query }
    });
    return response.data;
  },

  /**
   * Parse natural language query
   * @param {string} query - Raw search query
   * @returns {Promise} - Parsed query components
   */
  parseQuery: async (query) => {
    const response = await axios.post(`/search/parse`, { query });
    return response.data;
  },

  /**
   * Geocode city/zip to coordinates
   * @param {Object} params - { city, zip }
   * @returns {Promise} - Coordinates response
   */
  geocode: async (params) => {
    const response = await axios.post(`/search/geocode`, params);
    return response.data;
  },

  /**
   * Main search endpoint
   * @param {Object} params - Search parameters
   * @returns {Promise} - Search results
   */
  search: async (params) => {
    const response = await axios.get(`/search`, { params });
    return response.data;
  }
};

export default searchApi;
