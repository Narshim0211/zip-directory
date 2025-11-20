const impressionService = require('./impression.service');
const logger = require('../../../utils/logger');

/**
 * Impression Controller
 * Clean REST endpoints - NO business logic here
 * Handles impression tracking for posts and surveys
 */

/**
 * POST /api/v1/analytics/impressions/:contentType/:contentId
 * Record an impression (increment counter)
 * NO authentication required - impressions are public metrics
 */
exports.createImpression = async (req, res, next) => {
  try {
    const { contentType, contentId } = req.params;

    const result = await impressionService.addImpression(contentId, contentType);

    res.status(200).json(result);
  } catch (error) {
    logger.error(`Create impression failed: ${error.message}`);
    next(error);
  }
};

/**
 * GET /api/v1/analytics/impressions/:contentType/:contentId
 * Get impression count for content
 * Public endpoint - no authentication required
 */
exports.getImpressionCount = async (req, res, next) => {
  try {
    const { contentType, contentId } = req.params;

    const result = await impressionService.getImpressionCount(contentId, contentType);

    res.status(200).json(result);
  } catch (error) {
    logger.error(`Get impression count failed: ${error.message}`);
    next(error);
  }
};

/**
 * POST /api/v1/analytics/impressions/batch/:contentType
 * Get impression counts for multiple content items
 * Body: { contentIds: ['id1', 'id2', 'id3'] }
 * Public endpoint - used for feed optimization
 */
exports.getImpressionCountsBatch = async (req, res, next) => {
  try {
    const { contentType } = req.params;
    const { contentIds } = req.body;

    if (!contentIds || !Array.isArray(contentIds)) {
      return res.status(400).json({
        success: false,
        message: 'contentIds array is required in request body'
      });
    }

    const result = await impressionService.getImpressionCountsBatch(contentIds, contentType);

    res.status(200).json(result);
  } catch (error) {
    logger.error(`Get impression counts batch failed: ${error.message}`);
    next(error);
  }
};
