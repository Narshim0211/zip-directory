/**
 * Cleanup Script: Remove Duplicate Reactions
 *
 * This script removes duplicate reactions that were created before
 * the unique index was enforced. It keeps only the MOST RECENT reaction
 * for each (userId, contentId, contentType) combination.
 *
 * Usage: node scripts/cleanupDuplicateReactions.js
 */

const mongoose = require('mongoose');
const Reaction = require('../models/Reaction');
require('dotenv').config();

async function cleanupDuplicateReactions() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🔍 Finding duplicate reactions...');

    // Find all duplicate reactions
    const duplicates = await Reaction.aggregate([
      {
        $group: {
          _id: {
            userId: '$userId',
            contentId: '$contentId',
            contentType: '$contentType'
          },
          reactions: { $push: { id: '$_id', createdAt: '$createdAt', type: '$reactionType' } },
          count: { $sum: 1 }
        }
      },
      {
        $match: {
          count: { $gt: 1 } // Only groups with more than 1 reaction
        }
      }
    ]);

    console.log(`\n📊 Found ${duplicates.length} sets of duplicate reactions`);

    if (duplicates.length === 0) {
      console.log('✅ No duplicates found! Database is clean.');
      process.exit(0);
    }

    let totalRemoved = 0;

    // For each set of duplicates, keep only the most recent one
    for (const duplicate of duplicates) {
      const reactions = duplicate.reactions;

      // Sort by createdAt descending (most recent first)
      reactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Keep the first (most recent), delete the rest
      const toKeep = reactions[0];
      const toDelete = reactions.slice(1);

      console.log(`\n🔧 Processing duplicate for user ${duplicate._id.userId}:`);
      console.log(`   Content: ${duplicate._id.contentType} ${duplicate._id.contentId}`);
      console.log(`   Total reactions: ${reactions.length}`);
      console.log(`   Keeping: ${toKeep.type} (${toKeep.createdAt})`);
      console.log(`   Deleting: ${toDelete.length} older reactions`);

      // Delete the older duplicates
      const deleteIds = toDelete.map(r => r.id);
      const result = await Reaction.deleteMany({ _id: { $in: deleteIds } });
      totalRemoved += result.deletedCount;

      console.log(`   ✅ Deleted ${result.deletedCount} duplicate reactions`);
    }

    console.log(`\n✅ Cleanup complete!`);
    console.log(`📊 Total duplicate reactions removed: ${totalRemoved}`);
    console.log(`📊 Total duplicate sets cleaned: ${duplicates.length}`);

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the cleanup
cleanupDuplicateReactions();
