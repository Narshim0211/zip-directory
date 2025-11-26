const createRouter = require('../asyncRouter');
const router = createRouter();
const { protect } = require('../../middleWare/authMiddleware');
const rateLimit = require('../../middleWare/rateLimit');
const businessController = require('../../controllers/v1/businessController');

/**
 * Business Routes (v1)
 * Manages business entities (salons, spas, shops) owned by users
 *
 * These are SEPARATE from personal owner profiles
 */

// Get all businesses owned by current user
router.get('/my-businesses', protect, businessController.getMyBusinesses);

// Get specific business by ID (public or owner)
router.get('/:id', businessController.getById);

// Create new business
router.post('/', protect, rateLimit({ windowMs: 60 * 1000, max: 10 }), businessController.create);

// Update business
router.put('/:id', protect, rateLimit({ windowMs: 60 * 1000, max: 30 }), businessController.update);

// Upload business logo/banner
router.post('/:id/upload', protect, rateLimit({ windowMs: 60 * 1000, max: 20 }), businessController.uploadImage);

// Delete business (soft delete)
router.delete('/:id', protect, businessController.delete);

module.exports = router;
