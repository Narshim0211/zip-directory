const express = require("express");
const dailyController = require("../controllers/dailyController");
const weeklyController = require("../controllers/weeklyController");
const monthlyController = require("../controllers/monthlyController");
const reminderController = require("../controllers/reminderController");
const protectVisitor = require("../../../middleWare/authVisitorMiddleware");

const { validateDailyTask, validateWeeklyTask, validateMonthlyTask } = require("../validators/taskValidator");
const { checkValidationResult } = require("../../../shared/validationResult");
const router = express.Router();

router.get("/daily", protectVisitor, dailyController.getDailyTasks);
router.post("/daily", protectVisitor, validateDailyTask, checkValidationResult, dailyController.createDailyTask);
router.put("/daily/:id", protectVisitor, dailyController.updateDailyTask);
router.delete("/daily/:id", protectVisitor, dailyController.deleteDailyTask);

router.get("/weekly", protectVisitor, weeklyController.getWeeklyTasks);
router.post("/weekly", protectVisitor, validateWeeklyTask, checkValidationResult, weeklyController.createWeeklyTask);

router.get("/monthly", protectVisitor, monthlyController.getMonthlyTasks);
router.post("/monthly", protectVisitor, validateMonthlyTask, checkValidationResult, monthlyController.createMonthlyTask);

router.get("/reminders", protectVisitor, reminderController.getPendingReminders);
router.put("/reminders/:id", protectVisitor, reminderController.toggleReminder);

module.exports = router;
