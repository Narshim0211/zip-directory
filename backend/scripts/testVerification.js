/**
 * 🧪 AUTOMATED VERIFICATION SYSTEM TEST
 *
 * Tests all verification endpoints and logic
 * Run: node backend/scripts/testVerification.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Business = require('../models/Business');

// ANSI color codes for pretty output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

/**
 * Print test result
 */
function logTest(name, passed, message = '') {
  const status = passed
    ? `${colors.green}✓ PASS${colors.reset}`
    : `${colors.red}✗ FAIL${colors.reset}`;

  console.log(`  ${status} ${name}`);
  if (message) {
    console.log(`    ${colors.cyan}→${colors.reset} ${message}`);
  }

  results.tests.push({ name, passed, message });
  if (passed) results.passed++;
  else results.failed++;
}

/**
 * Print section header
 */
function logSection(title) {
  console.log(`\n${colors.bright}${colors.blue}━━━ ${title} ━━━${colors.reset}\n`);
}

/**
 * Main test suite
 */
async function runTests() {
  console.log(`\n${colors.bright}${colors.cyan}🧪 VERIFICATION SYSTEM TEST SUITE${colors.reset}`);
  console.log(`${colors.yellow}Starting automated tests...${colors.reset}\n`);

  let testBusiness = null;

  try {
    // Connect to MongoDB
    logSection('Database Connection');
    await mongoose.connect(process.env.MONGO_URI);
    logTest('MongoDB Connected', true, `Connected to ${mongoose.connection.name}`);

    // ========================================
    // TEST 1: Create Test Business
    // ========================================
    logSection('Test 1: Create Test Business');

    testBusiness = new Business({
      name: 'Test Salon - Verification Test',
      city: 'Dallas',
      state: 'TX',
      zip: '75001',
      address: '123 Test Street',
      category: 'Salon',
      phone: '555-0100',
      email: 'test@testsalon.com',
      description: 'This is a test business for verification system testing',
      location: {
        type: 'Point',
        coordinates: [-96.7970, 32.7767]
      }
    });

    await testBusiness.save();
    logTest('Test business created', true, `ID: ${testBusiness._id}`);

    // ========================================
    // TEST 2: Default Verification State
    // ========================================
    logSection('Test 2: Default Verification State');

    logTest(
      'Default verificationStatus is "unverified"',
      testBusiness.verificationStatus === 'unverified',
      `Status: ${testBusiness.verificationStatus}`
    );

    logTest(
      'All verificationSteps are false/0',
      !testBusiness.verificationSteps.emailVerified &&
      !testBusiness.verificationSteps.phoneVerified &&
      !testBusiness.verificationSteps.addressVerified &&
      testBusiness.verificationSteps.photosUploaded === 0 &&
      !testBusiness.verificationSteps.stripeConnected,
      'All steps unverified'
    );

    // ========================================
    // TEST 3: Profile Completion Calculation
    // ========================================
    logSection('Test 3: Profile Completion Calculation');

    const completion = testBusiness.calculateProfileCompletion();
    logTest(
      'calculateProfileCompletion() returns number',
      typeof completion === 'number',
      `Completion: ${completion}%`
    );

    logTest(
      'Profile completion is between 0-100',
      completion >= 0 && completion <= 100,
      `${completion}% (valid range)`
    );

    logTest(
      'Profile completion updated in verificationSteps',
      testBusiness.verificationSteps.profileCompleted === completion,
      `Stored: ${testBusiness.verificationSteps.profileCompleted}%`
    );

    // ========================================
    // TEST 4: Update Email Verification
    // ========================================
    logSection('Test 4: Update Email Verification');

    await testBusiness.updateVerificationStep('emailVerified', true);

    logTest(
      'Email verification updated',
      testBusiness.verificationSteps.emailVerified === true,
      'emailVerified: true'
    );

    logTest(
      'Status remains "unverified" (need 3+ steps)',
      testBusiness.verificationStatus === 'unverified',
      `Status: ${testBusiness.verificationStatus}`
    );

    // ========================================
    // TEST 5: Update Phone Verification
    // ========================================
    logSection('Test 5: Update Phone Verification');

    await testBusiness.updateVerificationStep('phoneVerified', true);

    logTest(
      'Phone verification updated',
      testBusiness.verificationSteps.phoneVerified === true,
      'phoneVerified: true'
    );

    logTest(
      'Status still "unverified" (only 2 steps)',
      testBusiness.verificationStatus === 'unverified',
      `Status: ${testBusiness.verificationStatus}`
    );

    // ========================================
    // TEST 6: Upgrade to "basic" Tier
    // ========================================
    logSection('Test 6: Upgrade to "basic" Tier');

    await testBusiness.updateVerificationStep('photosUploaded', 2);

    logTest(
      'Photos uploaded count updated',
      testBusiness.verificationSteps.photosUploaded === 2,
      'photosUploaded: 2'
    );

    logTest(
      'Status upgraded to "basic"',
      testBusiness.verificationStatus === 'basic',
      `✨ Status: ${testBusiness.verificationStatus}`
    );

    // ========================================
    // TEST 7: Additional Verification Steps
    // ========================================
    logSection('Test 7: Additional Verification Steps');

    await testBusiness.updateVerificationStep('addressVerified', true);

    logTest(
      'Address verified',
      testBusiness.verificationSteps.addressVerified === true,
      'addressVerified: true'
    );

    await testBusiness.updateVerificationStep('documentsUploaded', true);

    logTest(
      'Documents uploaded',
      testBusiness.verificationSteps.documentsUploaded === true,
      'documentsUploaded: true'
    );

    logTest(
      'Status still "basic" (waiting for Stripe)',
      testBusiness.verificationStatus === 'basic',
      `Status: ${testBusiness.verificationStatus}`
    );

    // ========================================
    // TEST 8: Upgrade to "fully_verified" Tier
    // ========================================
    logSection('Test 8: Upgrade to "fully_verified" Tier');

    await testBusiness.updateVerificationStep('stripeConnected', true);

    logTest(
      'Stripe connected',
      testBusiness.verificationSteps.stripeConnected === true,
      'stripeConnected: true'
    );

    logTest(
      'Status upgraded to "fully_verified"',
      testBusiness.verificationStatus === 'fully_verified',
      `🎉 Status: ${testBusiness.verificationStatus}`
    );

    // ========================================
    // TEST 9: Verification Tier Calculation Logic
    // ========================================
    logSection('Test 9: Verification Tier Calculation Logic');

    const currentTier = testBusiness.calculateVerificationTier();

    logTest(
      'calculateVerificationTier() returns correct tier',
      currentTier === 'fully_verified',
      `Calculated tier: ${currentTier}`
    );

    // Count steps
    const steps = testBusiness.verificationSteps;
    let stepCount = 0;
    if (steps.emailVerified) stepCount++;
    if (steps.phoneVerified) stepCount++;
    if (steps.addressVerified) stepCount++;
    if (steps.photosUploaded >= 2) stepCount++;
    if (steps.stripeConnected) stepCount++;
    if (steps.documentsUploaded) stepCount++;

    logTest(
      'Step count is 6+ for fully_verified',
      stepCount >= 6,
      `Steps completed: ${stepCount}/7`
    );

    // ========================================
    // TEST 10: Downgrade Test (Remove Stripe)
    // ========================================
    logSection('Test 10: Downgrade Test');

    await testBusiness.updateVerificationStep('stripeConnected', false);

    logTest(
      'Stripe disconnected',
      testBusiness.verificationSteps.stripeConnected === false,
      'stripeConnected: false'
    );

    logTest(
      'Status downgraded to "basic"',
      testBusiness.verificationStatus === 'basic',
      `Status: ${testBusiness.verificationStatus}`
    );

    // Restore Stripe for cleanup
    await testBusiness.updateVerificationStep('stripeConnected', true);

    // ========================================
    // TEST 11: Error Handling
    // ========================================
    logSection('Test 11: Error Handling');

    let errorThrown = false;
    try {
      await testBusiness.updateVerificationStep('invalidStep', true);
    } catch (error) {
      errorThrown = true;
    }

    logTest(
      'Invalid step throws error',
      errorThrown,
      'Error correctly thrown for invalid step'
    );

    // ========================================
    // TEST 12: toFullProfileJSON includes verification
    // ========================================
    logSection('Test 12: Profile JSON Output');

    const profileJSON = testBusiness.toFullProfileJSON();

    logTest(
      'toFullProfileJSON includes verificationStatus',
      profileJSON.hasOwnProperty('verificationStatus'),
      `verificationStatus: ${profileJSON.verificationStatus}`
    );

    logTest(
      'toFullProfileJSON includes verificationSteps',
      profileJSON.hasOwnProperty('verificationSteps'),
      'verificationSteps object present'
    );

    // ========================================
    // CLEANUP: Delete Test Business
    // ========================================
    logSection('Cleanup');

    await Business.findByIdAndDelete(testBusiness._id);
    logTest('Test business deleted', true, 'Cleanup successful');

  } catch (error) {
    console.error(`\n${colors.red}${colors.bright}✗ TEST ERROR:${colors.reset}`, error.message);
    console.error(error.stack);
    results.failed++;
  } finally {
    // Close database connection
    await mongoose.connection.close();
    logTest('Database connection closed', true);
  }

  // ========================================
  // FINAL RESULTS
  // ========================================
  console.log(`\n${colors.bright}${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.bright}📊 TEST RESULTS${colors.reset}\n`);

  const total = results.passed + results.failed;
  const percentage = total > 0 ? Math.round((results.passed / total) * 100) : 0;

  console.log(`  Total Tests: ${total}`);
  console.log(`  ${colors.green}✓ Passed: ${results.passed}${colors.reset}`);
  console.log(`  ${colors.red}✗ Failed: ${results.failed}${colors.reset}`);
  console.log(`  Success Rate: ${percentage}%\n`);

  if (results.failed === 0) {
    console.log(`${colors.green}${colors.bright}🎉 ALL TESTS PASSED! 🎉${colors.reset}\n`);
    console.log(`${colors.cyan}✅ Verification system is working correctly!${colors.reset}`);
    console.log(`${colors.cyan}✅ Ready to proceed with Phase 4 (OTP Integration)${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`${colors.red}${colors.bright}❌ SOME TESTS FAILED${colors.reset}\n`);
    console.log(`${colors.yellow}Please review the failed tests above.${colors.reset}\n`);
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
