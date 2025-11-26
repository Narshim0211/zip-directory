/**
 * Comments Service - V1 (Zero Paywall)
 * Handles all comment CRUD operations
 * Clean schema - no premium/paywall logic
 */

const Comment = require('../models/Comment');

async function listByContent(contentType, contentId) {
  // Find all parent comments (no parentId)
  const parentComments = await Comment.find({
    contentType,
    contentId,
    parentId: null,
  })
    .populate('userId', 'firstName lastName avatarUrl role')
    .sort({ createdAt: -1 });

  // For each parent, fetch its replies
  const commentsWithReplies = await Promise.all(
    parentComments.map(async (parent) => {
      const replies = await Comment.find({
        parentId: parent._id,
      })
        .populate('userId', 'firstName lastName avatarUrl role')
        .sort({ createdAt: 1 }); // Oldest reply first

      return {
        ...parent.toObject(),
        replies: replies,
      };
    })
  );

  return commentsWithReplies;
}

async function listByUser(userId) {
  return Comment.find({ userId })
    .sort({ createdAt: -1 });
}

async function createComment(userId, payload) {
  const { contentType, contentId, text, parentId } = payload || {};

  // V1: Simple validation
  if (!contentType || !contentId || !text || !text.trim()) {
    const error = new Error('contentType, contentId, and text are required');
    error.status = 400;
    throw error;
  }

  if (text.trim().length > 500) {
    const error = new Error('Comment text cannot exceed 500 characters');
    error.status = 400;
    throw error;
  }

  // Create comment with clean V1 schema
  const comment = new Comment({
    contentId,
    contentType,
    userId,
    text: text.trim(),
    parentId: parentId || null,
  });

  const saved = await comment.save();

  // Populate userId before returning
  await saved.populate('userId', 'firstName lastName avatarUrl role');

  return saved;
}

async function softDeleteComment(userId, commentId) {
  const comment = await Comment.findById(commentId);

  if (!comment) {
    const error = new Error('Comment not found');
    error.status = 404;
    throw error;
  }

  // V1: Only the author can delete their own comment
  if (String(comment.userId) !== String(userId)) {
    const error = new Error('Not authorized to delete this comment');
    error.status = 403;
    throw error;
  }

  // Hard delete in V1 (can change to soft delete later if needed)
  await Comment.findByIdAndDelete(commentId);

  return { success: true };
}

module.exports = {
  listByContent,
  listByUser,
  createComment,
  softDeleteComment,
};
