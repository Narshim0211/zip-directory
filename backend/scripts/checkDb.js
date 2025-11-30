require('dotenv').config();
const mongoose = require('mongoose');
const Business = require('../models/Business');

async function check() {
  await mongoose.connect(process.env.MONGO_URI);

  const total = await Business.countDocuments();
  const approved = await Business.countDocuments({ status: 'approved' });
  const seeded = await Business.countDocuments({ 'metadata.source': 'google_places' });

  // Sample some businesses
  const samples = await Business.find({ 'metadata.source': 'google_places' })
    .select('name city category location')
    .limit(5)
    .lean();

  console.log('');
  console.log('📊 DATABASE STATUS:');
  console.log('================================');
  console.log('   Total businesses:', total);
  console.log('   Approved:', approved);
  console.log('   Seeded from Google Places:', seeded);
  console.log('');
  console.log('📍 Sample businesses saved:');
  samples.forEach((b, i) => {
    const hasCoords = b.location?.coordinates ? '✓' : '✗';
    console.log(`   ${i+1}. ${b.name} (${b.city}) [coords: ${hasCoords}]`);
  });
  console.log('');

  await mongoose.disconnect();
}

check().catch(console.error);
