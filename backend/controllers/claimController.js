// backend/controllers/claimController.js

const ClaimService = require('../services/claimService');

/**
 * 🏢 CLAIM CONTROLLER
 *
 * HTTP handlers for "Claim This Business" feature.
 *
 * Public endpoints for users to submit claims and track their status.
 */

/**
 * Submit a new claim request
 *
 * @route POST /api/claims
 * @access Private (authenticated users only)
 * @body {
 *   businessId: string,
 *   evidence: {
 *     businessDocuments: array,
 *     proofOfOwnership: string,
 *     contactVerification: object,
 *     additionalNotes: string
 *   }
 * }
 */
const submitClaim = async (req, res, next) => {
  try {
    const { businessId, evidence } = req.body;

    if (!businessId) {
      return res.status(400).json({
        success: false,
        message: 'Business ID is required'
      });
    }

    if (!evidence || !evidence.proofOfOwnership) {
      return res.status(400).json({
        success: false,
        message: 'Proof of ownership is required'
      });
    }

    // Get metadata
    const metadata = {
      ip: req.ip,
      userAgent: req.get('user-agent'),
      submittedFrom: 'web'
    };

    const result = await ClaimService.submitClaim({
      userId: req.user._id,
      businessId,
      evidence,
      metadata
    });

    res.status(201).json({
      success: true,
      message: result.autoApproved
        ? 'Claim approved! You are now the owner of this business.'
        : 'Claim submitted successfully. It will be reviewed by our team.',
      claim: {
        id: result.claim._id,
        status: result.claim.status,
        autoApproved: result.autoApproved,
        requiresReview: result.requiresReview,
        isDispute: result.isDispute,
        confidenceScore: result.claim.verification.confidenceScore,
        submittedAt: result.claim.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's submitted claims
 *
 * @route GET /api/claims/my-claims
 * @access Private (authenticated users only)
 * @query { status, page, limit }
 */
const getMyClaims = async (req, res, next) => {
  try {
    const { status, page, limit } = req.query;

    const result = await ClaimService.getUserClaims({
      userId: req.user._id,
      status,
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
 * Get user's claim statistics
 *
 * @route GET /api/claims/my-stats
 * @access Private (authenticated users only)
 */
const getMyClaimStats = async (req, res, next) => {
  try {
    const stats = await ClaimService.getUserClaimStats(req.user._id);

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single claim status
 *
 * @route GET /api/claims/:claimId/status
 * @access Private (authenticated users only)
 */
const getClaimStatus = async (req, res, next) => {
  try {
    const { claimId } = req.params;

    const ClaimRequest = require('../models/ClaimRequest');
    const claim = await ClaimRequest.findOne({
      _id: claimId,
      claimant: req.user._id
    })
      .populate('business', 'name city category')
      .populate('existingOwner', 'name email')
      .populate('reviewedBy', 'name')
      .lean();

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found'
      });
    }

    res.json({
      success: true,
      claim: {
        id: claim._id,
        status: claim.status,
        business: claim.business,
        isDispute: claim.isDispute,
        autoApproved: claim.autoApproved,
        confidenceScore: claim.verification?.confidenceScore,
        submittedAt: claim.createdAt,
        reviewedAt: claim.reviewedAt,
        reviewedBy: claim.reviewedBy,
        rejectionReason: claim.rejectionReason,
        rejectionNotes: claim.rejectionNotes,
        ownershipTransferred: claim.ownershipTransferred,
        transferredAt: claim.transferredAt,
        appeal: claim.appeal
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit appeal for rejected claim
 *
 * @route POST /api/claims/:claimId/appeal
 * @access Private (authenticated users only)
 * @body { appealReason: string }
 */
const submitAppeal = async (req, res, next) => {
  try {
    const { claimId } = req.params;
    const { appealReason } = req.body;

    if (!appealReason || appealReason.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Appeal reason is required'
      });
    }

    const claim = await ClaimService.submitAppeal({
      claimId,
      userId: req.user._id,
      appealReason
    });

    res.json({
      success: true,
      message: 'Appeal submitted successfully. It will be reviewed by our team.',
      claim: {
        id: claim._id,
        status: claim.status,
        appeal: claim.appeal
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitClaim,
  getMyClaims,
  getMyClaimStats,
  getClaimStatus,
  submitAppeal
};
