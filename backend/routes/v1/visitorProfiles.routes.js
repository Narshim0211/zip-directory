const createRouter = require('../asyncRouter');
const router = createRouter();
const { protect } = require('../../middleWare/authMiddleware');
const rateLimit = require('../../middleWare/rateLimit');
const { validateVisitorUpdate } = require('../../validators/profileValidators');
const visitorController = require('../../controllers/v1/visitorProfileController');

router.get('/me', protect, visitorController.getMe);
router.put('/me', protect, rateLimit({ windowMs: 60 * 1000, max: 30 }), validateVisitorUpdate, visitorController.updateMe);

router.get('/:slug', visitorController.getPublic);
router.get('/:slug/timeline', visitorController.getTimeline);

// follow/unfollow (auth required)
router.post('/:id/follow', protect, rateLimit({ windowMs: 60 * 1000, max: 60 }), visitorController.follow);
router.delete('/:id/follow', protect, rateLimit({ windowMs: 60 * 1000, max: 60 }), visitorController.unfollow);
router.get('/:id/is-following', protect, visitorController.isFollowing);

module.exports = router;
