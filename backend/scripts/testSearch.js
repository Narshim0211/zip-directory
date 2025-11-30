require('dotenv').config();
const mongoose = require('mongoose');
const Business = require('../models/Business');

async function testSearch() {
  await mongoose.connect(process.env.MONGO_URI);

  console.log('\n🔍 TEST 1: Search for "salon"...');
  const salonResults = await Business.find({
    status: 'approved',
    $or: [
      { name: /salon/i },
      { city: /salon/i },
      { category: /salon/i },
    ],
  }).limit(5).lean();
  console.log(`   Found: ${salonResults.length} results`);
  salonResults.forEach((b, i) => console.log(`   ${i+1}. ${b.name} (${b.category})`));

  console.log('\n🔍 TEST 2: Search for "barber"...');
  const barberResults = await Business.find({
    status: 'approved',
    $or: [
      { name: /barber/i },
      { city: /barber/i },
      { category: /barber/i },
    ],
  }).limit(5).lean();
  console.log(`   Found: ${barberResults.length} results`);
  barberResults.forEach((b, i) => console.log(`   ${i+1}. ${b.name} (${b.category})`));

  console.log('\n🔍 TEST 3: Search for "braids"...');
  const braidResults = await Business.find({
    status: 'approved',
    $or: [
      { name: /braids/i },
      { city: /braids/i },
      { category: /braids/i },
    ],
  }).limit(5).lean();
  console.log(`   Found: ${braidResults.length} results`);
  braidResults.forEach((b, i) => console.log(`   ${i+1}. ${b.name} (${b.category})`));

  console.log('\n🔍 TEST 4: Search for ZIP "76107"...');
  const zipResults = await Business.find({
    status: 'approved',
    zip: '76107',
  }).limit(5).lean();
  console.log(`   Found: ${zipResults.length} results`);

  console.log('\n🔍 TEST 5: Search for "Fort Worth"...');
  const cityResults = await Business.find({
    status: 'approved',
    $or: [
      { name: /fort worth/i },
      { city: /fort worth/i },
      { category: /fort worth/i },
    ],
  }).limit(5).lean();
  console.log(`   Found: ${cityResults.length} results`);
  cityResults.forEach((b, i) => console.log(`   ${i+1}. ${b.name} (${b.city})`));

  await mongoose.disconnect();
  console.log('\n✅ All search tests complete!');
}

testSearch().catch(console.error);
