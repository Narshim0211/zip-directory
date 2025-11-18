const mongoose = require('mongoose');
require('dotenv').config();

async function dropIndex() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/salonhub-booking');
    console.log('✅ Connected to MongoDB');

    // Get the staffs collection
    const Staff = mongoose.connection.collection('staffs');

    // Drop the userId_1 index
    try {
      await Staff.dropIndex('userId_1');
      console.log('✅ Successfully dropped userId_1 index');
    } catch (err) {
      if (err.code === 27 || err.message.includes('index not found')) {
        console.log('ℹ️  Index userId_1 does not exist (already dropped or never created)');
      } else {
        throw err;
      }
    }

    // Show remaining indexes
    const indexes = await Staff.indexes();
    console.log('\n📋 Remaining indexes on staffs collection:');
    indexes.forEach(idx => {
      console.log(`  - ${idx.name}:`, Object.keys(idx.key).join(', '));
    });

    await mongoose.connection.close();
    console.log('\n✅ Done! You can now restart the booking service.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

dropIndex();
