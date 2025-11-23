// backend/controllers/admin/moderationController.js

const Business = require('../../models/Business');
const BusinessModerationEngine = require('../../modules/moderation/businessModerationEngine');
const Report = require('../../models/Report');
const ReportService = require('../../services/reportService');
const BannedUser = require('../../models/BannedUser');
const ClaimRequest = require('../../models/ClaimRequest');
const ClaimService = require('../../services/claimService');

/**
 * 🛡️ ADMIN MODERATION CONTROLLER
 *
 * Handles admin review queue for business listings that need manual approval.
 * Only accessible by admin users via adminMiddleware.
 *
 * Endpoints:
 * - GET /api/admin/moderation/pending - List all pending businesses
 * - GET /api/admin/moderation/stats - Moderation queue statistics
 * - POST /api/admin/moderation/businesses/:id/approve - Approve a business
 * - POST /api/admin/moderation/businesses/:id/reject - Reject a business
 * - POST /api/admin/moderation/businesses/:id/re-evaluate - Re-run moderation
 */

/**
 * Get all businesses pending admin review
 *
 * @route GET /api/admin/moderation/pending
 * @access Private (Admin only)
 */
const getPendingBusinesses = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const pending = await Business.find({
      moderationStatus: 'PENDING',
    })
      .select(
        'name phone address city category moderationIssues owner createdAt metadata'
      )
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    const total = await Business.countDocuments({
      moderationStatus: 'PENDING',
    });

    res.json({
      success: true,
      pending,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get moderation queue statistics
 *
 * @route GET /api/admin/moderation/stats
 * @access Private (Admin only)
 */
const getModerationStats = async (req, res, next) => {
  try {
    const stats = await Business.aggregate([
      {
        $group: {
          _id: '$moderationStatus',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get today's pending submissions
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayPending = await Business.countDocuments({
      moderationStatus: 'PENDING',
      createdAt: { $gte: startOfToday },
    });

    // Format stats for easy consumption
    const formattedStats = {
      APPROVED: 0,
      PENDING: 0,
      REJECTED: 0,
    };

    stats.forEach((stat) => {
      if (stat._id) {
        formattedStats[stat._id] = stat.count;
      }
    });

    res.json({
      success: true,
      stats: formattedStats,
      todayPending,
      queueSize: formattedStats.PENDING,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve a business listing
 *
 * @route POST /api/admin/moderation/businesses/:id/approve
 * @access Private (Admin only)
 */
const approveBusiness = async (req, res, next) => {
  try {
    const { id } = req.params;

    const business = await Business.findById(id);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found',
      });
    }

    // Update moderation status
    business.moderationStatus = 'APPROVED';
    business.moderationIssues = []; // Clear issues
    business.metadata.lastModeratedAt = new Date();

    await business.save();

    res.json({
      success: true,
      message: `Business "${business.name}" approved successfully`,
      business: {
        id: business._id,
        name: business.name,
        moderationStatus: business.moderationStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject a business listing
 *
 * @route POST /api/admin/moderation/businesses/:id/reject
 * @access Private (Admin only)
 * @body { reason: string }
 */
const rejectBusiness = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required',
      });
    }

    const business = await Business.findById(id);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found',
      });
    }

    // Update moderation status
    business.moderationStatus = 'REJECTED';
    business.moderationIssues = [reason];
    business.metadata.lastModeratedAt = new Date();

    await business.save();

    res.json({
      success: true,
      message: `Business "${business.name}" rejected`,
      business: {
        id: business._id,
        name: business.name,
        moderationStatus: business.moderationStatus,
        moderationIssues: business.moderationIssues,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Re-evaluate a business using moderation engine
 * Useful when rules change or owner claims they fixed issues
 *
 * @route POST /api/admin/moderation/businesses/:id/re-evaluate
 * @access Private (Admin only)
 */
const reevaluateBusiness = async (req, res, next) => {
  try {
    const { id } = req.params;

    const business = await Business.findById(id);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found',
      });
    }

    // Re-run moderation engine
    const moderation = await BusinessModerationEngine.evaluate(
      business.toObject(),
      {
        ip: business.metadata?.ip,
        ownerId: business.owner,
      }
    );

    // Update business with new moderation results
    business.moderationStatus = moderation.status;
    business.moderationIssues = moderation.issues;
    business.metadata.lastModeratedAt = new Date();

    await business.save();

    res.json({
      success: true,
      message: `Business "${business.name}" re-evaluated`,
      moderation,
      business: {
        id: business._id,
        name: business.name,
        moderationStatus: business.moderationStatus,
        moderationIssues: business.moderationIssues,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// REPORT MANAGEMENT (NEW - Phase 2)
// ========================================

/**
 * Get report queue (admin view)
 *
 * @route GET /api/admin/moderation/reports
 * @access Private (Admin only)
 */
const getReportQueue = async (req, res, next) => {
  try {
    const {
      status = 'open',
      priority,
      entityType,
      page = 1,
      limit = 20
    } = req.query;

    const result = await Report.getAdminQueue({
      status,
      priority,
      entityType,
      page,
      limit
    });

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get report statistics
 *
 * @route GET /api/admin/moderation/reports/stats
 * @access Private (Admin only)
 */
const getReportStats = async (req, res, next) => {
  try {
    const stats = await Report.getStats();

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Resolve a report
 *
 * @route POST /api/admin/moderation/reports/:id/resolve
 * @access Private (Admin only)
 * @body { resolution: string, adminNotes: string }
 */
const resolveReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { resolution, adminNotes } = req.body;

    if (!resolution) {
      return res.status(400).json({
        success: false,
        message: 'Resolution type is required'
      });
    }

    const validResolutions = [
      'content_removed',
      'user_warned',
      'user_banned',
      'entity_deleted',
      'no_action',
      'false_report'
    ];

    if (!validResolutions.includes(resolution)) {
      return res.status(400).json({
        success: false,
        message: `Invalid resolution. Must be one of: ${validResolutions.join(', ')}`
      });
    }

    const report = await ReportService.resolveReport({
      reportId: id,
      adminId: req.user._id,
      resolution,
      adminNotes: adminNotes || ''
    });

    res.json({
      success: true,
      message: `Report resolved: ${resolution}`,
      report: {
        id: report._id,
        status: report.status,
        resolution: report.resolution,
        resolvedAt: report.resolvedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Dismiss a report
 *
 * @route POST /api/admin/moderation/reports/:id/dismiss
 * @access Private (Admin only)
 * @body { reason: string }
 */
const dismissReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const report = await ReportService.dismissReport({
      reportId: id,
      adminId: req.user._id,
      reason: reason || 'No action needed'
    });

    res.json({
      success: true,
      message: 'Report dismissed',
      report: {
        id: report._id,
        status: report.status,
        resolution: report.resolution
      }
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// BAN MANAGEMENT (NEW - Phase 2)
// ========================================

/**
 * Get all active bans
 *
 * @route GET /api/admin/moderation/bans
 * @access Private (Admin only)
 */
const getActiveBans = async (req, res, next) => {
  try {
    const { banType, reason, page = 1, limit = 20 } = req.query;

    const result = await BannedUser.getActiveBans({
      banType,
      reason,
      page,
      limit
    });

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get ban statistics
 *
 * @route GET /api/admin/moderation/bans/stats
 * @access Private (Admin only)
 */
const getBanStats = async (req, res, next) => {
  try {
    const stats = await BannedUser.getStats();

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Manually lift a ban
 *
 * @route POST /api/admin/moderation/bans/:id/lift
 * @access Private (Admin only)
 * @body { reason: string }
 */
const liftBan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const ban = await BannedUser.findById(id);

    if (!ban) {
      return res.status(404).json({
        success: false,
        message: 'Ban record not found'
      });
    }

    await ban.liftBan(req.user._id, reason || 'Manually lifted by admin');

    res.json({
      success: true,
      message: 'Ban lifted successfully',
      ban: {
        id: ban._id,
        status: ban.status,
        unbannedAt: ban.unbannedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// CLAIM MANAGEMENT (NEW - Phase 3)
// ========================================

/**
 * Get claim queue (admin view)
 *
 * @route GET /api/admin/moderation/claims
 * @access Private (Admin only)
 */
const getClaimQueue = async (req, res, next) => {
  try {
    const {
      status = 'pending',
      priority,
      isDispute,
      page = 1,
      limit = 20
    } = req.query;

    const result = await ClaimRequest.getAdminQueue({
      status,
      priority,
      isDispute,
      page,
      limit
    });

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get claim statistics
 *
 * @route GET /api/admin/moderation/claims/stats
 * @access Private (Admin only)
 */
const getClaimStats = async (req, res, next) => {
  try {
    const stats = await ClaimRequest.getStats();

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve a claim
 *
 * @route POST /api/admin/moderation/claims/:id/approve
 * @access Private (Admin only)
 * @body { notes: string }
 */
const approveClaim = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const claim = await ClaimService.approveClaim({
      claimId: id,
      adminId: req.user._id,
      notes: notes || ''
    });

    res.json({
      success: true,
      message: 'Claim approved successfully. Ownership has been transferred.',
      claim: {
        id: claim._id,
        status: claim.status,
        ownershipTransferred: claim.ownershipTransferred,
        transferredAt: claim.transferredAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject a claim
 *
 * @route POST /api/admin/moderation/claims/:id/reject
 * @access Private (Admin only)
 * @body { reason: string, notes: string }
 */
const rejectClaim = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason, notes } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const validReasons = [
      'insufficient_evidence',
      'invalid_documents',
      'disputed_ownership',
      'business_not_found',
      'already_claimed',
      'fraud_suspected',
      'other'
    ];

    if (!validReasons.includes(reason)) {
      return res.status(400).json({
        success: false,
        message: `Invalid reason. Must be one of: ${validReasons.join(', ')}`
      });
    }

    const claim = await ClaimService.rejectClaim({
      claimId: id,
      adminId: req.user._id,
      reason,
      notes: notes || ''
    });

    res.json({
      success: true,
      message: 'Claim rejected',
      claim: {
        id: claim._id,
        status: claim.status,
        rejectionReason: claim.rejectionReason,
        rejectionNotes: claim.rejectionNotes
      }
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// PROMOTION MANAGEMENT (NEW - Phase 4)
// ========================================

/**
 * Get all active promotions across all businesses
 *
 * @route GET /api/admin/moderation/promotions
 * @access Private (Admin only)
 */
const getAllPromotions = async (req, res, next) => {
  try {
    const { isActive, page = 1, limit = 20 } = req.query;

    const query = { 'promotion.title': { $exists: true, $ne: '' } };

    if (isActive !== undefined) {
      query['promotion.isActive'] = isActive === 'true';
    }

    const skip = (page - 1) * limit;

    const businesses = await Business.find(query)
      .select('name city category promotion owner')
      .populate('owner', 'name email')
      .sort({ 'promotion.createdAt': -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    const total = await Business.countDocuments(query);

    res.json({
      success: true,
      promotions: businesses.map(b => ({
        businessId: b._id,
        businessName: b.name,
        businessCity: b.city,
        businessCategory: b.category,
        owner: b.owner,
        promotion: b.promotion
      })),
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get promotion statistics
 *
 * @route GET /api/admin/moderation/promotions/stats
 * @access Private (Admin only)
 */
const getPromotionStats = async (req, res, next) => {
  try {
    const [total, active, expired] = await Promise.all([
      Business.countDocuments({ 'promotion.title': { $exists: true, $ne: '' } }),
      Business.countDocuments({ 'promotion.isActive': true }),
      Business.countDocuments({
        'promotion.isActive': false,
        'promotion.title': { $exists: true, $ne: '' }
      })
    ]);

    // Get promotions expiring soon (within 3 days)
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const expiringSoon = await Business.countDocuments({
      'promotion.isActive': true,
      'promotion.expiresAt': { $lte: threeDaysFromNow }
    });

    res.json({
      success: true,
      stats: {
        total,
        active,
        expired,
        expiringSoon
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Manually deactivate a promotion
 *
 * @route POST /api/admin/moderation/promotions/:businessId/deactivate
 * @access Private (Admin only)
 * @body { reason: string }
 */
const adminDeactivatePromotion = async (req, res, next) => {
  try {
    const { businessId } = req.params;
    const { reason } = req.body;

    const business = await Business.findById(businessId);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    if (!business.promotion || !business.promotion.isActive) {
      return res.status(404).json({
        success: false,
        message: 'No active promotion found'
      });
    }

    business.promotion.isActive = false;
    await business.save();

    // Create audit log
    const AuditLog = require('../../models/AuditLog');
    await AuditLog.create({
      action: 'admin_deactivate_promotion',
      performedBy: req.user._id,
      targetModel: 'Business',
      targetId: business._id,
      changes: {
        promotion: {
          isActive: false
        }
      },
      reason: reason || 'Manually deactivated by admin',
      metadata: {
        businessId: business._id,
        promotionTitle: business.promotion.title
      }
    });

    res.json({
      success: true,
      message: `Promotion for "${business.name}" deactivated successfully`,
      business: {
        id: business._id,
        name: business.name,
        promotion: {
          title: business.promotion.title,
          isActive: business.promotion.isActive
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  // Business moderation (existing)
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
};
