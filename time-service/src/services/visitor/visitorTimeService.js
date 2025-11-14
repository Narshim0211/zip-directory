/**
 * Visitor Time Service
 * Handles all business logic for visitor task management
 * Uses UTC midnight dates for consistent querying
 */

const VisitorTask = require('../../models/visitor/VisitorTask');
const {
  toUtcMidnight,
  getWeekRange,
  getMonthRange,
  getTodayUtc,
  formatDateOnly,
  isValidTimeOfDay,
} = require('../../utils/dateUtils');

class VisitorTimeService {
  /**
   * TASK OPERATIONS - NEW IMPLEMENTATION WITH UTC DATE HANDLING
   */

  /**
   * Get daily tasks for a specific date
   * @param {string} userId - User ID
   * @param {string} dateIso - Date in ISO format (e.g., "2025-01-15")
   * @returns {Promise<Array>} - Tasks for that day, grouped by session
   */
  async getDailyTasks(userId, dateIso) {
    try {
      // Convert to UTC midnight for consistent querying
      const taskDate = dateIso ? toUtcMidnight(dateIso) : getTodayUtc();

      const tasks = await VisitorTask.find({
        userId,
        taskDate,
      })
        .sort({ session: 1, createdAt: 1 }) // Sort by session (morning, afternoon, evening)
        .lean();

      console.log(`[VisitorTimeService] Retrieved ${tasks.length} tasks for ${formatDateOnly(taskDate)}`);
      return tasks;
    } catch (error) {
      console.error('[VisitorTimeService] getDailyTasks error:', error);
      throw error;
    }
  }

  /**
   * Get weekly tasks for a specific week
   * @param {string} userId - User ID
   * @param {string} weekStartIso - Monday of the week (e.g., "2025-01-13")
   * @returns {Promise<Array>} - Tasks for that week (Monday to Sunday)
   */
  async getWeeklyTasks(userId, weekStartIso) {
    try {
      const { start, end } = getWeekRange(weekStartIso);

      const tasks = await VisitorTask.find({
        userId,
        taskDate: { $gte: start, $lte: end },
      })
        .sort({ taskDate: 1, session: 1, createdAt: 1 })
        .lean();

      console.log(`[VisitorTimeService] Retrieved ${tasks.length} weekly tasks`);
      return tasks;
    } catch (error) {
      console.error('[VisitorTimeService] getWeeklyTasks error:', error);
      throw error;
    }
  }

  /**
   * Get monthly tasks
   * @param {string} userId - User ID
   * @param {number} month - Month number (1-12)
   * @param {number} year - Year (e.g., 2025)
   * @returns {Promise<Array>} - Tasks for that month
   */
  async getMonthlyTasks(userId, month, year) {
    try {
      const { start, end } = getMonthRange(month, year);

      const tasks = await VisitorTask.find({
        userId,
        taskDate: { $gte: start, $lte: end },
      })
        .sort({ taskDate: 1, session: 1, createdAt: 1 })
        .lean();

      console.log(`[VisitorTimeService] Retrieved ${tasks.length} monthly tasks`);
      return tasks;
    } catch (error) {
      console.error('[VisitorTimeService] getMonthlyTasks error:', error);
      throw error;
    }
  }

  /**
   * Get all tasks for a visitor with optional filters (LEGACY - for backwards compatibility)
   * @param {string} userId - User ID
   * @param {object} filters - Filters (scope, session, isCompleted)
   * @returns {Promise<Array>} Array of tasks
   */
  async getTasks(userId, filters = {}) {
    try {
      const query = { userId };

      if (filters.scopeTag) query.scopeTag = filters.scopeTag;
      if (filters.scope) query.scopeTag = filters.scope; // Legacy support
      if (filters.session) query.session = filters.session;
      if (filters.completed !== undefined) query.completed = filters.completed;
      if (filters.isCompleted !== undefined) query.completed = filters.isCompleted; // Legacy support

      const tasks = await VisitorTask.find(query)
        .sort({ taskDate: -1, createdAt: -1 })
        .lean();

      console.log(`[VisitorTimeService] Retrieved ${tasks.length} tasks for user ${userId}`);
      return tasks;
    } catch (error) {
      console.error('[VisitorTimeService] getTasks error:', error.message);
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
      const task = await VisitorTask.findOne({ _id: taskId, userId }).lean();

      if (!task) {
        throw new Error('Task not found or unauthorized');
      }

      return task;
    } catch (error) {
      console.error('[VisitorTimeService] getTask error:', error.message);
      throw error;
    }
  }

  /**
   * Create new task
   * @param {string} userId - User ID
   * @param {object} payload - Task data
   * @returns {Promise<Object>} Created task
   */
  async createTask(userId, payload) {
    try {
      // Validate and convert taskDate to UTC midnight
      const taskDate = payload.date || payload.taskDate;
      if (!taskDate) {
        throw new Error('taskDate or date is required');
      }

      const utcTaskDate = toUtcMidnight(taskDate);

      // Validate timeOfDay if provided
      if (payload.timeOfDay && !isValidTimeOfDay(payload.timeOfDay)) {
        throw new Error('timeOfDay must be in HH:mm format (e.g., "09:30")');
      }

      // Validate session
      const validSessions = ['morning', 'afternoon', 'evening'];
      if (!payload.session || !validSessions.includes(payload.session)) {
        throw new Error('session must be one of: morning, afternoon, evening');
      }

      // Build task object
      const taskData = {
        userId,
        title: payload.title,
        notes: payload.notes || payload.description || '',
        taskDate: utcTaskDate,
        session: payload.session,
        timeOfDay: payload.timeOfDay || null,
        durationMin: payload.durationMin || payload.duration || null,
        priority: payload.priority || 'medium',
        scopeTag: payload.scopeTag || payload.scope || 'daily',
        completed: payload.completed || false,
        category: payload.category || 'general',
        tags: payload.tags || [],
      };

      // Handle reminder if provided
      if (payload.reminder) {
        taskData.reminder = {
          enabled: payload.reminder.enabled || false,
          channels: payload.reminder.channels || [],
          sendAt: payload.reminder.sendAt || null,
          phone: payload.reminder.phone || null,
          email: payload.reminder.email || null,
        };
      }

      const task = await VisitorTask.create(taskData);
      console.log(`[VisitorTimeService] Created task ${task._id} for ${formatDateOnly(utcTaskDate)}`);

      return task.toObject();
    } catch (error) {
      console.error('[VisitorTimeService] createTask error:', error);
      throw error;
    }
  }

  /**
   * Update task
   * @param {string} taskId - Task ID
   * @param {string} userId - User ID (for authorization)
   * @param {object} updates - Fields to update
   * @returns {Promise<Object>} Updated task
   */
  async updateTask(taskId, userId, updates) {
    try {
      // Find task and verify ownership
      const task = await VisitorTask.findOne({ _id: taskId, userId });
      if (!task) {
        throw new Error('Task not found or unauthorized');
      }

      // Handle taskDate update if provided
      if (updates.date || updates.taskDate) {
        const newDate = updates.date || updates.taskDate;
        updates.taskDate = toUtcMidnight(newDate);
        delete updates.date; // Remove 'date' field if present
      }

      // Validate timeOfDay if being updated
      if (updates.timeOfDay && !isValidTimeOfDay(updates.timeOfDay)) {
        throw new Error('timeOfDay must be in HH:mm format (e.g., "09:30")');
      }

      // Handle completed → completedAt logic
      if (updates.completed === true && !task.completed) {
        updates.completedAt = new Date();
      } else if (updates.completed === false) {
        updates.completedAt = null;
      }

      // Handle status update (for compatibility with older frontend code)
      if (updates.status === 'completed') {
        updates.completed = true;
        updates.completedAt = new Date();
      } else if (updates.status === 'pending' || updates.status === 'todo') {
        updates.completed = false;
        updates.completedAt = null;
      }

      // Handle reminder updates
      if (updates.reminder) {
        updates.reminder = {
          ...task.reminder?.toObject?.() || {},
          ...updates.reminder,
        };
      }

      // Remove fields that shouldn't be updated
      delete updates.userId;
      delete updates._id;

      // Apply updates
      Object.assign(task, updates);
      await task.save();

      console.log(`[VisitorTimeService] Updated task ${taskId}`);
      return task.toObject();
    } catch (error) {
      console.error('[VisitorTimeService] updateTask error:', error);
      throw error;
    }
  }

  /**
   * Delete task
   * @param {string} taskId - Task ID
   * @param {string} userId - User ID (for authorization)
   * @returns {Promise<Object>} Deleted task
   */
  async deleteTask(taskId, userId) {
    try {
      const task = await VisitorTask.findOneAndDelete({ _id: taskId, userId });

      if (!task) {
        throw new Error('Task not found or unauthorized');
      }

      console.log(`[VisitorTimeService] Deleted task ${taskId}`);
      return task.toObject();
    } catch (error) {
      console.error('[VisitorTimeService] deleteTask error:', error);
      throw error;
    }
  }

  /**
   * Get task statistics for analytics
   * @param {string} userId - User ID
   * @param {string} dateIso - Date to get stats for (defaults to today)
   * @returns {Promise<Object>} - { total, completed, pending, completionRate }
   */
  async getTaskStats(userId, dateIso) {
    try {
      const taskDate = dateIso ? toUtcMidnight(dateIso) : getTodayUtc();

      const [total, completed] = await Promise.all([
        VisitorTask.countDocuments({ userId, taskDate }),
        VisitorTask.countDocuments({ userId, taskDate, completed: true }),
      ]);

      return {
        total,
        completed,
        pending: total - completed,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    } catch (error) {
      console.error('[VisitorTimeService] getTaskStats error:', error);
      throw error;
    }
  }

  /**
   * Get pending reminders that need to be sent
   * @returns {Promise<Array>} - Tasks with pending reminders
   */
  async getPendingReminders() {
    try {
      const now = new Date();

      const tasks = await VisitorTask.find({
        'reminder.enabled': true,
        'reminder.sendAt': { $lte: now },
        'reminder.sentAt': null,
      })
        .populate('userId', 'name email phone')
        .lean();

      return tasks;
    } catch (error) {
      console.error('[VisitorTimeService] getPendingReminders error:', error);
      throw error;
    }
  }

  /**
   * Mark reminder as sent
   * @param {string} taskId - Task ID
   * @returns {Promise<void>}
   */
  async markReminderSent(taskId) {
    try {
      await VisitorTask.updateOne(
        { _id: taskId },
        { $set: { 'reminder.sentAt': new Date() } }
      );
    } catch (error) {
      console.error('[VisitorTimeService] markReminderSent error:', error);
      throw error;
    }
  }

  /**
   * GOAL OPERATIONS
   */

  /**
   * Get all goals for a visitor
   * @param {string} userId - User ID
   * @param {object} filters - Filters (scope, status)
   * @returns {Promise<Array>} Array of goals
   */
  async getGoals(userId, filters = {}) {
    try {
      const query = { userId };

      if (filters.scope) query.scope = filters.scope;
      if (filters.status) query.status = filters.status;

      const goals = await VisitorGoal.find(query)
        .sort({ startDate: -1 })
        .lean();

      console.log(`[VisitorTimeService] Retrieved ${goals.length} goals for user ${userId}`);
      return goals;
    } catch (error) {
      console.error('[VisitorTimeService] getGoals error:', error.message);
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
      const goal = await VisitorGoal.findOne({ _id: goalId, userId }).lean();

      if (!goal) {
        throw new Error('Goal not found or unauthorized');
      }

      return goal;
    } catch (error) {
      console.error('[VisitorTimeService] getGoal error:', error.message);
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
      const goal = new VisitorGoal({
        userId,
        ...goalData,
      });

      await goal.save();
      console.log(`[VisitorTimeService] Created goal ${goal._id} for user ${userId}`);

      return goal.toObject();
    } catch (error) {
      console.error('[VisitorTimeService] createGoal error:', error.message);
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

      const goal = await VisitorGoal.findOneAndUpdate(
        { _id: goalId, userId },
        updates,
        { new: true, runValidators: true }
      );

      if (!goal) {
        throw new Error('Goal not found or unauthorized');
      }

      console.log(`[VisitorTimeService] Updated goal ${goalId}`);
      return goal.toObject();
    } catch (error) {
      console.error('[VisitorTimeService] updateGoal error:', error.message);
      throw error;
    }
  }

  /**
   * REMINDER OPERATIONS
   */

  /**
   * Get all reminders for a visitor
   * @param {string} userId - User ID
   * @param {object} filters - Filters (isActive, status)
   * @returns {Promise<Array>} Array of reminders
   */
  async getReminders(userId, filters = {}) {
    try {
      const query = { userId };

      if (filters.isActive !== undefined) query.isActive = filters.isActive;
      if (filters.status) query.status = filters.status;

      const reminders = await VisitorReminder.find(query)
        .sort({ scheduledTime: 1 })
        .lean();

      console.log(`[VisitorTimeService] Retrieved ${reminders.length} reminders for user ${userId}`);
      return reminders;
    } catch (error) {
      console.error('[VisitorTimeService] getReminders error:', error.message);
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
      const reminder = new VisitorReminder({
        userId,
        ...reminderData,
      });

      await reminder.save();
      console.log(`[VisitorTimeService] Created reminder ${reminder._id} for user ${userId}`);

      return reminder.toObject();
    } catch (error) {
      console.error('[VisitorTimeService] createReminder error:', error.message);
      throw new Error(`Failed to create reminder: ${error.message}`);
    }
  }

  /**
   * REFLECTION OPERATIONS
   */

  /**
   * Get all reflections for a visitor
   * @param {string} userId - User ID
   * @param {object} filters - Filters (startDate, endDate, mood)
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

      if (filters.mood) query.mood = filters.mood;

      const reflections = await VisitorReflection.find(query)
        .sort({ date: -1 })
        .lean();

      console.log(`[VisitorTimeService] Retrieved ${reflections.length} reflections for user ${userId}`);
      return reflections;
    } catch (error) {
      console.error('[VisitorTimeService] getReflections error:', error.message);
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
      const reflection = await VisitorReflection.findOne({ _id: reflectionId, userId }).lean();

      if (!reflection) {
        throw new Error('Reflection not found or unauthorized');
      }

      return reflection;
    } catch (error) {
      console.error('[VisitorTimeService] getReflection error:', error.message);
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
      const reflection = new VisitorReflection({
        userId,
        date: reflectionData.date || new Date(),
        ...reflectionData,
      });

      await reflection.save();
      console.log(`[VisitorTimeService] Created reflection ${reflection._id} for user ${userId}`);

      return reflection.toObject();
    } catch (error) {
      console.error('[VisitorTimeService] createReflection error:', error.message);
      throw new Error(`Failed to create reflection: ${error.message}`);
    }
  }

  /**
   * Get daily reflection for user (or create if not exists)
   * @param {string} userId - User ID
   * @param {Date} date - Date to fetch
   * @returns {Promise<Object>} Reflection object
   */
  async getDailyReflection(userId, date = new Date()) {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const reflection = await VisitorReflection.findOne({
        userId,
        date: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      }).lean();

      return reflection;
    } catch (error) {
      console.error('[VisitorTimeService] getDailyReflection error:', error.message);
      throw error;
    }
  }
}

module.exports = new VisitorTimeService();
