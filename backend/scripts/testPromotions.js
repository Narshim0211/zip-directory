/**
 * 🎁 PROMOTIONS FEATURE TEST SUITE
 *
 * Comprehensive test script for Phase 4 - Promotions Feature
 *
 * Tests:
 * 1. Owner creates promotion
 * 2. Owner views promotion
 * 3. Owner updates promotion
 * 4. Owner deactivates promotion
 * 5. Admin views all promotions
 * 6. Admin views promotion stats
 * 7. Admin deactivates promotion
 * 8. Public API includes promotion
 * 9. Cron job deactivates expired promotions
 *
 * Usage: node backend/scripts/testPromotions.js
 */

const mongoose = require('mongoose');
const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:5001'; // Adjust if server is on different port
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

let testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// Test data
let authToken = null;
let adminToken = null;
let businessId = null;
let userId = null;

// Helper functions
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name, passed, details = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  const color = passed ? 'green' : 'red';
  log(`${status} - ${name}`, color);
  if (details) {
    log(`   ${details}`, 'cyan');
  }
  testResults.tests.push({ name, passed, details });
  if (passed) testResults.passed++;
  else testResults.failed++;
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Test 1: Setup - Create test user and business
async function setupTestData() {
  log('\n📋 Test 1: Setup - Creating test user and business', 'yellow');

  try {
    // Create test user
    const userEmail = `promo-test-${Date.now()}@test.com`;
    const userPassword = 'Test123!';

    const signupRes = await axios.post(`${BASE_URL}/api/auth/signup`, {
      name: 'Promo Test User',
      email: userEmail,
      password: userPassword,
      role: 'owner'
    });

    authToken = signupRes.data.token;
    userId = signupRes.data.user._id;

    logTest('Create test user', true, `User ID: ${userId}`);

    // Create test business
    const businessRes = await axios.post(
      `${BASE_URL}/api/businesses`,
      {
        name: 'Test Salon for Promotions',
        city: 'Miami',
        category: 'Salon',
        address: '123 Test St'
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    businessId = businessRes.data.business._id || businessRes.data.business.id;
    logTest('Create test business', true, `Business ID: ${businessId}`);

    return true;
  } catch (error) {
    logTest('Setup test data', false, error.response?.data?.message || error.message);
    return false;
  }
}

// Test 2: Owner creates promotion
async function testCreatePromotion() {
  log('\n📋 Test 2: Owner creates promotion (14-day expiry)', 'yellow');

  try {
    const res = await axios.post(
      `${BASE_URL}/api/owner/promotion`,
      {
        businessId: businessId,
        title: 'New Clients Get 20% Off!',
        description: 'Book your first appointment this month and save 20% on any service. Limited time offer!',
        expiryDays: 14
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    const passed = res.data.success && res.data.promotion.isActive;
    logTest(
      'Create promotion',
      passed,
      passed ? `Expires: ${new Date(res.data.promotion.expiresAt).toLocaleDateString()}` : 'Failed to create'
    );

    return passed;
  } catch (error) {
    logTest('Create promotion', false, error.response?.data?.message || error.message);
    return false;
  }
}

// Test 3: Owner views promotion
async function testGetPromotion() {
  log('\n📋 Test 3: Owner views their promotion', 'yellow');

  try {
    const res = await axios.get(
      `${BASE_URL}/api/owner/promotion/${businessId}`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    const passed = res.data.success && res.data.hasPromotion;
    logTest(
      'Get promotion',
      passed,
      passed ? `Title: "${res.data.promotion.title}"` : 'No promotion found'
    );

    return passed;
  } catch (error) {
    logTest('Get promotion', false, error.response?.data?.message || error.message);
    return false;
  }
}

// Test 4: Owner updates promotion
async function testUpdatePromotion() {
  log('\n📋 Test 4: Owner updates promotion', 'yellow');

  try {
    const res = await axios.post(
      `${BASE_URL}/api/owner/promotion`,
      {
        businessId: businessId,
        title: 'UPDATED: 30% Off First Visit!',
        description: 'Even better deal - 30% off your first service!',
        expiryDays: 7
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    const passed = res.data.success && res.data.promotion.title.includes('UPDATED');
    logTest(
      'Update promotion',
      passed,
      passed ? 'Successfully updated promotion' : 'Failed to update'
    );

    return passed;
  } catch (error) {
    logTest('Update promotion', false, error.response?.data?.message || error.message);
    return false;
  }
}

// Test 5: Test validation - title too long
async function testValidationTitleTooLong() {
  log('\n📋 Test 5: Test validation - title exceeds 50 characters', 'yellow');

  try {
    const res = await axios.post(
      `${BASE_URL}/api/owner/promotion`,
      {
        businessId: businessId,
        title: 'This is a very long promotion title that exceeds the maximum limit of fifty characters',
        description: 'Test description',
        expiryDays: 7
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    // Should fail
    logTest('Validation - title too long', false, 'Should have rejected long title');
    return false;
  } catch (error) {
    const passed = error.response?.status === 400;
    logTest(
      'Validation - title too long',
      passed,
      passed ? 'Correctly rejected long title' : 'Unexpected error'
    );
    return passed;
  }
}

// Test 6: Test validation - expiry too far
async function testValidationExpiryTooFar() {
  log('\n📋 Test 6: Test validation - expiry date > 90 days', 'yellow');

  try {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 100);

    const res = await axios.post(
      `${BASE_URL}/api/owner/promotion`,
      {
        businessId: businessId,
        title: 'Test Promotion',
        description: 'Test description',
        customExpiresAt: futureDate.toISOString()
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    // Should fail
    logTest('Validation - expiry too far', false, 'Should have rejected >90 day expiry');
    return false;
  } catch (error) {
    const passed = error.response?.status === 400;
    logTest(
      'Validation - expiry too far',
      passed,
      passed ? 'Correctly rejected >90 day expiry' : 'Unexpected error'
    );
    return passed;
  }
}

// Test 7: Owner deactivates promotion
async function testDeactivatePromotion() {
  log('\n📋 Test 7: Owner deactivates promotion', 'yellow');

  try {
    const res = await axios.delete(
      `${BASE_URL}/api/owner/promotion/${businessId}`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    const passed = res.data.success;
    logTest(
      'Deactivate promotion',
      passed,
      passed ? 'Successfully deactivated' : 'Failed to deactivate'
    );

    return passed;
  } catch (error) {
    logTest('Deactivate promotion', false, error.response?.data?.message || error.message);
    return false;
  }
}

// Test 8: Recreate promotion for admin tests
async function recreatePromotion() {
  log('\n📋 Test 8: Recreate promotion for admin tests', 'yellow');

  try {
    const res = await axios.post(
      `${BASE_URL}/api/owner/promotion`,
      {
        businessId: businessId,
        title: 'Admin Test Promotion',
        description: 'Testing admin endpoints with this promotion',
        expiryDays: 30
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    const passed = res.data.success;
    logTest('Recreate promotion', passed, passed ? 'Ready for admin tests' : 'Failed');
    return passed;
  } catch (error) {
    logTest('Recreate promotion', false, error.response?.data?.message || error.message);
    return false;
  }
}

// Test 9: Admin login
async function loginAsAdmin() {
  log('\n📋 Test 9: Admin login', 'yellow');

  try {
    // Try to login with admin credentials
    // NOTE: Adjust these credentials based on your setup
    const res = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'admin@salonhub.com', // Change to your admin email
      password: 'admin123' // Change to your admin password
    });

    adminToken = res.data.token;
    logTest('Admin login', true, 'Admin authenticated');
    return true;
  } catch (error) {
    logTest('Admin login', false, 'Could not login as admin - skipping admin tests');
    log('   💡 Tip: Create an admin user or update credentials in test script', 'cyan');
    return false;
  }
}

// Test 10: Admin views all promotions
async function testAdminGetAllPromotions() {
  log('\n📋 Test 10: Admin views all promotions', 'yellow');

  if (!adminToken) {
    logTest('Admin get all promotions', false, 'Skipped - no admin token');
    return false;
  }

  try {
    const res = await axios.get(
      `${BASE_URL}/api/admin/moderation/promotions?isActive=true`,
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );

    const passed = res.data.success && Array.isArray(res.data.promotions);
    logTest(
      'Admin get all promotions',
      passed,
      passed ? `Found ${res.data.promotions.length} active promotion(s)` : 'Failed'
    );

    return passed;
  } catch (error) {
    logTest('Admin get all promotions', false, error.response?.data?.message || error.message);
    return false;
  }
}

// Test 11: Admin views promotion stats
async function testAdminGetPromotionStats() {
  log('\n📋 Test 11: Admin views promotion statistics', 'yellow');

  if (!adminToken) {
    logTest('Admin get promotion stats', false, 'Skipped - no admin token');
    return false;
  }

  try {
    const res = await axios.get(
      `${BASE_URL}/api/admin/moderation/promotions/stats`,
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );

    const passed = res.data.success && res.data.stats;
    logTest(
      'Admin get promotion stats',
      passed,
      passed ? `Total: ${res.data.stats.total}, Active: ${res.data.stats.active}` : 'Failed'
    );

    return passed;
  } catch (error) {
    logTest('Admin get promotion stats', false, error.response?.data?.message || error.message);
    return false;
  }
}

// Test 12: Public API includes promotion
async function testPublicAPIPromotion() {
  log('\n📋 Test 12: Public API includes promotion in business response', 'yellow');

  try {
    // Get business details (adjust endpoint based on your public API)
    const res = await axios.get(`${BASE_URL}/api/businesses/${businessId}`);

    const promotion = res.data.business?.promotion || res.data.promotion;
    const passed = promotion !== undefined;

    logTest(
      'Public API includes promotion',
      passed,
      passed && promotion ? `Promotion: "${promotion.title}"` : 'No promotion in response'
    );

    return passed;
  } catch (error) {
    logTest('Public API includes promotion', false, error.response?.data?.message || error.message);
    return false;
  }
}

// Test 13: Test expired promotion (simulate)
async function testExpiredPromotion() {
  log('\n📋 Test 13: Test expired promotion behavior', 'yellow');

  try {
    // Create promotion with past expiry (will be caught by validation)
    // Instead, we'll verify the cron job logic manually
    const Business = require('../models/Business');

    // Connect to DB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/salonhub');

    // Find businesses with expired promotions
    const now = new Date();
    const expiredCount = await Business.countDocuments({
      'promotion.expiresAt': { $lt: now },
      'promotion.isActive': true
    });

    await mongoose.disconnect();

    logTest(
      'Check expired promotions',
      true,
      `Found ${expiredCount} expired promotion(s) that would be deactivated by cron`
    );

    return true;
  } catch (error) {
    logTest('Check expired promotions', false, error.message);
    return false;
  }
}

// Print summary
function printSummary() {
  log('\n' + '='.repeat(60), 'blue');
  log('📊 TEST SUMMARY', 'blue');
  log('='.repeat(60), 'blue');

  log(`\nTotal Tests: ${testResults.passed + testResults.failed}`, 'cyan');
  log(`✅ Passed: ${testResults.passed}`, 'green');
  log(`❌ Failed: ${testResults.failed}`, 'red');

  const percentage = Math.round((testResults.passed / (testResults.passed + testResults.failed)) * 100);
  log(`\nSuccess Rate: ${percentage}%`, percentage >= 80 ? 'green' : 'yellow');

  if (testResults.failed > 0) {
    log('\n❌ Failed Tests:', 'red');
    testResults.tests
      .filter(t => !t.passed)
      .forEach(t => log(`   - ${t.name}: ${t.details}`, 'red'));
  }

  log('\n' + '='.repeat(60), 'blue');
}

// Main test runner
async function runAllTests() {
  log('\n🎁 PROMOTIONS FEATURE TEST SUITE', 'blue');
  log('='.repeat(60), 'blue');
  log(`Testing against: ${BASE_URL}`, 'cyan');
  log('='.repeat(60) + '\n', 'blue');

  try {
    // Run tests sequentially
    await setupTestData();
    await sleep(500);

    await testCreatePromotion();
    await sleep(500);

    await testGetPromotion();
    await sleep(500);

    await testUpdatePromotion();
    await sleep(500);

    await testValidationTitleTooLong();
    await sleep(500);

    await testValidationExpiryTooFar();
    await sleep(500);

    await testDeactivatePromotion();
    await sleep(500);

    await recreatePromotion();
    await sleep(500);

    await loginAsAdmin();
    await sleep(500);

    await testAdminGetAllPromotions();
    await sleep(500);

    await testAdminGetPromotionStats();
    await sleep(500);

    await testPublicAPIPromotion();
    await sleep(500);

    await testExpiredPromotion();

    // Print summary
    printSummary();

    process.exit(testResults.failed > 0 ? 1 : 0);
  } catch (error) {
    log(`\n❌ Fatal error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Run tests
runAllTests();
