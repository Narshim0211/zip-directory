/**
 * Check for existing owner accounts
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function checkOwners() {
  try {
    console.log('\n🔍 Checking for owner accounts...\n');
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const Owner = mongoose.model('Owner', new mongoose.Schema({}, { strict: false }));
    const Business = mongoose.model('Business', new mongoose.Schema({}, { strict: false }));

    const owners = await Owner.find().select('email name isEmailVerified').limit(5);
    const businesses = await Business.find().select('name bookingSlug services staff allowCustomerChooseStaff').limit(5);

    console.log(`📊 Found ${owners.length} owner(s):`);
    owners.forEach((owner, idx) => {
      console.log(`   ${idx + 1}. Email: ${owner.email}`);
      console.log(`      Name: ${owner.name || 'Not set'}`);
      console.log(`      Verified: ${owner.isEmailVerified ? 'Yes' : 'No'}`);
      console.log('');
    });

    console.log(`\n📊 Found ${businesses.length} business(es):`);
    businesses.forEach((business, idx) => {
      console.log(`   ${idx + 1}. Name: ${business.name || 'Not set'}`);
      console.log(`      Booking Slug: ${business.bookingSlug || 'Not set'}`);
      console.log(`      Services: ${business.services?.length || 0}`);
      console.log(`      Staff: ${business.staff?.length || 0}`);
      console.log(`      Allow Customer Choose Staff: ${business.allowCustomerChooseStaff || false}`);
      console.log('');
    });

    if (owners.length > 0 && businesses.length > 0) {
      console.log('✅ Ready for testing!');
      console.log(`\n📝 Test credentials:`);
      console.log(`   Email: ${owners[0].email}`);
      console.log(`   Booking Slug: ${businesses[0].bookingSlug || 'not-set'}`);
      console.log(`   Services Available: ${businesses[0].services?.length || 0}`);
      console.log('\n📝 Update test-staff-booking-api.js line 21-22 with your owner credentials\n');
    } else {
      console.log('⚠️  No owners or businesses found. Please:');
      console.log('   1. Register a new owner account via API or frontend');
      console.log('   2. Create a business profile');
      console.log('   3. Add at least one service\n');
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkOwners();
