const ImpressionCount = require('./impression.model');
const logger = require('../../../utils/logger');

/**
 * Impression Service
 * Handles impression tracking for posts and surveys
 * Follows Instagram/TikTok/X (Twitter) patterns
 */
class ImpressionService {
  /**
   * Add an impression (increment counter)
   * Multiple impressions from same user allowed (like X/Twitter)
   */
  async addImpression(contentId, contentType) {
    try {
      if (!contentId) {
        throw new Error('Content ID is required');
      }

      if (!['post', 'survey'].includes(contentType)) {
        throw new Error('Content type must be "post" or "survey"');
      }

      // Use atomic $inc - safe for concurrent requests
      const result = await ImpressionCount.addImpression(contentId, contentType);

      logger.info(`Impression recorded: ${contentType} ${contentId} - new count: ${result.count}`);

      return {
        success: true,
        data: {
          contentId,
          contentType,
          impressions: result.count
        }
      };
    } catch (error) {
      logger.error(`Error adding impression: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get impression count for specific content
   */
  async getImpressionCount(contentId, contentType) {
    try {
      if (!contentId) {
        throw new Error('Content ID is required');
      }

      if (!['post', 'survey'].includes(contentType)) {
        throw new Error('Content type must be "post" or "survey"');
      }

      const count = await ImpressionCount.getCount(contentId, contentType);

      return {
        success: true,
        data: {
          contentId,
          contentType,
          impressions: count
        }
      };
    } catch (error) {
      logger.error(`Error getting impression count: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get impression counts for multiple content items (batch)
   * Useful for feed optimization
   */
  async getImpressionCountsBatch(contentIds, contentType) {
    try {
      if (!contentIds || contentIds.length === 0) {
        throw new Error('Content IDs array is required');
      }

      if (!['post', 'survey'].includes(contentType)) {
        throw new Error('Content type must be "post" or "survey"');
      }

      const countsMap = await ImpressionCount.getCountsBatch(contentIds, contentType);

      return {
        success: true,
        data: countsMap
      };
    } catch (error) {
      logger.error(`Error getting impression counts batch: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new ImpressionService();
