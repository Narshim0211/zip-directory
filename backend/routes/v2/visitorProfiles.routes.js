const express = require('express');
const router = express.Router();
const controller = require('../../controllers/v2/visitorProfileController');
const { protect } = require('../../middleWare/authMiddleware');
const { restrictTo } = require('../../middleWare/roleMiddleware');

// Public routes
router.get('/:slug', controller.getProfile);
router.get('/:slug/feed', controller.getFeed);

// Protected routes (authenticated users only)
router.use(protect);

router.put('/:id', restrictTo('visitor', 'admin'), controller.updateProfile);
router.post('/:id/follow', controller.followProfile);
router.delete('/:id/follow', controller.unfollowProfile);
router.get('/:id/is-following', controller.isFollowing);

module.exports = router;
