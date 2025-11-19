const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Verify transporter configuration
const verifyEmailService = async () => {
  try {
    await transporter.verify();
    console.log('✅ Email service is ready to send emails');
    return true;
  } catch (error) {
    console.error('❌ Email service verification failed:', error.message);
    return false;
  }
};

// Generate unsubscribe token
const generateUnsubscribeToken = (userId, email) => {
  const payload = `${userId}:${email}:${process.env.JWT_SECRET}`;
  return crypto.createHash('sha256').update(payload).digest('hex');
};

// Verify unsubscribe token
const verifyUnsubscribeToken = (userId, email, token) => {
  const expectedToken = generateUnsubscribeToken(userId, email);
  return token === expectedToken;
};

// Get base URL for links
const getBaseUrl = () => {
  return process.env.FRONTEND_URL || 'http://localhost:3000';
};

// Get backend API URL for unsubscribe
const getBackendUrl = () => {
  return process.env.BACKEND_URL || 'http://localhost:5000';
};

// HTML Email Templates
const getVisitorNewsletterTemplate = (subject, preheader, contentHtml, unsubscribeUrl) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>${subject}</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f7; }
    .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; }
    .preheader { color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 14px; }
    .content { padding: 40px 30px; color: #1d1d1f; line-height: 1.6; }
    .content h2 { color: #1d1d1f; font-size: 24px; margin: 0 0 20px 0; }
    .content p { margin: 0 0 15px 0; font-size: 16px; color: #424245; }
    .content a { color: #667eea; text-decoration: none; }
    .footer { background-color: #f5f5f7; padding: 30px; text-align: center; border-top: 1px solid #e5e5e7; }
    .footer p { margin: 5px 0; font-size: 13px; color: #6e6e73; }
    .unsubscribe { margin-top: 15px; }
    .unsubscribe a { color: #86868b; text-decoration: underline; font-size: 12px; }
    @media only screen and (max-width: 600px) {
      .content { padding: 30px 20px !important; }
      .header { padding: 30px 20px !important; }
      .header h1 { font-size: 24px !important; }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>🎨 SalonHub Hair Tips</h1>
      ${preheader ? `<p class="preheader">${preheader}</p>` : ''}
    </div>
    <div class="content">
      ${contentHtml}
    </div>
    <div class="footer">
      <p><strong>SalonHub</strong></p>
      <p>Your partner in hair care excellence</p>
      <p class="unsubscribe">
        <a href="${unsubscribeUrl}">Unsubscribe from Hair Tips</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
};

const getOwnerNewsletterTemplate = (subject, preheader, contentHtml, unsubscribeUrl) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>${subject}</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f7; }
    .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; }
    .preheader { color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 14px; }
    .content { padding: 40px 30px; color: #1d1d1f; line-height: 1.6; }
    .content h2 { color: #1d1d1f; font-size: 24px; margin: 0 0 20px 0; }
    .content p { margin: 0 0 15px 0; font-size: 16px; color: #424245; }
    .content a { color: #f5576c; text-decoration: none; }
    .footer { background-color: #f5f5f7; padding: 30px; text-align: center; border-top: 1px solid #e5e5e7; }
    .footer p { margin: 5px 0; font-size: 13px; color: #6e6e73; }
    .unsubscribe { margin-top: 15px; }
    .unsubscribe a { color: #86868b; text-decoration: underline; font-size: 12px; }
    @media only screen and (max-width: 600px) {
      .content { padding: 30px 20px !important; }
      .header { padding: 30px 20px !important; }
      .header h1 { font-size: 24px !important; }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>💼 SalonHub Business Growth</h1>
      ${preheader ? `<p class="preheader">${preheader}</p>` : ''}
    </div>
    <div class="content">
      ${contentHtml}
    </div>
    <div class="footer">
      <p><strong>SalonHub Business</strong></p>
      <p>Empowering salon owners to succeed</p>
      <p class="unsubscribe">
        <a href="${unsubscribeUrl}">Unsubscribe from Business Growth Tips</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
};

// Send single email
const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"SalonHub" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

// Send test email
const sendTestEmail = async (to, campaign) => {
  try {
    const unsubscribeUrl = `${getBaseUrl()}/unsubscribe-preview`;
    
    let html;
    if (campaign.audience === 'VISITOR') {
      html = getVisitorNewsletterTemplate(
        `[TEST] ${campaign.subject}`,
        campaign.preheader,
        campaign.contentHtml,
        unsubscribeUrl
      );
    } else {
      html = getOwnerNewsletterTemplate(
        `[TEST] ${campaign.subject}`,
        campaign.preheader,
        campaign.contentHtml,
        unsubscribeUrl
      );
    }

    const result = await sendEmail({
      to,
      subject: `[TEST] ${campaign.subject}`,
      html,
    });

    return result;
  } catch (error) {
    console.error('Failed to send test email:', error);
    throw error;
  }
};

// Send campaign emails in batches
const sendCampaignEmails = async (campaign, subscribers, onProgress) => {
  const BATCH_SIZE = 50; // Send 50 emails at a time
  const BATCH_DELAY = 1000; // 1 second delay between batches
  
  const results = {
    total: subscribers.length,
    sent: 0,
    failed: 0,
    errors: [],
  };

  // Process subscribers in batches
  for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
    const batch = subscribers.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(subscribers.length / BATCH_SIZE);

    console.log(`📧 Sending batch ${batchNumber}/${totalBatches} (${batch.length} emails)`);

    // Send emails in parallel within the batch
    const batchPromises = batch.map(async (subscriber) => {
  try {
    const unsubscribeToken = generateUnsubscribeToken(subscriber._id.toString(), subscriber.email);
    const unsubscribeUrl = `${getBackendUrl()}/api/newsletter/unsubscribe?userId=${subscriber._id}&token=${unsubscribeToken}&type=${campaign.audience.toLowerCase()}`;        let html;
        if (campaign.audience === 'VISITOR') {
          html = getVisitorNewsletterTemplate(
            campaign.subject,
            campaign.preheader,
            campaign.contentHtml,
            unsubscribeUrl
          );
        } else {
          html = getOwnerNewsletterTemplate(
            campaign.subject,
            campaign.preheader,
            campaign.contentHtml,
            unsubscribeUrl
          );
        }

        const result = await sendEmail({
          to: subscriber.email,
          subject: campaign.subject,
          html,
        });

        if (result.success) {
          results.sent++;
        } else {
          results.failed++;
          results.errors.push({ email: subscriber.email, error: result.error });
        }

        return result;
      } catch (error) {
        results.failed++;
        results.errors.push({ email: subscriber.email, error: error.message });
        return { success: false, error: error.message };
      }
    });

    await Promise.all(batchPromises);

    // Report progress
    if (onProgress) {
      onProgress({
        batch: batchNumber,
        totalBatches,
        sent: results.sent,
        failed: results.failed,
        total: results.total,
        percentage: Math.round((results.sent + results.failed) / results.total * 100),
      });
    }

    // Delay between batches (except for the last batch)
    if (i + BATCH_SIZE < subscribers.length) {
      await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
    }
  }

  return results;
};

module.exports = {
  verifyEmailService,
  sendEmail,
  sendTestEmail,
  sendCampaignEmails,
  generateUnsubscribeToken,
  verifyUnsubscribeToken,
  getBaseUrl,
};
