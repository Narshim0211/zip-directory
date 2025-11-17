const taskService = require("../services/taskService");

const getWeeklyTasks = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    const start = req.query.startDate ? new Date(req.query.startDate) : new Date();
    start.setDate(start.getDate() - start.getDay() + 1);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    const tasks = await taskService.listByWeek({
      userId: req.user._id,
      startDate: start,
      endDate: end,
    });
    res.json(tasks);
  } catch (error) {
    console.error("Weekly tasks error", error);
    next(error);
  }
};

const createWeeklyTask = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    const payload = {
      scope: "weekly",
      taskDate: new Date(req.body.taskDate),
      ...req.body,
    };
    const task = await taskService.createTask({ userId: req.user._id, payload });
    res.json(task);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWeeklyTasks,
  createWeeklyTask,
};
