/**
 * Drop index by name on ownerprofiles collection.
 * Usage: node scripts/dropOwnerProfileIndex.js <indexName>
 */
require('dotenv').config();
const mongoose = require('mongoose');

async function main() {
  const idxName = process.argv[2];
  if (!idxName) {
    console.error('Index name required. Usage: node scripts/dropOwnerProfileIndex.js <indexName>');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to Mongo');
  const db = mongoose.connection.db;
  const coll = db.collection('ownerprofiles');
  console.log('Dropping index', idxName);
  try {
    await coll.dropIndex(idxName);
    console.log('Dropped', idxName);
  } catch (e) {
    console.error('Failed to drop index:', e.message || e);
  }
  await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
