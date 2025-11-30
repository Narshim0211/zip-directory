/**
 * Fix Business Moderation Status
 * Updates all businesses that have status: "approved" but missing moderationStatus
 * to set moderationStatus: "APPROVED"
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Business = require('../models/Business');

async function fixModerationStatus() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find businesses that are approved but missing moderationStatus
    const businessesToFix = await Business.find({
      status: 'approved',
      $or: [
        { moderationStatus: { $exists: false } },
        { moderationStatus: null },
        { moderationStatus: '' },
        { moderationStatus: { $ne: 'APPROVED' } }
      ]
    });

    console.log(`\nFound ${businessesToFix.length} businesses to fix:\n`);

    for (const biz of businessesToFix) {
      console.log(`- ${biz.name} (${biz.city}) | current moderationStatus: ${biz.moderationStatus || 'N/A'}`);
    }

    if (businessesToFix.length === 0) {
      console.log('All approved businesses already have correct moderationStatus!');
      process.exit(0);
    }

    // Update them
    const result = await Business.updateMany(
      {
        status: 'approved',
        $or: [
          { moderationStatus: { $exists: false } },
          { moderationStatus: null },
          { moderationStatus: '' },
          { moderationStatus: { $ne: 'APPROVED' } }
        ]
      },
      {
        $set: { moderationStatus: 'APPROVED' }
      }
    );

    console.log(`\n✅ Updated ${result.modifiedCount} businesses to moderationStatus: "APPROVED"`);

    // Verify the fix
    const allApproved = await Business.find({ status: 'approved', moderationStatus: 'APPROVED' });
    console.log(`\nNow showing ${allApproved.length} approved businesses in directory.`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixModerationStatus();
