const express = require('express');
const router = express.Router();
const impressionController = require('./impression.controller');

/**
 * Impression Routes
 * NO authentication required - impressions are public metrics
 * Following Instagram/TikTok/X (Twitter) patterns
 */

// Record an impression (increment counter)
router.post('/:contentType/:contentId', impressionController.createImpression);

// Get impression count for specific content
router.get('/:contentType/:contentId', impressionController.getImpressionCount);

// Batch endpoint for feed optimization
router.post('/batch/:contentType', impressionController.getImpressionCountsBatch);

module.exports = router;
