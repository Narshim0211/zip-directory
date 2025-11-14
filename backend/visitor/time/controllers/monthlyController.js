const taskService = require("../services/taskService");

const getMonthlyTasks = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    const today = new Date();
    const targetMonth = Number(req.query.month) || today.getMonth() + 1;
    const targetYear = Number(req.query.year) || today.getFullYear();
    const start = new Date(targetYear, targetMonth - 1, 1);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    const tasks = await taskService.listByWeek({
      userId: req.user._id,
      startDate: start,
      endDate: end,
    });
    res.json(tasks);
  } catch (error) {
    console.error("Monthly tasks error", error);
    next(error);
  }
};

const createMonthlyTask = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    const payload = {
      scope: "monthly",
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
  getMonthlyTasks,
  createMonthlyTask,
};
