/**
 * Quick Invite System Test Script
 * Tests the invite API endpoints directly
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000';

// You'll need to replace this with a real JWT token from your browser
// 1. Open browser console
// 2. Type: localStorage.getItem('token')
// 3. Copy the token value
const AUTH_TOKEN = 'YOUR_JWT_TOKEN_HERE';

async function testInviteSystem() {
  console.log('🧪 Testing SalonHub Invite System...\n');

  // Test 1: Send an invite
  console.log('📧 Test 1: Sending invite...');
  try {
    const response = await axios.post(
      `${API_URL}/api/invite`,
      {
        recipientEmail: 'test@example.com',
        message: 'Check out SalonHub!'
      },
      {
        headers: {
          Authorization: `Bearer ${AUTH_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Success! Invite sent:');
    console.log(JSON.stringify(response.data, null, 2));
    console.log('\n');
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    console.log('\n');
  }

  // Test 2: Get invite stats
  console.log('📊 Test 2: Getting invite stats...');
  try {
    const response = await axios.get(`${API_URL}/api/invite/stats`, {
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`
      }
    });

    console.log('✅ Success! Your stats:');
    console.log(JSON.stringify(response.data, null, 2));
    console.log('\n');
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    console.log('\n');
  }

  // Test 3: Get invite history
  console.log('📜 Test 3: Getting invite history...');
  try {
    const response = await axios.get(`${API_URL}/api/invite/history`, {
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`
      }
    });

    console.log('✅ Success! Recent invites:');
    console.log(JSON.stringify(response.data, null, 2));
    console.log('\n');
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    console.log('\n');
  }

  console.log('🎉 Test complete!');
  console.log('\nNext steps:');
  console.log('1. Check your email inbox for the invite');
  console.log('2. Click the invite link');
  console.log('3. Verify it lands on /signup?ref=INVITE_ID');
}

// Run tests
testInviteSystem().catch(console.error);
