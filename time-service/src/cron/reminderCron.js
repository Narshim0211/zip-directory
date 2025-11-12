/**
 * Reminder Cron Job
 * Processes pending reminders for both Visitor and Owner users
 * Independent fault isolation: failure in one role doesn't affect the other
 */
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const VisitorReminder = require('../models/visitor/VisitorReminder');
const OwnerReminder = require('../models/owner/OwnerReminder');
const reminderService = require('../services/shared/reminderService');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '..', '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log file paths per role
const visitorLogPath = path.join(logsDir, 'reminder-visitor.log');
const ownerLogPath = path.join(logsDir, 'reminder-owner.log');

/**
 * Logger for visitor reminders
 */
const visitorLogger = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(visitorLogPath, logMessage, 'utf8');
  console.log(`[Visitor Cron] ${message}`);
};

/**
 * Logger for owner reminders
 */
const ownerLogger = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(ownerLogPath, logMessage, 'utf8');
  console.log(`[Owner Cron] ${message}`);
};

/**
 * Process Visitor Reminders
 * Runs every minute, independent of owner reminders
 * Separate try/catch ensures visitor failures don't crash owner processing
 */
const processVisitorReminders = async () => {
  try {
    visitorLogger('========== Starting visitor reminder processing ==========');

    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60000);

    try {
      // Find all pending visitor reminders due to be sent
      const pendingReminders = await VisitorReminder.find({
        isSent: false,
        isActive: true,
        status: 'pending',
        scheduledTime: {
          $gte: now,
          $lte: fiveMinutesFromNow,
        },
      }).populate('userId', 'email firstName lastName');

      visitorLogger(`Found ${pendingReminders.length} visitor reminders to process`);

      let successCount = 0;
      let failureCount = 0;

      // Process each reminder independently
      for (const reminder of pendingReminders) {
        try {
          if (!reminder.userId) {
            throw new Error('User not found for reminder');
          }

          visitorLogger(
            `Processing reminder ${reminder._id}: "${reminder.title}" for user ${reminder.userId._id}`
          );

          // Send reminder with independent error handling
          const sendResult = await reminderService.sendVisitorReminder(
            reminder,
            reminder.userId.email,
            `${reminder.userId.firstName} ${reminder.userId.lastName}`
          );

          if (sendResult.success) {
            // Update reminder as sent
            await VisitorReminder.findByIdAndUpdate(reminder._id, {
              isSent: true,
              status: 'sent',
              sendTime: new Date(),
            });

            successCount++;
            visitorLogger(
              `✅ Successfully sent reminder ${reminder._id} (${reminder.reminderType})`
            );
          } else {
            // Log failure but continue with next reminder
            failureCount++;
            visitorLogger(
              `⚠️  Failed to send reminder ${reminder._id}: ${sendResult.error}`
            );

            // Update reminder with error
            await VisitorReminder.findByIdAndUpdate(reminder._id, {
              status: 'failed',
              errorMessage: sendResult.error,
            });
          }
        } catch (reminderError) {
          failureCount++;
          visitorLogger(
            `❌ Error processing reminder ${reminder._id}: ${reminderError.message}`
          );

          // Try to update reminder status even if processing failed
          try {
            await VisitorReminder.findByIdAndUpdate(reminder._id, {
              status: 'failed',
              errorMessage: reminderError.message,
            });
          } catch (updateError) {
            visitorLogger(
              `❌ Failed to update reminder status: ${updateError.message}`
            );
          }
        }
      }

      visitorLogger(
        `========== Visitor reminder processing complete: ${successCount} success, ${failureCount} failures ==========`
      );
    } catch (processingError) {
      visitorLogger(
        `❌ Critical error in visitor reminder processing: ${processingError.message}`
      );
      visitorLogger(`Stack: ${processingError.stack}`);
    }
  } catch (outerError) {
    visitorLogger(
      `❌ Uncaught error in visitor reminder job: ${outerError.message}`
    );
  }
};

/**
 * Process Owner Reminders
 * Runs every minute, independent of visitor reminders
 * Separate try/catch ensures owner failures don't crash visitor processing
 */
const processOwnerReminders = async () => {
  try {
    ownerLogger('========== Starting owner reminder processing ==========');

    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60000);

    try {
      // Find all pending owner reminders due to be sent
      const pendingReminders = await OwnerReminder.find({
        isSent: false,
        isActive: true,
        status: 'pending',
        scheduledTime: {
          $gte: now,
          $lte: fiveMinutesFromNow,
        },
      }).populate('userId', 'email firstName lastName');

      ownerLogger(`Found ${pendingReminders.length} owner reminders to process`);

      let successCount = 0;
      let failureCount = 0;

      // Process each reminder independently
      for (const reminder of pendingReminders) {
        try {
          if (!reminder.userId) {
            throw new Error('User not found for reminder');
          }

          ownerLogger(
            `Processing reminder ${reminder._id}: "${reminder.title}" for owner ${reminder.userId._id}`
          );

          // Send reminder with independent error handling
          const sendResult = await reminderService.sendOwnerReminder(
            reminder,
            reminder.userId.email,
            `${reminder.userId.firstName} ${reminder.userId.lastName}`
          );

          if (sendResult.success) {
            // Update reminder as sent
            await OwnerReminder.findByIdAndUpdate(reminder._id, {
              isSent: true,
              status: 'sent',
              sendTime: new Date(),
            });

            successCount++;
            ownerLogger(
              `✅ Successfully sent reminder ${reminder._id} (${reminder.reminderType})`
            );

            if (sendResult.notifiedTeam > 0) {
              ownerLogger(
                `📢 Notified ${sendResult.notifiedTeam} team members`
              );
            }
          } else {
            // Log failure but continue with next reminder
            failureCount++;
            ownerLogger(
              `⚠️  Failed to send reminder ${reminder._id}: ${sendResult.error}`
            );

            // Update reminder with error
            await OwnerReminder.findByIdAndUpdate(reminder._id, {
              status: 'failed',
              errorMessage: sendResult.error,
            });
          }
        } catch (reminderError) {
          failureCount++;
          ownerLogger(
            `❌ Error processing reminder ${reminder._id}: ${reminderError.message}`
          );

          // Try to update reminder status even if processing failed
          try {
            await OwnerReminder.findByIdAndUpdate(reminder._id, {
              status: 'failed',
              errorMessage: reminderError.message,
            });
          } catch (updateError) {
            ownerLogger(
              `❌ Failed to update reminder status: ${updateError.message}`
            );
          }
        }
      }

      ownerLogger(
        `========== Owner reminder processing complete: ${successCount} success, ${failureCount} failures ==========`
      );
    } catch (processingError) {
      ownerLogger(
        `❌ Critical error in owner reminder processing: ${processingError.message}`
      );
      ownerLogger(`Stack: ${processingError.stack}`);
    }
  } catch (outerError) {
    ownerLogger(
      `❌ Uncaught error in owner reminder job: ${outerError.message}`
    );
  }
};

/**
 * Initialize cron jobs
 * Both jobs run in parallel, with independent error handling per role
 */
const initializeReminderCron = () => {
  if (process.env.ENABLE_VISITOR_REMINDERS !== 'false') {
    // Run visitor reminder job every minute
    cron.schedule('* * * * *', () => {
      processVisitorReminders().catch((error) => {
        visitorLogger(`Unhandled error in cron execution: ${error.message}`);
      });
    });

    visitorLogger('✅ Visitor reminder cron job scheduled (every minute)');
  }

  if (process.env.ENABLE_OWNER_REMINDERS !== 'false') {
    // Run owner reminder job every minute (offset by 30 seconds to avoid DB contention)
    cron.schedule('* * * * *', () => {
      setTimeout(() => {
        processOwnerReminders().catch((error) => {
          ownerLogger(`Unhandled error in cron execution: ${error.message}`);
        });
      }, 30000); // 30 second offset
    });

    ownerLogger('✅ Owner reminder cron job scheduled (every minute, 30s offset)');
  }

  console.log('🔔 Reminder cron jobs initialized with independent fault isolation');
};

module.exports = { initializeReminderCron };
