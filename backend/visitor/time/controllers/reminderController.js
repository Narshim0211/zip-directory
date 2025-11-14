const VisitorTimeTask = require("../models/Task");
const moment = require("moment");

const getPendingReminders = async (req, res, next) => {
  try {
    const tasks = await VisitorTimeTask.find({
      reminderEnabled: true,
      reminderDelivered: false,
      taskDate: { $gte: new Date() },
    }).sort({ reminderTime: 1 });
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

const toggleReminder = async (req, res, next) => {
  try {
    const updates = {
      reminderEnabled: req.body.enabled,
      reminderTime: req.body.time,
      deliveryMethods: req.body.methods || [],
      reminderContactEmail: req.body.email,
      reminderContactPhone: req.body.phone,
    };
    const task = await VisitorTimeTask.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json(task);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPendingReminders,
  toggleReminder,
};
