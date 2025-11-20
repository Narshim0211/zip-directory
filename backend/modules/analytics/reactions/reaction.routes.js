const express = require('express');
const router = express.Router();
const reactionController = require('./reaction.controller');
const { protect } = require('../../../middleWare/authMiddleware');

// Toggle reaction (add/remove/switch) - requires authentication
router.post('/toggle/:contentType/:contentId', protect, reactionController.toggleReaction);

// Get reactions for content - public, but returns userReaction if authenticated
router.get('/:contentType/:contentId', reactionController.getReactions);

module.exports = router;
