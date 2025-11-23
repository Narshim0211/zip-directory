const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
    content: { type: String, required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // ========================================
    // 💬 COMMENTS SYSTEM ENHANCEMENTS
    // ========================================
    // Allows comments on both posts AND surveys (unified system)
    contentType: {
      type: String,
      enum: ['post', 'survey'],
      default: 'post', // Backward compatible default
    },
    // Enables permission checks (owner vs visitor)
    authorType: {
      type: String,
      enum: ['owner', 'visitor', 'admin'],
      required: false, // Optional for backward compatibility with existing comments
    },
    // Triggers gold orbit visual in frontend for premium owners
    isPremiumAuthor: {
      type: Boolean,
      default: false,
    },
    // Enables community moderation (auto-hide at threshold)
    reportCount: {
      type: Number,
      default: 0,
    },
    // Soft delete for reported comments (preserves data for appeals)
    isHidden: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// EXISTING INDEX (keep for backward compatibility)
commentSchema.index({ postId: 1, createdAt: -1 });

// NEW INDEXES (for performance with surveys and moderation)
commentSchema.index({ postId: 1, contentType: 1, createdAt: -1 });
commentSchema.index({ author: 1, isHidden: 1 });
commentSchema.index({ reportCount: -1 }); // For moderation dashboard

module.exports = mongoose.model('Comment', commentSchema);
