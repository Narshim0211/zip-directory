const axios = require('axios');

// Use port 5000 by default
const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  magenta: '\x1b[35m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.magenta}━━━ ${msg} ━━━${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
};

// Test data
let authToken = null;
let testUserId = null;
let testOwnerId = null;

async function loginAsOwner() {
  log.section('Authentication Test');
  try {
    // Try to login with owner credentials (adjust as needed)
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'owner@test.com',
      password: 'password123'
    });
    
    authToken = response.data.token;
    testOwnerId = response.data.user._id;
    log.success(`Logged in as owner: ${response.data.user.name} (${testOwnerId})`);
    return true;
  } catch (error) {
    const errorMsg = error.code === 'ECONNREFUSED' 
      ? `Cannot connect to ${BASE_URL}` 
      : (error.response?.data?.message || error.message);
    log.warning(`Could not login as owner: ${errorMsg}`);
    log.info('Will test endpoints without authentication');
    return false;
  }
}

async function testUserStatsEndpoint() {
  log.section('User Stats API Test');
  
  if (!testOwnerId) {
    log.warning('Skipping - no authenticated user');
    return;
  }

  try {
    const response = await axios.get(`${BASE_URL}/api/v1/users/${testOwnerId}/stats`);
    
    if (response.data.success && response.data.stats) {
      log.success('User stats endpoint working!');
      console.log('  Stats:', JSON.stringify(response.data.stats, null, 2));
    } else {
      log.error('Unexpected response format');
    }
  } catch (error) {
    log.error(`User stats failed: ${error.response?.data?.message || error.message}`);
  }
}

async function testOwnerFeedEndpoint() {
  log.section('Owner Feed API Test');
  
  if (!authToken) {
    log.warning('Skipping - no auth token');
    return;
  }

  try {
    const response = await axios.get(`${BASE_URL}/api/v1/feed/owner`, {
      params: { limit: 10 },
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.data.success) {
      log.success('Owner feed endpoint working!');
      console.log(`  Items returned: ${response.data.items?.length || 0}`);
      if (response.data.items?.length > 0) {
        console.log(`  First item type: ${response.data.items[0].type}`);
      }
    } else {
      log.error('Unexpected response format');
    }
  } catch (error) {
    log.error(`Owner feed failed: ${error.response?.data?.message || error.message}`);
  }
}

async function testPublicFeedEndpoint() {
  log.section('Public Feed API Test');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/v1/feed`, {
      params: { limit: 10 }
    });
    
    if (response.data.success) {
      log.success('Public feed endpoint working!');
      console.log(`  Items returned: ${response.data.items?.length || 0}`);
    } else {
      log.error('Unexpected response format');
    }
  } catch (error) {
    log.error(`Public feed failed: ${error.response?.data?.message || error.message}`);
  }
}

async function testCreatePost() {
  log.section('Create Post API Test');
  
  if (!authToken) {
    log.warning('Skipping - no auth token');
    return;
  }

  try {
    const response = await axios.post(
      `${BASE_URL}/api/v1/owner/posts`,
      {
        text: 'Test post from Owner Home Page implementation',
        visibility: 'public'
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    if (response.data.success || response.data.post) {
      log.success('Create post endpoint working!');
      console.log(`  Post ID: ${response.data.post?._id || response.data._id}`);
    } else {
      log.error('Unexpected response format');
    }
  } catch (error) {
    log.error(`Create post failed: ${error.response?.data?.message || error.message}`);
  }
}

async function testCreateSurvey() {
  log.section('Create Survey API Test');
  
  if (!authToken) {
    log.warning('Skipping - no auth token');
    return;
  }

  try {
    const response = await axios.post(
      `${BASE_URL}/api/v1/owner/surveys`,
      {
        question: 'Test survey from Owner Home Page?',
        options: [
          { id: 'opt-1', label: 'Yes' },
          { id: 'opt-2', label: 'No' }
        ],
        visibility: 'public'
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    if (response.data.success || response.data.survey) {
      log.success('Create survey endpoint working!');
      console.log(`  Survey ID: ${response.data.survey?._id || response.data._id}`);
    } else {
      log.error('Unexpected response format');
    }
  } catch (error) {
    log.error(`Create survey failed: ${error.response?.data?.message || error.message}`);
  }
}

async function testServerHealth() {
  log.section('Server Health Check');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/health`);
    log.success('Server is healthy');
  } catch (error) {
    // If no health endpoint, just check if server is reachable
    try {
      await axios.get(`${BASE_URL}/api/auth/check`);
      log.success('Server is reachable');
    } catch {
      log.error('Server is not reachable');
    }
  }
}

async function runAllTests() {
  console.log('\n╔═══════════════════════════════════════════╗');
  console.log('║   Owner Home Page - API Testing Suite    ║');
  console.log('╚═══════════════════════════════════════════╝\n');
  
  await testServerHealth();
  await loginAsOwner();
  await testUserStatsEndpoint();
  await testPublicFeedEndpoint();
  await testOwnerFeedEndpoint();
  await testCreatePost();
  await testCreateSurvey();
  
  console.log('\n' + '═'.repeat(45));
  console.log('Testing complete!');
  console.log('═'.repeat(45) + '\n');
  
  if (!authToken) {
    log.warning('Some tests were skipped due to missing authentication');
    log.info('To run full tests, ensure an owner account exists:');
    log.info('  Email: owner@test.com');
    log.info('  Password: password123');
  }
}

// Run tests
runAllTests().catch(error => {
  log.error(`Test suite failed: ${error.message}`);
  process.exit(1);
});
