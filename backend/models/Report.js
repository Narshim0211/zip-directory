// backend/models/Report.js

const mongoose = require('mongoose');

/**
 * 🚨 REPORT MODEL (v1.0)
 *
 * User-submitted reports for spam, abuse, inappropriate content
 *
 * Reportable Entities:
 * - Business profiles (spam, fake, inappropriate, wrong info)
 * - Reviews (spam, fake, offensive, competitor attack)
 * - Social posts (spam, harassment, inappropriate images)
 * - User profiles (impersonation, spam account, harassment)
 *
 * Auto-Flagging:
 * - Business: 3 reports → auto-unpublish
 * - Review: 2 reports → auto-hide
 * - Post: 2 reports → auto-hide
 * - User: 3 reports → auto-suspend
 */

const reportSchema = new mongoose.Schema({
  // ========================================
  // WHAT IS BEING REPORTED
  // ========================================

  reportedEntityType: {
    type: String,
    enum: ['Business', 'Review', 'Post', 'User'],
    required: true,
    index: true
  },

  reportedEntityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
    refPath: 'reportedEntityType' // Dynamic reference based on entityType
  },

  // ========================================
  // WHO REPORTED IT
  // ========================================

  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // ========================================
  // REPORT DETAILS
  // ========================================

  reason: {
    type: String,
    enum: [
      'spam',                // Spam/advertising content
      'fake',                // Fake reviews, fake business
      'inappropriate',       // Inappropriate content/images
      'harassment',          // Harassment/bullying
      'offensive',           // Offensive language/profanity
      'duplicate',           // Duplicate listing
      'wrong_info',          // Wrong/outdated information
      'closed_business',     // Business is permanently closed
      'impersonation',       // Impersonating someone else
      'competitor_attack',   // Competitor posting fake negative review
      'other'                // Other (must provide description)
    ],
    required: true,
    index: true
  },

  description: {
    type: String,
    maxlength: 1000,
    default: '',
    trim: true
  },

  evidence: [{
    type: {
      type: String,
      enum: ['screenshot', 'link', 'text'],
      default: 'text'
    },
    url: {
      type: String,
      default: ''
    },
    caption: {
      type: String,
      default: ''
    }
  }],

  // ========================================
  // STATUS TRACKING
  // ========================================

  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'dismissed'],
    default: 'open',
    index: true
  },

  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true
  },

  // ========================================
  // ADMIN REVIEW
  // ========================================

  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Admin user who is handling this report
    default: null
  },

  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Admin who resolved it
    default: null
  },

  reviewedAt: {
    type: Date,
    default: null
  },

  resolution: {
    type: String,
    enum: [
      'content_removed',     // Content was deleted/hidden
      'user_warned',         // User received warning
      'user_banned',         // User was banned
      'entity_deleted',      // Entity permanently deleted
      'no_action',           // Reviewed, no action needed
      'false_report'         // Report was false/malicious
    ],
    default: null
  },

  adminNotes: {
    type: String,
    maxlength: 2000,
    default: ''
  },

  // ========================================
  // AUTO-FLAGGING METADATA
  // ========================================

  autoFlagged: {
    type: Boolean,
    default: false
  },

  // Count of similar reports for same entity
  similarReportsCount: {
    type: Number,
    default: 1, // This is the first report
    min: 1
  },

  // Links to other reports for the same entity
  aggregatedWith: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report'
  }],

  // ========================================
  // TIMESTAMPS
  // ========================================

  submittedAt: {
    type: Date,
    default: Date.now,
    index: true
  },

  resolvedAt: {
    type: Date,
    default: null
  }
});

// ========================================
// INDEXES FOR PERFORMANCE
// ========================================

// Fast lookup by entity + status
reportSchema.index({ reportedEntityType: 1, reportedEntityId: 1, status: 1 });

// Admin queue sorting (status → priority → date)
reportSchema.index({ status: 1, priority: -1, submittedAt: -1 });

// User's report history
reportSchema.index({ reporter: 1, submittedAt: -1 });

// Auto-flag threshold detection
reportSchema.index({ reportedEntityId: 1, status: 1 });

// Prevent duplicate reports from same user for same entity (while open/in_progress)
reportSchema.index(
  { reporter: 1, reportedEntityId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ['open', 'in_progress'] }
    }
  }
);

// ========================================
// METHODS
// ========================================

/**
 * Check if this report triggered auto-flag threshold
 * @returns {Boolean} True if threshold reached
 */
reportSchema.methods.checkAutoFlagThreshold = async function() {
  const thresholds = {
    Business: 3,
    Review: 2,
    Post: 2,
    User: 3
  };

  const threshold = thresholds[this.reportedEntityType];

  const count = await mongoose.model('Report').countDocuments({
    reportedEntityType: this.reportedEntityType,
    reportedEntityId: this.reportedEntityId,
    status: { $in: ['open', 'in_progress'] }
  });

  return count >= threshold;
};

/**
 * Mark report as resolved
 * @param {String} resolution - Resolution type
 * @param {String} adminId - Admin user ID
 * @param {String} notes - Admin notes
 */
reportSchema.methods.resolve = async function(resolution, adminId, notes = '') {
  this.status = 'resolved';
  this.resolution = resolution;
  this.reviewedBy = adminId;
  this.reviewedAt = new Date();
  this.resolvedAt = new Date();
  this.adminNotes = notes;

  await this.save();
  return this;
};

/**
 * Mark report as dismissed
 * @param {String} adminId - Admin user ID
 * @param {String} reason - Dismissal reason
 */
reportSchema.methods.dismiss = async function(adminId, reason = '') {
  this.status = 'dismissed';
  this.resolution = 'false_report';
  this.reviewedBy = adminId;
  this.reviewedAt = new Date();
  this.resolvedAt = new Date();
  this.adminNotes = reason;

  await this.save();
  return this;
};

// ========================================
// STATICS
// ========================================

/**
 * Get admin queue with filters
 * @param {Object} filters - Query filters
 * @returns {Array} Reports
 */
reportSchema.statics.getAdminQueue = async function(filters = {}) {
  const {
    status = 'open',
    priority,
    entityType,
    page = 1,
    limit = 20
  } = filters;

  const query = {};

  if (status !== 'all') {
    query.status = status;
  }

  if (priority) {
    query.priority = priority;
  }

  if (entityType) {
    query.reportedEntityType = entityType;
  }

  const skip = (page - 1) * limit;

  const reports = await this.find(query)
    .populate('reporter', 'name email')
    .populate('reviewedBy', 'name email')
    .populate('assignedTo', 'name email')
    .sort({ priority: -1, submittedAt: -1 })
    .limit(limit)
    .skip(skip)
    .lean();

  const total = await this.countDocuments(query);

  return {
    reports,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      limit: parseInt(limit)
    }
  };
};

/**
 * Get report statistics
 * @returns {Object} Stats
 */
reportSchema.statics.getStats = async function() {
  const statusStats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const reasonStats = await this.aggregate([
    {
      $match: { status: { $in: ['open', 'in_progress'] } }
    },
    {
      $group: {
        _id: '$reason',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: 5
    }
  ]);

  // Get reports resolved today
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const resolvedToday = await this.countDocuments({
    status: 'resolved',
    resolvedAt: { $gte: startOfToday }
  });

  // Calculate average resolution time
  const recentResolved = await this.find({
    status: 'resolved',
    resolvedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // last 7 days
  }).select('submittedAt resolvedAt');

  let totalResolutionTime = 0;
  recentResolved.forEach(report => {
    if (report.resolvedAt && report.submittedAt) {
      totalResolutionTime += report.resolvedAt - report.submittedAt;
    }
  });

  const avgResolutionTimeMs = recentResolved.length > 0
    ? totalResolutionTime / recentResolved.length
    : 0;

  const avgResolutionHours = (avgResolutionTimeMs / (1000 * 60 * 60)).toFixed(1);

  // Format stats
  const formattedStats = {
    open: 0,
    in_progress: 0,
    resolved: 0,
    dismissed: 0
  };

  statusStats.forEach(stat => {
    if (stat._id) {
      formattedStats[stat._id] = stat.count;
    }
  });

  return {
    totalReports: Object.values(formattedStats).reduce((a, b) => a + b, 0),
    openReports: formattedStats.open,
    inProgressReports: formattedStats.in_progress,
    resolvedReports: formattedStats.resolved,
    dismissedReports: formattedStats.dismissed,
    resolvedToday,
    averageResolutionTime: `${avgResolutionHours} hours`,
    topReasons: reasonStats.map(r => ({ reason: r._id, count: r.count }))
  };
};

module.exports = mongoose.model('Report', reportSchema);
