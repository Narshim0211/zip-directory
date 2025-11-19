const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function setupUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const User = require('./backend/models/User');

    // Setup Owner
    const ownerEmail = 'owner-test@example.com';
    let owner = await User.findOne({ email: ownerEmail });
    if (owner) {
      owner.role = 'owner';
      await owner.save();
      console.log('✅ Updated existing user to owner role');
    } else {
      owner = await User.create({
        name: 'Owner Test',
        firstName: 'Owner',
        lastName: 'Test',
        email: ownerEmail,
        password: 'password123',
        role: 'owner'
      });
      console.log('✅ Created owner test user');
    }

    await mongoose.connection.close();
    console.log('\n🎉 Test users setup complete!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setupUsers();
