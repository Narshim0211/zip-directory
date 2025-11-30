const mongoose = require('mongoose');

const messageThreadSchema = new mongoose.Schema({
  // ========================================
  // DUAL-IDENTITY SUPPORT (V2)
  // ========================================
  threadType: {
    type: String,
    enum: ['business', 'owner', 'visitor'],
    required: true,
    index: true,
    // "business" = Message to Business Listing
    // "owner" = Message to Owner Personal Profile
    // "visitor" = Message to Visitor Personal Profile
  },

  // Core relationship
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    default: null, // null for "owner" threads, businessId for "business" threads
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

  // Universal messaging participants (for visitor-visitor, owner-owner conversations)
  targetUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null, // Used for 'visitor' threadType
    index: true,
  },

  // Thread status
  status: {
    type: String,
    enum: ['OPEN', 'LOCKED', 'CLOSED', 'BLOCKED'],
    default: 'OPEN',
    index: true,
  },

  // Unread tracking (100% free - no paywall)
  unreadByOwner: {
    type: Boolean,
    default: true, // New thread = unread by owner
  },
  unreadByVisitor: {
    type: Boolean,
    default: false, // Visitor created thread = read by visitor
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

// ⚡ CRITICAL INDEX: One thread per visitor-business pair (ONLY for business threads)
// Using partialFilterExpression to only apply uniqueness to business threads
messageThreadSchema.index(
  { businessId: 1, visitorId: 1, threadType: 1 },
  {
    unique: true,
    partialFilterExpression: { threadType: 'business', businessId: { $type: 'objectId' } }
  }
);
// Unique index for owner personal threads (one thread per visitor-owner pair)
messageThreadSchema.index(
  { ownerId: 1, visitorId: 1, threadType: 1 },
  {
    unique: true,
    partialFilterExpression: { threadType: 'owner' }
  }
);

// Compound indexes for fast inbox queries
messageThreadSchema.index({ ownerId: 1, threadType: 1, lastMessageAt: -1 }); // Owner inbox with tabs
messageThreadSchema.index({ visitorId: 1, status: 1, lastMessageAt: -1 }); // Visitor inbox

module.exports = mongoose.model('MessageThread', messageThreadSchema);
