const surveyEngagementService = require('./surveyEngagement.service');
const logger = require('../../../utils/logger');

/**
 * Survey Engagement Controller
 * Clean REST endpoints - NO business logic here
 */

/**
 * POST /api/v1/analytics/survey/view/:surveyId
 * Record a survey view
 */
exports.recordView = async (req, res, next) => {
  try {
    const { surveyId } = req.params;
    const userId = req.user?._id || null; // Optional: track unique viewers
    
    const result = await surveyEngagementService.recordView(surveyId, userId);
    
    res.status(200).json(result);
  } catch (error) {
    logger.error(`Survey view recording failed: ${error.message}`);
    next(error);
  }
};

/**
 * POST /api/v1/analytics/survey/respond/:surveyId
 * Record a survey response
 */
exports.recordResponse = async (req, res, next) => {
  try {
    const { surveyId } = req.params;
    const userId = req.user?._id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User must be authenticated to respond to surveys'
      });
    }
    
    const result = await surveyEngagementService.recordResponse(surveyId, userId);
    
    res.status(200).json(result);
  } catch (error) {
    logger.error(`Survey response recording failed: ${error.message}`);
    next(error);
  }
};

/**
 * POST /api/v1/analytics/survey/react/:surveyId
 * Add or update a reaction
 * Body: { reactionType: 'like' | 'love' }
 */
exports.addReaction = async (req, res, next) => {
  try {
    const { surveyId } = req.params;
    const { reactionType } = req.body;
    const userId = req.user?._id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User must be authenticated to react'
      });
    }
    
    const result = await surveyEngagementService.addReaction(surveyId, userId, reactionType);
    
    res.status(200).json(result);
  } catch (error) {
    logger.error(`Survey reaction failed: ${error.message}`);
    next(error);
  }
};

/**
 * GET /api/v1/analytics/survey/:surveyId
 * Get survey engagement metrics
 */
exports.getEngagement = async (req, res, next) => {
  try {
    const { surveyId } = req.params;
    const userId = req.user?._id || null; // Optional: if logged in, return their reaction

    const result = await surveyEngagementService.getEngagement(surveyId, userId);

    res.status(200).json(result);
  } catch (error) {
    logger.error(`Fetching survey engagement failed: ${error.message}`);
    next(error);
  }
};
