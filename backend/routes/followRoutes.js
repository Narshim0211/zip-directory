const express = require('express');
const router = express.Router();
const { protect } = require('../middleWare/authMiddleware');
const controller = require('../controllers/followController');
const rateLimit = require('../middleWare/rateLimit');

// Follow a user (auth required)
router.post(
  '/',
  protect,
  rateLimit({ windowMs: 60 * 1000, max: 50 }), // 50 follows per minute
  controller.followUser
);

// Legacy route for backward compatibility
router.post(
  '/follow/:id',
  protect,
  rateLimit({ windowMs: 60 * 1000, max: 50 }),
  controller.followUser
);

// Unfollow a user (auth required)
router.delete(
  '/unfollow',
  protect,
  rateLimit({ windowMs: 60 * 1000, max: 50 }),
  controller.unfollowUser
);

// Legacy route for backward compatibility
router.delete(
  '/unfollow/:id',
  protect,
  rateLimit({ windowMs: 60 * 1000, max: 50 }),
  controller.unfollowUser
);

// Get followers of a user (public)
router.get(
  '/followers/:id',
  rateLimit({ windowMs: 60 * 1000, max: 100 }),
  controller.listFollowers
);

// Get users that a user is following (public)
router.get(
  '/following/:id',
  rateLimit({ windowMs: 60 * 1000, max: 100 }),
  controller.listFollowing
);

// Get following for current user (auth required)
router.get(
  '/following',
  protect,
  rateLimit({ windowMs: 60 * 1000, max: 100 }),
  controller.listFollowing
);

// Get follow statistics
router.get(
  '/stats/:id',
  rateLimit({ windowMs: 60 * 1000, max: 100 }),
  controller.getFollowStats
);

// Check if current user is following target user (auth required)
router.get(
  '/is-following/:id',
  protect,
  rateLimit({ windowMs: 60 * 1000, max: 100 }),
  controller.checkIsFollowing
);

module.exports = router;
