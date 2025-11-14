const cron = require("node-cron");
const OwnerTimeTask = require("../models/Task");

const sendReminder = async (task) => {
  console.log(`Owner reminder for ${task.title} at ${task.reminderTime}`);
  task.reminderDelivered = true;
  task.reminderSentAt = new Date();
  await task.save();
};

const startOwnerReminderCron = () => {
  cron.schedule("*/5 * * * *", async () => {
    const now = new Date();
    const tasks = await OwnerTimeTask.find({
      reminderEnabled: true,
      reminderDelivered: false,
      taskDate: { $lte: now },
    });
    await Promise.all(tasks.map(sendReminder));
  });
};

module.exports = { startOwnerReminderCron };
