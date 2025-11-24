const mongoose = require('mongoose');

/**
 * Invite Model - User referral/invitation system
 * Tracks invitations sent via email with full funnel analytics
 *
 * Lifecycle: sent → clicked → signed_up
 *
 * Anti-spam features:
 * - Rate limiting enforced at controller level
 * - Duplicate invite tracking per email
 * - Click tracking to measure engagement
 */
const inviteSchema = new mongoose.Schema(
  {
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    senderName: {
      type: String,
      required: true
    },
    senderRole: {
      type: String,
      enum: ['visitor', 'owner'],
      required: true
    },
    recipientEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true
    },
    message: {
      type: String,
      maxlength: 500,
      default: ''
    },
    status: {
      type: String,
      enum: ['sent', 'clicked', 'signed_up'],
      default: 'sent',
      index: true
    },
    clickedAt: {
      type: Date,
      default: null
    },
    signedUpAt: {
      type: Date,
      default: null
    },
    signedUpUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    // Track clicks for engagement metrics
    clickCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for analytics
inviteSchema.index({ sentBy: 1, createdAt: -1 }); // User's invite history
inviteSchema.index({ recipientEmail: 1, sentBy: 1 }); // Prevent duplicate tracking
inviteSchema.index({ status: 1, createdAt: -1 }); // Status-based queries
inviteSchema.index({ sentBy: 1, status: 1 }); // User conversion funnel

// Static method: Get user's invite stats
inviteSchema.statics.getUserInviteStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { sentBy: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const result = {
    sent: 0,
    clicked: 0,
    signedUp: 0
  };

  stats.forEach(stat => {
    if (stat._id === 'sent') result.sent = stat.count;
    if (stat._id === 'clicked') result.clicked += stat.count;
    if (stat._id === 'signed_up') result.signedUp = stat.count;
  });

  // Include clicked in sent count
  result.sent += result.clicked + result.signedUp;
  result.clicked += result.signedUp;

  return result;
};

// Static method: Check if email was already invited by user recently (24 hours)
inviteSchema.statics.wasRecentlyInvited = async function(sentBy, recipientEmail) {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const recentInvite = await this.findOne({
    sentBy,
    recipientEmail: recipientEmail.toLowerCase().trim(),
    createdAt: { $gte: oneDayAgo }
  });

  return !!recentInvite;
};

// Static method: Get invite by email and sender for tracking
inviteSchema.statics.findByRecipient = async function(recipientEmail) {
  return this.findOne({
    recipientEmail: recipientEmail.toLowerCase().trim(),
    status: { $ne: 'signed_up' }
  }).sort({ createdAt: -1 });
};

// Instance method: Mark as clicked
inviteSchema.methods.markAsClicked = function() {
  if (this.status === 'sent') {
    this.status = 'clicked';
    this.clickedAt = new Date();
  }
  this.clickCount += 1;
  return this.save();
};

// Instance method: Mark as signed up
inviteSchema.methods.markAsSignedUp = function(userId) {
  this.status = 'signed_up';
  this.signedUpAt = new Date();
  this.signedUpUserId = userId;
  return this.save();
};

module.exports = mongoose.model('Invite', inviteSchema);
