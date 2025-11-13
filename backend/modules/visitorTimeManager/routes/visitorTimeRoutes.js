/**
 * Visitor Time Manager Routes
 * All routes are protected and require visitor authentication
 */

const express = require('express');
const router = express.Router();
const controller = require('../controllers/visitorTimeController');
const { verifyVisitorAuth } = require('../middleware/visitorTimeAuth');

// Apply visitor auth to all routes
router.use(verifyVisitorAuth);

// Daily Tasks Routes
// Align with frontend API shape: /tasks/daily
router.get('/tasks/daily', controller.getDailyTasks);
router.post('/tasks/daily', controller.createDailyTask);
router.patch('/tasks/daily/:id', controller.updateDailyTask);
router.delete('/tasks/daily/:id', controller.deleteDailyTask);
router.patch('/tasks/daily/:id/toggle', controller.toggleDailyTaskCompletion);

// Weekly Tasks Routes
router.get('/tasks/weekly', controller.getWeeklyTasks);
router.post('/tasks/weekly', controller.createWeeklyTask);
router.patch('/tasks/weekly/:id', controller.updateWeeklyTask);
router.delete('/tasks/weekly/:id', controller.deleteWeeklyTask);

// Monthly Tasks Routes
router.get('/monthly', controller.getMonthlyTasks);
router.post('/monthly', controller.createMonthlyTask);
router.patch('/monthly/:id', controller.updateMonthlyTask);
router.delete('/monthly/:id', controller.deleteMonthlyTask);

// Analytics
router.get('/analytics', controller.getAnalytics);

module.exports = router;
