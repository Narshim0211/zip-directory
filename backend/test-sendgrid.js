/**
 * SendGrid API Test
 * 
 * Tests if SendGrid API key is valid and can send emails
 * 
 * Run: node test-sendgrid.js YOUR_EMAIL@example.com
 */

require('dotenv').config();
const sgMail = require('@sendgrid/mail');

console.log('\n========================================');
console.log('📧 SENDGRID API TEST');
console.log('========================================\n');

// Get email from command line argument
const testEmail = process.argv[2];

if (!testEmail) {
  console.error('❌ Error: Please provide your email address');
  console.log('\nUsage: node test-sendgrid.js your-email@example.com\n');
  process.exit(1);
}

// Check environment variables
console.log('📋 Configuration Check:\n');
console.log(`SENDGRID_API_KEY: ${process.env.SENDGRID_API_KEY ? 'SET (' + process.env.SENDGRID_API_KEY.substring(0, 10) + '...)' : '❌ NOT SET'}`);
console.log(`SENDER_EMAIL: ${process.env.SENDER_EMAIL || '❌ NOT SET'}`);
console.log(`Test recipient: ${testEmail}\n`);

if (!process.env.SENDGRID_API_KEY) {
  console.error('❌ SENDGRID_API_KEY is not set in .env file');
  console.log('\nAdd this to your backend/.env file:');
  console.log('SENDGRID_API_KEY=SG.your_key_here');
  console.log('SENDER_EMAIL=noreply@yourdomain.com\n');
  process.exit(1);
}

console.log('========================================\n');

async function testSendGrid() {
  try {
    console.log('🔧 Initializing SendGrid...');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    console.log('✅ SendGrid initialized\n');

    console.log('📤 Preparing test email...');
    const msg = {
      to: testEmail,
      from: process.env.SENDER_EMAIL || 'noreply@salonhub.com',
      subject: '🧪 Test Email from SalonHub Reminder System',
      text: `This is a test email from your SalonHub reminder system.\n\nIf you received this, your SendGrid integration is working correctly!\n\nTimestamp: ${new Date().toISOString()}\n\n— SalonHub`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #7c3aed;">🧪 SendGrid Test Email</h2>
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p>This is a test email from your <strong>SalonHub Reminder System</strong>.</p>
            <p>✅ If you received this, your SendGrid integration is <strong>working correctly</strong>!</p>
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
              <strong>Timestamp:</strong> ${new Date().toISOString()}
            </p>
          </div>
          <p style="color: #9ca3af; font-size: 12px;">
            This is a test email from SalonHub Time Manager.
          </p>
        </div>
      `,
    };

    console.log('Message prepared:');
    console.log(`  To: ${msg.to}`);
    console.log(`  From: ${msg.from}`);
    console.log(`  Subject: ${msg.subject}\n`);

    console.log('📨 Sending email via SendGrid...\n');
    
    const response = await sgMail.send(msg);
    
    console.log('✅ EMAIL SENT SUCCESSFULLY!\n');
    console.log('📊 Response Details:');
    console.log(`  Status Code: ${response[0].statusCode}`);
    console.log(`  Status Message: ${response[0].statusMessage || 'OK'}`);
    console.log(`  Headers:`, response[0].headers);

    console.log('\n========================================');
    console.log('🎉 SUCCESS!');
    console.log('========================================\n');
    console.log('✅ Your SendGrid API key is valid');
    console.log('✅ Email was sent successfully');
    console.log(`✅ Check your inbox: ${testEmail}`);
    console.log('✅ Also check spam/junk folder\n');
    console.log('Next steps:');
    console.log('1. Check your email inbox');
    console.log('2. Verify email was received');
    console.log('3. Check SendGrid dashboard: https://app.sendgrid.com/');
    console.log('4. If received, your reminder system should work!\n');

  } catch (error) {
    console.error('\n❌ FAILED TO SEND EMAIL\n');
    console.error('Error Details:');
    console.error(`  Message: ${error.message}`);
    console.error(`  Code: ${error.code || 'N/A'}`);
    
    if (error.response) {
      console.error(`  Status: ${error.response.statusCode}`);
      console.error(`  Body:`, error.response.body);
    }

    console.log('\n📋 Troubleshooting:');
    console.log('1. Check if SendGrid API key is valid');
    console.log('2. Verify sender email is authenticated in SendGrid');
    console.log('3. Check SendGrid account status');
    console.log('4. Make sure API key has "Mail Send" permissions');
    console.log('5. Visit: https://app.sendgrid.com/settings/api_keys\n');

    console.log('Common Issues:');
    console.log('- Invalid API key → Check .env file');
    console.log('- Sender not verified → Go to SendGrid > Settings > Sender Authentication');
    console.log('- Account suspended → Check SendGrid dashboard');
    console.log('- API key lacks permissions → Regenerate with Mail Send enabled\n');

    process.exit(1);
  }
}

testSendGrid();
