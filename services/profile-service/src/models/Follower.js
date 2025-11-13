const mongoose = require('mongoose');

/**
 * Followers Model
 * Per PRD Section 6: Database Structure
 * 
 * Tracks follower relationships between users
 */

const followerSchema = new mongoose.Schema(
  {
    // User being followed
    userId: {
      type: String,
      required: true,
      index: true,
    },
    
    // User who is following
    followerId: {
      type: String,
      required: true,
      index: true,
    },
    
    // Timestamp
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

// Compound index to prevent duplicate follows
followerSchema.index({ userId: 1, followerId: 1 }, { unique: true });

// Index for "who am I following" queries
followerSchema.index({ followerId: 1, createdAt: -1 });

// Index for "who follows me" queries
followerSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Follower', followerSchema);
