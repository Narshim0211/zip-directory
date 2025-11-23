// backend/models/BannedUser.js

const mongoose = require('mongoose');

/**
 * 🚫 BANNED USER MODEL (v1.0)
 *
 * Tracks user bans for violations of platform rules
 *
 * Ban Types:
 * - Temporary (expires after duration)
 * - Permanent (no expiration)
 *
 * Ban Reasons:
 * - Spam (fake reviews, business spam)
 * - Harassment (bullying, threats)
 * - Inappropriate content (offensive images/text)
 * - Fraud (fake claims, impersonation)
 * - Multiple violations (repeated offenses)
 *
 * Purpose:
 * - Prevent banned users from accessing platform
 * - Track violation history
 * - Allow temporary bans with auto-unban
 * - Admin accountability
 */

const bannedUserSchema = new mongoose.Schema({
  // ========================================
  // WHO IS BANNED
  // ========================================

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true, // One ban record per user (update if re-banned)
    index: true
  },

  // ========================================
  // BAN DETAILS
  // ========================================

  banType: {
    type: String,
    enum: ['temporary', 'permanent'],
    required: true,
    default: 'temporary'
  },

  reason: {
    type: String,
    enum: [
      'spam',                // Spam/fake content
      'harassment',          // Harassment/bullying
      'inappropriate',       // Inappropriate content
      'fraud',               // Fraud/impersonation
      'multiple_violations', // Repeated violations
      'fake_reviews',        // Creating fake reviews
      'abuse_reports',       // Abusing report system
      'other'                // Other (must provide description)
    ],
    required: true,
    index: true
  },

  description: {
    type: String,
    required: true,
    maxlength: 2000,
    trim: true
  },

  // ========================================
  // BAN DURATION
  // ========================================

  bannedAt: {
    type: Date,
    default: Date.now,
    required: true,
    index: true
  },

  expiresAt: {
    type: Date,
    default: null, // null = permanent ban
    index: true
  },

  // Duration in days (for reference)
  durationDays: {
    type: Number,
    default: null // null = permanent
  },

  // ========================================
  // ADMIN TRACKING
  // ========================================

  bannedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Admin who issued ban
    required: true
  },

  unbannedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Admin who lifted ban (if manually unbanned)
    default: null
  },

  unbannedAt: {
    type: Date,
    default: null
  },

  // ========================================
  // RELATED ENTITIES
  // ========================================

  // Reports that led to this ban
  relatedReports: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report'
  }],

  // ========================================
  // VIOLATION HISTORY
  // ========================================

  // Number of previous warnings before ban
  previousWarnings: {
    type: Number,
    default: 0,
    min: 0
  },

  // Number of previous temporary bans
  previousBans: {
    type: Number,
    default: 0,
    min: 0
  },

  // ========================================
  // STATUS
  // ========================================

  status: {
    type: String,
    enum: ['active', 'expired', 'lifted'],
    default: 'active',
    index: true
  },

  // Reason for lifting ban (if manually unbanned)
  unbanReason: {
    type: String,
    maxlength: 1000,
    default: ''
  }
});

// ========================================
// INDEXES FOR PERFORMANCE
// ========================================

// Active bans lookup
bannedUserSchema.index({ status: 1, expiresAt: 1 });

// User ban check (most critical query)
bannedUserSchema.index({ user: 1, status: 1 });

// Admin queries
bannedUserSchema.index({ bannedBy: 1, bannedAt: -1 });

// ========================================
// VIRTUALS
// ========================================

/**
 * Check if ban is currently active
 */
bannedUserSchema.virtual('isActive').get(function() {
  if (this.status !== 'active') return false;
  if (this.banType === 'permanent') return true;
  if (!this.expiresAt) return false;
  return new Date() < this.expiresAt;
});

/**
 * Days remaining (for temporary bans)
 */
bannedUserSchema.virtual('daysRemaining').get(function() {
  if (this.banType === 'permanent' || !this.expiresAt) return null;
  const now = new Date();
  if (now >= this.expiresAt) return 0;
  const msRemaining = this.expiresAt - now;
  return Math.ceil(msRemaining / (1000 * 60 * 60 * 24));
});

// ========================================
// METHODS
// ========================================

/**
 * Check and auto-unban if expired
 * @returns {Boolean} True if user is still banned
 */
bannedUserSchema.methods.checkAndUpdateStatus = async function() {
  // Permanent bans never expire
  if (this.banType === 'permanent') {
    return true; // Still banned
  }

  // Already expired or lifted
  if (this.status !== 'active') {
    return false; // Not banned
  }

  // Check if temporary ban has expired
  if (this.expiresAt && new Date() >= this.expiresAt) {
    this.status = 'expired';
    await this.save();
    return false; // No longer banned
  }

  return true; // Still banned
};

/**
 * Manually lift ban
 * @param {String} adminId - Admin who is lifting the ban
 * @param {String} reason - Reason for lifting ban
 */
bannedUserSchema.methods.liftBan = async function(adminId, reason = '') {
  this.status = 'lifted';
  this.unbannedBy = adminId;
  this.unbannedAt = new Date();
  this.unbanReason = reason;
  await this.save();
  return this;
};

/**
 * Extend ban duration
 * @param {Number} additionalDays - Days to add
 */
bannedUserSchema.methods.extendBan = async function(additionalDays) {
  if (this.banType === 'permanent') {
    throw new Error('Cannot extend permanent ban');
  }

  if (!this.expiresAt) {
    throw new Error('No expiration date set');
  }

  const currentExpiry = new Date(this.expiresAt);
  currentExpiry.setDate(currentExpiry.getDate() + additionalDays);
  this.expiresAt = currentExpiry;
  this.durationDays = (this.durationDays || 0) + additionalDays;

  await this.save();
  return this;
};

// ========================================
// STATICS
// ========================================

/**
 * Check if user is currently banned
 * @param {String} userId - User ID to check
 * @returns {Promise<Object|null>} Ban record if banned, null if not
 */
bannedUserSchema.statics.checkUserBan = async function(userId) {
  const ban = await this.findOne({
    user: userId,
    status: 'active'
  }).populate('bannedBy', 'name email');

  if (!ban) return null;

  // Check if expired
  const stillBanned = await ban.checkAndUpdateStatus();
  if (!stillBanned) return null;

  return ban;
};

/**
 * Create or update ban for user
 * @param {Object} data - Ban data
 * @returns {Promise<BannedUser>}
 */
bannedUserSchema.statics.banUser = async function(data) {
  const {
    userId,
    banType,
    reason,
    description,
    durationDays,
    bannedBy,
    relatedReports
  } = data;

  // Check for existing ban
  const existingBan = await this.findOne({ user: userId });

  let previousWarnings = 0;
  let previousBans = 0;

  if (existingBan) {
    previousWarnings = existingBan.previousWarnings || 0;
    previousBans = existingBan.previousBans || 0;

    // If currently active, increment ban count
    if (existingBan.status === 'active') {
      previousBans += 1;
    }
  }

  // Calculate expiration date for temporary bans
  let expiresAt = null;
  if (banType === 'temporary' && durationDays) {
    expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);
  }

  // Update existing or create new ban
  const ban = await this.findOneAndUpdate(
    { user: userId },
    {
      banType,
      reason,
      description,
      bannedAt: new Date(),
      expiresAt,
      durationDays: banType === 'temporary' ? durationDays : null,
      bannedBy,
      relatedReports: relatedReports || [],
      previousWarnings,
      previousBans,
      status: 'active',
      // Clear unban fields
      unbannedBy: null,
      unbannedAt: null,
      unbanReason: ''
    },
    { upsert: true, new: true }
  );

  return ban;
};

/**
 * Get all active bans
 * @param {Object} filters - Query filters
 * @returns {Promise<Array>}
 */
bannedUserSchema.statics.getActiveBans = async function(filters = {}) {
  const { banType, reason, page = 1, limit = 20 } = filters;

  const query = { status: 'active' };

  if (banType) {
    query.banType = banType;
  }

  if (reason) {
    query.reason = reason;
  }

  const skip = (page - 1) * limit;

  const bans = await this.find(query)
    .populate('user', 'name email')
    .populate('bannedBy', 'name email')
    .sort({ bannedAt: -1 })
    .limit(limit)
    .skip(skip)
    .lean();

  const total = await this.countDocuments(query);

  return {
    bans,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      limit: parseInt(limit)
    }
  };
};

/**
 * Get ban statistics
 * @returns {Promise<Object>}
 */
bannedUserSchema.statics.getStats = async function() {
  const totalBans = await this.countDocuments({});
  const activeBans = await this.countDocuments({ status: 'active' });
  const permanentBans = await this.countDocuments({ status: 'active', banType: 'permanent' });
  const temporaryBans = await this.countDocuments({ status: 'active', banType: 'temporary' });

  const reasonStats = await this.aggregate([
    { $match: { status: 'active' } },
    {
      $group: {
        _id: '$reason',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);

  return {
    totalBans,
    activeBans,
    permanentBans,
    temporaryBans,
    byReason: reasonStats.map(r => ({ reason: r._id, count: r.count }))
  };
};

/**
 * Auto-expire old temporary bans (run via cron job)
 * @returns {Promise<Number>} Number of bans expired
 */
bannedUserSchema.statics.autoExpireBans = async function() {
  const result = await this.updateMany(
    {
      status: 'active',
      banType: 'temporary',
      expiresAt: { $lte: new Date() }
    },
    {
      status: 'expired'
    }
  );

  return result.modifiedCount;
};

module.exports = mongoose.model('BannedUser', bannedUserSchema);
