/**
 * Task Service - Business Logic Layer
 *
 * Implements business logic with:
 * - Repository pattern for data access
 * - Automatic cache invalidation
 * - UTC date handling
 * - Transaction support (future)
 */

const VisitorTask = require('./VisitorTask.model');
const cacheService = require('../../infrastructure/cache/cacheService');
const logger = require('../../shared/utils/logger');
const { ApiError } = require('../../shared/middleware/errorHandler');

class TaskService {
  /**
   * Create a new task
   * @param {ObjectId} userId
   * @param {Object} taskData
   * @returns {Promise<Object>}
   */
  async createTask(userId, taskData) {
    try {
      // Ensure taskDate is stored as UTC midnight
      const taskDate = new Date(taskData.taskDate);
      taskDate.setUTCHours(0, 0, 0, 0);

      const task = new VisitorTask({
        userId,
        ...taskData,
        taskDate
      });

      await task.save();

      // Invalidate cache for this user's task data
      await this.invalidateUserCache(userId, taskData.scopeTag);

      logger.info('Task created', {
        userId,
        taskId: task._id,
        scope: taskData.scopeTag
      });

      return task;
    } catch (error) {
      logger.error('Error creating task', { userId, error: error.message });
      throw error;
    }
  }

  /**
   * Get tasks for a specific date (daily view)
   * @param {ObjectId} userId
   * @param {string} dateString - YYYY-MM-DD format
   * @returns {Promise<Array>}
   */
  async getDailyTasks(userId, dateString) {
    try {
      // Try cache first
      const cached = await cacheService.getTaskData(userId, 'daily', dateString);
      if (cached) {
        logger.debug('Cache hit for daily tasks', { userId, date: dateString });
        return cached;
      }

      // Parse date and set to UTC midnight
      const taskDate = new Date(dateString);
      taskDate.setUTCHours(0, 0, 0, 0);

      // Query database
      const tasks = await VisitorTask.findByDay(userId, taskDate)
        .select('-__v')
        .lean();

      // Cache the results
      await cacheService.cacheTaskData(userId, 'daily', dateString, tasks);

      logger.debug('Database query for daily tasks', {
        userId,
        date: dateString,
        count: tasks.length
      });

      return tasks;
    } catch (error) {
      logger.error('Error getting daily tasks', {
        userId,
        date: dateString,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get tasks for a week (weekly view)
   * @param {ObjectId} userId
   * @param {string} weekStartDate - YYYY-MM-DD format (Monday)
   * @returns {Promise<Array>}
   */
  async getWeeklyTasks(userId, weekStartDate) {
    try {
      // Try cache first
      const cached = await cacheService.getTaskData(userId, 'weekly', weekStartDate);
      if (cached) {
        return cached;
      }

      // Calculate week range
      const startDate = new Date(weekStartDate);
      startDate.setUTCHours(0, 0, 0, 0);

      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      endDate.setUTCHours(23, 59, 59, 999);

      // Query database
      const tasks = await VisitorTask.findByDateRange(userId, startDate, endDate)
        .select('-__v')
        .lean();

      // Cache the results
      await cacheService.cacheTaskData(userId, 'weekly', weekStartDate, tasks);

      logger.debug('Database query for weekly tasks', {
        userId,
        weekStart: weekStartDate,
        count: tasks.length
      });

      return tasks;
    } catch (error) {
      logger.error('Error getting weekly tasks', {
        userId,
        weekStart: weekStartDate,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get tasks for a month (monthly view)
   * @param {ObjectId} userId
   * @param {number} month - 1-12
   * @param {number} year
   * @returns {Promise<Array>}
   */
  async getMonthlyTasks(userId, month, year) {
    try {
      const cacheKey = `${year}-${String(month).padStart(2, '0')}-01`;

      // Try cache first
      const cached = await cacheService.getTaskData(userId, 'monthly', cacheKey);
      if (cached) {
        return cached;
      }

      // Calculate month range
      const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
      const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

      // Query database
      const tasks = await VisitorTask.findByDateRange(userId, startDate, endDate)
        .select('-__v')
        .lean();

      // Cache the results
      await cacheService.cacheTaskData(userId, 'monthly', cacheKey, tasks);

      logger.debug('Database query for monthly tasks', {
        userId,
        month,
        year,
        count: tasks.length
      });

      return tasks;
    } catch (error) {
      logger.error('Error getting monthly tasks', {
        userId,
        month,
        year,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get task by ID
   * @param {ObjectId} taskId
   * @param {ObjectId} userId - For authorization check
   * @returns {Promise<Object>}
   */
  async getTaskById(taskId, userId) {
    try {
      const task = await VisitorTask.findOne({
        _id: taskId,
        userId // Ensure user owns this task
      }).select('-__v');

      if (!task) {
        throw new ApiError(404, 'Task not found');
      }

      return task;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Error getting task by ID', { taskId, userId, error: error.message });
      throw error;
    }
  }

  /**
   * Update task
   * @param {ObjectId} taskId
   * @param {ObjectId} userId
   * @param {Object} updates
   * @returns {Promise<Object>}
   */
  async updateTask(taskId, userId, updates) {
    try {
      const task = await this.getTaskById(taskId, userId);

      // Handle taskDate update (ensure UTC midnight)
      if (updates.taskDate) {
        const taskDate = new Date(updates.taskDate);
        taskDate.setUTCHours(0, 0, 0, 0);
        updates.taskDate = taskDate;
      }

      // Apply updates
      Object.assign(task, updates);
      await task.save();

      // Invalidate cache
      await this.invalidateUserCache(userId, task.scopeTag);

      logger.info('Task updated', { taskId, userId });
      return task;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Error updating task', { taskId, userId, error: error.message });
      throw error;
    }
  }

  /**
   * Delete task
   * @param {ObjectId} taskId
   * @param {ObjectId} userId
   * @returns {Promise<void>}
   */
  async deleteTask(taskId, userId) {
    try {
      const task = await this.getTaskById(taskId, userId);

      await VisitorTask.deleteOne({ _id: taskId });

      // Invalidate cache
      await this.invalidateUserCache(userId, task.scopeTag);

      logger.info('Task deleted', { taskId, userId });
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Error deleting task', { taskId, userId, error: error.message });
      throw error;
    }
  }

  /**
   * Toggle task completion
   * @param {ObjectId} taskId
   * @param {ObjectId} userId
   * @returns {Promise<Object>}
   */
  async toggleTaskCompletion(taskId, userId) {
    try {
      const task = await this.getTaskById(taskId, userId);

      if (task.completed) {
        await task.markIncomplete();
      } else {
        await task.markComplete();
      }

      // Invalidate cache
      await this.invalidateUserCache(userId, task.scopeTag);

      logger.info('Task completion toggled', {
        taskId,
        userId,
        completed: task.completed
      });

      return task;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Error toggling task completion', { taskId, userId, error: error.message });
      throw error;
    }
  }

  /**
   * Invalidate user's cache
   * @param {ObjectId} userId
   * @param {string} scope - Optional: specific scope to invalidate
   */
  async invalidateUserCache(userId, scope = null) {
    try {
      if (scope) {
        await cacheService.invalidateUserScope(userId, scope);
      } else {
        await cacheService.invalidateUserTasks(userId);
      }
    } catch (error) {
      // Don't fail the request if cache invalidation fails
      logger.warn('Cache invalidation failed', { userId, scope, error: error.message });
    }
  }
}

module.exports = new TaskService();
