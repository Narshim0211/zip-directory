const express = require('express');
const router = express.Router();
const { getFeed, getOwnerFeed } = require('../../controllers/v1/feedController');
const { protect } = require('../../middleWare/authMiddleware');

// GET /api/v1/feed - Public feed
router.get('/', getFeed);

// GET /api/v1/feed/owner - Owner-specific feed (authenticated)
router.get('/owner', protect, getOwnerFeed);

module.exports = router;
