const goalsService = require("../services/goalsService");

exports.listMine = async (req, res) => {
  try {
    const items = await goalsService.listMyGoals(req.user._id);
    res.json(items);
  } catch (e) {
    res.status(e.status || 500).json({ message: e.message });
  }
};

exports.create = async (req, res) => {
  try {
    const created = await goalsService.createGoal(req.user._id, req.body || {});
    res.status(201).json(created);
  } catch (e) {
    res.status(e.status || 500).json({ message: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    const updated = await goalsService.updateGoal(req.user._id, req.params.id, req.body || {});
    res.json(updated);
  } catch (e) {
    res.status(e.status || 500).json({ message: e.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await goalsService.deleteGoal(req.user._id, req.params.id);
    res.status(204).end();
  } catch (e) {
    res.status(e.status || 500).json({ message: e.message });
  }
};

