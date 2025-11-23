// backend/models/ClaimRequest.js

const mongoose = require('mongoose');

/**
 * 🏢 CLAIM REQUEST MODEL
 *
 * Tracks business ownership claims with smart auto-approval and admin review.
 *
 * Features:
 * - Auto-approve if no existing owner
 * - Manual review if business already has owner (ownership dispute)
 * - Evidence tracking (documents, proof of ownership)
 * - Verification status and history
 * - Support for claim appeals
 */

const claimRequestSchema = new mongoose.Schema({
  // Who is claiming
  claimant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // What business they're claiming
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true
  },

  // Claim status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'appealed'],
    default: 'pending',
    index: true
  },

  // Auto-approval tracking
  autoApproved: {
    type: Boolean,
    default: false
  },

  autoApprovalReason: {
    type: String,
    enum: ['no_existing_owner', 'expired_owner', null],
    default: null
  },

  // Evidence provided by claimant
  evidence: {
    // Business documents
    businessDocuments: [{
      type: {
        type: String,
        enum: ['business_license', 'tax_id', 'incorporation_docs', 'other'],
        required: true
      },
      url: String,
      description: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],

    // Proof of ownership/management
    proofOfOwnership: {
      type: String, // Text description
      maxlength: 1000
    },

    // Contact verification
    contactVerification: {
      phoneVerified: Boolean,
      emailVerified: Boolean,
      verificationCode: String,
      verifiedAt: Date
    },

    // Additional notes
    additionalNotes: {
      type: String,
      maxlength: 2000
    }
  },

  // Verification details
  verification: {
    // Method used to verify
    method: {
      type: String,
      enum: ['phone', 'email', 'documents', 'manual', 'auto', null],
      default: null
    },

    // Verification status
    verified: {
      type: Boolean,
      default: false
    },

    verifiedAt: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },

    // Verification score (0-100)
    confidenceScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },

  // Existing owner (if any) - for dispute tracking
  existingOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  // Is this a disputed claim?
  isDispute: {
    type: Boolean,
    default: false
  },

  // Admin review
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  reviewedAt: Date,

  // Admin decision
  adminDecision: {
    approved: Boolean,
    reason: String,
    notes: String
  },

  // Rejection details
  rejectionReason: {
    type: String,
    enum: [
      'insufficient_evidence',
      'invalid_documents',
      'disputed_ownership',
      'business_not_found',
      'already_claimed',
      'fraud_suspected',
      'other',
      null
    ],
    default: null
  },

  rejectionNotes: String,

  // Appeal tracking
  appeal: {
    appealed: {
      type: Boolean,
      default: false
    },
    appealReason: String,
    appealedAt: Date,
    appealStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', null],
      default: null
    },
    appealReviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    appealReviewedAt: Date
  },

  // Ownership transfer tracking
  ownershipTransferred: {
    type: Boolean,
    default: false
  },

  transferredAt: Date,

  previousOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Priority (for admin queue)
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true
  },

  // Metadata
  metadata: {
    ip: String,
    userAgent: String,
    submittedFrom: String, // 'web', 'mobile', 'api'

    // Fraud detection flags
    flags: [{
      type: String,
      reason: String,
      flaggedAt: Date
    }],

    // Processing time tracking
    processingStartedAt: Date,
    processingCompletedAt: Date
  }
}, {
  timestamps: true
});

// Indexes
claimRequestSchema.index({ claimant: 1, business: 1 });
claimRequestSchema.index({ business: 1, status: 1 });
claimRequestSchema.index({ status: 1, priority: 1 });
claimRequestSchema.index({ createdAt: -1 });

// ========================================
// STATIC METHODS
// ========================================

/**
 * Get admin claim queue
 */
claimRequestSchema.statics.getAdminQueue = async function(filters = {}) {
  const {
    status = 'pending',
    priority,
    isDispute,
    page = 1,
    limit = 20
  } = filters;

  const query = { status };

  if (priority) {
    query.priority = priority;
  }

  if (isDispute !== undefined) {
    query.isDispute = isDispute;
  }

  const skip = (page - 1) * limit;

  const claims = await this.find(query)
    .populate('claimant', 'name email role')
    .populate('business', 'name city category owner status')
    .populate('existingOwner', 'name email')
    .populate('reviewedBy', 'name email')
    .sort({ priority: -1, createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip)
    .lean();

  const total = await this.countDocuments(query);

  return {
    claims,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      limit: parseInt(limit)
    }
  };
};

/**
 * Get claim statistics
 */
claimRequestSchema.statics.getStats = async function() {
  const [statusStats, priorityStats, disputeStats, autoApprovalStats] = await Promise.all([
    // By status
    this.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]),

    // By priority
    this.aggregate([
      {
        $match: { status: 'pending' }
      },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]),

    // Dispute vs non-dispute
    this.aggregate([
      {
        $group: {
          _id: '$isDispute',
          count: { $sum: 1 }
        }
      }
    ]),

    // Auto-approval stats
    this.aggregate([
      {
        $group: {
          _id: '$autoApproved',
          count: { $sum: 1 }
        }
      }
    ])
  ]);

  // Format stats
  const formatStats = (stats) => {
    const result = {};
    stats.forEach(stat => {
      result[stat._id] = stat.count;
    });
    return result;
  };

  return {
    byStatus: formatStats(statusStats),
    byPriority: formatStats(priorityStats),
    disputes: disputeStats.find(s => s._id === true)?.count || 0,
    nonDisputes: disputeStats.find(s => s._id === false)?.count || 0,
    autoApproved: autoApprovalStats.find(s => s._id === true)?.count || 0,
    manualReview: autoApprovalStats.find(s => s._id === false)?.count || 0
  };
};

/**
 * Check if user already has pending claim for this business
 */
claimRequestSchema.statics.hasPendingClaim = async function(userId, businessId) {
  const existingClaim = await this.findOne({
    claimant: userId,
    business: businessId,
    status: 'pending'
  });

  return !!existingClaim;
};

/**
 * Calculate verification confidence score
 */
claimRequestSchema.methods.calculateConfidenceScore = function() {
  let score = 0;

  // Business documents (+40 points)
  if (this.evidence.businessDocuments && this.evidence.businessDocuments.length > 0) {
    score += Math.min(this.evidence.businessDocuments.length * 15, 40);
  }

  // Proof of ownership text (+20 points)
  if (this.evidence.proofOfOwnership && this.evidence.proofOfOwnership.length > 50) {
    score += 20;
  }

  // Contact verification (+30 points)
  if (this.evidence.contactVerification?.phoneVerified) {
    score += 15;
  }
  if (this.evidence.contactVerification?.emailVerified) {
    score += 15;
  }

  // No existing owner (+10 points - easier to approve)
  if (!this.existingOwner) {
    score += 10;
  }

  this.verification.confidenceScore = Math.min(score, 100);
  return this.verification.confidenceScore;
};

/**
 * Mark as approved
 */
claimRequestSchema.methods.approve = async function(adminId, notes = '') {
  this.status = 'approved';
  this.reviewedBy = adminId;
  this.reviewedAt = new Date();
  this.adminDecision = {
    approved: true,
    notes
  };
  this.metadata.processingCompletedAt = new Date();

  await this.save();
  return this;
};

/**
 * Mark as rejected
 */
claimRequestSchema.methods.reject = async function(adminId, reason, notes = '') {
  this.status = 'rejected';
  this.reviewedBy = adminId;
  this.reviewedAt = new Date();
  this.rejectionReason = reason;
  this.rejectionNotes = notes;
  this.adminDecision = {
    approved: false,
    reason,
    notes
  };
  this.metadata.processingCompletedAt = new Date();

  await this.save();
  return this;
};

/**
 * Submit appeal
 */
claimRequestSchema.methods.submitAppeal = async function(appealReason) {
  this.status = 'appealed';
  this.appeal = {
    appealed: true,
    appealReason,
    appealedAt: new Date(),
    appealStatus: 'pending'
  };

  await this.save();
  return this;
};

module.exports = mongoose.model('ClaimRequest', claimRequestSchema);
