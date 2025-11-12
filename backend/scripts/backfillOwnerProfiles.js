/**
 * Backfill OwnerProfile records for users with role 'owner'.
 * Run with: node scripts/backfillOwnerProfiles.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const OwnerProfile = require('../models/OwnerProfile');
const slugify = require('../utils/slugify');

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to Mongo');

  const owners = await User.find({ role: 'owner' });
  for (const u of owners) {
    const existing = await OwnerProfile.findOne({ userId: u._id });
    if (existing) continue;

    const firstName = u.firstName || u.name || 'Owner';
    const lastName = u.lastName || '';
    let base = slugify(`${firstName} ${lastName}`) || `owner-${u._id.toString().slice(-4)}`;
    let handle = base;
    let slug = base;
    let i = 0;
    while (await OwnerProfile.findOne({ $or: [{ handle }, { slug }] })) {
      i += 1;
      handle = `${base}-${i}`.slice(0, 30);
      slug = handle;
    }

    const profile = new OwnerProfile({
      userId: u._id,
      firstName: firstName || 'Owner',
      lastName: lastName || '',
      handle,
      slug,
      needsCompletion: !(u.firstName && u.lastName),
    });
    await profile.save();
    console.log('Created OwnerProfile for', u.email || u._id.toString());
  }

  console.log('Backfill complete');
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
/**
 * Backfill OwnerProfile records for users with role 'owner'.
 * Run with: node scripts/backfillOwnerProfiles.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const OwnerProfile = require('../models/OwnerProfile');
const slugify = require('../utils/slugify');

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to Mongo');

  const owners = await User.find({ role: 'owner' });
  for (const u of owners) {
    const existing = await OwnerProfile.findOne({ userId: u._id });
    if (existing) continue;

    const firstName = u.firstName || u.name || 'Owner';
    const lastName = u.lastName || '';
    let handle = slugify(`${firstName} ${lastName}`) || `owner-${u._id.toString().slice(-4)}`;
    let slug = handle;
    let i = 0;
    while (await OwnerProfile.findOne({ $or: [{ handle }, { slug }] })) {
      i += 1;
      handle = `${handle}-${i}`.slice(0, 30);
      slug = handle;
    }

    const profile = new OwnerProfile({
      userId: u._id,
      firstName: firstName || 'Owner',
      lastName: lastName || '',
      handle,
      slug,
      needsCompletion: !(u.firstName && u.lastName),
    });
    await profile.save();
    console.log('Created OwnerProfile for', u.email || u._id.toString());
  }

  console.log('Backfill complete');
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
