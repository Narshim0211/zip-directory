/**
 * Diagnostic Script: Check Reaction Data
 *
 * This script checks:
 * 1. Total reactions in database
 * 2. All collection names (to find any legacy reaction collections)
 * 3. Sample of reactions to understand the data structure
 * 4. Reactions grouped by content to find posts with multiple user reactions
 */

const mongoose = require('mongoose');
const Reaction = require('../models/Reaction');
require('dotenv').config();

async function checkReactionData() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // 1. Check all collection names
    console.log('📁 ALL COLLECTIONS IN DATABASE:');
    const collections = await mongoose.connection.db.listCollections().toArray();
    collections.forEach(col => {
      if (col.name.toLowerCase().includes('react')) {
        console.log(`  ⭐ ${col.name} (REACTION-RELATED)`);
      } else {
        console.log(`     ${col.name}`);
      }
    });

    // 2. Count total reactions
    console.log('\n📊 REACTION STATISTICS:');
    const totalReactions = await Reaction.countDocuments();
    console.log(`  Total reactions in 'reactions' collection: ${totalReactions}`);

    // 3. Show sample reactions
    console.log('\n📄 SAMPLE REACTIONS (first 5):');
    const sampleReactions = await Reaction.find().limit(5).lean();
    sampleReactions.forEach((r, i) => {
      console.log(`\n  ${i + 1}. Reaction:`);
      console.log(`     userId: ${r.userId}`);
      console.log(`     contentId: ${r.contentId}`);
      console.log(`     contentType: ${r.contentType}`);
      console.log(`     reactionType: ${r.reactionType}`);
      console.log(`     createdAt: ${r.createdAt}`);
    });

    // 4. Find posts with the most reactions
    console.log('\n🔥 TOP 10 POSTS BY REACTION COUNT:');
    const topPosts = await Reaction.aggregate([
      { $match: { contentType: 'post' } },
      {
        $group: {
          _id: '$contentId',
          count: { $sum: 1 },
          reactions: { $push: { userId: '$userId', type: '$reactionType' } }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    topPosts.forEach((post, i) => {
      console.log(`\n  ${i + 1}. Post ID: ${post._id}`);
      console.log(`     Total reactions: ${post.count}`);
      console.log(`     User breakdown:`);

      // Group by user to find duplicates
      const userReactionCounts = {};
      post.reactions.forEach(r => {
        const userId = r.userId.toString();
        if (!userReactionCounts[userId]) {
          userReactionCounts[userId] = { count: 0, types: [] };
        }
        userReactionCounts[userId].count++;
        userReactionCounts[userId].types.push(r.type);
      });

      Object.entries(userReactionCounts).forEach(([userId, data]) => {
        if (data.count > 1) {
          console.log(`       ⚠️  User ${userId.substring(0, 8)}... has ${data.count} reactions: ${data.types.join(', ')}`);
        } else {
          console.log(`       ✅ User ${userId.substring(0, 8)}... has ${data.count} reaction: ${data.types[0]}`);
        }
      });
    });

    // 5. Check for any user with multiple reactions on same post
    console.log('\n🚨 USERS WITH MULTIPLE REACTIONS ON SAME CONTENT:');
    const multiReactions = await Reaction.aggregate([
      {
        $group: {
          _id: { userId: '$userId', contentId: '$contentId', contentType: '$contentType' },
          count: { $sum: 1 },
          reactions: { $push: { type: '$reactionType', createdAt: '$createdAt' } }
        }
      },
      { $match: { count: { $gt: 1 } } },
      { $limit: 20 }
    ]);

    if (multiReactions.length === 0) {
      console.log('  ✅ No users have multiple reactions on same content!');
    } else {
      console.log(`  ⚠️  Found ${multiReactions.length} instances:`);
      multiReactions.forEach((item, i) => {
        console.log(`\n  ${i + 1}. User ${item._id.userId.toString().substring(0, 8)}...`);
        console.log(`     ${item._id.contentType} ID: ${item._id.contentId}`);
        console.log(`     Reactions: ${item.reactions.map(r => `${r.type} (${new Date(r.createdAt).toLocaleString()})`).join(', ')}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the check
checkReactionData();
