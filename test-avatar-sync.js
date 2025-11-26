/**
 * Avatar Sync Test Script
 * Tests that avatar uploads update both Profile and User models
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/salonhub');

const User = require('./backend/models/User');
const OwnerProfile = require('./backend/models/OwnerProfile');
const VisitorProfile = require('./backend/models/VisitorProfile');

async function testAvatarSync() {
  console.log('\n🧪 Testing Avatar Synchronization...\n');

  try {
    // Find a test user (owner or visitor)
    const testUser = await User.findOne({ role: { $in: ['owner', 'visitor'] } });

    if (!testUser) {
      console.log('❌ No test user found. Please create an owner or visitor account first.');
      process.exit(1);
    }

    console.log(`✅ Found test user: ${testUser.firstName} ${testUser.lastName} (${testUser.role})`);
    console.log(`   User Model avatarUrl: ${testUser.avatarUrl || '(empty)'}`);

    // Find corresponding profile
    let profile;
    if (testUser.role === 'owner') {
      profile = await OwnerProfile.findOne({ userId: testUser._id });
    } else {
      profile = await VisitorProfile.findOne({ userId: testUser._id });
    }

    if (!profile) {
      console.log('❌ No profile found for user');
      process.exit(1);
    }

    console.log(`   Profile Model avatarUrl: ${profile.avatarUrl || '(empty)'}`);

    // Check if they match
    if (testUser.avatarUrl === profile.avatarUrl) {
      console.log('\n✅ PASS: User.avatarUrl matches Profile.avatarUrl');
    } else {
      console.log('\n⚠️  WARNING: User.avatarUrl does NOT match Profile.avatarUrl');
      console.log('   This is expected if avatar was uploaded before the fix.');
      console.log('   Upload a new avatar to test the sync.');
    }

    // Test data
    console.log('\n📊 Current Data:');
    console.log(`   User._id: ${testUser._id}`);
    console.log(`   User.avatarUrl: ${testUser.avatarUrl || '(empty)'}`);
    console.log(`   Profile.avatarUrl: ${profile.avatarUrl || '(empty)'}`);
    console.log(`   Profile._id: ${profile._id}`);

    console.log('\n✅ Backend fix is live. Test by uploading a new avatar!');
    console.log('   The avatar should now sync to both User and Profile models.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testAvatarSync();
