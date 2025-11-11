const commentsService = require('../services/commentsService');

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
    const comment = await commentsService.createComment(req.user._id, req.body || {});
    res.status(201).json(comment);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.reply = async (req, res) => {
  try {
    const payload = { ...req.body, parentId: req.params.id };
    const comment = await commentsService.createComment(req.user._id, payload);
    res.status(201).json(comment);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.edit = async (req, res) => {
  try {
    const updated = await commentsService.editComment(req.user._id, req.params.id, req.body.text);
    res.json(updated);
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

exports.toggleLike = async (req, res) => {
  try {
    const count = await commentsService.toggleLike(req.user._id, req.params.id);
    res.json({ likes: count });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.react = async (req, res) => {
  try {
    const reactions = await commentsService.addReaction(req.user._id, req.params.id, req.body.emoji);
    res.json({ reactions });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.pin = async (req, res) => {
  try {
    const pinned = await commentsService.togglePin(req.params.id);
    res.json({ pinned });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.userComments = async (req, res) => {
  try {
    const list = await commentsService.listByUser(req.user._id);
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
