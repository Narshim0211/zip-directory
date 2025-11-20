const reactionService = require('./reaction.service');
const logger = require('../../../utils/logger');

/**
 * Toggle reaction on content (survey or post)
 * POST /api/analytics/reactions/toggle/:contentType/:contentId
 */
exports.toggleReaction = async (req, res, next) => {
  try {
    const { contentType, contentId } = req.params;
    const { reactionType } = req.body;
    const userId = req.user._id;

    const result = await reactionService.toggleReaction(userId, contentId, contentType, reactionType);

    res.status(200).json(result);
  } catch (error) {
    logger.error(`Toggle reaction failed: ${error.message}`);
    next(error);
  }
};

/**
 * Get reactions for content
 * GET /api/analytics/reactions/:contentType/:contentId
 */
exports.getReactions = async (req, res, next) => {
  try {
    const { contentType, contentId } = req.params;
    const userId = req.user?._id || null; // Optional: if logged in, return their reaction

    const result = await reactionService.getReactions(contentId, contentType, userId);

    res.status(200).json(result);
  } catch (error) {
    logger.error(`Get reactions failed: ${error.message}`);
    next(error);
  }
};
