/**
 * Feedback API Testing Script
 * Tests all feedback endpoints: Visitor, Owner, and Admin
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

let testResults = {
  passed: 0,
  failed: 0,
  skipped: 0
};

// Store tokens and IDs for cross-test usage
let visitorToken = null;
let ownerToken = null;
let adminToken = null;
let visitorFeedbackId = null;
let ownerFeedbackId = null;

/**
 * Test helper functions
 */
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName) {
  console.log(`\n${'='.repeat(60)}`);
  log(`🧪 TEST: ${testName}`, 'cyan');
  console.log('='.repeat(60));
}

function logSuccess(message) {
  testResults.passed++;
  log(`✅ PASS: ${message}`, 'green');
}

function logError(message, error) {
  testResults.failed++;
  log(`❌ FAIL: ${message}`, 'red');
  if (error?.response?.data) {
    console.log('   Response:', error.response.data);
  } else if (error?.message) {
    console.log('   Error:', error.message);
  }
}

function logSkip(message) {
  testResults.skipped++;
  log(`⏭️  SKIP: ${message}`, 'yellow');
}

/**
 * Step 1: Create test users and get tokens
 */
async function setupTestUsers() {
  logTest('Setup: Create Test Users & Get Tokens');

  try {
    // Try to login first (if users exist)
    try {
      const visitorLogin = await axios.post(`${API_BASE}/auth/login`, {
        email: 'visitor-test@example.com',
        password: 'password123'
      });
      visitorToken = visitorLogin.data.token;
      logSuccess('Visitor token obtained (existing user)');
    } catch {
      // User doesn't exist, create new one
      const visitorRegister = await axios.post(`${API_BASE}/auth/register`, {
        firstName: 'Visitor',
        lastName: 'Test',
        email: 'visitor-test@example.com',
        password: 'password123'
      });
      visitorToken = visitorRegister.data.token;
      logSuccess('Visitor user created and token obtained');
    }

    try {
      const ownerLogin = await axios.post(`${API_BASE}/auth/login`, {
        email: 'owner-test@example.com',
        password: 'password123'
      });
      ownerToken = ownerLogin.data.token;
      logSuccess('Owner token obtained (existing user)');
    } catch {
      const ownerRegister = await axios.post(`${API_BASE}/auth/register`, {
        firstName: 'Owner',
        lastName: 'Test',
        email: 'owner-test@example.com',
        password: 'password123',
        accountType: 'owner'
      });
      ownerToken = ownerRegister.data.token;
      logSuccess('Owner user created and token obtained');
    }

    try {
      const adminLogin = await axios.post(`${API_BASE}/auth/login`, {
        email: 'admin@example.com',
        password: 'admin123'
      });
      adminToken = adminLogin.data.token;
      logSuccess('Admin token obtained');
    } catch (error) {
      logSkip('Admin user not found - will skip admin tests');
    }

  } catch (error) {
    logError('Failed to setup test users', error);
    throw error;
  }
}

/**
 * Step 2: Test Visitor Feedback Submission
 */
async function testVisitorFeedbackSubmission() {
  logTest('Visitor Feedback Submission');

  // Test 1: Valid visitor feedback
  try {
    const response = await axios.post(
      `${API_BASE}/visitor/feedback`,
      {
        category: 'Bug',
        title: 'Test Visitor Feedback',
        description: 'This is a test feedback submission from a visitor user with sufficient length.'
      },
      {
        headers: { Authorization: `Bearer ${visitorToken}` }
      }
    );

    if (response.data.success && response.data.data.id) {
      visitorFeedbackId = response.data.data.id;
      logSuccess(`Visitor feedback created (ID: ${visitorFeedbackId})`);
    } else {
      logError('Visitor feedback - invalid response structure', null);
    }
  } catch (error) {
    logError('Visitor feedback submission failed', error);
  }

  // Test 2: Validation - title too short
  try {
    await axios.post(
      `${API_BASE}/visitor/feedback`,
      {
        category: 'Bug',
        title: 'Ab',
        description: 'Valid description with more than ten characters here.'
      },
      {
        headers: { Authorization: `Bearer ${visitorToken}` }
      }
    );
    logError('Validation should have failed for short title', null);
  } catch (error) {
    if (error.response?.status === 400) {
      logSuccess('Validation correctly rejected short title');
    } else {
      logError('Unexpected error for short title validation', error);
    }
  }

  // Test 3: Validation - description too short
  try {
    await axios.post(
      `${API_BASE}/visitor/feedback`,
      {
        category: 'Bug',
        title: 'Valid Title',
        description: 'Too short'
      },
      {
        headers: { Authorization: `Bearer ${visitorToken}` }
      }
    );
    logError('Validation should have failed for short description', null);
  } catch (error) {
    if (error.response?.status === 400) {
      logSuccess('Validation correctly rejected short description');
    } else {
      logError('Unexpected error for short description validation', error);
    }
  }

  // Test 4: Missing required field
  try {
    await axios.post(
      `${API_BASE}/visitor/feedback`,
      {
        title: 'Valid Title',
        description: 'Valid description with more than ten characters.'
      },
      {
        headers: { Authorization: `Bearer ${visitorToken}` }
      }
    );
    logError('Validation should have failed for missing category', null);
  } catch (error) {
    if (error.response?.status === 400) {
      logSuccess('Validation correctly rejected missing category');
    } else {
      logError('Unexpected error for missing field validation', error);
    }
  }

  // Test 5: Invalid category
  try {
    await axios.post(
      `${API_BASE}/visitor/feedback`,
      {
        category: 'InvalidCategory',
        title: 'Valid Title',
        description: 'Valid description with more than ten characters.'
      },
      {
        headers: { Authorization: `Bearer ${visitorToken}` }
      }
    );
    logError('Validation should have failed for invalid category', null);
  } catch (error) {
    if (error.response?.status === 400) {
      logSuccess('Validation correctly rejected invalid category');
    } else {
      logError('Unexpected error for invalid category validation', error);
    }
  }

  // Test 6: Unauthorized access (no token)
  try {
    await axios.post(
      `${API_BASE}/visitor/feedback`,
      {
        category: 'Bug',
        title: 'Valid Title',
        description: 'Valid description with more than ten characters.'
      }
    );
    logError('Should have rejected request without auth token', null);
  } catch (error) {
    if (error.response?.status === 401) {
      logSuccess('Correctly rejected unauthorized request');
    } else {
      logError('Unexpected error for unauthorized request', error);
    }
  }

  // Test 7: Wrong role (owner trying to use visitor endpoint)
  try {
    await axios.post(
      `${API_BASE}/visitor/feedback`,
      {
        category: 'Bug',
        title: 'Valid Title',
        description: 'Valid description with more than ten characters.'
      },
      {
        headers: { Authorization: `Bearer ${ownerToken}` }
      }
    );
    logError('Should have rejected owner on visitor endpoint', null);
  } catch (error) {
    if (error.response?.status === 403) {
      logSuccess('Correctly rejected wrong role (owner on visitor endpoint)');
    } else {
      logError('Unexpected error for wrong role', error);
    }
  }
}

/**
 * Step 3: Test Owner Feedback Submission
 */
async function testOwnerFeedbackSubmission() {
  logTest('Owner Feedback Submission');

  // Test 1: Valid owner feedback with urgency
  try {
    const response = await axios.post(
      `${API_BASE}/owner/feedback`,
      {
        category: 'Booking Issue',
        urgency: 'HIGH',
        title: 'Test Owner Feedback - High Priority',
        description: 'This is a high priority test feedback from business owner with sufficient detail.'
      },
      {
        headers: { Authorization: `Bearer ${ownerToken}` }
      }
    );

    if (response.data.success && response.data.data.id) {
      ownerFeedbackId = response.data.data.id;
      logSuccess(`Owner feedback created (ID: ${ownerFeedbackId}, Urgency: ${response.data.data.urgency})`);
    } else {
      logError('Owner feedback - invalid response structure', null);
    }
  } catch (error) {
    logError('Owner feedback submission failed', error);
  }

  // Test 2: Owner feedback without urgency (should default to MEDIUM)
  try {
    const response = await axios.post(
      `${API_BASE}/owner/feedback`,
      {
        category: 'Payment Issue',
        title: 'Test Owner Feedback - Default Urgency',
        description: 'Testing default urgency level when not specified by owner user.'
      },
      {
        headers: { Authorization: `Bearer ${ownerToken}` }
      }
    );

    if (response.data.data.urgency === 'MEDIUM') {
      logSuccess('Owner feedback correctly defaults to MEDIUM urgency');
    } else {
      logError(`Expected MEDIUM urgency, got: ${response.data.data.urgency}`, null);
    }
  } catch (error) {
    logError('Owner feedback with default urgency failed', error);
  }

  // Test 3: Invalid urgency level
  try {
    await axios.post(
      `${API_BASE}/owner/feedback`,
      {
        category: 'Booking Issue',
        urgency: 'CRITICAL',
        title: 'Valid Title',
        description: 'Valid description with more than ten characters.'
      },
      {
        headers: { Authorization: `Bearer ${ownerToken}` }
      }
    );
    logError('Should have rejected invalid urgency level', null);
  } catch (error) {
    if (error.response?.status === 400) {
      logSuccess('Validation correctly rejected invalid urgency');
    } else {
      logError('Unexpected error for invalid urgency validation', error);
    }
  }

  // Test 4: Wrong role (visitor trying to use owner endpoint)
  try {
    await axios.post(
      `${API_BASE}/owner/feedback`,
      {
        category: 'Booking Issue',
        urgency: 'HIGH',
        title: 'Valid Title',
        description: 'Valid description with more than ten characters.'
      },
      {
        headers: { Authorization: `Bearer ${visitorToken}` }
      }
    );
    logError('Should have rejected visitor on owner endpoint', null);
  } catch (error) {
    if (error.response?.status === 403) {
      logSuccess('Correctly rejected wrong role (visitor on owner endpoint)');
    } else {
      logError('Unexpected error for wrong role', error);
    }
  }
}

/**
 * Step 4: Test Admin Feedback Management
 */
async function testAdminFeedbackManagement() {
  logTest('Admin Feedback Management');

  if (!adminToken) {
    logSkip('Admin tests skipped - no admin token available');
    return;
  }

  // Test 1: Get all feedback
  try {
    const response = await axios.get(
      `${API_BASE}/admin/feedback`,
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );

    if (response.data.success && Array.isArray(response.data.data)) {
      logSuccess(`Retrieved ${response.data.data.length} feedback items (Total: ${response.data.pagination.total})`);
      console.log(`   Counts - Visitor: ${response.data.counts.visitor}, Owner: ${response.data.counts.owner}, Open: ${response.data.counts.open}`);
    } else {
      logError('Admin get all feedback - invalid response structure', null);
    }
  } catch (error) {
    logError('Admin get all feedback failed', error);
  }

  // Test 2: Filter by userType (visitor)
  try {
    const response = await axios.get(
      `${API_BASE}/admin/feedback?userType=visitor`,
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );

    const allVisitor = response.data.data.every(item => item.userType === 'visitor');
    if (allVisitor) {
      logSuccess(`Filtered visitor feedback correctly (${response.data.data.length} items)`);
    } else {
      logError('Filter returned non-visitor feedback', null);
    }
  } catch (error) {
    logError('Admin filter by visitor failed', error);
  }

  // Test 3: Filter by userType (owner)
  try {
    const response = await axios.get(
      `${API_BASE}/admin/feedback?userType=owner`,
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );

    const allOwner = response.data.data.every(item => item.userType === 'owner');
    if (allOwner) {
      logSuccess(`Filtered owner feedback correctly (${response.data.data.length} items)`);
    } else {
      logError('Filter returned non-owner feedback', null);
    }
  } catch (error) {
    logError('Admin filter by owner failed', error);
  }

  // Test 4: Filter by status (OPEN)
  try {
    const response = await axios.get(
      `${API_BASE}/admin/feedback?status=OPEN`,
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );

    const allOpen = response.data.data.every(item => item.status === 'OPEN');
    if (allOpen) {
      logSuccess(`Filtered OPEN feedback correctly (${response.data.data.length} items)`);
    } else {
      logError('Filter returned non-OPEN feedback', null);
    }
  } catch (error) {
    logError('Admin filter by status failed', error);
  }

  // Test 5: Pagination
  try {
    const response = await axios.get(
      `${API_BASE}/admin/feedback?page=1&limit=5`,
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );

    if (response.data.pagination.page === 1 && response.data.pagination.limit === 5) {
      logSuccess(`Pagination working correctly (Page 1, Limit 5, Total pages: ${response.data.pagination.pages})`);
    } else {
      logError('Pagination parameters not working', null);
    }
  } catch (error) {
    logError('Admin pagination failed', error);
  }

  // Test 6: Update feedback status to IN_REVIEW
  if (visitorFeedbackId) {
    try {
      const response = await axios.patch(
        `${API_BASE}/admin/feedback/${visitorFeedbackId}`,
        {
          status: 'IN_REVIEW',
          internalNotes: 'Under investigation by support team.'
        },
        {
          headers: { Authorization: `Bearer ${adminToken}` }
        }
      );

      if (response.data.data.status === 'IN_REVIEW') {
        logSuccess(`Updated feedback status to IN_REVIEW`);
      } else {
        logError('Status update did not persist', null);
      }
    } catch (error) {
      logError('Admin status update failed', error);
    }
  }

  // Test 7: Update feedback status to RESOLVED
  if (ownerFeedbackId) {
    try {
      const response = await axios.patch(
        `${API_BASE}/admin/feedback/${ownerFeedbackId}`,
        {
          status: 'RESOLVED',
          internalNotes: 'Issue resolved. Customer contacted via email.'
        },
        {
          headers: { Authorization: `Bearer ${adminToken}` }
        }
      );

      if (response.data.data.status === 'RESOLVED' && response.data.data.resolvedAt) {
        logSuccess(`Updated feedback to RESOLVED with auto-timestamp`);
      } else {
        logError('RESOLVED status update incomplete', null);
      }
    } catch (error) {
      logError('Admin resolve feedback failed', error);
    }
  }

  // Test 8: Invalid feedback ID
  try {
    await axios.patch(
      `${API_BASE}/admin/feedback/000000000000000000000000`,
      { status: 'RESOLVED' },
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );
    logError('Should have returned 404 for invalid ID', null);
  } catch (error) {
    if (error.response?.status === 404) {
      logSuccess('Correctly returned 404 for invalid feedback ID');
    } else {
      logError('Unexpected error for invalid ID', error);
    }
  }

  // Test 9: Unauthorized access (visitor trying admin endpoint)
  try {
    await axios.get(
      `${API_BASE}/admin/feedback`,
      {
        headers: { Authorization: `Bearer ${visitorToken}` }
      }
    );
    logError('Should have rejected visitor on admin endpoint', null);
  } catch (error) {
    if (error.response?.status === 403) {
      logSuccess('Correctly rejected visitor on admin endpoint');
    } else {
      logError('Unexpected error for visitor on admin endpoint', error);
    }
  }

  // Test 10: Search functionality
  try {
    const response = await axios.get(
      `${API_BASE}/admin/feedback?search=Test`,
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );

    if (response.data.success) {
      logSuccess(`Search functionality working (Found ${response.data.data.length} results)`);
    } else {
      logError('Search returned invalid response', null);
    }
  } catch (error) {
    logError('Admin search failed', error);
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.clear();
  log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║         FEEDBACK SYSTEM API TESTING SUITE                 ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝\n', 'cyan');

  try {
    await setupTestUsers();
    await testVisitorFeedbackSubmission();
    await testOwnerFeedbackSubmission();
    await testAdminFeedbackManagement();

    // Print summary
    console.log('\n' + '='.repeat(60));
    log('\n📊 TEST SUMMARY', 'cyan');
    console.log('='.repeat(60));
    log(`✅ Passed:  ${testResults.passed}`, 'green');
    log(`❌ Failed:  ${testResults.failed}`, 'red');
    log(`⏭️  Skipped: ${testResults.skipped}`, 'yellow');
    log(`📈 Total:   ${testResults.passed + testResults.failed + testResults.skipped}\n`, 'cyan');

    if (testResults.failed === 0) {
      log('🎉 ALL TESTS PASSED! Backend is ready for frontend integration.\n', 'green');
    } else {
      log('⚠️  Some tests failed. Please review the errors above.\n', 'yellow');
    }

  } catch (error) {
    log('\n💥 FATAL ERROR: Test suite crashed', 'red');
    console.error(error);
    process.exit(1);
  }
}

// Run tests
runTests();
