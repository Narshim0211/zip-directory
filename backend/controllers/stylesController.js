const stylesService = require('../services/stylesService');

exports.listMine = async (req, res) => {
  try {
    const list = await stylesService.listForUser(req.user._id);
    res.json(list);
  } catch (e) {
    res.status(e.status || 500).json({ message: e.message });
  }
};

exports.create = async (req, res) => {
  try {
    const created = await stylesService.createEntry(req.user._id, req.body || {});
    res.status(201).json(created);
  } catch (e) {
    res.status(e.status || 500).json({ message: e.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await stylesService.deleteEntry(req.user._id, req.params.id);
    res.status(204).end();
  } catch (e) {
    res.status(e.status || 500).json({ message: e.message });
  }
};
