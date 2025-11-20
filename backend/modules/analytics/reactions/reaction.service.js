const Reaction = require('../../../models/Reaction');
const logger = require('../../../utils/logger');

class ReactionService {
  /**
   * Toggle reaction on any content (survey or post)
   * Returns updated counts and user's new reaction state
   */
  async toggleReaction(userId, contentId, contentType, reactionType) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      if (!contentId) {
        throw new Error('Content ID is required');
      }

      if (!['survey', 'post'].includes(contentType)) {
        throw new Error('Content type must be "survey" or "post"');
      }

      if (!['like', 'love'].includes(reactionType)) {
        throw new Error('Reaction type must be "like" or "love"');
      }

      // Use the model's toggleReaction method
      const result = await Reaction.toggleReaction(userId, contentId, contentType, reactionType);

      // Get updated counts
      const counts = await Reaction.getReactionCounts(contentId, contentType);

      logger.info(`Reaction ${result.action}: User ${userId} on ${contentType} ${contentId} - ${reactionType}`);

      return {
        success: true,
        data: {
          action: result.action, // 'added', 'removed', or 'switched'
          userReaction: result.newReaction, // null, 'like', or 'love'
          reactions: counts
        }
      };
    } catch (error) {
      logger.error(`Error toggling reaction: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get reactions for content including user's current reaction
   */
  async getReactions(contentId, contentType, userId = null) {
    try {
      if (!contentId) {
        throw new Error('Content ID is required');
      }

      if (!['survey', 'post'].includes(contentType)) {
        throw new Error('Content type must be "survey" or "post"');
      }

      // Get counts
      const counts = await Reaction.getReactionCounts(contentId, contentType);

      // Get user's reaction if userId provided
      const userReaction = userId
        ? await Reaction.getUserReaction(userId, contentId, contentType)
        : null;

      return {
        success: true,
        data: {
          reactions: counts,
          userReaction: userReaction
        }
      };
    } catch (error) {
      logger.error(`Error getting reactions: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new ReactionService();
