/**
 * Twilio SMS Test
 * 
 * Tests if Twilio credentials work and can send SMS
 * 
 * Run: node test-twilio.js +1234567890
 */

require('dotenv').config();
const twilio = require('twilio');

console.log('\n========================================');
console.log('📱 TWILIO SMS TEST');
console.log('========================================\n');

// Get phone number from command line argument
const testPhone = process.argv[2];

if (!testPhone) {
  console.error('❌ Error: Please provide your phone number');
  console.log('\nUsage: node test-twilio.js +1234567890');
  console.log('Note: Phone number must include country code (e.g., +1 for US)\n');
  process.exit(1);
}

// Check environment variables
console.log('📋 Configuration Check:\n');
console.log(`TWILIO_SID: ${process.env.TWILIO_SID ? 'SET (' + process.env.TWILIO_SID.substring(0, 10) + '...)' : '❌ NOT SET'}`);
console.log(`TWILIO_TOKEN: ${process.env.TWILIO_TOKEN ? 'SET (' + process.env.TWILIO_TOKEN.substring(0, 10) + '...)' : '❌ NOT SET'}`);
console.log(`TWILIO_PHONE: ${process.env.TWILIO_PHONE || '❌ NOT SET'}`);
console.log(`Test recipient: ${testPhone}\n`);

if (!process.env.TWILIO_SID || !process.env.TWILIO_TOKEN || !process.env.TWILIO_PHONE) {
  console.error('❌ Twilio credentials are not fully configured in .env file');
  console.log('\nAdd these to your backend/.env file:');
  console.log('TWILIO_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
  console.log('TWILIO_TOKEN=your_auth_token_here');
  console.log('TWILIO_PHONE=+1234567890\n');
  console.log('Get credentials from: https://console.twilio.com/\n');
  process.exit(1);
}

console.log('========================================\n');

async function testTwilio() {
  try {
    console.log('🔧 Initializing Twilio client...');
    const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
    console.log('✅ Twilio client initialized\n');

    console.log('📤 Preparing test SMS...');
    console.log(`  From: ${process.env.TWILIO_PHONE}`);
    console.log(`  To: ${testPhone}`);
    console.log(`  Message: Test SMS from SalonHub\n`);

    console.log('📨 Sending SMS via Twilio...\n');
    
    const message = await client.messages.create({
      to: testPhone,
      from: process.env.TWILIO_PHONE,
      body: '🧪 Test SMS from SalonHub Reminder System\n\nIf you received this, your Twilio integration is working correctly!\n\nTimestamp: ' + new Date().toISOString() + '\n\n— SalonHub'
    });
    
    console.log('✅ SMS SENT SUCCESSFULLY!\n');
    console.log('📊 Response Details:');
    console.log(`  Message SID: ${message.sid}`);
    console.log(`  Status: ${message.status}`);
    console.log(`  To: ${message.to}`);
    console.log(`  From: ${message.from}`);
    console.log(`  Date Created: ${message.dateCreated}`);

    console.log('\n========================================');
    console.log('🎉 SUCCESS!');
    console.log('========================================\n');
    console.log('✅ Your Twilio credentials are valid');
    console.log('✅ SMS was sent successfully');
    console.log(`✅ Check your phone: ${testPhone}`);
    console.log('✅ SMS should arrive within 1-2 minutes\n');
    console.log('Next steps:');
    console.log('1. Check your phone for the SMS');
    console.log('2. Verify SMS was received');
    console.log('3. Check Twilio console: https://console.twilio.com/');
    console.log('4. If received, your SMS reminder system will work!\n');

  } catch (error) {
    console.error('\n❌ FAILED TO SEND SMS\n');
    console.error('Error Details:');
    console.error(`  Message: ${error.message}`);
    console.error(`  Code: ${error.code || 'N/A'}`);
    console.error(`  Status: ${error.status || 'N/A'}`);
    
    if (error.moreInfo) {
      console.error(`  More info: ${error.moreInfo}`);
    }

    console.log('\n📋 Troubleshooting:');
    console.log('1. Check if Twilio credentials are correct');
    console.log('2. Verify phone number format includes country code (+1...)');
    console.log('3. Check if Twilio phone number is active');
    console.log('4. Verify Twilio account has credits');
    console.log('5. Visit: https://console.twilio.com/\n');

    console.log('Common Issues:');
    console.log('- Invalid credentials → Check TWILIO_SID and TWILIO_TOKEN');
    console.log('- Invalid phone format → Must include country code (+1234567890)');
    console.log('- Twilio number not verified → Check Twilio console');
    console.log('- Insufficient balance → Add funds to Twilio account');
    console.log('- Trial account → Can only send to verified numbers\n');

    console.log('💡 Tip: If using Twilio trial account:');
    console.log('   - You can only send SMS to verified phone numbers');
    console.log('   - Verify your phone at: https://console.twilio.com/\n');

    process.exit(1);
  }
}

testTwilio();
