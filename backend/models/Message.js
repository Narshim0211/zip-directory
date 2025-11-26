const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  threadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MessageThread',
    required: true,
    index: true,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  senderRole: {
    type: String,
    enum: ['visitor', 'owner'],
    required: true,
  },
  text: {
    type: String,
    required: true,
    maxlength: 500, // Keep messages concise
    trim: true,
  },
  photoUrl: {
    type: String,
    default: '',
  },

  // Read tracking (100% free - no paywall)
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: {
    type: Date,
    default: null,
  },

  // Safety
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

// Indexes for fast message retrieval
messageSchema.index({ threadId: 1, createdAt: 1 }); // Chronological order
messageSchema.index({ senderId: 1, createdAt: -1 }); // User's message history

module.exports = mongoose.model('Message', messageSchema);
