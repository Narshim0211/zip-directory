// backend/routes/claimRoutes.js

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const claimController = require('../controllers/claimController');
const rateLimit = require('../middleWare/rateLimit');

/**
 * 🏢 PUBLIC CLAIM ROUTES
 *
 * All routes require authentication (protect middleware)
 *
 * Routes:
 * - POST /api/claims - Submit a new claim
 * - GET /api/claims/my-claims - Get my submitted claims
 * - GET /api/claims/my-stats - Get my claim statistics
 * - GET /api/claims/:claimId/status - Get claim status
 * - POST /api/claims/:claimId/appeal - Submit appeal
 */

/**
 * @route POST /api/claims
 * @desc Submit a new claim request
 * @access Private (authenticated users only)
 * @body { businessId, evidence }
 */
router.post(
  '/',
  protect,
  rateLimit({ windowMs: 60 * 60 * 1000, max: 5 }), // 5 claims per hour
  claimController.submitClaim
);

/**
 * @route GET /api/claims/my-claims
 * @desc Get all claims submitted by current user
 * @access Private (authenticated users only)
 * @query { status, page, limit }
 */
router.get('/my-claims', protect, claimController.getMyClaims);

/**
 * @route GET /api/claims/my-stats
 * @desc Get claim statistics for current user
 * @access Private (authenticated users only)
 */
router.get('/my-stats', protect, claimController.getMyClaimStats);

/**
 * @route GET /api/claims/:claimId/status
 * @desc Get status of a specific claim
 * @access Private (authenticated users only)
 */
router.get('/:claimId/status', protect, claimController.getClaimStatus);

/**
 * @route POST /api/claims/:claimId/appeal
 * @desc Submit appeal for rejected claim
 * @access Private (authenticated users only)
 * @body { appealReason }
 */
router.post(
  '/:claimId/appeal',
  protect,
  rateLimit({ windowMs: 24 * 60 * 60 * 1000, max: 3 }), // 3 appeals per day
  claimController.submitAppeal
);

module.exports = router;
