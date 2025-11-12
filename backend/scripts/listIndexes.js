/**
 * List indexes for ownerprofiles collection to help resolve duplicate-index warnings.
 * Run: node scripts/listIndexes.js
 */
require('dotenv').config();
const mongoose = require('mongoose');

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to Mongo');
  const db = mongoose.connection.db;
  const coll = db.collection('ownerprofiles');
  const idx = await coll.indexes();
  console.log('Indexes for ownerprofiles:');
  console.dir(idx, { depth: null });
  await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
