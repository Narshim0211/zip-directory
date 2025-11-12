/**
 * Backfill VisitorProfile records for users with role 'visitor'.
 * Run with: node scripts/backfillVisitorProfiles.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const VisitorProfile = require('../models/VisitorProfile');
const slugify = require('../utils/slugify');

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to Mongo');

  const visitors = await User.find({ role: 'visitor' });
  for (const u of visitors) {
    const existing = await VisitorProfile.findOne({ userId: u._id });
    if (existing) continue;

    const firstName = u.firstName || u.name || 'Visitor';
    const lastName = u.lastName || '';
    let handle = slugify(`${firstName} ${lastName}`) || `visitor-${u._id.toString().slice(-4)}`;
    let slug = handle;
    let i = 0;
    while (await VisitorProfile.findOne({ $or: [{ handle }, { slug }] })) {
      i += 1;
      handle = `${handle}-${i}`.slice(0, 30);
      slug = handle;
    }

    const profile = new VisitorProfile({
      userId: u._id,
      firstName: firstName || 'Visitor',
      lastName: lastName || '',
      handle,
      slug,
      needsCompletion: !(u.firstName && u.lastName),
    });
    await profile.save();
    console.log('Created VisitorProfile for', u.email || u._id.toString());
  }

  console.log('Backfill complete');
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
