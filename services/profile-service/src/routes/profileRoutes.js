const express = require('express');
const profileController = require('../controllers/profileController');
const { validateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * Profile Routes
 * Per PRD Section 7: API Endpoints
 * 
 * All routes require authentication via main backend token validation
 */

// Health check (no auth required)
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'profile-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// Profile Management
router.patch('/', validateToken, profileController.upsertProfile);
router.get('/me', validateToken, profileController.getMyProfile);
router.get('/:userId', validateToken, profileController.getProfileById);

// Social Features
router.post('/:userId/follow', validateToken, profileController.followUser);
router.delete('/:userId/follow', validateToken, profileController.unfollowUser);
router.get('/:userId/followers', validateToken, profileController.getFollowers);
router.get('/:userId/following', validateToken, profileController.getFollowing);

// Timeline
router.post('/timeline', validateToken, profileController.createTimelinePost);
router.get('/:userId/timeline', validateToken, profileController.getTimeline);

// Owner Business Info
router.patch('/business', validateToken, profileController.updateBusinessInfo);
router.get('/:ownerId/business', validateToken, profileController.getBusinessInfo);

module.exports = router;
