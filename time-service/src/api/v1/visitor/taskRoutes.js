/**
 * Visitor Task Routes
 *
 * API routes for visitor daily/weekly/monthly planner
 */

const express = require('express');
const router = express.Router();
const taskController = require('./taskController');
const { authenticate, requireRole } = require('../../../shared/middleware/auth');
const { validate, schemas } = require('../../../shared/middleware/validate');
const { writeLimiter } = require('../../../shared/middleware/rateLimit');

// All routes require authentication and visitor role
router.use(authenticate);
router.use(requireRole('visitor'));

// ==========================================
// TASK CRUD OPERATIONS
// ==========================================

/**
 * @route   POST /api/v1/visitor/time/tasks
 * @desc    Create a new task
 * @access  Visitor only
 */
router.post(
  '/',
  writeLimiter,
  validate(schemas.createTask),
  taskController.createTask
);

/**
 * @route   GET /api/v1/visitor/time/tasks/:id
 * @desc    Get task by ID
 * @access  Visitor only (own tasks)
 */
router.get('/:id', taskController.getTaskById);

/**
 * @route   PUT /api/v1/visitor/time/tasks/:id
 * @desc    Update task
 * @access  Visitor only (own tasks)
 */
router.put(
  '/:id',
  writeLimiter,
  validate(schemas.updateTask),
  taskController.updateTask
);

/**
 * @route   DELETE /api/v1/visitor/time/tasks/:id
 * @desc    Delete task
 * @access  Visitor only (own tasks)
 */
router.delete('/:id', writeLimiter, taskController.deleteTask);

/**
 * @route   PATCH /api/v1/visitor/time/tasks/:id/toggle
 * @desc    Toggle task completion status
 * @access  Visitor only (own tasks)
 */
router.patch('/:id/toggle', writeLimiter, taskController.toggleCompletion);

// ==========================================
// VIEW OPERATIONS (Daily/Weekly/Monthly)
// ==========================================

/**
 * @route   GET /api/v1/visitor/time/tasks/daily
 * @desc    Get daily tasks for a specific date
 * @query   date (YYYY-MM-DD format)
 * @access  Visitor only
 */
router.get('/views/daily', taskController.getDailyTasks);

/**
 * @route   GET /api/v1/visitor/time/tasks/weekly
 * @desc    Get weekly tasks
 * @query   weekStart (YYYY-MM-DD format - Monday)
 * @access  Visitor only
 */
router.get('/views/weekly', taskController.getWeeklyTasks);

/**
 * @route   GET /api/v1/visitor/time/tasks/monthly
 * @desc    Get monthly tasks
 * @query   month (1-12), year (YYYY)
 * @access  Visitor only
 */
router.get('/views/monthly', taskController.getMonthlyTasks);

module.exports = router;
