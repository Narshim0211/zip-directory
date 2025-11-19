/**
 * Script to fix owner test user role in database
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });
const mongoose = require('mongoose');

// User Schema (minimal version for update)
const userSchema = new mongoose.Schema({
  email: String,
  role: String
}, { collection: 'users' });

const User = mongoose.model('User', userSchema);

async function fixOwnerRole() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to database\n');

    // Find and update owner test user
    const result = await User.findOneAndUpdate(
      { email: 'owner-test@example.com' },
      { $set: { role: 'owner' } },
      { new: true }
    );

    if (result) {
      console.log('✅ Updated owner-test@example.com role to:', result.role);
    } else {
      console.log('❌ User owner-test@example.com not found');
      console.log('   User needs to be created first via the test script');
    }

    await mongoose.disconnect();
    console.log('\n✅ Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixOwnerRole();
