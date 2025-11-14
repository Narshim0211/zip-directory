/**
 * Task Controller - HTTP Request Handlers
 *
 * Handles HTTP requests and responses
 * Delegates business logic to service layer
 */

const taskService = require('../../../domain/task/taskService');
const logger = require('../../../shared/utils/logger');

class TaskController {
  /**
   * Create a new task
   * POST /api/v1/visitor/time/tasks
   */
  async createTask(req, res, next) {
    try {
      const task = await taskService.createTask(req.user.id, req.body);

      res.status(201).json({
        success: true,
        data: task
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get daily tasks
   * GET /api/v1/visitor/time/tasks/daily?date=YYYY-MM-DD
   */
  async getDailyTasks(req, res, next) {
    try {
      const { date } = req.query;

      if (!date) {
        return res.status(400).json({
          success: false,
          error: 'Date query parameter is required (YYYY-MM-DD format)'
        });
      }

      // Validate date format
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid date format. Use YYYY-MM-DD'
        });
      }

      const tasks = await taskService.getDailyTasks(req.user.id, date);

      // Group tasks by session
      const groupedTasks = {
        morning: tasks.filter(t => t.session === 'morning'),
        afternoon: tasks.filter(t => t.session === 'afternoon'),
        evening: tasks.filter(t => t.session === 'evening')
      };

      res.json({
        success: true,
        data: {
          date,
          tasks: groupedTasks,
          total: tasks.length
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get weekly tasks
   * GET /api/v1/visitor/time/tasks/weekly?weekStart=YYYY-MM-DD
   */
  async getWeeklyTasks(req, res, next) {
    try {
      const { weekStart } = req.query;

      if (!weekStart) {
        return res.status(400).json({
          success: false,
          error: 'weekStart query parameter is required (YYYY-MM-DD format)'
        });
      }

      const tasks = await taskService.getWeeklyTasks(req.user.id, weekStart);

      // Group tasks by date
      const tasksByDate = tasks.reduce((acc, task) => {
        const dateKey = task.taskDate.toISOString().split('T')[0];
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(task);
        return acc;
      }, {});

      res.json({
        success: true,
        data: {
          weekStart,
          tasks: tasksByDate,
          total: tasks.length
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get monthly tasks
   * GET /api/v1/visitor/time/tasks/monthly?month=M&year=YYYY
   */
  async getMonthlyTasks(req, res, next) {
    try {
      const { month, year } = req.query;

      if (!month || !year) {
        return res.status(400).json({
          success: false,
          error: 'Both month (1-12) and year parameters are required'
        });
      }

      const monthNum = parseInt(month, 10);
      const yearNum = parseInt(year, 10);

      if (monthNum < 1 || monthNum > 12) {
        return res.status(400).json({
          success: false,
          error: 'Month must be between 1 and 12'
        });
      }

      const tasks = await taskService.getMonthlyTasks(req.user.id, monthNum, yearNum);

      // Group tasks by date
      const tasksByDate = tasks.reduce((acc, task) => {
        const dateKey = task.taskDate.toISOString().split('T')[0];
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(task);
        return acc;
      }, {});

      res.json({
        success: true,
        data: {
          month: monthNum,
          year: yearNum,
          tasks: tasksByDate,
          total: tasks.length
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get task by ID
   * GET /api/v1/visitor/time/tasks/:id
   */
  async getTaskById(req, res, next) {
    try {
      const task = await taskService.getTaskById(req.params.id, req.user.id);

      res.json({
        success: true,
        data: task
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update task
   * PUT /api/v1/visitor/time/tasks/:id
   */
  async updateTask(req, res, next) {
    try {
      const task = await taskService.updateTask(req.params.id, req.user.id, req.body);

      res.json({
        success: true,
        data: task
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete task
   * DELETE /api/v1/visitor/time/tasks/:id
   */
  async deleteTask(req, res, next) {
    try {
      await taskService.deleteTask(req.params.id, req.user.id);

      res.json({
        success: true,
        message: 'Task deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Toggle task completion
   * PATCH /api/v1/visitor/time/tasks/:id/toggle
   */
  async toggleCompletion(req, res, next) {
    try {
      const task = await taskService.toggleTaskCompletion(req.params.id, req.user.id);

      res.json({
        success: true,
        data: task
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TaskController();
