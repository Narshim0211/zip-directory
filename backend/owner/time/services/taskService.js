const OwnerTimeTask = require("../models/Task");

const listTasks = async ({ userId, scope, date }) => {
  const query = {
    userId,
    scope,
  };
  
  const tasks = await OwnerTimeTask.find(query).sort({ createdAt: -1 });
  return tasks;
};

const createTask = async ({ userId, payload }) => {
  return OwnerTimeTask.create({
    userId,
    ...payload,
  });
};

const updateTask = async ({ taskId, updates }) => {
  return OwnerTimeTask.findByIdAndUpdate(taskId, updates, { new: true });
};

const deleteTask = async ({ taskId }) => {
  return OwnerTimeTask.findByIdAndDelete(taskId);
};

const listByWeek = async ({ userId, startDate, endDate }) => {
  return OwnerTimeTask.find({
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
