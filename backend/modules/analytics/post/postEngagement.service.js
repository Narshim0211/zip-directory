const PostEngagement = require('./postEngagement.model');
const Reaction = require('../../../models/Reaction');
const logger = require('../../../utils/logger');

/**
 * Post Engagement Service
 * Handles ALL owner post analytics logic
 * NO duplication - single source of truth
 */
class PostEngagementService {
  
  /**
   * Record a post view
   */
  async recordView(postId, userId = null) {
    try {
      if (!postId) {
        throw new Error('Post ID is required');
      }

      const engagement = await PostEngagement.incrementViews(postId, userId);

      logger.info(`Post view recorded: ${postId}`);

      return {
        success: true,
        data: await this.formatEngagementData(engagement, userId)
      };
    } catch (error) {
      logger.error(`Error recording post view: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Add or update a reaction
   */
  async addReaction(postId, userId, reactionType) {
    try {
      if (!postId || !userId || !reactionType) {
        throw new Error('Post ID, User ID, and Reaction Type are required');
      }

      if (!['like', 'love'].includes(reactionType)) {
        throw new Error('Invalid reaction type. Must be "like" or "love"');
      }

      const engagement = await PostEngagement.addReaction(postId, userId, reactionType);

      logger.info(`Post reaction added: ${postId} - ${reactionType} by ${userId}`);

      return {
        success: true,
        data: await this.formatEngagementData(engagement, userId)
      };
    } catch (error) {
      logger.error(`Error adding post reaction: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Get post engagement metrics
   */
  async getEngagement(postId, userId = null) {
    try {
      if (!postId) {
        throw new Error('Post ID is required');
      }

      let engagement = await PostEngagement.findOne({ postId });

      // Get reactions from new Reaction model
      const reactionCounts = await Reaction.getReactionCounts(postId, 'post');
      const userReaction = userId ? await Reaction.getUserReaction(userId, postId, 'post') : null;

      if (!engagement) {
        // Return zeros for views if no analytics exist yet
        return {
          success: true,
          data: {
            views: 0,
            reactions: reactionCounts,
            userReaction: userReaction
          }
        };
      }

      return {
        success: true,
        data: {
          views: engagement.views,
          reactions: reactionCounts,
          userReaction: userReaction
        }
      };
    } catch (error) {
      logger.error(`Error fetching post engagement: ${error.message}`);
      throw error;
    }
  }

  /**
   * Helper to format engagement data consistently
   */
  async formatEngagementData(engagement, userId = null) {
    // Get reactions from new Reaction model
    const reactionCounts = await Reaction.getReactionCounts(engagement.postId, 'post');
    const userReaction = userId ? await Reaction.getUserReaction(userId, engagement.postId, 'post') : null;

    return {
      views: engagement.views,
      reactions: reactionCounts,
      userReaction: userReaction
    };
  }
}

module.exports = new PostEngagementService();
