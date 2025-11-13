/**
 * Reminder Service
 * Handles SMS and Email reminders for both Visitor and Owner roles
 * Decoupled from main application - runs independently
 */

const { VisitorDaily, OwnerDaily } = require('../models/timeModels');

/**
 * Send reminder via SMS
 * @param {Object} task - Task object with reminder details
 * @param {String} phoneNumber - User's phone number
 */
const sendSMSReminder = async (task, phoneNumber) => {
  try {
    // TODO: Integrate with SMS provider (Twilio, AWS SNS, etc.)
    console.log(`[SMS Reminder] Sending to ${phoneNumber}: ${task.task}`);

    // Placeholder for actual SMS implementation
    // const twilio = require('twilio');
    // await twilioClient.messages.create({
    //   body: `Reminder: ${task.task} at ${task.reminder.time}`,
    //   to: phoneNumber,
    //   from: process.env.TWILIO_PHONE
    // });

    return {
      success: true,
      type: 'sms',
      taskId: task._id
    };
  } catch (error) {
    console.error(`[SMS Reminder Error] Task ${task._id}:`, error.message);
    return {
      success: false,
      type: 'sms',
      taskId: task._id,
      error: error.message
    };
  }
};

/**
 * Send reminder via Email
 * @param {Object} task - Task object with reminder details
 * @param {String} email - User's email address
 */
const sendEmailReminder = async (task, email) => {
  try {
    // TODO: Integrate with email provider (SendGrid, AWS SES, etc.)
    console.log(`[Email Reminder] Sending to ${email}: ${task.task}`);

    // Placeholder for actual email implementation
    // const sgMail = require('@sendgrid/mail');
    // await sgMail.send({
    //   to: email,
    //   from: process.env.SENDER_EMAIL,
    //   subject: 'Task Reminder',
    //   text: `Reminder: ${task.task} scheduled for ${task.reminder.time}`,
    //   html: `<strong>Reminder:</strong> ${task.task}<br/>Time: ${task.reminder.time}`
    // });

    return {
      success: true,
      type: 'email',
      taskId: task._id
    };
  } catch (error) {
    console.error(`[Email Reminder Error] Task ${task._id}:`, error.message);
    return {
      success: false,
      type: 'email',
      taskId: task._id,
      error: error.message
    };
  }
};

/**
 * Process reminder for a single task
 * @param {Object} task - Task with reminder
 * @param {Object} user - User object with contact details
 */
const sendReminder = async (task, user) => {
  const results = [];

  try {
    const reminderType = task.reminder.type;

    if (reminderType === 'sms' || reminderType === 'both') {
      if (user.phone) {
        const smsResult = await sendSMSReminder(task, user.phone);
        results.push(smsResult);
      }
    }

    if (reminderType === 'email' || reminderType === 'both') {
      if (user.email) {
        const emailResult = await sendEmailReminder(task, user.email);
        results.push(emailResult);
      }
    }

    // Mark reminder as sent
    task.reminder.sent = true;
    await task.save();

    return results;
  } catch (error) {
    console.warn(`[Reminder Service Error] Failed for task ${task._id}:`, error.message);
    return results;
  }
};

/**
 * Scan and send pending reminders
 * Run this as a cron job every minute or as needed
 */
const processPendingReminders = async () => {
  try {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    // Find tasks with reminders due now
    const query = {
      'reminder.enabled': true,
      'reminder.sent': false,
      'reminder.time': currentTime,
      completed: false,
      date: { $gte: now }
    };

    // Process visitor reminders
    const visitorTasks = await VisitorDaily.find(query).populate('userId');
    for (const task of visitorTasks) {
      if (task.userId) {
        await sendReminder(task, task.userId);
      }
    }

    // Process owner reminders
    const ownerTasks = await OwnerDaily.find(query).populate('userId');
    for (const task of ownerTasks) {
      if (task.userId) {
        await sendReminder(task, task.userId);
      }
    }

    console.log(`[Reminder Service] Processed ${visitorTasks.length + ownerTasks.length} reminders`);
  } catch (error) {
    console.error('[Reminder Service] Processing error:', error.message);
  }
};

/**
 * Initialize reminder cron job
 * Checks every minute for pending reminders
 */
const initializeReminderCron = () => {
  // Run every minute
  setInterval(processPendingReminders, 60 * 1000);
  console.log('[Reminder Service] Cron job initialized');
};

module.exports = {
  sendReminder,
  sendSMSReminder,
  sendEmailReminder,
  processPendingReminders,
  initializeReminderCron
};
