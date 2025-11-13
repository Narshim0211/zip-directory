const mongoose = require('mongoose');

/**
 * OwnerPost Model
 * Represents posts created by salon owners
 * Completely isolated from visitor posts
 */
const OwnerPostSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000
  },
  mediaUrl: {
    type: String,
    default: ''
  },
  mediaType: {
    type: String,
    enum: ['', 'image', 'video'],
    default: ''
  },
  reactions: {
    likes: { type: Number, default: 0 },
    hearts: { type: Number, default: 0 },
    celebrate: { type: Number, default: 0 }
  },
  commentsCount: {
    type: Number,
    default: 0
  },
  sharesCount: {
    type: Number,
    default: 0
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  visibility: {
    type: String,
    enum: ['public', 'followers', 'private'],
    default: 'public'
  }
}, {
  timestamps: true
});

// Index for efficient feed queries
OwnerPostSchema.index({ ownerId: 1, createdAt: -1 });
OwnerPostSchema.index({ createdAt: -1 });

module.exports = mongoose.model('OwnerPost', OwnerPostSchema);
