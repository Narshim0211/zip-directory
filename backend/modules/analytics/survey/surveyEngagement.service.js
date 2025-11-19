const SurveyEngagement = require('./surveyEngagement.model');
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
        data: this.formatEngagementData(engagement)
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
        data: this.formatEngagementData(engagement)
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
        data: this.formatEngagementData(engagement)
      };
    } catch (error) {
      logger.error(`Error adding survey reaction: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Get survey engagement metrics
   */
  async getEngagement(surveyId) {
    try {
      if (!surveyId) {
        throw new Error('Survey ID is required');
      }
      
      let engagement = await SurveyEngagement.findOne({ surveyId });
      
      if (!engagement) {
        // Return zeros if no analytics exist yet
        return {
          success: true,
          data: {
            views: 0,
            responses: 0,
            reactions: {
              like: 0,
              love: 0,
              total: 0
            }
          }
        };
      }
      
      return {
        success: true,
        data: this.formatEngagementData(engagement)
      };
    } catch (error) {
      logger.error(`Error fetching survey engagement: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Helper to format engagement data consistently
   */
  formatEngagementData(engagement) {
    return {
      views: engagement.views,
      responses: engagement.responses,
      reactions: {
        like: engagement.reactions.like,
        love: engagement.reactions.love,
        total: engagement.reactions.like + engagement.reactions.love
      }
    };
  }
}

module.exports = new SurveyEngagementService();
