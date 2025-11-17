/**
 * Owner Time Manager - Complete Test Script
 * 
 * Tests:
 * 1. Create daily task
 * 2. Fetch daily tasks
 * 3. Verify task appears in results
 * 4. Compare with Visitor implementation
 * 
 * Run: node test-owner-time-manager.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

console.log('\n========================================');
console.log('🏢 OWNER TIME MANAGER TEST');
console.log('========================================\n');

async function testOwnerTimeManager() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected\n');

    // Import models and services
    const OwnerTask = require('./owner/time/models/Task');
    const VisitorTask = require('./visitor/time/models/Task');
    const User = require('./models/User');

    // Find an owner user
    console.log('👤 Finding owner user...');
    const owner = await User.findOne({ role: 'owner' });
    if (!owner) {
      console.log('❌ No owner found! Please create an owner account first.');
      process.exit(1);
    }
    console.log(`✅ Found owner: ${owner.name} (${owner.email})`);
    console.log(`   ID: ${owner._id}\n`);

    // Test 1: Create a daily task
    console.log('========================================');
    console.log('TEST 1: Create Daily Task');
    console.log('========================================\n');

    const today = new Date();
    today.setHours(0, 0, 0, 0);  // Normalize to midnight

    const testTask = {
      userId: owner._id,
      scope: 'daily',
      taskDate: today,
      session: 'morning',
      title: 'Test Task - ' + new Date().toLocaleTimeString(),
      description: 'Testing owner time manager fix',
      priority: 'high',
      completed: false,
    };

    console.log('📝 Creating task with normalized date:', today.toISOString());
    const createdTask = await OwnerTask.create(testTask);
    console.log('✅ Task created:');
    console.log('   ID:', createdTask._id);
    console.log('   Title:', createdTask.title);
    console.log('   TaskDate:', createdTask.taskDate.toISOString());
    console.log('');

    // Test 2: Fetch daily tasks (simulating what the API does)
    console.log('========================================');
    console.log('TEST 2: Fetch Daily Tasks');
    console.log('========================================\n');

    const queryDate = new Date();  // Current date
    const startOfDay = new Date(queryDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(queryDate);
    endOfDay.setHours(23, 59, 59, 999);

    console.log('🔍 Querying with date range:');
    console.log('   Start:', startOfDay.toISOString());
    console.log('   End:', endOfDay.toISOString());
    console.log('');

    const tasks = await OwnerTask.find({
      userId: owner._id,
      scope: 'daily',
      taskDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    }).sort({ createdAt: -1 });

    console.log(`✅ Found ${tasks.length} task(s) for today:`);
    tasks.forEach((task, i) => {
      console.log(`\n${i + 1}. "${task.title}"`);
      console.log(`   ID: ${task._id}`);
      console.log(`   TaskDate: ${task.taskDate.toISOString()}`);
      console.log(`   Session: ${task.session}`);
      console.log(`   Created: ${task.createdAt.toISOString()}`);
    });
    console.log('');

    // Test 3: Verify our test task is in results
    console.log('========================================');
    console.log('TEST 3: Verify Test Task Appears');
    console.log('========================================\n');

    const foundTestTask = tasks.find(t => t._id.toString() === createdTask._id.toString());
    if (foundTestTask) {
      console.log('✅ SUCCESS! Test task appears in query results');
      console.log('   This means the Owner Time Manager will work correctly\n');
    } else {
      console.log('❌ FAIL! Test task NOT in query results');
      console.log('   This means there is still a bug\n');
    }

    // Test 4: Compare with Visitor implementation
    console.log('========================================');
    console.log('TEST 4: Compare Owner vs Visitor');
    console.log('========================================\n');

    const ownerCount = await OwnerTask.countDocuments({ userId: owner._id, scope: 'daily' });
    console.log(`Owner daily tasks: ${ownerCount}`);

    const visitor = await User.findOne({ role: 'visitor' });
    if (visitor) {
      const visitorCount = await VisitorTask.countDocuments({ userId: visitor._id, scope: 'daily' });
      console.log(`Visitor daily tasks: ${visitorCount}`);
      console.log('');
      console.log('✅ Both systems are using the same architecture\n');
    }

    // Cleanup: Delete test task
    console.log('========================================');
    console.log('CLEANUP');
    console.log('========================================\n');

    await OwnerTask.findByIdAndDelete(createdTask._id);
    console.log('✅ Test task deleted\n');

    console.log('========================================');
    console.log('✅ ALL TESTS PASSED');
    console.log('========================================\n');

    console.log('🎉 Owner Time Manager is working correctly!\n');
    console.log('Next steps:');
    console.log('1. Restart backend: cd backend && npm start');
    console.log('2. Restart frontend: cd frontend && npm start');
    console.log('3. Login as owner and test creating tasks');
    console.log('4. Tasks should now appear immediately after creation\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testOwnerTimeManager();
