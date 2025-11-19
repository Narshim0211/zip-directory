const express = require('express');
const router = express.Router();
const {
  followOwner,
  unfollowOwner,
  getFollowing,
  getFollowers,
  checkFollowStatus
} = require('../../../controllers/v1/owner/followController');
const { protect } = require('../../../middleWare/authMiddleware');
const { restrictTo } = require('../../../middleWare/roleMiddleware');

// All routes require authentication and owner role
router.use(protect);
router.use(restrictTo('owner'));

// Get following/followers lists (must be before parameterized routes)
router.get('/following', getFollowing);
router.get('/followers', getFollowers);

// Check follow status
router.get('/check/:targetOwnerId', checkFollowStatus);

// Follow/Unfollow
router.post('/:targetOwnerId', followOwner);
router.delete('/:targetOwnerId', unfollowOwner);

module.exports = router;
