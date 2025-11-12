/**
 * Owner Time Management Service
 * Handles all CRUD operations for owner tasks, goals, reminders, and reflections
 * Includes team collaboration and business-specific features
 */
const OwnerTask = require('../../models/owner/OwnerTask');
const OwnerGoal = require('../../models/owner/OwnerGoal');
const OwnerReminder = require('../../models/owner/OwnerReminder');
const OwnerReflection = require('../../models/owner/OwnerReflection');

class OwnerTimeService {
  /**
   * TASK OPERATIONS
   */

  /**
   * Get all tasks for an owner with optional filters
   * @param {string} userId - User ID
   * @param {object} filters - Filters (scope, status, businessId, isTeamTask)
   * @returns {Promise<Array>} Array of tasks
   */
  async getTasks(userId, filters = {}) {
    try {
      const query = { userId };

      if (filters.scope) query.scope = filters.scope;
      if (filters.status) query.status = filters.status;
      if (filters.businessId) query.businessId = filters.businessId;
      if (filters.isTeamTask !== undefined) query.isTeamTask = filters.isTeamTask;
      if (filters.assignedTo) query.assignedTo = filters.assignedTo;

      const tasks = await OwnerTask.find(query)
        .populate('assignedTo', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .lean();

      console.log(`[OwnerTimeService] Retrieved ${tasks.length} tasks for owner ${userId}`);
      return tasks;
    } catch (error) {
      console.error('[OwnerTimeService] getTasks error:', error.message);
      throw new Error(`Failed to fetch tasks: ${error.message}`);
    }
  }

  /**
   * Get single task by ID
   * @param {string} taskId - Task ID
   * @param {string} userId - User ID (for authorization)
   * @returns {Promise<Object>} Task object
   */
  async getTask(taskId, userId) {
    try {
      const task = await OwnerTask.findOne({ _id: taskId, userId })
        .populate('assignedTo', 'firstName lastName email')
        .lean();

      if (!task) {
        throw new Error('Task not found or unauthorized');
      }

      return task;
    } catch (error) {
      console.error('[OwnerTimeService] getTask error:', error.message);
      throw error;
    }
  }

  /**
   * Create new task
   * @param {string} userId - User ID
   * @param {object} taskData - Task data
   * @returns {Promise<Object>} Created task
   */
  async createTask(userId, taskData) {
    try {
      const task = new OwnerTask({
        userId,
        ...taskData,
        status: taskData.status || 'todo',
      });

      await task.save();
      console.log(`[OwnerTimeService] Created task ${task._id} for owner ${userId}`);

      return task.toObject();
    } catch (error) {
      console.error('[OwnerTimeService] createTask error:', error.message);
      throw new Error(`Failed to create task: ${error.message}`);
    }
  }

  /**
   * Update task
   * @param {string} taskId - Task ID
   * @param {string} userId - User ID
   * @param {object} updates - Updates to apply
   * @returns {Promise<Object>} Updated task
   */
  async updateTask(taskId, userId, updates) {
    try {
      delete updates.userId;
      delete updates._id;

      const task = await OwnerTask.findOneAndUpdate(
        { _id: taskId, userId },
        updates,
        { new: true, runValidators: true }
      ).populate('assignedTo', 'firstName lastName email');

      if (!task) {
        throw new Error('Task not found or unauthorized');
      }

      console.log(`[OwnerTimeService] Updated task ${taskId}`);
      return task.toObject();
    } catch (error) {
      console.error('[OwnerTimeService] updateTask error:', error.message);
      throw error;
    }
  }

  /**
   * Update task status
   * @param {string} taskId - Task ID
   * @param {string} userId - User ID
   * @param {string} status - New status
   * @param {number} actualHours - Actual hours spent (optional)
   * @returns {Promise<Object>} Updated task
   */
  async updateTaskStatus(taskId, userId, status, actualHours = null) {
    try {
      const updates = { status };
      if (actualHours !== null) updates.actualHours = actualHours;

      const task = await OwnerTask.findOneAndUpdate(
        { _id: taskId, userId },
        updates,
        { new: true, runValidators: true }
      );

      if (!task) {
        throw new Error('Task not found or unauthorized');
      }

      console.log(`[OwnerTimeService] Updated task ${taskId} status to ${status}`);
      return task.toObject();
    } catch (error) {
      console.error('[OwnerTimeService] updateTaskStatus error:', error.message);
      throw error;
    }
  }

  /**
   * Delete task
   * @param {string} taskId - Task ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Deleted task
   */
  async deleteTask(taskId, userId) {
    try {
      const task = await OwnerTask.findOneAndDelete({ _id: taskId, userId });

      if (!task) {
        throw new Error('Task not found or unauthorized');
      }

      console.log(`[OwnerTimeService] Deleted task ${taskId}`);
      return task.toObject();
    } catch (error) {
      console.error('[OwnerTimeService] deleteTask error:', error.message);
      throw error;
    }
  }

  /**
   * GOAL OPERATIONS
   */

  /**
   * Get all goals for an owner
   * @param {string} userId - User ID
   * @param {object} filters - Filters (scope, status, businessId, teamGoal)
   * @returns {Promise<Array>} Array of goals
   */
  async getGoals(userId, filters = {}) {
    try {
      const query = { userId };

      if (filters.scope) query.scope = filters.scope;
      if (filters.status) query.status = filters.status;
      if (filters.businessId) query.businessId = filters.businessId;
      if (filters.teamGoal !== undefined) query.teamGoal = filters.teamGoal;

      const goals = await OwnerGoal.find(query)
        .populate('assignedTeamMembers', 'firstName lastName email')
        .sort({ startDate: -1 })
        .lean();

      console.log(`[OwnerTimeService] Retrieved ${goals.length} goals for owner ${userId}`);
      return goals;
    } catch (error) {
      console.error('[OwnerTimeService] getGoals error:', error.message);
      throw new Error(`Failed to fetch goals: ${error.message}`);
    }
  }

  /**
   * Get single goal by ID
   * @param {string} goalId - Goal ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Goal object
   */
  async getGoal(goalId, userId) {
    try {
      const goal = await OwnerGoal.findOne({ _id: goalId, userId })
        .populate('assignedTeamMembers', 'firstName lastName email')
        .lean();

      if (!goal) {
        throw new Error('Goal not found or unauthorized');
      }

      return goal;
    } catch (error) {
      console.error('[OwnerTimeService] getGoal error:', error.message);
      throw error;
    }
  }

  /**
   * Create new goal
   * @param {string} userId - User ID
   * @param {object} goalData - Goal data
   * @returns {Promise<Object>} Created goal
   */
  async createGoal(userId, goalData) {
    try {
      const goal = new OwnerGoal({
        userId,
        ...goalData,
      });

      await goal.save();
      console.log(`[OwnerTimeService] Created goal ${goal._id} for owner ${userId}`);

      return goal.toObject();
    } catch (error) {
      console.error('[OwnerTimeService] createGoal error:', error.message);
      throw new Error(`Failed to create goal: ${error.message}`);
    }
  }

  /**
   * Update goal
   * @param {string} goalId - Goal ID
   * @param {string} userId - User ID
   * @param {object} updates - Updates to apply
   * @returns {Promise<Object>} Updated goal
   */
  async updateGoal(goalId, userId, updates) {
    try {
      delete updates.userId;
      delete updates._id;

      const goal = await OwnerGoal.findOneAndUpdate(
        { _id: goalId, userId },
        updates,
        { new: true, runValidators: true }
      ).populate('assignedTeamMembers', 'firstName lastName email');

      if (!goal) {
        throw new Error('Goal not found or unauthorized');
      }

      console.log(`[OwnerTimeService] Updated goal ${goalId}`);
      return goal.toObject();
    } catch (error) {
      console.error('[OwnerTimeService] updateGoal error:', error.message);
      throw error;
    }
  }

  /**
   * REMINDER OPERATIONS
   */

  /**
   * Get all reminders for an owner
   * @param {string} userId - User ID
   * @param {object} filters - Filters (isActive, status, businessId)
   * @returns {Promise<Array>} Array of reminders
   */
  async getReminders(userId, filters = {}) {
    try {
      const query = { userId };

      if (filters.isActive !== undefined) query.isActive = filters.isActive;
      if (filters.status) query.status = filters.status;
      if (filters.businessId) query.businessId = filters.businessId;

      const reminders = await OwnerReminder.find(query)
        .sort({ scheduledTime: 1 })
        .lean();

      console.log(`[OwnerTimeService] Retrieved ${reminders.length} reminders for owner ${userId}`);
      return reminders;
    } catch (error) {
      console.error('[OwnerTimeService] getReminders error:', error.message);
      throw new Error(`Failed to fetch reminders: ${error.message}`);
    }
  }

  /**
   * Create new reminder
   * @param {string} userId - User ID
   * @param {object} reminderData - Reminder data
   * @returns {Promise<Object>} Created reminder
   */
  async createReminder(userId, reminderData) {
    try {
      const reminder = new OwnerReminder({
        userId,
        ...reminderData,
      });

      await reminder.save();
      console.log(`[OwnerTimeService] Created reminder ${reminder._id} for owner ${userId}`);

      return reminder.toObject();
    } catch (error) {
      console.error('[OwnerTimeService] createReminder error:', error.message);
      throw new Error(`Failed to create reminder: ${error.message}`);
    }
  }

  /**
   * REFLECTION OPERATIONS
   */

  /**
   * Get all reflections for an owner
   * @param {string} userId - User ID
   * @param {object} filters - Filters (startDate, endDate, businessId, isWeeklyReview, isMonthlyReview)
   * @returns {Promise<Array>} Array of reflections
   */
  async getReflections(userId, filters = {}) {
    try {
      const query = { userId };

      if (filters.startDate && filters.endDate) {
        query.date = {
          $gte: new Date(filters.startDate),
          $lte: new Date(filters.endDate),
        };
      }

      if (filters.businessId) query.businessId = filters.businessId;
      if (filters.isWeeklyReview !== undefined) query.isWeeklyReview = filters.isWeeklyReview;
      if (filters.isMonthlyReview !== undefined) query.isMonthlyReview = filters.isMonthlyReview;

      const reflections = await OwnerReflection.find(query)
        .sort({ date: -1 })
        .lean();

      console.log(`[OwnerTimeService] Retrieved ${reflections.length} reflections for owner ${userId}`);
      return reflections;
    } catch (error) {
      console.error('[OwnerTimeService] getReflections error:', error.message);
      throw new Error(`Failed to fetch reflections: ${error.message}`);
    }
  }

  /**
   * Get single reflection by ID
   * @param {string} reflectionId - Reflection ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Reflection object
   */
  async getReflection(reflectionId, userId) {
    try {
      const reflection = await OwnerReflection.findOne({ _id: reflectionId, userId }).lean();

      if (!reflection) {
        throw new Error('Reflection not found or unauthorized');
      }

      return reflection;
    } catch (error) {
      console.error('[OwnerTimeService] getReflection error:', error.message);
      throw error;
    }
  }

  /**
   * Create new reflection
   * @param {string} userId - User ID
   * @param {object} reflectionData - Reflection data
   * @returns {Promise<Object>} Created reflection
   */
  async createReflection(userId, reflectionData) {
    try {
      const reflection = new OwnerReflection({
        userId,
        date: reflectionData.date || new Date(),
        ...reflectionData,
      });

      await reflection.save();
      console.log(`[OwnerTimeService] Created reflection ${reflection._id} for owner ${userId}`);

      return reflection.toObject();
    } catch (error) {
      console.error('[OwnerTimeService] createReflection error:', error.message);
      throw new Error(`Failed to create reflection: ${error.message}`);
    }
  }
}

module.exports = new OwnerTimeService();
