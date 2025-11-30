/**
 * Check all businesses in database and their visibility status
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

async function checkBusinesses() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');

    const Business = require('../models/Business');

    // Get all businesses with their status
    const businesses = await Business.find({})
      .select('name status moderationStatus isHidden isDeleted createdAt owner city category')
      .lean();

    console.log('=== ALL BUSINESSES IN DATABASE ===');
    console.log('Total:', businesses.length);
    console.log('');

    businesses.forEach((b, i) => {
      console.log((i + 1) + '. ' + b.name);
      console.log('   Status: ' + b.status + ' | Moderation: ' + b.moderationStatus);
      console.log('   Hidden: ' + b.isHidden + ' | Deleted: ' + b.isDeleted);
      console.log('   City: ' + b.city + ' | Category: ' + b.category);
      console.log('   Created: ' + b.createdAt);
      console.log('');
    });

    // Count by status
    const approved = businesses.filter(b => b.status === 'approved').length;
    const pending = businesses.filter(b => b.status === 'pending').length;
    const rejected = businesses.filter(b => b.status === 'rejected').length;

    console.log('=== STATUS BREAKDOWN ===');
    console.log('Approved:', approved);
    console.log('Pending:', pending);
    console.log('Rejected:', rejected);

    // Show which ones would appear in explore
    console.log('\n=== VISIBLE IN EXPLORE (status=approved) ===');
    const visible = businesses.filter(b => b.status === 'approved' && !b.isHidden && !b.isDeleted);
    if (visible.length === 0) {
      console.log('NONE - No approved businesses!');
    } else {
      visible.forEach(b => console.log('- ' + b.name));
    }

    // Show pending ones
    console.log('\n=== PENDING APPROVAL ===');
    const pendingList = businesses.filter(b => b.status === 'pending');
    if (pendingList.length === 0) {
      console.log('NONE');
    } else {
      pendingList.forEach(b => console.log('- ' + b.name + ' (ID: ' + b._id + ')'));
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

checkBusinesses();
