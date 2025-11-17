/**
 * Manual Reminder Test Script
 * 
 * This script tests the reminder system by:
 * 1. Connecting to MongoDB
 * 2. Checking environment variables
 * 3. Creating a test task with reminder
 * 4. Manually triggering the reminder send
 * 5. Showing detailed logs
 * 
 * Run: node test-reminder-manual.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { sendReminder } = require('./shared/utils/sendReminder');
const { processReminders } = require('./services/reminderScheduler');

console.log('\n========================================');
console.log('🧪 MANUAL REMINDER SYSTEM TEST');
console.log('========================================\n');

// Check environment variables
console.log('📋 Environment Variables Check:\n');
console.log(`✓ MONGO_URI: ${process.env.MONGO_URI ? 'SET' : '❌ NOT SET'}`);
console.log(`✓ SENDGRID_API_KEY: ${process.env.SENDGRID_API_KEY ? 'SET (' + process.env.SENDGRID_API_KEY.substring(0, 10) + '...)' : '❌ NOT SET'}`);
console.log(`✓ SENDER_EMAIL: ${process.env.SENDER_EMAIL || '❌ NOT SET'}`);
console.log(`✓ FRONTEND_URL: ${process.env.FRONTEND_URL || '❌ NOT SET'}`);
console.log(`✓ TWILIO_SID: ${process.env.TWILIO_SID ? 'SET' : 'NOT SET (optional)'}`);
console.log(`✓ TWILIO_TOKEN: ${process.env.TWILIO_TOKEN ? 'SET' : 'NOT SET (optional)'}`);
console.log(`✓ TWILIO_PHONE: ${process.env.TWILIO_PHONE || 'NOT SET (optional)'}`);

console.log('\n========================================\n');

async function runTest() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected\n');

    // Import models after connection
    const VisitorTask = require('./visitor/time/models/Task');

    // Check if there are any tasks with reminders
    console.log('📊 Checking existing tasks with reminders...\n');
    
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    console.log(`Current time: ${now.toISOString()}`);
    console.log(`Current time (HH:MM): ${currentTime}`);
    console.log(`Today range: ${todayStart.toISOString()} to ${todayEnd.toISOString()}\n`);

    // Find all tasks with reminders
    const allTasks = await VisitorTask.find({
      reminder: { $exists: true, $ne: null }
    }).sort({ createdAt: -1 }).limit(10);

    console.log(`Found ${allTasks.length} tasks with reminders:\n`);
    
    allTasks.forEach((task, i) => {
      console.log(`${i + 1}. "${task.title}" (ID: ${task._id})`);
      console.log(`   - Reminder time: ${task.reminder?.time || 'N/A'}`);
      console.log(`   - Email: ${task.reminder?.email || 'none'}`);
      console.log(`   - Phone: ${task.reminder?.phone || 'none'}`);
      console.log(`   - Sent: ${task.reminder?.sent || false}`);
      console.log(`   - Task date: ${task.taskDate}`);
      console.log('');
    });

    // Find pending reminders for current time
    const pendingReminders = await VisitorTask.find({
      "reminder.time": currentTime,
      "reminder.sent": false,
      taskDate: { $gte: todayStart, $lt: todayEnd },
    });

    console.log(`\n📬 Pending reminders for ${currentTime}: ${pendingReminders.length}\n`);

    if (pendingReminders.length > 0) {
      console.log('🚀 Testing reminder send for first pending task...\n');
      const testTask = pendingReminders[0];
      
      console.log(`Task: "${testTask.title}"`);
      console.log(`Email: ${testTask.reminder.email}`);
      console.log(`Phone: ${testTask.reminder.phone || 'none'}\n`);

      const result = await sendReminder(testTask);
      
      console.log('\n📊 Send Result:');
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log('ℹ️  No pending reminders at current time.');
      console.log('💡 To test, create a task with reminder set for:', currentTime);
      console.log('   Or create a task with reminder set for the next minute.\n');
      
      // Offer to run full cron check
      console.log('🔄 Running full reminder check (like the cron job does)...\n');
      await processReminders();
    }

    console.log('\n========================================');
    console.log('✅ Test completed');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

runTest();
