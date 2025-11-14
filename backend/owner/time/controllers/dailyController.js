const taskService = require("../services/taskService");

const getDailyTasks = async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: "Authentication required" });
    const targetDate = req.query.date ? new Date(req.query.date) : new Date();
    const tasks = await taskService.listTasks({
      userId: req.user._id,
      scope: "daily",
      date: targetDate,
    });
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

const createDailyTask = async (req, res, next) => {
  try {
    const payload = {
      scope: "daily",
      taskDate: new Date(),
      ...req.body,
    };
    const task = await taskService.createTask({ userId: req.user._id, payload });
    res.json(task);
  } catch (error) {
    next(error);
  }
};

const updateDailyTask = async (req, res, next) => {
  try {
    const task = await taskService.updateTask({
      taskId: req.params.id,
      updates: req.body,
    });
    res.json(task);
  } catch (error) {
    next(error);
  }
};

const deleteDailyTask = async (req, res, next) => {
  try {
    await taskService.deleteTask({ taskId: req.params.id });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDailyTasks,
  createDailyTask,
  updateDailyTask,
  deleteDailyTask,
};
