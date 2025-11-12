const createRouter = require('../asyncRouter');
const router = createRouter();
const { protect } = require('../../middleWare/authMiddleware');
const rateLimit = require('../../middleWare/rateLimit');
const { validateOwnerUpdate } = require('../../validators/profileValidators');
const ownerController = require('../../controllers/v1/ownerProfileController');

// Owner-only (profile of current user)
router.get('/me', protect, ownerController.getMe);
router.put('/me', protect, rateLimit({ windowMs: 60 * 1000, max: 30 }), validateOwnerUpdate, ownerController.updateMe);
router.put('/me/featured', protect, rateLimit({ windowMs: 60 * 1000, max: 20 }), ownerController.updateFeatured);

// Public
router.get('/:slug', ownerController.getPublic);
router.get('/:slug/timeline', ownerController.getTimeline);

// Upload avatar/header (protected)
router.post('/me/upload', protect, rateLimit({ windowMs: 60 * 1000, max: 20 }), ownerController.uploadImage);

// Follow/unfollow (auth required)
router.post('/:id/follow', protect, rateLimit({ windowMs: 60 * 1000, max: 60 }), ownerController.follow);
router.delete('/:id/follow', protect, rateLimit({ windowMs: 60 * 1000, max: 60 }), ownerController.unfollow);
router.get('/:id/is-following', protect, ownerController.isFollowing);

module.exports = router;
