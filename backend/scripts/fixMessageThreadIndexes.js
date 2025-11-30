/**
 * Migration Script: Fix MessageThread Indexes
 *
 * Problem: The old unique index { businessId, visitorId, threadType } with sparse:true
 * was causing duplicate key errors for owner/visitor threads because null values
 * are still indexed (sparse only skips undefined fields).
 *
 * Solution: Replace with partial indexes that only apply to their respective thread types.
 *
 * Run this script ONCE after deploying the model changes:
 * node backend/scripts/fixMessageThreadIndexes.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/salonhub';

async function fixIndexes() {
  try {
    console.log('🔧 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('messagethreads');

    // List current indexes
    console.log('\n📋 Current indexes:');
    const currentIndexes = await collection.indexes();
    currentIndexes.forEach(idx => {
      console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
      if (idx.unique) console.log(`    (unique)`);
      if (idx.sparse) console.log(`    (sparse)`);
      if (idx.partialFilterExpression) console.log(`    (partial: ${JSON.stringify(idx.partialFilterExpression)})`);
    });

    // Drop the old problematic index if it exists
    const oldIndexName = 'businessId_1_visitorId_1_threadType_1';
    const hasOldIndex = currentIndexes.some(idx => idx.name === oldIndexName);

    if (hasOldIndex) {
      console.log(`\n🗑️  Dropping old index: ${oldIndexName}`);
      await collection.dropIndex(oldIndexName);
      console.log('✅ Old index dropped');
    } else {
      console.log('\n✅ Old problematic index not found (already removed or never existed)');
    }

    // Also drop the old ownerId index if it exists without partial filter
    const oldOwnerIndexName = 'ownerId_1_visitorId_1_threadType_1';
    const hasOldOwnerIndex = currentIndexes.some(idx =>
      idx.name === oldOwnerIndexName && !idx.partialFilterExpression
    );

    if (hasOldOwnerIndex) {
      console.log(`\n🗑️  Dropping old owner index: ${oldOwnerIndexName}`);
      await collection.dropIndex(oldOwnerIndexName);
      console.log('✅ Old owner index dropped');
    }

    // Create new partial indexes
    console.log('\n📝 Creating new partial indexes...');

    // Business thread index (only for business threads)
    try {
      await collection.createIndex(
        { businessId: 1, visitorId: 1, threadType: 1 },
        {
          unique: true,
          partialFilterExpression: { threadType: 'business', businessId: { $type: 'objectId' } },
          name: 'businessId_visitorId_threadType_business_partial'
        }
      );
      console.log('✅ Created business thread partial index');
    } catch (err) {
      if (err.code === 85 || err.codeName === 'IndexOptionsConflict') {
        console.log('⚠️  Business index already exists (skipping)');
      } else {
        throw err;
      }
    }

    // Owner thread index (only for owner threads)
    try {
      await collection.createIndex(
        { ownerId: 1, visitorId: 1, threadType: 1 },
        {
          unique: true,
          partialFilterExpression: { threadType: 'owner' },
          name: 'ownerId_visitorId_threadType_owner_partial'
        }
      );
      console.log('✅ Created owner thread partial index');
    } catch (err) {
      if (err.code === 85 || err.codeName === 'IndexOptionsConflict') {
        console.log('⚠️  Owner index already exists (skipping)');
      } else {
        throw err;
      }
    }

    // List updated indexes
    console.log('\n📋 Updated indexes:');
    const updatedIndexes = await collection.indexes();
    updatedIndexes.forEach(idx => {
      console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
      if (idx.unique) console.log(`    (unique)`);
      if (idx.partialFilterExpression) console.log(`    (partial: ${JSON.stringify(idx.partialFilterExpression)})`);
    });

    // Clean up any threads with businessId: null that should be undefined
    console.log('\n🧹 Cleaning up threads with businessId: null...');
    const updateResult = await collection.updateMany(
      { businessId: null, threadType: { $in: ['owner', 'visitor'] } },
      { $unset: { businessId: '' } }
    );
    console.log(`✅ Updated ${updateResult.modifiedCount} threads (removed explicit null businessId)`);

    console.log('\n🎉 Migration complete!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

fixIndexes();
