const SurveyEngagement = require('./surveyEngagement.model');
const Reaction = require('../../../models/Reaction');
const logger = require('../../../utils/logger');

/**
 * Survey Engagement Service
 * Handles ALL survey analytics logic
 * NO duplication - single source of truth
 */
class SurveyEngagementService {
  
  /**
   * Record a survey view
   */
  async recordView(surveyId, userId = null) {
    try {
      if (!surveyId) {
        throw new Error('Survey ID is required');
      }

      const engagement = await SurveyEngagement.incrementViews(surveyId, userId);

      logger.info(`Survey view recorded: ${surveyId}`);

      return {
        success: true,
        data: await this.formatEngagementData(engagement, userId)
      };
    } catch (error) {
      logger.error(`Error recording survey view: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Record a survey response (when user submits)
   */
  async recordResponse(surveyId, userId) {
    try {
      if (!surveyId || !userId) {
        throw new Error('Survey ID and User ID are required');
      }

      const engagement = await SurveyEngagement.incrementResponses(surveyId, userId);

      logger.info(`Survey response recorded: ${surveyId} by ${userId}`);

      return {
        success: true,
        data: await this.formatEngagementData(engagement, userId)
      };
    } catch (error) {
      logger.error(`Error recording survey response: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Add or update a reaction
   */
  async addReaction(surveyId, userId, reactionType) {
    try {
      if (!surveyId || !userId || !reactionType) {
        throw new Error('Survey ID, User ID, and Reaction Type are required');
      }

      if (!['like', 'love'].includes(reactionType)) {
        throw new Error('Invalid reaction type. Must be "like" or "love"');
      }

      const engagement = await SurveyEngagement.addReaction(surveyId, userId, reactionType);

      logger.info(`Survey reaction added: ${surveyId} - ${reactionType} by ${userId}`);

      return {
        success: true,
        data: await this.formatEngagementData(engagement, userId)
      };
    } catch (error) {
      logger.error(`Error adding survey reaction: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Get survey engagement metrics
   */
  async getEngagement(surveyId, userId = null) {
    try {
      if (!surveyId) {
        throw new Error('Survey ID is required');
      }

      let engagement = await SurveyEngagement.findOne({ surveyId });

      // Get reactions from new Reaction model
      const reactionCounts = await Reaction.getReactionCounts(surveyId, 'survey');
      const userReaction = userId ? await Reaction.getUserReaction(userId, surveyId, 'survey') : null;

      if (!engagement) {
        // Return zeros for views/responses if no analytics exist yet
        return {
          success: true,
          data: {
            views: 0,
            responses: 0,
            reactions: reactionCounts,
            userReaction: userReaction
          }
        };
      }

      return {
        success: true,
        data: {
          views: engagement.views,
          responses: engagement.responses,
          reactions: reactionCounts,
          userReaction: userReaction
        }
      };
    } catch (error) {
      logger.error(`Error fetching survey engagement: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Helper to format engagement data consistently
   */
  async formatEngagementData(engagement, userId = null) {
    // Get reactions from new Reaction model
    const reactionCounts = await Reaction.getReactionCounts(engagement.surveyId, 'survey');
    const userReaction = userId ? await Reaction.getUserReaction(userId, engagement.surveyId, 'survey') : null;

    return {
      views: engagement.views,
      responses: engagement.responses,
      reactions: reactionCounts,
      userReaction: userReaction
    };
  }
}

module.exports = new SurveyEngagementService();
