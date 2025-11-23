const mongoose = require('mongoose');

const messageThreadSchema = new mongoose.Schema({
  // Core relationship
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true,
  },
  visitorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },

  // Thread status
  status: {
    type: String,
    enum: ['OPEN', 'LOCKED', 'CLOSED', 'BLOCKED'],
    default: 'OPEN',
    index: true,
  },

  // FOMO tracking
  hasOwnerReplied: {
    type: Boolean,
    default: false,
  },
  visitorHasSeenOwnerReply: {
    type: Boolean,
    default: false, // CRITICAL for FOMO email trigger
  },

  // Timestamps
  lastMessageAt: {
    type: Date,
    default: Date.now,
    index: true, // For sorting inbox
  },
  lockedAt: {
    type: Date,
    default: null,
  },
  closedAt: {
    type: Date,
    default: null,
  },

  // Safety
  blockedBy: {
    type: String,
    enum: ['owner', 'visitor', 'admin', null],
    default: null,
  },
  blockedAt: {
    type: Date,
    default: null,
  },

  // Moderation
  isFlagged: {
    type: Boolean,
    default: false,
  },
  flaggedBy: {
    type: String,
    enum: ['owner', 'visitor', null],
    default: null,
  },
  flagReason: {
    type: String,
    default: '',
  },
}, { timestamps: true });

// ⚡ CRITICAL INDEX: One thread per visitor-business pair
messageThreadSchema.index({ businessId: 1, visitorId: 1 }, { unique: true });

// Compound indexes for fast inbox queries
messageThreadSchema.index({ ownerId: 1, status: 1, lastMessageAt: -1 }); // Owner inbox
messageThreadSchema.index({ visitorId: 1, status: 1, lastMessageAt: -1 }); // Visitor inbox

module.exports = mongoose.model('MessageThread', messageThreadSchema);
