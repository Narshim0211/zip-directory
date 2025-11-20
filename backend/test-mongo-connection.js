require('dotenv').config();
const mongoose = require('mongoose');

console.log('MONGO_URI from .env:', process.env.MONGO_URI);
console.log('\nAttempting to connect to MongoDB...\n');

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Atlas connected successfully!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

// Timeout after 15 seconds
setTimeout(() => {
  console.error('❌ Connection timeout after 15 seconds');
  process.exit(1);
}, 15000);
