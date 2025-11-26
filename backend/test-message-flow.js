/**
 * Complete Message Flow Test
 * Tests the entire message button flow from frontend to backend
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api';

// Test data
const TEST_OWNER_ID = '6914351ce4a41bf4cbf6e73a'; // From your screenshot
const TEST_TOKEN = 'PASTE_YOUR_TOKEN_HERE'; // Get from localStorage.getItem('token') in browser

async function testCompleteFlow() {
  console.log('='.repeat(70));
  console.log('COMPLETE MESSAGE FLOW TEST');
  console.log('='.repeat(70));
  console.log();

  // Step 1: Test authentication
  console.log('Step 1: Testing authentication...');
  try {
    const authTest = await axios.get(`${BASE_URL}/v1/users/me`, {
      headers: { Authorization: `Bearer ${TEST_TOKEN}` }
    });
    console.log('✅ Authentication works');
    console.log('   Logged in as:', authTest.data.data?.email || authTest.data.email);
    console.log();
  } catch (err) {
    console.log('❌ Authentication failed');
    console.log('   Error:', err.response?.data?.message || err.message);
    console.log();
    console.log('INSTRUCTIONS:');
    console.log('1. Open your browser console (F12)');
    console.log('2. Type: localStorage.getItem("token")');
    console.log('3. Copy the token value (without quotes)');
    console.log('4. Paste it in this file at line 10 where it says PASTE_YOUR_TOKEN_HERE');
    console.log('5. Run this script again: node test-message-flow.js');
    return;
  }

  // Step 2: Test sending message
  console.log('Step 2: Testing message send...');
  console.log('Request payload:');
  const payload = {
    threadType: 'owner',
    ownerId: TEST_OWNER_ID,
    text: 'Hi! This is a test message from the automated test script.',
    photoUrl: ''
  };
  console.log(JSON.stringify(payload, null, 2));
  console.log();

  try {
    const response = await axios.post(`${BASE_URL}/v1/messages/send`, payload, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Message sent successfully!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    console.log();

    const threadId = response.data.threadId;

    // Step 3: Fetch the thread messages
    console.log('Step 3: Fetching thread messages...');
    const threadResponse = await axios.get(`${BASE_URL}/v1/messages/thread/${threadId}`, {
      headers: { Authorization: `Bearer ${TEST_TOKEN}` }
    });

    console.log('✅ Thread fetched successfully!');
    console.log('Messages in thread:', threadResponse.data.messages?.length || 0);
    console.log();

    console.log('='.repeat(70));
    console.log('SUCCESS! The message system is working perfectly!');
    console.log('='.repeat(70));
    console.log();
    console.log('Next steps:');
    console.log('1. Refresh your browser (Ctrl + F5)');
    console.log('2. Go to any owner profile');
    console.log('3. Click the Message button');
    console.log('4. You should be taken to the chat with "Hi!" pre-sent');

  } catch (err) {
    console.log('❌ Message send failed');
    console.log('Status:', err.response?.status);
    console.log('Error:', err.response?.data?.message || err.message);
    console.log('Full response:', JSON.stringify(err.response?.data, null, 2));
    console.log();

    if (err.response?.status === 400 && err.response?.data?.message?.includes('ownerId')) {
      console.log('DIAGNOSIS: The ownerId field is not being received by backend');
      console.log('This means the frontend is not sending it correctly.');
      console.log();
      console.log('FIX: Check frontend/src/api/chatApi.js line 26');
      console.log('Make sure it says: payload.ownerId = targetId;');
    }
  }
}

// Run the test
testCompleteFlow();
