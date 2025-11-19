const profileInsightService = require('./profileInsight.service');
const logger = require('../../../utils/logger');

/**
 * Profile Analytics Controller
 * Clean REST endpoints - NO business logic here
 * All logic delegated to service layer
 */

/**
 * POST /api/v1/analytics/profile/view/:ownerId
 * Record a profile view (triggered when someone visits business listing)
 */
exports.recordProfileView = async (req, res, next) => {
  try {
    const { ownerId } = req.params;
    
    const result = await profileInsightService.recordView(ownerId);
    
    res.status(200).json(result);
  } catch (error) {
    logger.error(`Profile view recording failed: ${error.message}`);
    next(error);
  }
};

/**
 * GET /api/v1/analytics/profile/:ownerId
 * Get profile insights for display
 */
exports.getProfileInsights = async (req, res, next) => {
  try {
    const { ownerId } = req.params;
    
    const result = await profileInsightService.getInsights(ownerId);
    
    res.status(200).json(result);
  } catch (error) {
    logger.error(`Fetching profile insights failed: ${error.message}`);
    next(error);
  }
};
