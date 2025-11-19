/**
 * Quick database check for testing
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

async function checkDatabase() {
  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    console.log('MongoDB URI:', uri ? 'Found' : 'Not found');
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB\n');

    // Check collections
    const db = mongoose.connection.db;
    
    const usersCount = await db.collection('users').countDocuments();
    const postsCount = await db.collection('posts').countDocuments();
    const surveysCount = await db.collection('surveys').countDocuments();
    const ownerFollowsCount = await db.collection('ownerfollows').countDocuments();
    const visitorFollowsCount = await db.collection('visitorfollows').countDocuments();

    console.log('📊 Database Status:');
    console.log(`   Users: ${usersCount}`);
    console.log(`   Posts: ${postsCount}`);
    console.log(`   Surveys: ${surveysCount}`);
    console.log(`   Owner Follows: ${ownerFollowsCount}`);
    console.log(`   Visitor Follows: ${visitorFollowsCount}\n`);

    // Get sample users
    const owners = await db.collection('users').find({ role: 'owner' }).limit(3).toArray();
    const visitors = await db.collection('users').find({ role: 'visitor' }).limit(3).toArray();

    if (owners.length > 0) {
      console.log('👔 Sample Owners:');
      owners.forEach((o, i) => {
        console.log(`   ${i + 1}. ${o.firstName} ${o.lastName} (${o.email})`);
      });
      console.log('');
    } else {
      console.log('⚠️  No owners found - you may need to create test accounts\n');
    }

    if (visitors.length > 0) {
      console.log('👤 Sample Visitors:');
      visitors.forEach((v, i) => {
        console.log(`   ${i + 1}. ${v.firstName} ${v.lastName} (${v.email})`);
      });
      console.log('');
    } else {
      console.log('⚠️  No visitors found - you may need to create test accounts\n');
    }

    // Get sample content
    const recentPosts = await db.collection('posts').find().sort({ createdAt: -1 }).limit(2).toArray();
    const recentSurveys = await db.collection('surveys').find().sort({ createdAt: -1 }).limit(2).toArray();

    if (recentPosts.length > 0) {
      console.log('📝 Recent Posts:');
      recentPosts.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.title || 'Untitled'} - ${new Date(p.createdAt).toLocaleDateString()}`);
      });
      console.log('');
    }

    if (recentSurveys.length > 0) {
      console.log('📊 Recent Surveys:');
      recentSurveys.forEach((s, i) => {
        console.log(`   ${i + 1}. ${s.question} - ${new Date(s.createdAt).toLocaleDateString()}`);
      });
      console.log('');
    }

    await mongoose.connection.close();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkDatabase();
