const articlesService = require('../services/articlesService');

exports.feed = async (req, res) => {
  try {
    const items = await articlesService.feedFor(req.user._id);
    res.json(items);
  } catch (e) {
    res.status(e.status || 500).json({ message: e.message });
  }
};

exports.create = async (req, res) => {
  try {
    const created = await articlesService.createArticle({ ...req.body, author: req.user._id });
    res.status(201).json(created);
  } catch (e) {
    res.status(e.status || 500).json({ message: e.message });
  }
};
