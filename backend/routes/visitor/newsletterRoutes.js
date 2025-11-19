const createRouter = require('../asyncRouter');
const router = createRouter();
const { protect, visitorOnly } = require('../../middleWare/authMiddleware');
const visitorNewsletterController = require('../../controllers/visitor/visitorNewsletterController');

/**
 * Visitor Newsletter Routes
 * All routes protected and visitor-only
 */

// Subscribe to hair tips newsletter
router.post('/subscribe', protect, visitorOnly, visitorNewsletterController.subscribe);

// Unsubscribe from hair tips newsletter
router.post('/unsubscribe', protect, visitorOnly, visitorNewsletterController.unsubscribe);

// Get newsletter subscription status
router.get('/status', protect, visitorOnly, visitorNewsletterController.getStatus);

module.exports = router;
