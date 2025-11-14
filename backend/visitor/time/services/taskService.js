const VisitorTimeTask = require("../models/Task");

const listTasks = async ({ userId, scope, date }) => {
  const query = {
    userId,
    scope,
    taskDate: date,
  };
  return VisitorTimeTask.find(query).sort({ createdAt: 1 });
};

const createTask = async ({ userId, payload }) => {
  return VisitorTimeTask.create({
    userId,
    ...payload,
  });
};

const updateTask = async ({ taskId, updates }) => {
  return VisitorTimeTask.findByIdAndUpdate(taskId, updates, { new: true });
};

const deleteTask = async ({ taskId }) => {
  return VisitorTimeTask.findByIdAndDelete(taskId);
};

const listByWeek = async ({ userId, startDate, endDate }) => {
  return VisitorTimeTask.find({
    userId,
    scope: "weekly",
    taskDate: { $gte: startDate, $lte: endDate },
  }).sort({ taskDate: 1 });
};

module.exports = {
  listTasks,
  createTask,
  updateTask,
  deleteTask,
  listByWeek,
};
