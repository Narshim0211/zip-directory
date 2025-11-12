/**
 * Quick integration test for ownerProfileService.updateFeatured
 * - Creates a temporary user
 * - Inserts one business owned by the user and one not owned
 * - Verifies updateFeatured accepts owned business and rejects non-owned
 * Run: node scripts/testOwnerProfileService.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const assert = require('assert');
const User = require('../models/User');
const OwnerProfile = require('../models/OwnerProfile');
const ownerService = require('../services/owner/ownerProfileService');

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to Mongo');

  const db = mongoose.connection.db;

  // create a temp user
  const testEmail = `test.owner.${Date.now()}@example.com`;
  const user = await User.create({ email: testEmail, password: 'pass123', role: 'owner', name: 'Test Owner', firstName: 'Test', lastName: 'Owner' });
  console.log('Created user', user._id.toString());

  // ensure owner profile exists
  const profile = await ownerService.ensureProfileForUser(user);
  console.log('Ensured profile', profile._id.toString());

  // insert two businesses: one owned by this user, one owned by another
  const owned = await db.collection('businesses').insertOne({ name: 'Owned Biz', city: 'Testville', category: 'Salon', ownerId: user._id, createdAt: new Date(), updatedAt: new Date() });
  const other = await db.collection('businesses').insertOne({ name: 'Other Biz', city: 'Elsewhere', category: 'Spa', ownerId: new mongoose.Types.ObjectId(), createdAt: new Date(), updatedAt: new Date() });
  console.log('Inserted businesses', owned.insertedId.toString(), other.insertedId.toString());

  // Happy path: updateFeatured with owned business
  const updated = await ownerService.updateFeatured(user._id, [owned.insertedId]);
  assert(updated.featuredBusinesses && updated.featuredBusinesses.length === 1, 'featuredBusinesses should contain one item');
  console.log('✓ Happy path passed: owned business accepted');

  // Negative path: try to set featured to a business not owned
  let threw = false;
  try {
    await ownerService.updateFeatured(user._id, [other.insertedId]);
  } catch (err) {
    threw = true;
    if (!err.message || !err.message.toLowerCase().includes('invalid')) {
      console.error('Unexpected error message:', err.message);
      throw err;
    }
    console.log('✓ Negative path passed: non-owned business rejected with error:', err.message);
  }
  if (!threw) throw new Error('Expected updateFeatured to throw for non-owned business');

  // cleanup
  await OwnerProfile.deleteOne({ _id: profile._id });
  await User.deleteOne({ _id: user._id });
  await db.collection('businesses').deleteOne({ _id: owned.insertedId });
  await db.collection('businesses').deleteOne({ _id: other.insertedId });

  console.log('\n✓ All tests passed\n');
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(async (err) => {
  console.error('✗ Test failed:', err.message || err);
  try { await mongoose.disconnect(); } catch (e) {}
  process.exit(1);
});
