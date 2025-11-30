/**
 * Drop the old businessId_1_visitorId_1 unique index
 * This index was causing issues because it didn't include threadType
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

async function dropOldIndex() {
  try {
    console.log('🔧 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('messagethreads');

    // Drop the old businessId_visitorId index
    try {
      await collection.dropIndex('businessId_1_visitorId_1');
      console.log('✅ Dropped old businessId_1_visitorId_1 index');
    } catch (err) {
      if (err.codeName === 'IndexNotFound') {
        console.log('⚠️  Index already removed');
      } else {
        throw err;
      }
    }

    console.log('🎉 Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed:', error);
    process.exit(1);
  }
}

dropOldIndex();
