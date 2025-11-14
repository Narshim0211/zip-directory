const express = require("express");
const dailyController = require("../controllers/dailyController");
const weeklyController = require("../controllers/weeklyController");
const monthlyController = require("../controllers/monthlyController");
const reminderController = require("../controllers/reminderController");
const protectOwner = require("../../../middleWare/authOwnerMiddleware");

const { validateDailyTask, validateWeeklyTask, validateMonthlyTask } = require("../validators/taskValidator");
const { checkValidationResult } = require("../../../shared/validationResult");
const router = express.Router();

router.get("/daily", protectOwner, dailyController.getDailyTasks);
router.post("/daily", protectOwner, validateDailyTask, checkValidationResult, dailyController.createDailyTask);
router.put("/daily/:id", protectOwner, dailyController.updateDailyTask);
router.delete("/daily/:id", protectOwner, dailyController.deleteDailyTask);

router.get("/weekly", protectOwner, weeklyController.getWeeklyTasks);
router.post("/weekly", protectOwner, validateWeeklyTask, checkValidationResult, weeklyController.createWeeklyTask);

router.get("/monthly", protectOwner, monthlyController.getMonthlyTasks);
router.post("/monthly", protectOwner, validateMonthlyTask, checkValidationResult, monthlyController.createMonthlyTask);

router.get("/reminders", protectOwner, reminderController.getPendingReminders);
router.put("/reminders/:id", protectOwner, reminderController.toggleReminder);

module.exports = router;
