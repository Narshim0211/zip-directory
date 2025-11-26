const commentsService = require('../services/commentsService');
const { canComment } = require('../services/chatEntitlementsService');
const Comment = require('../models/Comment');

exports.getComments = async (req, res) => {
  const { contentType, contentId } = req.query;
  if (!contentType || !contentId) {
    return res.status(400).json({ message: 'contentType + contentId are required' });
  }
  try {
    const comments = await commentsService.listByContent(contentType, contentId);
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    // V1: NO PAYWALL - All logged-in users can comment
    // (canComment check REMOVED for V1 - will be re-added in V2)

    const comment = await commentsService.createComment(req.user._id, req.body || {});
    res.status(201).json(comment);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.reply = async (req, res) => {
  try {
    // When replying, the parentId is the comment being replied to
    const payload = { ...req.body, parentId: req.params.id };
    const comment = await commentsService.createComment(req.user._id, payload);
    res.status(201).json(comment);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.softDelete = async (req, res) => {
  try {
    await commentsService.softDeleteComment(req.user._id, req.params.id);
    res.status(204).end();
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};
