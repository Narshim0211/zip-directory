// backend/models/AuditLog.js

const mongoose = require('mongoose');

/**
 * 📜 AUDIT LOG MODEL (v1.0)
 *
 * Tracks all admin actions for accountability and compliance
 *
 * Logged Actions:
 * - Business approvals/rejections
 * - Claim approvals/rejections
 * - Report resolutions
 * - User bans/unbans
 * - Content deletions
 *
 * Purpose:
 * - Compliance (who did what, when)
 * - Fraud investigation
 * - Admin accountability
 * - Rollback capability (know previous state)
 */

const auditLogSchema = new mongoose.Schema({
  // ========================================
  // WHO PERFORMED THE ACTION
  // ========================================

  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // ========================================
  // WHAT ACTION WAS PERFORMED
  // ========================================

  action: {
    type: String,
    enum: [
      // Business moderation
      'approve_business',
      'reject_business',
      're_evaluate_business',

      // Claim management
      'approve_claim',
      'reject_claim',

      // Report resolution
      'resolve_report',
      'dismiss_report',

      // User management
      'ban_user',
      'unban_user',
      'warn_user',

      // Content moderation
      'delete_business',
      'delete_review',
      'delete_post',
      'hide_content',
      'unhide_content',

      // Other
      'edit_business',
      'bulk_action'
    ],
    required: true,
    index: true
  },

  // ========================================
  // WHAT ENTITY WAS AFFECTED
  // ========================================

  targetEntityType: {
    type: String,
    enum: ['Business', 'Review', 'Post', 'User', 'ClaimRequest', 'Report'],
    required: true
  },

  targetEntityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'targetEntityType'
  },

  // ========================================
  // ACTION DETAILS
  // ========================================

  // State before action (for rollback)
  previousState: {
    type: mongoose.Schema.Types.Mixed
  },

  // State after action
  newState: {
    type: mongoose.Schema.Types.Mixed
  },

  // Reason/justification for action
  reason: {
    type: String,
    maxlength: 1000,
    default: ''
  },

  // Additional metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  // ========================================
  // TIMESTAMP
  // ========================================

  performedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// ========================================
// INDEXES FOR PERFORMANCE
// ========================================

// Query by admin
auditLogSchema.index({ admin: 1, performedAt: -1 });

// Query by entity
auditLogSchema.index({ targetEntityType: 1, targetEntityId: 1, performedAt: -1 });

// Query by action type
auditLogSchema.index({ action: 1, performedAt: -1 });

// Recent logs
auditLogSchema.index({ performedAt: -1 });

// ========================================
// STATICS
// ========================================

/**
 * Log an admin action
 * @param {Object} data - Action data
 * @returns {Promise<AuditLog>}
 */
auditLogSchema.statics.logAction = async function(data) {
  const {
    admin,
    action,
    targetEntityType,
    targetEntityId,
    previousState,
    newState,
    reason,
    metadata
  } = data;

  return await this.create({
    admin,
    action,
    targetEntityType,
    targetEntityId,
    previousState,
    newState,
    reason,
    metadata: metadata || {},
    performedAt: new Date()
  });
};

/**
 * Get recent actions by admin
 * @param {String} adminId - Admin user ID
 * @param {Number} limit - Number of results
 * @returns {Promise<Array>}
 */
auditLogSchema.statics.getRecentByAdmin = async function(adminId, limit = 20) {
  return await this.find({ admin: adminId })
    .sort({ performedAt: -1 })
    .limit(limit)
    .populate('admin', 'name email')
    .lean();
};

/**
 * Get action history for an entity
 * @param {String} entityType - Entity type
 * @param {String} entityId - Entity ID
 * @returns {Promise<Array>}
 */
auditLogSchema.statics.getEntityHistory = async function(entityType, entityId) {
  return await this.find({
    targetEntityType: entityType,
    targetEntityId: entityId
  })
    .sort({ performedAt: -1 })
    .populate('admin', 'name email')
    .lean();
};

/**
 * Get statistics
 * @param {Object} filters - Date filters
 * @returns {Promise<Object>}
 */
auditLogSchema.statics.getStats = async function(filters = {}) {
  const { startDate, endDate } = filters;

  const query = {};
  if (startDate || endDate) {
    query.performedAt = {};
    if (startDate) query.performedAt.$gte = new Date(startDate);
    if (endDate) query.performedAt.$lte = new Date(endDate);
  }

  const actionStats = await this.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$action',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);

  const adminStats = await this.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$admin',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  const totalActions = await this.countDocuments(query);

  return {
    totalActions,
    byAction: actionStats.map(a => ({ action: a._id, count: a.count })),
    topAdmins: adminStats.map(a => ({ adminId: a._id, count: a.count }))
  };
};

module.exports = mongoose.model('AuditLog', auditLogSchema);
