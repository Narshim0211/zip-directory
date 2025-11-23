// backend/routes/promotionRoutes.js

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const promotionController = require('../controllers/promotionController');
const rateLimit = require('../middleWare/rateLimit');

/**
 * 🎁 OWNER PROMOTION ROUTES
 *
 * All routes require authentication (protect middleware)
 *
 * Routes:
 * - POST /api/owner/promotion - Create/update promotion
 * - GET /api/owner/promotion/:businessId - Get my promotion
 * - DELETE /api/owner/promotion/:businessId - Deactivate promotion
 */

/**
 * @route POST /api/owner/promotion
 * @desc Create or update promotion for business
 * @access Private (business owners only)
 * @body { businessId, title, description, expiryDays, customExpiresAt }
 */
router.post(
  '/',
  protect,
  rateLimit({ windowMs: 60 * 60 * 1000, max: 10 }), // 10 promotions per hour
  promotionController.createPromotion
);

/**
 * @route GET /api/owner/promotion/:businessId
 * @desc Get active promotion for my business
 * @access Private (business owners only)
 */
router.get('/:businessId', protect, promotionController.getMyPromotion);

/**
 * @route DELETE /api/owner/promotion/:businessId
 * @desc Deactivate (delete) promotion
 * @access Private (business owners only)
 */
router.delete('/:businessId', protect, promotionController.deactivatePromotion);

module.exports = router;
