/**
 * Cleanup Unwanted Businesses Script
 *
 * Removes massages, wellness centers, barbershops, and other non-beauty businesses
 * Keeps: salons, spas, nail salons, beauty salons/studios, threading, waxing, lash, brow studios
 *
 * Usage: node scripts/cleanupUnwantedBusinesses.js [--dry-run]
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Business = require('../models/Business');

const DRY_RUN = process.argv.includes('--dry-run');

// Keywords to DELETE (case-insensitive)
const DELETE_KEYWORDS = [
  // Massage & Wellness
  'massage',
  'wellness',
  'massage spa',
  'massage therapy',
  'foot spa',
  'reflexology',
  'acupuncture',
  'chiropractor',
  'physical therapy',
  'cryotherapy',
  'cryo',
  'float therapy',
  'meditation',
  'yoga',
  'fitness',
  'gym',
  'workout',
  'weight loss',

  // Barbershops
  'barber',
  'barbershop',
  'barber shop',
  'barberia',
  'cuts',
  'kutz',
  'fade',
  'haircut',

  // Medical/Dermatology
  'dermatology',
  'medical spa',
  'medspa',
  'med spa',
  'doctor',
  'clinic',
  'hospital',

  // Misc to remove
  'planet fitness',
  'anytime fitness',
  'supply',
  'beauty supply',
  'boutique',
  'painted tree',
  'retail',
  'store',
  'tanning', // Remove standalone tanning
  'tan salon',
  'airbrush tan',
  'spray tan'
];

// Keywords to KEEP (these will NOT be deleted even if they match delete keywords)
const KEEP_KEYWORDS = [
  'salon',
  'spa',
  'nail',
  'beauty salon',
  'beauty studio',
  'beauty bar',
  'hair salon',
  'hair studio',
  'threading',
  'waxing',
  'lash',
  'lashes',
  'brow',
  'brows',
  'eyebrow',
  'esthetics',
  'esthetician',
  'facial',
  'skin care',
  'skincare'
];

async function shouldDelete(business) {
  const name = business.name.toLowerCase();
  const category = (business.category || '').toLowerCase();
  const description = (business.description || '').toLowerCase();

  // Check if business has keep keywords (prioritize keeping)
  for (const keep of KEEP_KEYWORDS) {
    if (name.includes(keep) || category.includes(keep)) {
      // Only keep if it's truly a salon/spa type
      // Exception: if it's "barbershop" with "salon" it should still be deleted
      if (!DELETE_KEYWORDS.some(del => name.includes(del) && del.includes('barber'))) {
        return { delete: false, reason: `Has keep keyword: ${keep}` };
      }
    }
  }

  // Check if business matches delete keywords
  for (const del of DELETE_KEYWORDS) {
    if (name.includes(del)) {
      return { delete: true, reason: `Matches delete keyword: ${del}` };
    }
  }

  // If category suggests it's not a salon/spa type
  if (category && !KEEP_KEYWORDS.some(k => category.includes(k))) {
    // Check if it's a wellness/massage category
    if (category.includes('wellness') || category.includes('massage')) {
      return { delete: true, reason: `Category: ${category}` };
    }
  }

  return { delete: false, reason: 'No match found' };
}

async function cleanup() {
  console.log('\n===========================================');
  console.log('Business Cleanup Script');
  console.log('===========================================');

  if (DRY_RUN) {
    console.log('MODE: DRY RUN (no changes will be made)\n');
  } else {
    console.log('MODE: LIVE DELETE\n');
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');

    // Get all businesses
    const businesses = await Business.find({});
    console.log(`Total businesses in database: ${businesses.length}\n`);

    const toDelete = [];
    const toKeep = [];

    for (const business of businesses) {
      const result = await shouldDelete(business);
      if (result.delete) {
        toDelete.push({ business, reason: result.reason });
      } else {
        toKeep.push(business);
      }
    }

    console.log('===========================================');
    console.log('DELETION PREVIEW');
    console.log('===========================================');
    console.log(`Will DELETE: ${toDelete.length} businesses`);
    console.log(`Will KEEP: ${toKeep.length} businesses`);
    console.log('');

    // Group deletions by reason
    const deletionsByReason = {};
    for (const item of toDelete) {
      if (!deletionsByReason[item.reason]) {
        deletionsByReason[item.reason] = [];
      }
      deletionsByReason[item.reason].push(item.business.name);
    }

    console.log('Deletions by category:');
    for (const [reason, names] of Object.entries(deletionsByReason)) {
      console.log(`\n  ${reason}: ${names.length} businesses`);
      // Show first 5 examples
      names.slice(0, 5).forEach(name => {
        console.log(`    - ${name}`);
      });
      if (names.length > 5) {
        console.log(`    ... and ${names.length - 5} more`);
      }
    }

    if (!DRY_RUN) {
      console.log('\n===========================================');
      console.log('EXECUTING DELETION...');
      console.log('===========================================');

      const ids = toDelete.map(item => item.business._id);
      const result = await Business.deleteMany({ _id: { $in: ids } });

      console.log(`\nDeleted ${result.deletedCount} businesses`);

      // Verify counts
      const finalCount = await Business.countDocuments();
      console.log(`Remaining businesses: ${finalCount}`);
    }

    // Show summary by city
    console.log('\n===========================================');
    console.log('REMAINING BUSINESS BREAKDOWN BY CITY');
    console.log('===========================================');

    const cities = ['North Richland Hills', 'Hurst', 'Colleyville'];
    for (const city of cities) {
      const count = DRY_RUN
        ? toKeep.filter(b => b.city === city).length
        : await Business.countDocuments({ city });
      console.log(`  ${city}: ${count} businesses`);
    }

    await mongoose.disconnect();
    console.log('\nDone!');

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

cleanup();
