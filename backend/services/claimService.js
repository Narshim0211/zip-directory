// backend/services/claimService.js

const ClaimRequest = require('../models/ClaimRequest');
const Business = require('../models/Business');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');

/**
 * 🏢 CLAIM SERVICE
 *
 * Business logic for "Claim This Business" feature.
 *
 * Features:
 * - Smart auto-approval (if no existing owner)
 * - Manual review queue (if disputed)
 * - Ownership transfer
 * - Audit logging
 */

class ClaimService {
  /**
   * Submit a new claim request
   *
   * Flow:
   * 1. Validate claim (no duplicate pending claims)
   * 2. Check if business has existing owner
   * 3. Auto-approve if no owner, else queue for admin review
   * 4. Calculate confidence score
   * 5. Create audit log
   */
  static async submitClaim({
    userId,
    businessId,
    evidence,
    metadata = {}
  }) {
    // 1. Check for duplicate pending claim
    const hasPending = await ClaimRequest.hasPendingClaim(userId, businessId);
    if (hasPending) {
      throw new Error('You already have a pending claim for this business');
    }

    // 2. Get business
    const business = await Business.findById(businessId);
    if (!business) {
      throw new Error('Business not found');
    }

    // 3. Check if business already claimed by this user
    if (business.owner && business.owner.toString() === userId.toString()) {
      throw new Error('You already own this business');
    }

    // 4. Determine if this is a dispute (existing owner)
    const isDispute = !!business.owner;
    const existingOwner = business.owner || null;

    // 5. Create claim request
    const claim = new ClaimRequest({
      claimant: userId,
      business: businessId,
      status: 'pending',
      evidence,
      isDispute,
      existingOwner,
      metadata: {
        ...metadata,
        processingStartedAt: new Date()
      }
    });

    // 6. Calculate confidence score
    claim.calculateConfidenceScore();

    // 7. Smart auto-approval logic
    const autoApprovalResult = await this._evaluateAutoApproval(claim, business);

    if (autoApprovalResult.shouldAutoApprove) {
      claim.autoApproved = true;
      claim.autoApprovalReason = autoApprovalResult.reason;
      claim.status = 'approved';
      claim.verification.verified = true;
      claim.verification.verifiedAt = new Date();
      claim.verification.method = 'auto';
      claim.metadata.processingCompletedAt = new Date();

      // Transfer ownership immediately
      await this._transferOwnership(claim, business);

      // Create audit log
      await AuditLog.create({
        action: 'auto_approve_claim',
        performedBy: null, // System action
        targetModel: 'ClaimRequest',
        targetId: claim._id,
        changes: {
          status: 'approved',
          autoApproved: true,
          reason: autoApprovalResult.reason
        },
        reason: `Auto-approved: ${autoApprovalResult.reason}`,
        metadata: {
          businessId,
          claimantId: userId
        }
      });
    } else {
      // Set priority based on dispute status
      claim.priority = isDispute ? 'high' : 'medium';

      // Create audit log for manual review
      await AuditLog.create({
        action: 'claim_submitted_for_review',
        performedBy: userId,
        targetModel: 'ClaimRequest',
        targetId: claim._id,
        changes: {
          status: 'pending',
          isDispute,
          priority: claim.priority
        },
        reason: isDispute ? 'Existing owner - requires admin review' : 'Requires manual verification',
        metadata: {
          businessId,
          existingOwnerId: existingOwner
        }
      });
    }

    await claim.save();

    return {
      claim,
      autoApproved: autoApprovalResult.shouldAutoApprove,
      requiresReview: !autoApprovalResult.shouldAutoApprove,
      isDispute
    };
  }

  /**
   * Evaluate if claim should be auto-approved
   *
   * Auto-approve if:
   * - Business has no existing owner
   * - Confidence score >= 70
   * - No fraud flags
   */
  static async _evaluateAutoApproval(claim, business) {
    // Check 1: No existing owner
    if (!business.owner) {
      // Check confidence score
      if (claim.verification.confidenceScore >= 70) {
        return {
          shouldAutoApprove: true,
          reason: 'no_existing_owner'
        };
      }
    }

    // Check 2: Existing owner but inactive (future enhancement)
    // Could check last login, business activity, etc.

    return {
      shouldAutoApprove: false,
      reason: null
    };
  }

  /**
   * Transfer ownership from claim
   */
  static async _transferOwnership(claim, business) {
    const previousOwner = business.owner;

    // Update business owner
    business.owner = claim.claimant;
    business.metadata = business.metadata || {};
    business.metadata.claimedAt = new Date();
    business.metadata.claimRequestId = claim._id;

    if (previousOwner) {
      business.metadata.previousOwner = previousOwner;
    }

    await business.save();

    // Update claim
    claim.ownershipTransferred = true;
    claim.transferredAt = new Date();
    claim.previousOwner = previousOwner;

    await claim.save();

    return business;
  }

  /**
   * Admin approve claim (manual review)
   */
  static async approveClaim({
    claimId,
    adminId,
    notes = ''
  }) {
    const claim = await ClaimRequest.findById(claimId)
      .populate('business')
      .populate('claimant');

    if (!claim) {
      throw new Error('Claim request not found');
    }

    if (claim.status !== 'pending' && claim.status !== 'appealed') {
      throw new Error('Claim is not pending review');
    }

    // Approve claim
    await claim.approve(adminId, notes);

    // Transfer ownership
    const business = await Business.findById(claim.business._id || claim.business);
    await this._transferOwnership(claim, business);

    // Create audit log
    await AuditLog.create({
      action: 'approve_claim',
      performedBy: adminId,
      targetModel: 'ClaimRequest',
      targetId: claim._id,
      changes: {
        status: 'approved',
        ownershipTransferred: true
      },
      reason: notes,
      metadata: {
        businessId: claim.business._id || claim.business,
        claimantId: claim.claimant._id || claim.claimant,
        previousOwnerId: claim.existingOwner
      }
    });

    return claim;
  }

  /**
   * Admin reject claim
   */
  static async rejectClaim({
    claimId,
    adminId,
    reason,
    notes = ''
  }) {
    const claim = await ClaimRequest.findById(claimId);

    if (!claim) {
      throw new Error('Claim request not found');
    }

    if (claim.status !== 'pending' && claim.status !== 'appealed') {
      throw new Error('Claim is not pending review');
    }

    // Reject claim
    await claim.reject(adminId, reason, notes);

    // Create audit log
    await AuditLog.create({
      action: 'reject_claim',
      performedBy: adminId,
      targetModel: 'ClaimRequest',
      targetId: claim._id,
      changes: {
        status: 'rejected',
        rejectionReason: reason
      },
      reason: notes,
      metadata: {
        businessId: claim.business,
        claimantId: claim.claimant
      }
    });

    return claim;
  }

  /**
   * User submit appeal for rejected claim
   */
  static async submitAppeal({
    claimId,
    userId,
    appealReason
  }) {
    const claim = await ClaimRequest.findById(claimId);

    if (!claim) {
      throw new Error('Claim request not found');
    }

    if (claim.claimant.toString() !== userId.toString()) {
      throw new Error('You can only appeal your own claims');
    }

    if (claim.status !== 'rejected') {
      throw new Error('Can only appeal rejected claims');
    }

    if (claim.appeal.appealed) {
      throw new Error('You have already appealed this claim');
    }

    // Submit appeal
    await claim.submitAppeal(appealReason);

    // Create audit log
    await AuditLog.create({
      action: 'submit_claim_appeal',
      performedBy: userId,
      targetModel: 'ClaimRequest',
      targetId: claim._id,
      changes: {
        status: 'appealed',
        appealReason
      },
      reason: appealReason,
      metadata: {
        businessId: claim.business
      }
    });

    return claim;
  }

  /**
   * Get user's claims
   */
  static async getUserClaims({
    userId,
    status,
    page = 1,
    limit = 20
  }) {
    const query = { claimant: userId };

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const claims = await ClaimRequest.find(query)
      .populate('business', 'name city category status')
      .populate('existingOwner', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    const total = await ClaimRequest.countDocuments(query);

    return {
      claims,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    };
  }

  /**
   * Get user's claim statistics
   */
  static async getUserClaimStats(userId) {
    const [total, pending, approved, rejected, appealed] = await Promise.all([
      ClaimRequest.countDocuments({ claimant: userId }),
      ClaimRequest.countDocuments({ claimant: userId, status: 'pending' }),
      ClaimRequest.countDocuments({ claimant: userId, status: 'approved' }),
      ClaimRequest.countDocuments({ claimant: userId, status: 'rejected' }),
      ClaimRequest.countDocuments({ claimant: userId, status: 'appealed' })
    ]);

    return {
      total,
      pending,
      approved,
      rejected,
      appealed
    };
  }
}

module.exports = ClaimService;
