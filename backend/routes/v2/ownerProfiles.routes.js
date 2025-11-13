const express = require('express');
const router = express.Router();
const controller = require('../../controllers/v2/ownerProfileController');
const { protect } = require('../../middleWare/authMiddleware');
const { restrictTo } = require('../../middleWare/roleMiddleware');

// Public routes
router.get('/:slug/feed', controller.getFeed);

// Protected routes (authenticated users only)
router.use(protect);

// Owner-only routes for own profile
router.get('/me', restrictTo('owner', 'admin'), controller.getMyProfile);
router.post('/init', restrictTo('owner', 'admin'), controller.initProfile);

// Public profile route (must come after /me to avoid conflict)
router.get('/:slug', controller.getProfile);

router.put('/:id', restrictTo('owner', 'admin'), controller.updateProfile);
router.post('/:id/follow', controller.followProfile);
router.delete('/:id/follow', controller.unfollowProfile);
router.get('/:id/is-following', controller.isFollowing);

module.exports = router;
