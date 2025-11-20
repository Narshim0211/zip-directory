const postEngagementService = require('./postEngagement.service');
const logger = require('../../../utils/logger');

/**
 * Post Engagement Controller
 * Clean REST endpoints - NO business logic here
 */

/**
 * POST /api/v1/analytics/post/view/:postId
 * Record a post view
 */
exports.recordView = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user?._id || null; // Optional: track unique viewers
    
    const result = await postEngagementService.recordView(postId, userId);
    
    res.status(200).json(result);
  } catch (error) {
    logger.error(`Post view recording failed: ${error.message}`);
    next(error);
  }
};

/**
 * POST /api/v1/analytics/post/react/:postId
 * Add or update a reaction
 * Body: { reactionType: 'like' | 'love' }
 */
exports.addReaction = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { reactionType } = req.body;
    const userId = req.user?._id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User must be authenticated to react'
      });
    }
    
    const result = await postEngagementService.addReaction(postId, userId, reactionType);
    
    res.status(200).json(result);
  } catch (error) {
    logger.error(`Post reaction failed: ${error.message}`);
    next(error);
  }
};

/**
 * GET /api/v1/analytics/post/:postId
 * Get post engagement metrics
 */
exports.getEngagement = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user?._id || null; // Optional: if logged in, return their reaction

    const result = await postEngagementService.getEngagement(postId, userId);

    res.status(200).json(result);
  } catch (error) {
    logger.error(`Fetching post engagement failed: ${error.message}`);
    next(error);
  }
};
