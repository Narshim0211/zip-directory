const sgMail = require("@sendgrid/mail");
const twilio = require("twilio");

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Initialize Twilio
let twilioClient = null;
if (process.env.TWILIO_SID && process.env.TWILIO_TOKEN) {
  twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
}

/**
 * Sends reminder via email and/or SMS
 * @param {Object} task - The task object with reminder details
 * @returns {Promise<Object>} Result with success status and details
 */
async function sendReminder(task) {
  const results = {
    email: { sent: false, error: null },
    sms: { sent: false, error: null },
  };

  // Check if reminder exists
  if (!task.reminder) {
    return { success: false, error: "No reminder configured" };
  }

  const { email, phone } = task.reminder;

  // Send Email
  if (email && process.env.SENDGRID_API_KEY) {
    try {
      const msg = {
        to: email,
        from: process.env.SENDER_EMAIL || "noreply@salonhub.com",
        subject: `⏰ Reminder: ${task.title}`,
        text: `Hi there!\n\nThis is your reminder for:\n\n📌 ${task.title}\n⏰ Scheduled for: ${task.taskDate.toLocaleDateString()} at ${task.reminder.time}\n\n${
          task.description ? `Details: ${task.description}\n\n` : ""
        }Stay organized!\n\n— SalonHub Time Manager`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7c3aed;">⏰ Reminder</h2>
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #1f2937;">${task.title}</h3>
              <p style="color: #6b7280; margin: 5px 0;">
                <strong>Date:</strong> ${task.taskDate.toLocaleDateString()}
              </p>
              <p style="color: #6b7280; margin: 5px 0;">
                <strong>Time:</strong> ${task.reminder.time}
              </p>
              ${
                task.description
                  ? `<p style="color: #6b7280; margin: 15px 0 5px 0;">
                <strong>Details:</strong><br/>${task.description}
              </p>`
                  : ""
              }
            </div>
            <p style="color: #9ca3af; font-size: 12px;">
              This is an automated reminder from SalonHub Time Manager.
            </p>
          </div>
        `,
      };

      await sgMail.send(msg);
      results.email.sent = true;
      console.log(`✅ Email reminder sent to ${email} for task: ${task.title}`);
    } catch (error) {
      results.email.error = error.message;
      console.error(`❌ Failed to send email to ${email}:`, error.message);
    }
  }

  // Send SMS
  if (phone && twilioClient && process.env.TWILIO_PHONE) {
    try {
      const message = await twilioClient.messages.create({
        to: phone,
        from: process.env.TWILIO_PHONE,
        body: `⏰ Reminder: ${task.title}\n📅 ${task.taskDate.toLocaleDateString()} at ${task.reminder.time}\n\n— SalonHub`,
      });

      results.sms.sent = true;
      console.log(`✅ SMS reminder sent to ${phone} for task: ${task.title} (SID: ${message.sid})`);
    } catch (error) {
      results.sms.error = error.message;
      console.error(`❌ Failed to send SMS to ${phone}:`, error.message);
    }
  }

  // Determine overall success
  const emailAttempted = !!email && !!process.env.SENDGRID_API_KEY;
  const smsAttempted = !!phone && !!twilioClient;

  const success =
    (emailAttempted ? results.email.sent : true) && (smsAttempted ? results.sms.sent : true);

  return {
    success,
    results,
    emailSent: results.email.sent,
    smsSent: results.sms.sent,
  };
}

/**
 * Formats time from 24h to 12h for display
 */
function formatTime12h(time24) {
  if (!time24) return "";
  const [hours, minutes] = time24.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

module.exports = {
  sendReminder,
  formatTime12h,
};
