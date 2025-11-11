const Comment = require('../models/Comment');

async function listByContent(contentType, contentId) {
  return Comment.find({ contentType, contentId, isDeleted: false })
    .populate('userId', 'name avatarUrl role')
    .populate('reactions.user', 'name')
    .sort([
      ['isPinned', -1],
      ['createdAt', -1],
    ]);
}

async function listByUser(userId) {
  return Comment.find({ userId, isDeleted: false })
    .populate('contentId')
    .sort({ createdAt: -1 });
}

async function createComment(userId, payload) {
  const { contentType, contentId, text, parentId } = payload || {};
  if (!contentType || !contentId || !text || !text.trim()) {
    const error = new Error('contentType, contentId, and text are required');
    error.status = 400;
    throw error;
  }
  const comment = new Comment({
    contentType,
    contentId,
    text: text.trim(),
    parentId: parentId || null,
    userId,
  });
  return comment.save();
}

async function editComment(userId, commentId, text) {
  const comment = await Comment.findById(commentId);
  if (!comment) throw new Error('Comment not found');
  if (String(comment.userId) !== String(userId)) {
    const err = new Error('Not authorized');
    err.status = 403;
    throw err;
  }
  if (!text || !text.trim()) {
    const err = new Error('Updated text is required');
    err.status = 400;
    throw err;
  }
  comment.text = text.trim();
  return comment.save();
}

async function softDeleteComment(userId, commentId) {
  const comment = await Comment.findById(commentId);
  if (!comment) throw new Error('Comment not found');
  if (String(comment.userId) !== String(userId)) {
    const err = new Error('Not authorized');
    err.status = 403;
    throw err;
  }
  comment.isDeleted = true;
  return comment.save();
}

async function toggleLike(userId, commentId) {
  const comment = await Comment.findById(commentId);
  if (!comment) throw new Error('Comment not found');
  const strUser = String(userId);
  const index = comment.likes.findIndex((id) => String(id) === strUser);
  if (index === -1) comment.likes.push(userId);
  else comment.likes.splice(index, 1);
  await comment.save();
  return comment.likes.length;
}

async function addReaction(userId, commentId, emoji) {
  if (!emoji || !emoji.trim()) {
    const err = new Error('Emoji is required');
    err.status = 400;
    throw err;
  }
  const comment = await Comment.findById(commentId);
  if (!comment) throw new Error('Comment not found');
  comment.reactions.push({ emoji: emoji.trim(), user: userId });
  await comment.save();
  return comment.reactions;
}

async function togglePin(commentId) {
  const comment = await Comment.findById(commentId);
  if (!comment) throw new Error('Comment not found');
  comment.isPinned = !comment.isPinned;
  await comment.save();
  return comment.isPinned;
}

module.exports = {
  listByContent,
  listByUser,
  createComment,
  editComment,
  softDeleteComment,
  toggleLike,
  addReaction,
  togglePin,
};
