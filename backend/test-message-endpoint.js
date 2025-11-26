/**
 * Test script to verify chat messaging endpoint
 * Usage: node test-message-endpoint.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api';

// Test user tokens (replace with actual tokens from your logged-in users)
const OWNER_TOKEN = 'YOUR_OWNER_TOKEN_HERE';
const TEST_PAYLOAD = {
  threadType: 'owner',
  ownerId: '6914351ce4a41bf4cbf6e73a', // Replace with actual target user ID
  text: 'Test message from script',
  photoUrl: ''
};

async function testMessageEndpoint() {
  console.log('🧪 Testing message endpoint...\n');

  // Test 1: Check if endpoint exists
  console.log('Test 1: Checking endpoint availability');
  console.log(`URL: ${BASE_URL}/v1/messages/send`);

  try {
    const response = await axios.post(`${BASE_URL}/v1/messages/send`, TEST_PAYLOAD, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OWNER_TOKEN}`
      }
    });

    console.log('✅ SUCCESS!');
    console.log('Response:', response.data);
  } catch (error) {
    console.log('❌ ERROR!');
    console.log('Status:', error.response?.status);
    console.log('Message:', error.response?.data?.message || error.message);
    console.log('Full error:', error.response?.data);
  }
}

// Test without auth to see what happens
async function testWithoutAuth() {
  console.log('\n🧪 Testing without authentication...\n');

  try {
    const response = await axios.post(`${BASE_URL}/v1/messages/send`, TEST_PAYLOAD);
    console.log('Response:', response.data);
  } catch (error) {
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data?.message || error.message);
  }
}

// Test if route exists (OPTIONS request)
async function testRouteExists() {
  console.log('\n🧪 Testing if route exists (OPTIONS)...\n');

  try {
    const response = await axios.options(`${BASE_URL}/v1/messages/send`);
    console.log('✅ Route exists!');
    console.log('Status:', response.status);
  } catch (error) {
    console.log('Status:', error.response?.status);
    console.log('Error:', error.message);
  }
}

console.log('='.repeat(60));
console.log('CHAT MESSAGING ENDPOINT TEST');
console.log('='.repeat(60));

testRouteExists()
  .then(() => testWithoutAuth())
  .then(() => {
    console.log('\n📝 To test with authentication, add your token to this script');
    console.log('Get token from localStorage in browser console:');
    console.log('  localStorage.getItem("token")');
  });
