/**
 * 🧪 CHAT SYSTEM - HTTP API TESTING SCRIPT
 *
 * Tests the complete chat system via HTTP endpoints
 * Run: node test-chat-api.js
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  test: (msg) => console.log(`${colors.cyan}🧪 ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  step: (msg) => console.log(`${colors.magenta}👉 ${msg}${colors.reset}`),
};

// Test data
let visitorToken = '';
let freeOwnerToken = '';
let premiumOwnerToken = '';
let premiumBusinessId = '';
let threadId = '';

/**
 * Login as a user and get JWT token
 */
async function login(email, password) {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });
    return response.data.token;
  } catch (error) {
    throw new Error(`Login failed: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Create test accounts if they don't exist
 */
async function setupTestAccounts() {
  log.info('Setting up test accounts...');

  try {
    // Try to register visitor
    try {
      await axios.post(`${API_URL}/auth/register`, {
        name: 'Test Visitor',
        email: 'test.visitor@salonhub.com',
        password: 'password123',
        role: 'visitor',
      });
      log.success('Created test visitor account');
    } catch (err) {
      if (err.response?.status === 400) {
        log.info('Visitor account already exists');
      }
    }

    // Try to register free owner
    try {
      await axios.post(`${API_URL}/auth/register`, {
        name: 'Free Owner',
        email: 'test.owner.free@salonhub.com',
        password: 'password123',
        role: 'owner',
      });
      log.success('Created free owner account');
    } catch (err) {
      if (err.response?.status === 400) {
        log.info('Free owner account already exists');
      }
    }

    // Try to register premium owner
    try {
      await axios.post(`${API_URL}/auth/register`, {
        name: 'Premium Owner',
        email: 'test.owner.premium@salonhub.com',
        password: 'password123',
        role: 'owner',
      });
      log.success('Created premium owner account');
    } catch (err) {
      if (err.response?.status === 400) {
        log.info('Premium owner account already exists');
      }
    }

    // Login all accounts
    log.step('Logging in test accounts...');
    visitorToken = await login('test.visitor@salonhub.com', 'password123');
    log.success('Visitor logged in');

    freeOwnerToken = await login('test.owner.free@salonhub.com', 'password123');
    log.success('Free owner logged in');

    premiumOwnerToken = await login('test.owner.premium@salonhub.com', 'password123');
    log.success('Premium owner logged in');

  } catch (error) {
    log.error(`Setup failed: ${error.message}`);
    throw error;
  }
}

/**
 * Get or create a premium business for testing
 */
async function getPremiumBusiness() {
  log.step('Getting premium business for testing...');

  try {
    // Get owner's business
    const response = await axios.get(`${API_URL}/owner/business`, {
      headers: { Authorization: `Bearer ${premiumOwnerToken}` }
    });

    if (response.data && response.data._id) {
      premiumBusinessId = response.data._id;
      log.success(`Found business: ${response.data.name} (${premiumBusinessId})`);

      // Check if it's premium
      const isPremium = response.data.listingType === 'premium' &&
                       response.data.premiumSubscription?.active === true;

      if (isPremium) {
        log.success('Business is already premium');
      } else {
        log.warn('Business is not premium - some tests may fail');
        log.info('To test fully, upgrade this business to premium via the UI');
      }

      return premiumBusinessId;
    }
  } catch (error) {
    log.error(`Failed to get business: ${error.response?.data?.message || error.message}`);
    log.warn('Some tests will be skipped without a business');
  }
}

/**
 * TEST 1: Visitor sends first free message
 */
async function testVisitorSendFirstMessage() {
  log.test('TEST 1: Visitor sends first free message');

  try {
    const response = await axios.post(
      `${API_URL}/v1/messages/visitor/send`,
      {
        businessId: premiumBusinessId,
        text: 'Hi! I would like to book a consultation for next week.',
        photoUrl: '',
      },
      {
        headers: { Authorization: `Bearer ${visitorToken}` }
      }
    );

    if (response.data.success) {
      threadId = response.data.threadId;
      log.success(`First message sent successfully! Thread ID: ${threadId}`);
      log.info(`Message ID: ${response.data.messageId}`);
      return true;
    }
  } catch (error) {
    log.error(`Failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

/**
 * TEST 2: Visitor tries to send second message (should fail without chat pass)
 */
async function testVisitorSendSecondMessage() {
  log.test('TEST 2: Visitor tries to send second message without Chat Pass');

  try {
    await axios.post(
      `${API_URL}/v1/messages/visitor/send`,
      {
        businessId: premiumBusinessId,
        text: 'This should be blocked without chat pass!',
        photoUrl: '',
      },
      {
        headers: { Authorization: `Bearer ${visitorToken}` }
      }
    );

    log.error('Second message was allowed - SHOULD HAVE BEEN BLOCKED!');
    return false;
  } catch (error) {
    if (error.response?.status === 403 && error.response?.data?.requiresPayment) {
      log.success('Second message correctly blocked - Chat Pass required ✅');
      log.info(`Reason: ${error.response.data.message}`);
      return true;
    } else {
      log.error(`Unexpected error: ${error.response?.data?.message || error.message}`);
      return false;
    }
  }
}

/**
 * TEST 3: Get visitor inbox
 */
async function testGetVisitorInbox() {
  log.test('TEST 3: Get visitor inbox');

  try {
    const response = await axios.get(
      `${API_URL}/v1/messages/visitor/inbox`,
      {
        headers: { Authorization: `Bearer ${visitorToken}` }
      }
    );

    if (response.data.success) {
      log.success(`Inbox loaded: ${response.data.threads.length} thread(s)`);

      if (response.data.threads.length > 0) {
        const thread = response.data.threads[0];
        log.info(`Latest thread with: ${thread.business?.name || 'Business'}`);
        log.info(`Unread count: ${thread.unreadCount}`);
        log.info(`Has blurred replies: ${thread.hasBlurredReplies ? 'Yes 🔒' : 'No'}`);
      }
      return true;
    }
  } catch (error) {
    log.error(`Failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

/**
 * TEST 4: Premium owner replies to visitor
 */
async function testPremiumOwnerReply() {
  log.test('TEST 4: Premium owner replies to message');

  if (!threadId) {
    log.warn('No thread ID - skipping test');
    return false;
  }

  try {
    const response = await axios.post(
      `${API_URL}/v1/messages/owner/reply`,
      {
        threadId: threadId,
        text: 'Thanks for reaching out! I have availability next Tuesday at 2pm.',
      },
      {
        headers: { Authorization: `Bearer ${premiumOwnerToken}` }
      }
    );

    if (response.data.success) {
      log.success('Owner reply sent successfully!');
      log.info(`Message ID: ${response.data.messageId}`);
      log.info(`Auto-blurred for visitor: ${response.data.isBlurred ? 'Yes 🔒' : 'No'}`);
      return true;
    }
  } catch (error) {
    if (error.response?.status === 403 && error.response?.data?.requiresUpgrade) {
      log.warn('Owner needs premium subscription to reply');
      log.info('This business is not premium - upgrade via UI to test');
      return false;
    }
    log.error(`Failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

/**
 * TEST 5: Free owner tries to reply (should fail)
 */
async function testFreeOwnerReply() {
  log.test('TEST 5: Free owner tries to reply (should be blocked)');

  if (!threadId) {
    log.warn('No thread ID - skipping test');
    return false;
  }

  try {
    await axios.post(
      `${API_URL}/v1/messages/owner/reply`,
      {
        threadId: threadId,
        text: 'This should be blocked!',
      },
      {
        headers: { Authorization: `Bearer ${freeOwnerToken}` }
      }
    );

    log.error('Free owner was allowed to reply - SHOULD HAVE BEEN BLOCKED!');
    return false;
  } catch (error) {
    if (error.response?.status === 403) {
      log.success('Free owner correctly blocked - Premium required ✅');
      log.info(`Reason: ${error.response.data.message}`);
      return true;
    } else {
      log.error(`Unexpected error: ${error.response?.data?.message || error.message}`);
      return false;
    }
  }
}

/**
 * TEST 6: Get thread messages
 */
async function testGetThreadMessages() {
  log.test('TEST 6: Get thread messages');

  if (!threadId) {
    log.warn('No thread ID - skipping test');
    return false;
  }

  try {
    const response = await axios.get(
      `${API_URL}/v1/messages/thread/${threadId}`,
      {
        headers: { Authorization: `Bearer ${visitorToken}` }
      }
    );

    if (response.data.success) {
      log.success(`Loaded ${response.data.messages.length} message(s)`);

      response.data.messages.forEach((msg, idx) => {
        const sender = msg.senderRole === 'visitor' ? 'You' : 'Business';
        const text = msg.isBlurred ? '🔒 [LOCKED]' : msg.text;
        log.info(`${idx + 1}. ${sender}: ${text}`);
      });

      const blurredCount = response.data.messages.filter(m => m.isBlurred).length;
      if (blurredCount > 0) {
        log.warn(`${blurredCount} message(s) are blurred - Chat Pass needed to read`);
      }

      return true;
    }
  } catch (error) {
    log.error(`Failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

/**
 * TEST 7: Get owner inbox
 */
async function testGetOwnerInbox() {
  log.test('TEST 7: Get owner inbox');

  try {
    const response = await axios.get(
      `${API_URL}/v1/messages/owner/inbox`,
      {
        headers: { Authorization: `Bearer ${premiumOwnerToken}` }
      }
    );

    if (response.data.success) {
      log.success(`Owner inbox loaded: ${response.data.threads.length} thread(s)`);

      if (response.data.threads.length > 0) {
        const thread = response.data.threads[0];
        log.info(`Latest thread with: ${thread.visitor?.name || 'Visitor'}`);
        log.info(`Unread count: ${thread.unreadCount}`);
      }
      return true;
    }
  } catch (error) {
    log.error(`Failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

/**
 * TEST 8: Get Chat Pass status
 */
async function testGetChatPassStatus() {
  log.test('TEST 8: Get Chat Pass status');

  try {
    const response = await axios.get(
      `${API_URL}/v1/subscriptions/chat-pass/status`,
      {
        headers: { Authorization: `Bearer ${visitorToken}` }
      }
    );

    if (response.data.success) {
      log.success('Chat Pass status loaded');
      log.info(`Has Chat Pass: ${response.data.hasChatPass ? 'Yes ✅' : 'No ❌'}`);
      log.info(`In Grace Period: ${response.data.inGracePeriod ? 'Yes' : 'No'}`);

      if (response.data.hasChatPass && response.data.expiresAt) {
        log.info(`Expires: ${new Date(response.data.expiresAt).toLocaleDateString()}`);
      }

      return true;
    }
  } catch (error) {
    log.error(`Failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log('\n' + '='.repeat(60));
  log.info('🚀 CHAT SYSTEM API TESTING');
  console.log('='.repeat(60) + '\n');

  const results = [];

  try {
    // Setup
    await setupTestAccounts();
    await getPremiumBusiness();

    if (!premiumBusinessId) {
      log.error('Cannot continue without a business - please create one via UI');
      process.exit(1);
    }

    console.log('\n' + '-'.repeat(60) + '\n');

    // Run tests
    results.push({ name: 'Visitor send first message', passed: await testVisitorSendFirstMessage() });
    console.log('');

    results.push({ name: 'Visitor send second message (blocked)', passed: await testVisitorSendSecondMessage() });
    console.log('');

    results.push({ name: 'Get visitor inbox', passed: await testGetVisitorInbox() });
    console.log('');

    results.push({ name: 'Premium owner reply', passed: await testPremiumOwnerReply() });
    console.log('');

    results.push({ name: 'Free owner reply (blocked)', passed: await testFreeOwnerReply() });
    console.log('');

    results.push({ name: 'Get thread messages', passed: await testGetThreadMessages() });
    console.log('');

    results.push({ name: 'Get owner inbox', passed: await testGetOwnerInbox() });
    console.log('');

    results.push({ name: 'Get Chat Pass status', passed: await testGetChatPassStatus() });
    console.log('');

    // Summary
    console.log('\n' + '='.repeat(60));
    log.info('📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(60) + '\n');

    const passed = results.filter(r => r.passed).length;
    const total = results.length;

    results.forEach((result, idx) => {
      const status = result.passed ? colors.green + '✅ PASS' : colors.red + '❌ FAIL';
      console.log(`${idx + 1}. ${result.name}: ${status}${colors.reset}`);
    });

    console.log('\n' + '-'.repeat(60));
    const successRate = ((passed / total) * 100).toFixed(0);
    const color = passed === total ? colors.green : passed > total / 2 ? colors.yellow : colors.red;
    console.log(`${color}${passed}/${total} tests passed (${successRate}%)${colors.reset}`);
    console.log('='.repeat(60) + '\n');

    // Next steps
    if (passed === total) {
      log.success('All tests passed! ✅');
      log.info('Next steps:');
      log.step('1. Test the UI flows in the browser');
      log.step('2. Test Chat Pass checkout with Stripe');
      log.step('3. Test on mobile devices');
    } else {
      log.warn('Some tests failed - review errors above');
      log.info('Note: Some failures may be expected if business is not premium');
    }

    process.exit(passed === total ? 0 : 1);

  } catch (error) {
    log.error(`Test suite failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Run tests
runAllTests();
