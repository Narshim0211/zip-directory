/**
 * Quick Database Inspector for Owner Tasks
 * 
 * Checks if owner tasks are actually being saved to database
 * 
 * Run: node check-owner-tasks.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

console.log('\n========================================');
console.log('🔍 OWNER TASKS DATABASE INSPECTOR');
console.log('========================================\n');

async function inspectTasks() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected\n');

    // Import models
    const OwnerTask = require('./owner/time/models/Task');
    const User = require('./models/User');

    // Find all owner users
    console.log('👥 Finding owner users...');
    const owners = await User.find({ role: 'owner' }).select('_id name email');
    console.log(`Found ${owners.length} owner(s):\n`);
    
    owners.forEach((owner, i) => {
      console.log(`${i + 1}. ${owner.name} (${owner.email})`);
      console.log(`   ID: ${owner._id}\n`);
    });

    if (owners.length === 0) {
      console.log('⚠️  No owners found in database!');
      process.exit(0);
    }

    // Check tasks for each owner
    console.log('========================================\n');
    console.log('📊 OWNER TASKS:\n');

    for (const owner of owners) {
      console.log(`\n👤 Tasks for: ${owner.name}`);
      console.log('─'.repeat(50));
      
      const tasks = await OwnerTask.find({ userId: owner._id })
        .sort({ createdAt: -1 })
        .limit(10);
      
      if (tasks.length === 0) {
        console.log('❌ NO TASKS FOUND for this owner\n');
        continue;
      }

      console.log(`✅ Found ${tasks.length} task(s):\n`);
      
      tasks.forEach((task, i) => {
        console.log(`${i + 1}. "${task.title}"`);
        console.log(`   ID: ${task._id}`);
        console.log(`   Scope: ${task.scope || 'NOT SET'}`);
        console.log(`   Date: ${task.taskDate}`);
        console.log(`   Session: ${task.session || 'NOT SET'}`);
        console.log(`   Priority: ${task.priority || 'NOT SET'}`);
        console.log(`   Completed: ${task.completed || false}`);
        console.log(`   Created: ${task.createdAt}`);
        if (task.reminder) {
          console.log(`   📱 Reminder: ${task.reminder.time || 'N/A'}`);
          console.log(`      Email: ${task.reminder.email || 'none'}`);
          console.log(`      Phone: ${task.reminder.phone || 'none'}`);
          console.log(`      Sent: ${task.reminder.sent || false}`);
        }
        console.log('');
      });
    }

    console.log('========================================');
    console.log('✅ Inspection complete\n');

    // Summary
    const totalTasks = await OwnerTask.countDocuments();
    const todayTasks = await OwnerTask.countDocuments({
      taskDate: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999))
      }
    });
    const dailyTasks = await OwnerTask.countDocuments({ scope: 'daily' });
    const weeklyTasks = await OwnerTask.countDocuments({ scope: 'weekly' });
    const monthlyTasks = await OwnerTask.countDocuments({ scope: 'monthly' });

    console.log('📈 SUMMARY:');
    console.log(`   Total owner tasks: ${totalTasks}`);
    console.log(`   Today's tasks: ${todayTasks}`);
    console.log(`   Daily tasks: ${dailyTasks}`);
    console.log(`   Weekly tasks: ${weeklyTasks}`);
    console.log(`   Monthly tasks: ${monthlyTasks}`);
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

inspectTasks();
