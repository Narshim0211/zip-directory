const cron = require("node-cron");
const VisitorTimeTask = require("../models/Task");

const sendReminder = async (task) => {
  console.log(`Reminder: ${task.title} scheduled for ${task.reminderTime}`);
  task.reminderDelivered = true;
  task.reminderSentAt = new Date();
  await task.save();
};

const startVisitorReminderCron = () => {
  cron.schedule("*/5 * * * *", async () => {
    const now = new Date();
    const tasks = await VisitorTimeTask.find({
      reminderEnabled: true,
      reminderDelivered: false,
      taskDate: { $lte: now },
    });
    await Promise.all(tasks.map(sendReminder));
  });
};

module.exports = { startVisitorReminderCron };
