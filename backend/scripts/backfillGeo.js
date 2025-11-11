/*
  Backfill geocoding for existing businesses lacking location coordinates.
  Usage: npm run backfill:geo
*/
const mongoose = require('mongoose');
require('dotenv').config();

const Business = require('../models/Business');
const geocodeLocation = require('../config/openCage');

async function sleep(ms) { return new Promise(res => setTimeout(res, ms)); }

async function run() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI missing');
  if (!process.env.OPENCAGE_API_KEY) {
    console.warn('OPENCAGE_API_KEY missing; cannot geocode. Exiting.');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const cursor = Business.find({}).cursor();
  let processed = 0, updated = 0, skipped = 0, failed = 0;
  for await (const b of cursor) {
    processed += 1;
    const hasCoords = b.location && Array.isArray(b.location.coordinates) && b.location.coordinates.length === 2;
    if (hasCoords) { skipped += 1; continue; }

    const fullAddress = [b.address, b.city, b.zip].filter(Boolean).join(', ');
    if (!fullAddress) { skipped += 1; continue; }

    try {
      const coords = await geocodeLocation(fullAddress);
      if (!coords) { failed += 1; continue; }
      b.location = { type: 'Point', coordinates: [coords.lng, coords.lat] };
      await b.save();
      updated += 1;
    } catch (e) {
      failed += 1;
    }
    // Respect OpenCage free tier: ~1 rq/s
    await sleep(1100);
  }

  console.log(JSON.stringify({ processed, updated, skipped, failed }));
  await mongoose.disconnect();
}

run().catch(async (e) => {
  console.error(e);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});

