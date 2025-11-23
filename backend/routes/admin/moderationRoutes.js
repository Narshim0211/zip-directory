// backend/routes/admin/moderationRoutes.js

const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../../middleWare/authMiddleware');
const {
  // Business moderation
  getPendingBusinesses,
  getModerationStats,
  approveBusiness,
  rejectBusiness,
  reevaluateBusiness,

  // Report management (Phase 2)
  getReportQueue,
  getReportStats,
  resolveReport,
  dismissReport,

  // Ban management (Phase 2)
  getActiveBans,
  getBanStats,
  liftBan,

  // Claim management (Phase 3)
  getClaimQueue,
  getClaimStats,
  approveClaim,
  rejectClaim,

  // Promotion management (Phase 4)
  getAllPromotions,
  getPromotionStats,
  adminDeactivatePromotion
} = require('../../controllers/admin/moderationController');

/**
 * 🛡️ ADMIN MODERATION ROUTES
 *
 * All routes require authentication + admin role.
 * Handles manual review queue for business listings.
 *
 * Base path: /api/admin/moderation
 */

// Apply authentication + admin middleware to all routes
router.use(protect);
router.use(adminOnly);

/**
 * @route   GET /api/admin/moderation/pending
 * @desc    Get list of businesses pending admin review
 * @access  Private (Admin only)
 * @query   page, limit
 */
router.get('/pending', getPendingBusinesses);

/**
 * @route   GET /api/admin/moderation/stats
 * @desc    Get moderation queue statistics
 * @access  Private (Admin only)
 */
router.get('/stats', getModerationStats);

/**
 * @route   POST /api/admin/moderation/businesses/:id/approve
 * @desc    Approve a pending business listing
 * @access  Private (Admin only)
 */
router.post('/businesses/:id/approve', approveBusiness);

/**
 * @route   POST /api/admin/moderation/businesses/:id/reject
 * @desc    Reject a business listing
 * @access  Private (Admin only)
 * @body    { reason: string }
 */
router.post('/businesses/:id/reject', rejectBusiness);

/**
 * @route   POST /api/admin/moderation/businesses/:id/re-evaluate
 * @desc    Re-run moderation engine on a business
 * @access  Private (Admin only)
 */
router.post('/businesses/:id/re-evaluate', reevaluateBusiness);

// ========================================
// REPORT MANAGEMENT ROUTES (Phase 2)
// ========================================

/**
 * @route   GET /api/admin/moderation/reports
 * @desc    Get report queue for admin review
 * @access  Private (Admin only)
 * @query   status, priority, entityType, page, limit
 */
router.get('/reports', getReportQueue);

/**
 * @route   GET /api/admin/moderation/reports/stats
 * @desc    Get report statistics
 * @access  Private (Admin only)
 */
router.get('/reports/stats', getReportStats);

/**
 * @route   POST /api/admin/moderation/reports/:id/resolve
 * @desc    Resolve a report with action
 * @access  Private (Admin only)
 * @body    { resolution: string, adminNotes: string }
 */
router.post('/reports/:id/resolve', resolveReport);

/**
 * @route   POST /api/admin/moderation/reports/:id/dismiss
 * @desc    Dismiss a report (no action needed)
 * @access  Private (Admin only)
 * @body    { reason: string }
 */
router.post('/reports/:id/dismiss', dismissReport);

// ========================================
// BAN MANAGEMENT ROUTES (Phase 2)
// ========================================

/**
 * @route   GET /api/admin/moderation/bans
 * @desc    Get list of active bans
 * @access  Private (Admin only)
 * @query   banType, reason, page, limit
 */
router.get('/bans', getActiveBans);

/**
 * @route   GET /api/admin/moderation/bans/stats
 * @desc    Get ban statistics
 * @access  Private (Admin only)
 */
router.get('/bans/stats', getBanStats);

/**
 * @route   POST /api/admin/moderation/bans/:id/lift
 * @desc    Manually lift a ban
 * @access  Private (Admin only)
 * @body    { reason: string }
 */
router.post('/bans/:id/lift', liftBan);

// ========================================
// CLAIM MANAGEMENT ROUTES (Phase 3)
// ========================================

/**
 * @route   GET /api/admin/moderation/claims
 * @desc    Get claim queue for admin review
 * @access  Private (Admin only)
 * @query   status, priority, isDispute, page, limit
 */
router.get('/claims', getClaimQueue);

/**
 * @route   GET /api/admin/moderation/claims/stats
 * @desc    Get claim statistics
 * @access  Private (Admin only)
 */
router.get('/claims/stats', getClaimStats);

/**
 * @route   POST /api/admin/moderation/claims/:id/approve
 * @desc    Approve a claim and transfer ownership
 * @access  Private (Admin only)
 * @body    { notes: string }
 */
router.post('/claims/:id/approve', approveClaim);

/**
 * @route   POST /api/admin/moderation/claims/:id/reject
 * @desc    Reject a claim
 * @access  Private (Admin only)
 * @body    { reason: string, notes: string }
 */
router.post('/claims/:id/reject', rejectClaim);

// ========================================
// PROMOTION MANAGEMENT ROUTES (Phase 4)
// ========================================

/**
 * @route   GET /api/admin/moderation/promotions
 * @desc    Get all promotions across all businesses
 * @access  Private (Admin only)
 * @query   isActive, page, limit
 */
router.get('/promotions', getAllPromotions);

/**
 * @route   GET /api/admin/moderation/promotions/stats
 * @desc    Get promotion statistics
 * @access  Private (Admin only)
 */
router.get('/promotions/stats', getPromotionStats);

/**
 * @route   POST /api/admin/moderation/promotions/:businessId/deactivate
 * @desc    Manually deactivate a promotion
 * @access  Private (Admin only)
 * @body    { reason: string }
 */
router.post('/promotions/:businessId/deactivate', adminDeactivatePromotion);

module.exports = router;
