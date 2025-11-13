/**
 * Owner Time Manager Controller
 * Handles HTTP requests for owner time management
 */

const service = require('../services/ownerTimeService');
const { asyncHandler } = require('../../shared/utils/errorHandler');
const { successResponse, createdResponse } = require('../../shared/utils/responseWrapper');
const { OwnerDaily, OwnerWeekly, OwnerMonthly } = require('../../shared/models/timeModels');

/**
 * GET /api/owner/time/daily
 * Get daily tasks for authenticated owner
 */
const getDailyTasks = asyncHandler(async (req, res) => {
  const { date } = req.query;
  const targetDate = date ? new Date(date) : new Date();

  const tasks = await service.getDailyTasks(req.user.id, targetDate);

  successResponse(res, tasks, 'Daily tasks retrieved successfully');
});

/**
 * GET /api/owner/time/weekly
 * Get weekly tasks for authenticated owner
 */
const getWeeklyTasks = asyncHandler(async (req, res) => {
  const { startDate } = req.query;
  const start = startDate ? new Date(startDate) : new Date();

  const tasks = await service.getWeeklyTasks(req.user.id, start);

  successResponse(res, tasks, 'Weekly tasks retrieved successfully');
});

/**
 * GET /api/owner/time/monthly
 * Get monthly tasks for authenticated owner
 */
const getMonthlyTasks = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  const targetMonth = month ? parseInt(month) : new Date().getMonth() + 1;
  const targetYear = year ? parseInt(year) : new Date().getFullYear();

  const tasks = await service.getMonthlyTasks(req.user.id, targetMonth, targetYear);

  successResponse(res, tasks, 'Monthly tasks retrieved successfully');
});

/**
 * POST /api/owner/time/daily
 * Create a new daily task
 */
const createDailyTask = asyncHandler(async (req, res) => {
  const task = await service.createDailyTask(req.user.id, req.body);

  createdResponse(res, task, 'Task created successfully');
});

/**
 * POST /api/owner/time/weekly
 * Create a new weekly task
 */
const createWeeklyTask = asyncHandler(async (req, res) => {
  const task = new OwnerWeekly({
    userId: req.user.id,
    role: 'owner',
    ...req.body
  });

  await task.save();

  createdResponse(res, task, 'Weekly task created successfully');
});

/**
 * POST /api/owner/time/monthly
 * Create a new monthly task
 */
const createMonthlyTask = asyncHandler(async (req, res) => {
  const task = new OwnerMonthly({
    userId: req.user.id,
    role: 'owner',
    ...req.body
  });

  await task.save();

  createdResponse(res, task, 'Monthly task created successfully');
});

/**
 * PATCH /api/owner/time/daily/:id
 * Update a daily task
 */
const updateDailyTask = asyncHandler(async (req, res) => {
  const task = await service.updateTask(req.user.id, req.params.id, req.body, OwnerDaily);

  successResponse(res, task, 'Task updated successfully');
});

/**
 * PATCH /api/owner/time/weekly/:id
 * Update a weekly task
 */
const updateWeeklyTask = asyncHandler(async (req, res) => {
  const task = await service.updateTask(req.user.id, req.params.id, req.body, OwnerWeekly);

  successResponse(res, task, 'Weekly task updated successfully');
});

/**
 * PATCH /api/owner/time/monthly/:id
 * Update a monthly task
 */
const updateMonthlyTask = asyncHandler(async (req, res) => {
  const task = await service.updateTask(req.user.id, req.params.id, req.body, OwnerMonthly);

  successResponse(res, task, 'Monthly task updated successfully');
});

/**
 * DELETE /api/owner/time/daily/:id
 * Delete a daily task
 */
const deleteDailyTask = asyncHandler(async (req, res) => {
  await service.deleteTask(req.user.id, req.params.id, OwnerDaily);

  successResponse(res, null, 'Task deleted successfully');
});

/**
 * DELETE /api/owner/time/weekly/:id
 * Delete a weekly task
 */
const deleteWeeklyTask = asyncHandler(async (req, res) => {
  await service.deleteTask(req.user.id, req.params.id, OwnerWeekly);

  successResponse(res, null, 'Weekly task deleted successfully');
});

/**
 * DELETE /api/owner/time/monthly/:id
 * Delete a monthly task
 */
const deleteMonthlyTask = asyncHandler(async (req, res) => {
  await service.deleteTask(req.user.id, req.params.id, OwnerMonthly);

  successResponse(res, null, 'Monthly task deleted successfully');
});

/**
 * PATCH /api/owner/time/daily/:id/toggle
 * Toggle task completion status
 */
const toggleDailyTaskCompletion = asyncHandler(async (req, res) => {
  const task = await service.toggleTaskCompletion(req.user.id, req.params.id, OwnerDaily);

  successResponse(res, task, 'Task status updated');
});

/**
 * GET /api/owner/time/analytics
 * Get owner time management analytics
 */
const getAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const start = startDate ? new Date(startDate) : new Date(new Date().setDate(1)); // First day of month
  const end = endDate ? new Date(endDate) : new Date(); // Today

  const analytics = await service.getAnalytics(req.user.id, start, end);

  successResponse(res, analytics, 'Analytics retrieved successfully');
});

module.exports = {
  getDailyTasks,
  getWeeklyTasks,
  getMonthlyTasks,
  createDailyTask,
  createWeeklyTask,
  createMonthlyTask,
  updateDailyTask,
  updateWeeklyTask,
  updateMonthlyTask,
  deleteDailyTask,
  deleteWeeklyTask,
  deleteMonthlyTask,
  toggleDailyTaskCompletion,
  getAnalytics
};
