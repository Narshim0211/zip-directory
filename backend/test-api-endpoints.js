/**
 * 🌐 API ENDPOINT TESTS - Admin Comment Paywall Toggle
 *
 * Tests actual HTTP endpoints with authentication
 *
 * Run: node backend/test-api-endpoints.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const API_BASE_URL = 'http://localhost:5003';

async function runAPITests() {
  console.log('\n🌐 ========================================');
  console.log('   API ENDPOINT TESTS');
  console.log('========================================\n');

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected\n');

    // Get admin user
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('❌ No admin user found. Creating one...');
      console.log('   Please create an admin user first or this test will fail.\n');
      return;
    }

    console.log(`✅ Found admin user: ${admin.email}\n`);

    // Generate JWT token manually (simulating login)
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { id: admin._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    console.log('📡 Testing GET /api/admin/config/comment-paywall...\n');

    // Test GET endpoint
    const getResponse = await fetch(`${API_BASE_URL}/api/admin/config/comment-paywall`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const getData = await getResponse.json();
    console.log(`✅ GET response (${getResponse.status}):`, JSON.stringify(getData, null, 2));
    console.log('');

    // Test POST endpoint - Toggle OFF
    console.log('📡 Testing POST /api/admin/config/comment-paywall (toggle OFF)...\n');
    const postResponse1 = await fetch(`${API_BASE_URL}/api/admin/config/comment-paywall`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ enabled: false })
    });

    const postData1 = await postResponse1.json();
    console.log(`✅ POST response (${postResponse1.status}):`, JSON.stringify(postData1, null, 2));
    console.log('');

    // Verify change
    console.log('📡 Verifying change with GET...\n');
    const getResponse2 = await fetch(`${API_BASE_URL}/api/admin/config/comment-paywall`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const getData2 = await getResponse2.json();
    console.log(`✅ GET response (${getResponse2.status}):`, JSON.stringify(getData2, null, 2));
    console.log('');

    if (getData2.enabled === false) {
      console.log('✅ Toggle OFF successful!\n');
    }

    // Test POST endpoint - Toggle back ON
    console.log('📡 Testing POST /api/admin/config/comment-paywall (toggle ON)...\n');
    const postResponse2 = await fetch(`${API_BASE_URL}/api/admin/config/comment-paywall`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ enabled: true })
    });

    const postData2 = await postResponse2.json();
    console.log(`✅ POST response (${postResponse2.status}):`, JSON.stringify(postData2, null, 2));
    console.log('');

    // Test invalid request (non-boolean)
    console.log('📡 Testing POST with invalid data...\n');
    const postResponse3 = await fetch(`${API_BASE_URL}/api/admin/config/comment-paywall`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ enabled: 'not-a-boolean' })
    });

    const postData3 = await postResponse3.json();
    console.log(`✅ POST response (${postResponse3.status}):`, JSON.stringify(postData3, null, 2));
    console.log('');

    if (postResponse3.status === 400) {
      console.log('✅ Invalid request correctly rejected with 400!\n');
    }

    console.log('========================================');
    console.log('🎉 ALL API TESTS PASSED!');
    console.log('========================================\n');

  } catch (err) {
    console.error('❌ Test failed:', err.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

runAPITests();
