const express = require('express');
const router = express.Router();
const feedController = require('../controllers/feedController');
const { protect } = require('../middleWare/authMiddleware');
const rateLimit = require('../middleWare/rateLimit');

// New unified global feed (public - no auth required)
router.get(
  '/global',
  rateLimit({ windowMs: 60 * 1000, max: 100 }), // 100 requests per minute
  feedController.getGlobalFeed
);

// New following feed (auth required)
router.get(
  '/following',
  protect,
  rateLimit({ windowMs: 60 * 1000, max: 100 }),
  feedController.getFollowingFeed
);

// Legacy route (kept for backward compatibility)
router.get('/visitor', protect, feedController.getVisitorFeed);

module.exports = router;
