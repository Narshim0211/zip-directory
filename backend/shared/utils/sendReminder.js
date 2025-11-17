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
  console.log(`\n🚀 [sendReminder] Starting for task: "${task.title}" (${task._id})`);
  
  const results = {
    email: { sent: false, error: null },
    sms: { sent: false, error: null },
  };

  // Check if reminder exists
  if (!task.reminder) {
    console.log(`❌ [sendReminder] No reminder configured for task ${task._id}`);
    return { success: false, error: "No reminder configured" };
  }

  const { email, phone } = task.reminder;
  console.log(`📧 Email recipient: ${email || 'NONE'}`);
  console.log(`📱 Phone recipient: ${phone || 'NONE'}`);
  console.log(`🔑 SENDGRID_API_KEY present: ${!!process.env.SENDGRID_API_KEY}`);
  console.log(`🔑 SENDER_EMAIL: ${process.env.SENDER_EMAIL || 'NOT SET'}`);

  // Send Email
  console.log(`\n📧 [EMAIL] Attempting to send email...`);
  console.log(`   - Condition check: email=${!!email}, SENDGRID_API_KEY=${!!process.env.SENDGRID_API_KEY}`);
  
  if (email && process.env.SENDGRID_API_KEY) {
    console.log(`✓ Email conditions met, preparing message...`);
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

      console.log(`📤 Sending email to ${email}...`);
      const sendResult = await sgMail.send(msg);
      results.email.sent = true;
      console.log(`✅ [EMAIL SUCCESS] Email sent to ${email}`);
      console.log(`   - Task: ${task.title}`);
      console.log(`   - SendGrid response:`, sendResult?.[0]?.statusCode || 'OK');
    } catch (error) {
      results.email.error = error.message;
      console.error(`❌ [EMAIL FAILED] Error sending email to ${email}`);
      console.error(`   - Error message: ${error.message}`);
      console.error(`   - Error code: ${error.code || 'N/A'}`);
      console.error(`   - Full error:`, error.response?.body || error);
    }
  } else {
    console.log(`⏭️  Email skipped (email=${!!email}, SENDGRID_API_KEY=${!!process.env.SENDGRID_API_KEY})`);
  }

  // Send SMS
  console.log(`\n📱 [SMS] Attempting to send SMS...`);
  console.log(`   - Condition check: phone=${!!phone}, twilioClient=${!!twilioClient}, TWILIO_PHONE=${!!process.env.TWILIO_PHONE}`);
  console.log(`   - TWILIO_SID: ${process.env.TWILIO_SID ? 'SET' : 'NOT SET'}`);
  console.log(`   - TWILIO_TOKEN: ${process.env.TWILIO_TOKEN ? 'SET' : 'NOT SET'}`);
  console.log(`   - TWILIO_PHONE: ${process.env.TWILIO_PHONE || 'NOT SET'}`);
  
  if (phone && twilioClient && process.env.TWILIO_PHONE) {
    console.log(`✓ SMS conditions met, sending message...`);
    try {
      console.log(`📤 Sending SMS to ${phone}...`);
      const message = await twilioClient.messages.create({
        to: phone,
        from: process.env.TWILIO_PHONE,
        body: `⏰ Reminder: ${task.title}\n📅 ${task.taskDate.toLocaleDateString()} at ${task.reminder.time}\n\n— SalonHub`,
      });

      results.sms.sent = true;
      console.log(`✅ [SMS SUCCESS] SMS sent to ${phone}`);
      console.log(`   - Task: ${task.title}`);
      console.log(`   - Message SID: ${message.sid}`);
      console.log(`   - Status: ${message.status}`);
    } catch (error) {
      results.sms.error = error.message;
      console.error(`❌ [SMS FAILED] Error sending SMS to ${phone}`);
      console.error(`   - Error message: ${error.message}`);
      console.error(`   - Error code: ${error.code || 'N/A'}`);
      console.error(`   - Full error:`, error);
    }
  } else {
    console.log(`⏭️  SMS skipped (phone=${!!phone}, twilioClient=${!!twilioClient}, TWILIO_PHONE=${!!process.env.TWILIO_PHONE})`);
  }

  // Determine overall success
  const emailAttempted = !!email && !!process.env.SENDGRID_API_KEY;
  const smsAttempted = !!phone && !!twilioClient && !!process.env.TWILIO_PHONE;

  // Success if:
  // - SMS was attempted and sent successfully, OR
  // - Email was attempted and sent successfully, OR
  // - At least one method succeeded when both were attempted
  const success = results.sms.sent || results.email.sent;

  console.log(`\n📊 [FINAL RESULT]`);
  console.log(`   - Email attempted: ${emailAttempted}, sent: ${results.email.sent}`);
  console.log(`   - SMS attempted: ${smsAttempted}, sent: ${results.sms.sent}`);
  console.log(`   - Overall success: ${success}`);
  console.log(`======================================\n`);

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
