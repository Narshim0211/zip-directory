const createRouter = require('../asyncRouter');
const router = createRouter();
const { protect, adminOnly } = require('../../middleWare/authMiddleware');
const adminNewsletterController = require('../../controllers/adminNewsletterController');

/**
 * Admin Newsletter Routes
 * All routes protected and admin-only
 */

// Overview: Get subscriber counts and recent campaigns
router.get('/overview', protect, adminOnly, adminNewsletterController.getOverview);

// Get visitor newsletter subscribers
router.get('/subscribers/visitor', protect, adminOnly, adminNewsletterController.getVisitorSubscribers);

// Get owner newsletter subscribers
router.get('/subscribers/owner', protect, adminOnly, adminNewsletterController.getOwnerSubscribers);

// Campaign CRUD operations
router.post('/campaigns', protect, adminOnly, adminNewsletterController.createCampaign);
router.get('/campaigns', protect, adminOnly, adminNewsletterController.getCampaigns);
router.get('/campaigns/:id', protect, adminOnly, adminNewsletterController.getCampaignById);
router.patch('/campaigns/:id', protect, adminOnly, adminNewsletterController.updateCampaign);
router.delete('/campaigns/:id', protect, adminOnly, adminNewsletterController.deleteCampaign);

// Campaign actions
router.post('/campaigns/:id/test', protect, adminOnly, adminNewsletterController.sendTestEmail);
router.post('/campaigns/:id/send', protect, adminOnly, adminNewsletterController.scheduleCampaign);

module.exports = router;
