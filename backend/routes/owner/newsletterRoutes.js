const createRouter = require('../asyncRouter');
const router = createRouter();
const { protect, ownerOnly } = require('../../middleWare/authMiddleware');
const ownerNewsletterController = require('../../controllers/owner/ownerNewsletterController');

/**
 * Owner Newsletter Routes
 * All routes protected and owner-only
 */

// Subscribe to business growth newsletter
router.post('/subscribe', protect, ownerOnly, ownerNewsletterController.subscribe);

// Unsubscribe from business growth newsletter
router.post('/unsubscribe', protect, ownerOnly, ownerNewsletterController.unsubscribe);

// Get newsletter subscription status
router.get('/status', protect, ownerOnly, ownerNewsletterController.getStatus);

module.exports = router;
