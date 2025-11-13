/**
 * Owner Time Manager Service
 * Business logic for owner time management
 * Completely isolated from visitor service
 */

const { OwnerDaily, OwnerWeekly, OwnerMonthly } = require('../../shared/models/timeModels');
const { NotFoundError, ValidationError } = require('../../shared/utils/errorHandler');

/**
 * Get daily tasks for an owner
 * @param {String} userId - Owner user ID
 * @param {Date} date - Target date (optional, defaults to today)
 */
const getDailyTasks = async (userId, date = new Date()) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const tasks = await OwnerDaily.find({
    userId,
    date: { $gte: startOfDay, $lte: endOfDay }
  }).sort({ session: 1, createdAt: 1 });

  return tasks;
};

/**
 * Get weekly tasks for an owner
 * @param {String} userId - Owner user ID
 * @param {Date} startDate - Week start date
 */
const getWeeklyTasks = async (userId, startDate = new Date()) => {
  const weekStart = new Date(startDate);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const tasks = await OwnerWeekly.find({
    userId,
    date: { $gte: weekStart, $lt: weekEnd }
  }).sort({ date: 1 });

  return tasks;
};

/**
 * Get monthly tasks for an owner
 * @param {String} userId - Owner user ID
 * @param {Number} month - Month (1-12)
 * @param {Number} year - Year
 */
const getMonthlyTasks = async (userId, month, year) => {
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 1);

  const tasks = await OwnerMonthly.find({
    userId,
    date: { $gte: monthStart, $lt: monthEnd }
  }).sort({ date: 1 });

  return tasks;
};

/**
 * Create a new daily task
 * @param {String} userId - Owner user ID
 * @param {Object} taskData - Task details
 */
const createDailyTask = async (userId, taskData) => {
  // Validate required fields
  if (!taskData.task) {
    throw new ValidationError('Task description is required');
  }

  if (!taskData.date) {
    throw new ValidationError('Task date is required');
  }

  const task = new OwnerDaily({
    userId,
    role: 'owner',
    ...taskData
  });

  await task.save();
  return task;
};

/**
 * Update a task
 * @param {String} userId - Owner user ID
 * @param {String} taskId - Task ID
 * @param {Object} updates - Fields to update
 */
const updateTask = async (userId, taskId, updates, Model = OwnerDaily) => {
  const task = await Model.findOne({ _id: taskId, userId });

  if (!task) {
    throw new NotFoundError('Task not found or access denied');
  }

  // Update allowed fields
  const allowedUpdates = ['task', 'description', 'session', 'completed', 'priority', 'reminder', 'metadata'];
  Object.keys(updates).forEach(key => {
    if (allowedUpdates.includes(key)) {
      task[key] = updates[key];
    }
  });

  await task.save();
  return task;
};

/**
 * Delete a task
 * @param {String} userId - Owner user ID
 * @param {String} taskId - Task ID
 */
const deleteTask = async (userId, taskId, Model = OwnerDaily) => {
  const task = await Model.findOneAndDelete({ _id: taskId, userId });

  if (!task) {
    throw new NotFoundError('Task not found or access denied');
  }

  return task;
};

/**
 * Toggle task completion
 * @param {String} userId - Owner user ID
 * @param {String} taskId - Task ID
 */
const toggleTaskCompletion = async (userId, taskId, Model = OwnerDaily) => {
  const task = await Model.findOne({ _id: taskId, userId });

  if (!task) {
    throw new NotFoundError('Task not found or access denied');
  }

  task.completed = !task.completed;
  await task.save();

  return task;
};

/**
 * Get owner analytics
 * @param {String} userId - Owner user ID
 * @param {Date} startDate - Start date for analytics
 * @param {Date} endDate - End date for analytics
 */
const getAnalytics = async (userId, startDate, endDate) => {
  const tasks = await OwnerDaily.find({
    userId,
    date: { $gte: startDate, $lte: endDate }
  });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(2) : 0;

  // Count by priority
  const priorityCounts = {
    high: tasks.filter(t => t.priority === 'high').length,
    medium: tasks.filter(t => t.priority === 'medium').length,
    low: tasks.filter(t => t.priority === 'low').length
  };

  // Count by session
  const sessionCounts = {
    morning: tasks.filter(t => t.session === 'morning').length,
    afternoon: tasks.filter(t => t.session === 'afternoon').length,
    evening: tasks.filter(t => t.session === 'evening').length,
    night: tasks.filter(t => t.session === 'night').length
  };

  return {
    totalTasks,
    completedTasks,
    pendingTasks,
    completionRate: parseFloat(completionRate),
    priorityCounts,
    sessionCounts,
    period: {
      start: startDate,
      end: endDate
    }
  };
};

module.exports = {
  getDailyTasks,
  getWeeklyTasks,
  getMonthlyTasks,
  createDailyTask,
  updateTask,
  deleteTask,
  toggleTaskCompletion,
  getAnalytics
};
