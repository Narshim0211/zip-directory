// backend/services/reportService.js

const Report = require('../models/Report');
const Business = require('../models/Business');
const Review = require('../models/Review');
const Post = require('../models/Post');
const User = require('../models/User');
const BannedUser = require('../models/BannedUser');
const AuditLog = require('../models/AuditLog');

/**
 * 🚨 REPORT SERVICE
 *
 * Handles report submission, auto-flagging, and resolution
 */

class ReportService {
  /**
   * Submit a new report
   * @param {Object} data - Report data
   * @returns {Promise<Object>} Report and auto-flag status
   */
  static async submitReport(data) {
    const {
      reporterId,
      entityType,
      entityId,
      reason,
      description,
      evidence
    } = data;

    // ========================================
    // 1. Validate entity exists
    // ========================================
    const entity = await this._validateEntity(entityType, entityId);
    if (!entity) {
      throw new Error(`${entityType} not found`);
    }

    // ========================================
    // 2. Check for duplicate report (same user, same entity)
    // ========================================
    const existingReport = await Report.findOne({
      reporter: reporterId,
      reportedEntityId: entityId,
      status: { $in: ['open', 'in_progress'] }
    });

    if (existingReport) {
      throw new Error('You have already reported this content');
    }

    // ========================================
    // 3. Create report
    // ========================================
    const report = await Report.create({
      reportedEntityType: entityType,
      reportedEntityId: entityId,
      reporter: reporterId,
      reason,
      description: description || '',
      evidence: evidence || [],
      status: 'open',
      priority: 'medium',
      submittedAt: new Date()
    });

    // ========================================
    // 4. Count similar reports for this entity
    // ========================================
    const similarReportsCount = await Report.countDocuments({
      reportedEntityType: entityType,
      reportedEntityId: entityId,
      status: { $in: ['open', 'in_progress'] }
    });

    // Update similar reports count
    await Report.updateMany(
      {
        reportedEntityType: entityType,
        reportedEntityId: entityId,
        status: { $in: ['open', 'in_progress'] }
      },
      { similarReportsCount }
    );

    // ========================================
    // 5. Check auto-flag threshold
    // ========================================
    const autoFlagged = await this._checkAutoFlagThreshold(
      entityType,
      entityId,
      similarReportsCount
    );

    if (autoFlagged) {
      await this._autoFlagEntity(entityType, entityId, similarReportsCount);

      // Mark report as triggering auto-flag
      report.autoFlagged = true;
      report.priority = 'high'; // Escalate priority
      await report.save();
    }

    return {
      report: report.toObject(),
      autoFlagged,
      similarReportsCount
    };
  }

  /**
   * Validate that entity exists
   * @private
   */
  static async _validateEntity(entityType, entityId) {
    const models = {
      Business,
      Review,
      Post,
      User
    };

    const Model = models[entityType];
    if (!Model) {
      throw new Error(`Invalid entity type: ${entityType}`);
    }

    return await Model.findById(entityId);
  }

  /**
   * Check if auto-flag threshold is reached
   * @private
   */
  static _checkAutoFlagThreshold(entityType, entityId, count) {
    const thresholds = {
      Business: 3,  // 3 reports → auto-unpublish
      Review: 2,    // 2 reports → auto-hide
      Post: 2,      // 2 reports → auto-hide
      User: 3       // 3 reports → auto-suspend
    };

    const threshold = thresholds[entityType];
    return count >= threshold;
  }

  /**
   * Auto-flag entity when threshold is reached
   * @private
   */
  static async _autoFlagEntity(entityType, entityId, reportCount) {
    console.log(`🚨 AUTO-FLAG TRIGGERED: ${entityType} ${entityId} (${reportCount} reports)`);

    const models = {
      Business,
      Review,
      Post,
      User
    };

    const Model = models[entityType];
    const entity = await Model.findById(entityId);

    if (!entity) return;

    // Store previous state for audit log
    const previousState = {
      status: entity.status,
      isHidden: entity.isHidden,
      isFlagged: entity.isFlagged
    };

    // Apply auto-flag based on entity type
    switch (entityType) {
      case 'Business':
        // Auto-unpublish business
        entity.status = 'pending';
        entity.isFlagged = true;
        entity.flagReason = `Auto-flagged: ${reportCount} reports`;
        entity.flaggedAt = new Date();
        break;

      case 'Review':
      case 'Post':
        // Auto-hide content
        entity.isHidden = true;
        entity.isFlagged = true;
        entity.flagReason = `Auto-flagged: ${reportCount} reports`;
        entity.flaggedAt = new Date();
        break;

      case 'User':
        // Don't auto-ban, but mark as flagged for admin review
        entity.isFlagged = true;
        entity.flagReason = `Auto-flagged: ${reportCount} reports`;
        entity.flaggedAt = new Date();
        break;
    }

    await entity.save();

    console.log(`✅ AUTO-FLAG APPLIED: ${entityType} ${entityId}`);

    return {
      previousState,
      newState: {
        status: entity.status,
        isHidden: entity.isHidden,
        isFlagged: entity.isFlagged
      }
    };
  }

  /**
   * Resolve a report
   * @param {Object} data - Resolution data
   * @returns {Promise<Object>} Updated report
   */
  static async resolveReport(data) {
    const {
      reportId,
      adminId,
      resolution,
      adminNotes
    } = data;

    // ========================================
    // 1. Get report
    // ========================================
    const report = await Report.findById(reportId)
      .populate('reportedEntityId');

    if (!report) {
      throw new Error('Report not found');
    }

    if (report.status === 'resolved') {
      throw new Error('Report already resolved');
    }

    // ========================================
    // 2. Apply resolution action
    // ========================================
    const entityType = report.reportedEntityType;
    const entityId = report.reportedEntityId;

    const previousState = await this._getEntityState(entityType, entityId);

    switch (resolution) {
      case 'content_removed':
        await this._removeContent(entityType, entityId);
        break;

      case 'user_warned':
        await this._warnUser(entityType, entityId, adminId, adminNotes);
        break;

      case 'user_banned':
        await this._banUser(entityType, entityId, adminId, adminNotes, report._id);
        break;

      case 'entity_deleted':
        await this._deleteEntity(entityType, entityId);
        break;

      case 'no_action':
        // Unflag entity if it was auto-flagged
        await this._unflagEntity(entityType, entityId);
        break;

      case 'false_report':
        // Consider penalizing reporter if pattern of false reports
        await this._handleFalseReport(report.reporter);
        break;
    }

    const newState = await this._getEntityState(entityType, entityId);

    // ========================================
    // 3. Mark report as resolved
    // ========================================
    await report.resolve(resolution, adminId, adminNotes);

    // ========================================
    // 4. Log admin action
    // ========================================
    await AuditLog.logAction({
      admin: adminId,
      action: 'resolve_report',
      targetEntityType: 'Report',
      targetEntityId: reportId,
      previousState,
      newState,
      reason: adminNotes,
      metadata: {
        resolution,
        reportedEntityType: entityType,
        reportedEntityId: entityId
      }
    });

    return report;
  }

  /**
   * Dismiss a report
   * @param {Object} data - Dismissal data
   * @returns {Promise<Object>} Updated report
   */
  static async dismissReport(data) {
    const { reportId, adminId, reason } = data;

    const report = await Report.findById(reportId);
    if (!report) {
      throw new Error('Report not found');
    }

    await report.dismiss(adminId, reason);

    // Log admin action
    await AuditLog.logAction({
      admin: adminId,
      action: 'dismiss_report',
      targetEntityType: 'Report',
      targetEntityId: reportId,
      reason,
      metadata: {
        reportedEntityType: report.reportedEntityType,
        reportedEntityId: report.reportedEntityId
      }
    });

    return report;
  }

  // ========================================
  // PRIVATE RESOLUTION ACTIONS
  // ========================================

  /**
   * Get current state of entity
   * @private
   */
  static async _getEntityState(entityType, entityId) {
    const models = { Business, Review, Post, User };
    const Model = models[entityType];
    const entity = await Model.findById(entityId);

    if (!entity) return null;

    return {
      status: entity.status,
      isHidden: entity.isHidden,
      isFlagged: entity.isFlagged,
      isDeleted: entity.isDeleted
    };
  }

  /**
   * Remove/hide content
   * @private
   */
  static async _removeContent(entityType, entityId) {
    const models = { Business, Review, Post, User };
    const Model = models[entityType];

    if (entityType === 'Business') {
      await Model.findByIdAndUpdate(entityId, {
        status: 'rejected',
        isFlagged: true,
        isHidden: true
      });
    } else {
      await Model.findByIdAndUpdate(entityId, {
        isHidden: true,
        isFlagged: true
      });
    }
  }

  /**
   * Warn user
   * @private
   */
  static async _warnUser(entityType, entityId, adminId, reason) {
    // Get user ID from entity
    const userId = await this._getUserIdFromEntity(entityType, entityId);
    if (!userId) return;

    // Update user warning count
    await User.findByIdAndUpdate(userId, {
      $inc: { warningCount: 1 },
      $push: {
        warnings: {
          reason,
          issuedBy: adminId,
          issuedAt: new Date()
        }
      }
    });
  }

  /**
   * Ban user
   * @private
   */
  static async _banUser(entityType, entityId, adminId, reason, reportId) {
    // Get user ID from entity
    const userId = await this._getUserIdFromEntity(entityType, entityId);
    if (!userId) return;

    // Determine ban duration based on violation history
    const user = await User.findById(userId);
    const previousBans = user.banHistory?.length || 0;

    let banType = 'temporary';
    let durationDays = 7; // Default: 7 days

    if (previousBans === 0) {
      durationDays = 7; // First offense: 7 days
    } else if (previousBans === 1) {
      durationDays = 30; // Second offense: 30 days
    } else {
      banType = 'permanent'; // Third offense: permanent
      durationDays = null;
    }

    // Create ban record
    await BannedUser.banUser({
      userId,
      banType,
      reason: 'multiple_violations',
      description: reason,
      durationDays,
      bannedBy: adminId,
      relatedReports: [reportId]
    });

    console.log(`🚫 USER BANNED: ${userId} (${banType}, ${durationDays} days)`);
  }

  /**
   * Delete entity permanently
   * @private
   */
  static async _deleteEntity(entityType, entityId) {
    const models = { Business, Review, Post, User };
    const Model = models[entityType];

    await Model.findByIdAndUpdate(entityId, {
      isDeleted: true,
      deletedAt: new Date()
    });
  }

  /**
   * Unflag entity
   * @private
   */
  static async _unflagEntity(entityType, entityId) {
    const models = { Business, Review, Post, User };
    const Model = models[entityType];

    const entity = await Model.findById(entityId);
    if (!entity) return;

    entity.isFlagged = false;
    entity.flagReason = '';
    entity.flaggedAt = null;

    // Restore previous status if it was auto-flagged
    if (entityType === 'Business' && entity.status === 'pending') {
      entity.status = 'approved';
    } else if ((entityType === 'Review' || entityType === 'Post') && entity.isHidden) {
      entity.isHidden = false;
    }

    await entity.save();
  }

  /**
   * Handle false report (track reporter abuse)
   * @private
   */
  static async _handleFalseReport(reporterId) {
    // Count false reports by this user
    const falseReportCount = await Report.countDocuments({
      reporter: reporterId,
      resolution: 'false_report'
    });

    // If more than 3 false reports, flag user
    if (falseReportCount >= 3) {
      await User.findByIdAndUpdate(reporterId, {
        isFlagged: true,
        flagReason: 'Multiple false reports submitted'
      });

      console.log(`⚠️ USER FLAGGED FOR FALSE REPORTS: ${reporterId}`);
    }
  }

  /**
   * Get user ID from entity
   * @private
   */
  static async _getUserIdFromEntity(entityType, entityId) {
    if (entityType === 'User') {
      return entityId;
    }

    const models = { Business, Review, Post };
    const Model = models[entityType];
    const entity = await Model.findById(entityId);

    if (!entity) return null;

    // Business has 'owner', Review has 'author', Post has 'author'
    return entity.owner || entity.author || entity.user;
  }
}

module.exports = ReportService;
