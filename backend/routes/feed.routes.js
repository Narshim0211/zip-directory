const express = require('express');
const router = express.Router();
const feedController = require('../controllers/feedController');
const { protect } = require('../middleWare/authMiddleware');
const rateLimit = require('../middleWare/rateLimit');

/**
 * Feed Routes - Unified Global Feed
 *
 * Provides endpoints for accessing the unified feed that combines
 * posts and surveys from both Owners and Visitors with role metadata.
 */

// Public routes (no auth required)
router.get(
  '/global',
  rateLimit({ windowMs: 60 * 1000, max: 100 }), // 100 requests per minute
  feedController.getGlobalFeed
);

// Protected routes (auth required)
router.get(
  '/following',
  protect,
  rateLimit({ windowMs: 60 * 1000, max: 100 }),
  feedController.getFollowingFeed
);

module.exports = router;
