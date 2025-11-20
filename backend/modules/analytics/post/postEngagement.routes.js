const express = require('express');
const router = express.Router();
const postController = require('./postEngagement.controller');
const { protect } = require('../../../middleWare/authMiddleware');

/**
 * Post Engagement Routes
 * Clear, predictable, no conflicts
 * Base: /api/v1/analytics/post
 */

// Record a post view (public - anyone can trigger)
router.post('/view/:postId', postController.recordView);

// Add/update a reaction (authenticated users only)
router.post('/react/:postId', protect, postController.addReaction);

// Get post engagement metrics (public - anyone can see)
router.get('/:postId', postController.getEngagement);

module.exports = router;
