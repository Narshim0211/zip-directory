// Quick diagnostic script to check MongoDB directly
// Run with: node backend/check-tasks.js

const mongoose = require('mongoose');
require('dotenv').config();

async function checkTasks() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    const VisitorTask = require('./visitor/time/models/Task');
    
    console.log('\n📊 CHECKING ALL VISITOR TASKS:\n');
    
    const allTasks = await VisitorTask.find({}).sort({ createdAt: -1 }).limit(10);
    
    console.log(`Total tasks found: ${allTasks.length}\n`);
    
    allTasks.forEach((task, index) => {
      console.log(`─────────────────────────────────────`);
      console.log(`Task ${index + 1}:`);
      console.log(`  ID: ${task._id}`);
      console.log(`  Title: ${task.title}`);
      console.log(`  Scope: ${task.scope}`);
      console.log(`  TaskDate: ${task.taskDate}`);
      console.log(`  TaskDate ISO: ${task.taskDate.toISOString()}`);
      console.log(`  Has reminder field: ${'reminder' in task}`);
      console.log(`  Reminder value: ${task.reminder ? JSON.stringify(task.reminder, null, 2) : 'null'}`);
      console.log(`  Created: ${task.createdAt}`);
    });
    
    console.log('\n─────────────────────────────────────\n');
    
    // Check tasks with reminders
    const tasksWithReminders = allTasks.filter(t => t.reminder);
    console.log(`\n✨ Tasks with reminders: ${tasksWithReminders.length}`);
    
    if (tasksWithReminders.length > 0) {
      console.log('\nReminder details:');
      tasksWithReminders.forEach(task => {
        console.log(`  - "${task.title}": ${JSON.stringify(task.reminder)}`);
      });
    }
    
    // Check today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    console.log(`\n📅 Today's date range:`);
    console.log(`  Start: ${today.toISOString()}`);
    console.log(`  End: ${tomorrow.toISOString()}`);
    
    const todayTasks = await VisitorTask.find({
      scope: 'daily',
      taskDate: { $gte: today, $lt: tomorrow }
    });
    
    console.log(`\n📋 Tasks in today's range: ${todayTasks.length}`);
    todayTasks.forEach(task => {
      console.log(`  - ${task.title} (${task.taskDate.toISOString()})`);
    });
    
    await mongoose.disconnect();
    console.log('\n✅ Disconnected\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkTasks();
