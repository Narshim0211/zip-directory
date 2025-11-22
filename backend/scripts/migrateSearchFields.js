/**
 * Migration Script: Initialize Search Fields for Existing Businesses
 *
 * This script adds default values for the new search engine fields
 * to all existing businesses in the database.
 *
 * Run once after deploying Smart Search v1.0:
 * ```bash
 * node backend/scripts/migrateSearchFields.js
 * ```
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Business = require('../models/Business');

async function migrateSearchFields() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    // Get all businesses
    const businesses = await Business.find({});
    console.log(`📊 Found ${businesses.length} businesses to migrate`);

    let updated = 0;
    let skipped = 0;

    for (const business of businesses) {
      let needsUpdate = false;
      const updates = {};

      // Add serviceKeywords if missing (try to extract from existing data)
      if (!business.serviceKeywords || business.serviceKeywords.length === 0) {
        const keywords = [];

        // Extract from services array
        if (business.services && business.services.length > 0) {
          business.services.forEach(service => {
            if (service.name) {
              keywords.push(service.name.toLowerCase());
            }
          });
        }

        // Extract from specialties
        if (business.specialties && business.specialties.length > 0) {
          keywords.push(...business.specialties.map(s => s.toLowerCase()));
        }

        // Extract from category
        if (business.category) {
          keywords.push(business.category.toLowerCase());
        }

        if (keywords.length > 0) {
          updates.serviceKeywords = [...new Set(keywords)]; // Remove duplicates
          needsUpdate = true;
        }
      }

      // Add hours if missing (set to empty strings)
      if (!business.hours || Object.keys(business.hours).length === 0) {
        updates.hours = {
          mon: '',
          tue: '',
          wed: '',
          thu: '',
          fri: '',
          sat: '',
          sun: ''
        };
        needsUpdate = true;
      }

      // Set isOpenNow to false initially (cron will update)
      if (business.isOpenNow === undefined) {
        updates.isOpenNow = false;
        needsUpdate = true;
      }

      // Set default priceLevel if missing
      if (!business.priceLevel) {
        updates.priceLevel = 2; // Default to $$
        needsUpdate = true;
      }

      // Initialize viewsLast7Days
      if (business.viewsLast7Days === undefined) {
        updates.viewsLast7Days = 0;
        needsUpdate = true;
      }

      // Initialize verifiedBadges
      if (!business.verifiedBadges || business.verifiedBadges.length === 0) {
        updates.verifiedBadges = [];
        needsUpdate = true;
      }

      // Set default qualityScore if missing
      if (!business.qualityScore) {
        updates.qualityScore = 50; // Default mid-range
        needsUpdate = true;
      }

      // Apply updates if needed
      if (needsUpdate) {
        await Business.updateOne(
          { _id: business._id },
          { $set: updates }
        );
        updated++;

        if (updated % 10 === 0) {
          console.log(`⏳ Progress: ${updated}/${businesses.length} updated...`);
        }
      } else {
        skipped++;
      }
    }

    console.log('\n✅ Migration Complete!');
    console.log(`📊 Statistics:`);
    console.log(`   - Total businesses: ${businesses.length}`);
    console.log(`   - Updated: ${updated}`);
    console.log(`   - Skipped (already migrated): ${skipped}`);

    // Run the open now updater once
    console.log('\n🕐 Running initial "Open Now" calculation...');
    const { updateOpenStatus } = require('../lib/cron/updateOpenStatus');
    const cronResult = await updateOpenStatus();

    if (cronResult.success) {
      console.log(`✅ Open status updated:`);
      console.log(`   - Businesses now open: ${cronResult.businessesOpen}`);
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run migration
console.log('🚀 Starting Smart Search field migration...\n');
migrateSearchFields();
