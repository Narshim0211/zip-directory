const { body } = require("express-validator");

const validateDailyTask = [
  body("title").notEmpty().withMessage("Title is required"),
  body("duration").optional().isNumeric(),
];

const validateWeeklyTask = [
  body("title").notEmpty().withMessage("Title is required"),
  body("taskDate").notEmpty().isISO8601(),
];

const validateMonthlyTask = validateWeeklyTask;

module.exports = {
  validateDailyTask,
  validateWeeklyTask,
  validateMonthlyTask,
};
