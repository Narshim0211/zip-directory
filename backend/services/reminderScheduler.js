const cron = require("node-cron");
const mongoose = require("mongoose");
const { sendReminder } = require("../shared/utils/sendReminder");

// Import task models
const VisitorTask = require("../visitor/time/models/Task");
const OwnerTask = require("../owner/time/models/Task");
const ReminderLog = require("../shared/models/ReminderLog");

let isSchedulerRunning = false;

/**
 * Checks for reminders that need to be sent and processes them
 */
async function processReminders() {
  const now = new Date();

  // Format current time as HH:MM (24-hour)
  const currentTime = now.toTimeString().slice(0, 5);

  // Get today's date (midnight)
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  console.log(`🔍 Checking reminders at ${currentTime}...`);

  try {
    // Query both visitor and owner tasks
    const visitorTasks = await VisitorTask.find({
      "reminder.time": currentTime,
      "reminder.sent": false,
      taskDate: { $gte: todayStart, $lt: todayEnd },
    });

    const ownerTasks = await OwnerTask.find({
      "reminder.time": currentTime,
      "reminder.sent": false,
      taskDate: { $gte: todayStart, $lt: todayEnd },
    });

    const allTasks = [...visitorTasks, ...ownerTasks];

    if (allTasks.length === 0) {
      console.log(`✓ No reminders to send at ${currentTime}`);
      return;
    }

    console.log(`📬 Found ${allTasks.length} reminder(s) to send`);

    // Process each reminder
    for (const task of allTasks) {
      try {
        // Update last attempt timestamp
        task.reminder.lastAttemptAt = new Date();

        // Send the reminder
        const result = await sendReminder(task);

        // Log the attempt to ReminderLog collection
        await ReminderLog.logAttempt(task, result);

        if (result.success) {
          // Mark as sent
          task.reminder.sent = true;
          task.reminder.sentAt = new Date();
          task.reminder.failureReason = null;

          console.log(
            `✅ Reminder sent successfully for task: "${task.title}" (ID: ${task._id})`
          );
        } else {
          // Mark failure reason
          const errors = [];
          if (result.results.email.error) errors.push(`Email: ${result.results.email.error}`);
          if (result.results.sms.error) errors.push(`SMS: ${result.results.sms.error}`);

          task.reminder.failureReason = errors.join("; ");

          console.error(
            `❌ Failed to send reminder for task: "${task.title}" (ID: ${task._id})`,
            task.reminder.failureReason
          );
        }

        await task.save();
      } catch (error) {
        console.error(`❌ Error processing reminder for task ${task._id}:`, error.message);

        // Save error to task
        task.reminder.failureReason = error.message;
        task.reminder.lastAttemptAt = new Date();
        await task.save();
      }
    }
  } catch (error) {
    console.error("❌ Error in processReminders:", error.message);
  }
}

/**
 * Starts the reminder scheduler cron job
 */
function startReminderScheduler() {
  if (isSchedulerRunning) {
    console.log("⚠️  Reminder scheduler is already running");
    return;
  }

  console.log("🚀 Starting reminder scheduler...");

  // Run every minute: * * * * *
  // Format: minute hour day month weekday
  cron.schedule("* * * * *", async () => {
    if (!mongoose.connection.readyState) {
      console.warn("⚠️  MongoDB not connected, skipping reminder check");
      return;
    }

    await processReminders();
  });

  isSchedulerRunning = true;
  console.log("✅ Reminder scheduler started successfully");
  console.log("⏰ Checking for reminders every minute...");
}

/**
 * Manually trigger reminder processing (for testing)
 */
async function triggerManualCheck() {
  console.log("🔧 Manual reminder check triggered");
  await processReminders();
}

module.exports = {
  startReminderScheduler,
  triggerManualCheck,
  processReminders,
};
