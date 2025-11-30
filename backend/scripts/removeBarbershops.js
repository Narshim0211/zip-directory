require('dotenv').config();
const mongoose = require('mongoose');
const Business = require('../models/Business');

async function removeBarbershops() {
  await mongoose.connect(process.env.MONGO_URI);

  // Check counts before
  const totalBefore = await Business.countDocuments();
  const barbershopCount = await Business.countDocuments({ category: 'Barbershop' });
  const salonCount = await Business.countDocuments({ category: 'Salon' });
  const spaCount = await Business.countDocuments({ category: 'Spa' });

  console.log('\n📊 BEFORE DELETION:');
  console.log('================================');
  console.log('   Total businesses:', totalBefore);
  console.log('   Barbershops:', barbershopCount);
  console.log('   Salons:', salonCount);
  console.log('   Spas:', spaCount);

  // Delete all barbershops
  console.log('\n🗑️  Deleting all Barbershops...');
  const deleteResult = await Business.deleteMany({ category: 'Barbershop' });
  console.log(`   Deleted: ${deleteResult.deletedCount} barbershops`);

  // Check counts after
  const totalAfter = await Business.countDocuments();
  const salonAfter = await Business.countDocuments({ category: 'Salon' });
  const spaAfter = await Business.countDocuments({ category: 'Spa' });

  console.log('\n📊 AFTER DELETION:');
  console.log('================================');
  console.log('   Total businesses:', totalAfter);
  console.log('   Salons:', salonAfter);
  console.log('   Spas:', spaAfter);

  await mongoose.disconnect();
  console.log('\n✅ Done! Only Salons and Spas remain.');
}

removeBarbershops().catch(console.error);
