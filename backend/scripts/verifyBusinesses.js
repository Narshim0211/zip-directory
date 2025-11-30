/**
 * Verify Businesses Script
 * Quick check to see what businesses remain after cleanup
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Business = require('../models/Business');

async function verify() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');

    // Get sample of business names
    const businesses = await Business.find({}).select('name category city').limit(30);

    console.log('Sample of remaining businesses:');
    console.log('================================');
    businesses.forEach(b => console.log(`  ${b.name} (${b.category}) - ${b.city}`));

    // Count by category
    const categories = await Business.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('\nBusinesses by category:');
    console.log('=======================');
    categories.forEach(c => console.log(`  ${c._id}: ${c.count}`));

    // Count by city
    const cities = await Business.aggregate([
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('\nBusinesses by city:');
    console.log('===================');
    cities.forEach(c => console.log(`  ${c._id}: ${c.count}`));

    // Total
    const total = await Business.countDocuments();
    console.log(`\nTotal businesses: ${total}`);

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

verify();
