const mongoose = require('mongoose');

/**
 * Comment Model - SalonHub V1 (Clean Version)
 *
 * Purpose: Enable commenting on surveys and posts
 * Features:
 * - 1-level threading (parent → reply)
 * - Works for both surveys and posts (polymorphic via contentType)
 * - Zero paywall logic in V1 (all logged-in users have equal rights)
 * - Simple, stable schema
 *
 * @see COMMENT_SYSTEM_V1.md for full documentation
 */

const commentSchema = new mongoose.Schema(
  {
    // ========================================
    // CONTENT REFERENCE (Polymorphic)
    // ========================================
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
      // Can reference Survey._id OR OwnerPost._id
    },

    contentType: {
      type: String,
      required: true,
      enum: ['survey', 'post'],
      // Determines which collection contentId points to
    },

    // ========================================
    // AUTHOR
    // ========================================
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // ========================================
    // CONTENT
    // ========================================
    text: {
      type: String,
      required: true,
      maxlength: 500,
      trim: true,
    },

    // ========================================
    // THREADING (1-level only)
    // ========================================
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
      index: true,
      // null = top-level comment
      // commentId = reply to that comment
    },
  },
  {
    timestamps: true, // Auto-adds createdAt, updatedAt
  }
);

// ========================================
// PERFORMANCE INDEXES
// ========================================
commentSchema.index({ contentId: 1, createdAt: -1 }); // Fast loading of comments for content
commentSchema.index({ parentId: 1 }); // Fast loading of replies
commentSchema.index({ userId: 1 }); // Fast user comment history queries
commentSchema.index({ contentId: 1, contentType: 1 }); // Fast filtering by content type

module.exports = mongoose.model('Comment', commentSchema);
