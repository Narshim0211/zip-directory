const VisitorTimeTask = require("../models/Task");

const listTasks = async ({ userId, scope, date }) => {
  const query = {
    userId,
    scope,
  };
  
  const tasks = await VisitorTimeTask.find(query).sort({ createdAt: -1 });
  return tasks;
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
