/**
 * Reminder Service
 * Handles reminder delivery (email, SMS, in-app, push, Slack)
 * With comprehensive error handling and logging per role
 */
const nodemailer = require('nodemailer');

class ReminderService {
  constructor() {
    this.initializeEmailService();
  }

  /**
   * Initialize email service
   */
  initializeEmailService() {
    if (process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true') {
      this.emailTransporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      console.log('[ReminderService] Email service initialized');
    }
  }

  /**
   * Send visitor reminder
   * @param {Object} reminder - Reminder object
   * @param {string} userEmail - User email address
   * @param {string} userName - User name
   * @returns {Promise<Object>} Send result
   */
  async sendVisitorReminder(reminder, userEmail, userName) {
    const startTime = Date.now();

    try {
      console.log(
        `[ReminderService:Visitor] Processing reminder ${reminder._id} for ${userEmail}`
      );

      if (!reminder.isActive) {
        throw new Error('Reminder is not active');
      }

      let result;

      switch (reminder.reminderType) {
        case 'email':
          result = await this.sendEmailReminder(reminder, userEmail, userName, 'visitor');
          break;
        case 'sms':
          result = await this.sendSmsReminder(reminder, userEmail, 'visitor');
          break;
        case 'in-app':
          result = await this.logInAppReminder(reminder, 'visitor');
          break;
        case 'push':
          result = await this.sendPushNotification(reminder, 'visitor');
          break;
        default:
          throw new Error(`Unknown reminder type: ${reminder.reminderType}`);
      }

      const duration = Date.now() - startTime;
      console.log(
        `[ReminderService:Visitor] ✅ Reminder ${reminder._id} sent successfully in ${duration}ms`
      );

      return {
        success: true,
        reminderId: reminder._id,
        type: reminder.reminderType,
        duration,
        result,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(
        `[ReminderService:Visitor] ❌ Failed to send reminder ${reminder._id}:`,
        error.message
      );

      return {
        success: false,
        reminderId: reminder._id,
        type: reminder.reminderType,
        duration,
        error: error.message,
      };
    }
  }

  /**
   * Send owner reminder with team notification support
   * @param {Object} reminder - Reminder object
   * @param {string} userEmail - User email address
   * @param {string} userName - User name
   * @returns {Promise<Object>} Send result
   */
  async sendOwnerReminder(reminder, userEmail, userName) {
    const startTime = Date.now();

    try {
      console.log(
        `[ReminderService:Owner] Processing reminder ${reminder._id} for ${userEmail}`
      );

      if (!reminder.isActive) {
        throw new Error('Reminder is not active');
      }

      let result;

      switch (reminder.reminderType) {
        case 'email':
          result = await this.sendEmailReminder(reminder, userEmail, userName, 'owner');
          break;
        case 'sms':
          result = await this.sendSmsReminder(reminder, userEmail, 'owner');
          break;
        case 'in-app':
          result = await this.logInAppReminder(reminder, 'owner');
          break;
        case 'push':
          result = await this.sendPushNotification(reminder, 'owner');
          break;
        case 'slack':
          result = await this.sendSlackNotification(reminder, 'owner');
          break;
        default:
          throw new Error(`Unknown reminder type: ${reminder.reminderType}`);
      }

      // Send to team members if notifyTeam is true
      if (reminder.notifyTeam && reminder.teamMembers?.length > 0) {
        console.log(
          `[ReminderService:Owner] Notifying ${reminder.teamMembers.length} team members`
        );
        // TODO: Implement team member notification
      }

      const duration = Date.now() - startTime;
      console.log(
        `[ReminderService:Owner] ✅ Reminder ${reminder._id} sent successfully in ${duration}ms`
      );

      return {
        success: true,
        reminderId: reminder._id,
        type: reminder.reminderType,
        duration,
        notifiedTeam: reminder.notifyTeam ? reminder.teamMembers.length : 0,
        result,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(
        `[ReminderService:Owner] ❌ Failed to send reminder ${reminder._id}:`,
        error.message
      );

      return {
        success: false,
        reminderId: reminder._id,
        type: reminder.reminderType,
        duration,
        error: error.message,
      };
    }
  }

  /**
   * Send email reminder
   * @param {Object} reminder - Reminder object
   * @param {string} email - Recipient email
   * @param {string} userName - User name
   * @param {string} role - User role (visitor/owner)
   * @returns {Promise<Object>} Email send result
   */
  async sendEmailReminder(reminder, email, userName, role) {
    if (!process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true') {
      throw new Error('Email notifications are disabled');
    }

    if (!this.emailTransporter) {
      throw new Error('Email service not configured');
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@salonhub.com',
      to: email,
      subject: `⏰ ${reminder.title}`,
      html: this.generateEmailTemplate(reminder, userName, role),
    };

    try {
      const info = await this.emailTransporter.sendMail(mailOptions);
      console.log(`[ReminderService] Email sent: ${info.response}`);
      return { messageId: info.messageId };
    } catch (error) {
      throw new Error(`Email send failed: ${error.message}`);
    }
  }

  /**
   * Send SMS reminder
   * @param {Object} reminder - Reminder object
   * @param {string} phone - Phone number
   * @param {string} role - User role
   * @returns {Promise<Object>} SMS send result
   */
  async sendSmsReminder(reminder, phone, role) {
    // TODO: Implement with Twilio or similar SMS service
    console.log(`[ReminderService] SMS reminder would be sent to ${phone}`);
    return { status: 'queued', service: 'twilio' };
  }

  /**
   * Log in-app reminder
   * @param {Object} reminder - Reminder object
   * @param {string} role - User role
   * @returns {Promise<Object>} Log result
   */
  async logInAppReminder(reminder, role) {
    // In-app reminders are typically stored in a notifications collection
    console.log(`[ReminderService:${role}] In-app reminder logged: ${reminder.title}`);
    return { logged: true, displayTime: new Date() };
  }

  /**
   * Send push notification
   * @param {Object} reminder - Reminder object
   * @param {string} role - User role
   * @returns {Promise<Object>} Push notification result
   */
  async sendPushNotification(reminder, role) {
    // TODO: Implement with Firebase Cloud Messaging or similar
    console.log(`[ReminderService:${role}] Push notification queued for ${reminder.title}`);
    return { queued: true, service: 'fcm' };
  }

  /**
   * Send Slack notification (owner only)
   * @param {Object} reminder - Reminder object
   * @param {string} role - User role
   * @returns {Promise<Object>} Slack notification result
   */
  async sendSlackNotification(reminder, role) {
    // TODO: Implement with Slack Webhook
    if (role !== 'owner') {
      throw new Error('Slack notifications only available for owners');
    }

    console.log(`[ReminderService:${role}] Slack notification queued for ${reminder.title}`);
    return { queued: true, service: 'slack' };
  }

  /**
   * Generate email template
   * @param {Object} reminder - Reminder object
   * @param {string} userName - User name
   * @param {string} role - User role
   * @returns {string} HTML email template
   */
  generateEmailTemplate(reminder, userName, role) {
    const roleLabel = role === 'owner' ? 'Business' : 'Personal';

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Your ${roleLabel} Reminder</h2>
        <p>Hi ${userName},</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #0066cc; margin: 0 0 10px 0;">${reminder.title}</h3>
          <p style="margin: 0;">${reminder.message || 'This is your scheduled reminder.'}</p>
        </div>
        <p>This is an automated reminder from SalonHub. If you'd like to update this reminder, please log in to your account.</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="font-size: 12px; color: #999;">
          © ${new Date().getFullYear()} SalonHub. All rights reserved.<br>
          <a href="https://salonhub.com/unsubscribe?email=${encodeURIComponent('user@example.com')}">Unsubscribe</a>
        </p>
      </div>
    `;
  }
}

module.exports = new ReminderService();
