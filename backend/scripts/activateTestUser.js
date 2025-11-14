/**
 * Manual User Activation Script
 * Use this to activate a test user's subscription without waiting for Stripe webhook
 * 
 * Usage:
 * node backend/scripts/activateTestUser.js "user@example.com"
 */

const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');

async function activateUser(email) {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.error('❌ User not found with email:', email);
      process.exit(1);
    }
    
    console.log('📧 Found user:', user.email);
    console.log('Current subscription status:', user.subscriptionStatus);
    
    // Update subscription
    user.subscriptionStatus = 'active';
    user.subscriptionPlan = 'premium';
    user.subscriptionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    // Save
    await user.save();
    
    console.log('✅ User subscription activated!');
    console.log({
      email: user.email,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionPlan: user.subscriptionPlan,
      subscriptionExpiresAt: user.subscriptionExpiresAt
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Get email from command line
const email = process.argv[2];

if (!email) {
  console.error('❌ Usage: node activateTestUser.js "user@example.com"');
  process.exit(1);
}

activateUser(email);
