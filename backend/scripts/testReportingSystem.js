// backend/scripts/testReportingSystem.js

/**
 * 🧪 PHASE 2: REPORTING SYSTEM TEST SUITE
 *
 * Tests:
 * 1. Submit report for business
 * 2. Submit multiple reports to trigger auto-flag
 * 3. Admin view report queue
 * 4. Admin resolve report
 * 5. Admin ban user
 * 6. Check audit logs
 */

require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const User = require('../models/User');
const Business = require('../models/Business');
const Report = require('../models/Report');
const AuditLog = require('../models/AuditLog');
const BannedUser = require('../models/BannedUser');

const API_BASE = 'http://localhost:5000/api';

let testUsers = [];
let testAdmin = null;
let testBusiness = null;
let userTokens = [];
let adminToken = null;
let testReportId = null;

/**
 * Test 0: Setup - Create test users and business
 */
async function setup() {
  console.log('\n========================================');
  console.log('🛠️  SETUP: Creating Test Users & Business');
  console.log('========================================\n');

  // Clean up existing test data
  await User.deleteMany({ email: /test-reporter/ });
  await User.deleteMany({ email: 'test-admin-reports@example.com' });
  await Business.deleteMany({ name: /Test Business/ });
  await Report.deleteMany({});
  await AuditLog.deleteMany({});
  await BannedUser.deleteMany({});

  // Create admin user (password will be hashed by User model pre-save hook)
  testAdmin = await User.create({
    name: 'Test Admin',
    email: 'test-admin-reports@example.com',
    password: 'password123',
    role: 'admin'
  });

  // Create 3 test reporter users
  for (let i = 1; i <= 3; i++) {
    const user = await User.create({
      name: `Test Reporter ${i}`,
      email: `test-reporter${i}@example.com`,
      password: 'password123',
      role: 'visitor'
    });
    testUsers.push(user);

    // Login to get token
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: user.email,
      password: 'password123'
    });
    userTokens.push(loginRes.data.token);
  }

  // Login admin
  const adminLoginRes = await axios.post(`${API_BASE}/auth/login`, {
    email: testAdmin.email,
    password: 'password123'
  });
  adminToken = adminLoginRes.data.token;

  // Create a test business to report
  testBusiness = await Business.create({
    name: 'Test Business for Reports',
    city: 'Miami',
    category: 'Salon',
    description: 'This is a test business that will be reported',
    owner: testUsers[0]._id,
    status: 'approved',
    moderationStatus: 'APPROVED',
    location: { type: 'Point', coordinates: [-80.1918, 25.7617] }
  });

  console.log('✅ Created Admin:', testAdmin.email);
  console.log('✅ Created 3 Test Reporters');
  console.log('✅ Created Test Business:', testBusiness.name);
  console.log('✅ Tokens Generated\n');
}

/**
 * Test 1: Submit single report
 */
async function testSubmitReport() {
  console.log('\n========================================');
  console.log('🧪 Test 1: Submit Single Report');
  console.log('========================================\n');

  try {
    const response = await axios.post(
      `${API_BASE}/reports`,
      {
        entityType: 'Business',
        entityId: testBusiness._id.toString(),
        reason: 'spam',
        description: 'This business is posting fake reviews and spamming'
      },
      {
        headers: { Authorization: `Bearer ${userTokens[0]}` }
      }
    );

    testReportId = response.data.report.id;

    console.log('✅ PASSED: Report submitted successfully');
    console.log('Report ID:', testReportId);
    console.log('Auto-flagged:', response.data.autoFlagged);
    console.log('Similar reports:', response.data.similarReportsCount);

    if (response.data.similarReportsCount !== 1) {
      console.log('❌ FAILED: Expected similarReportsCount to be 1');
      return false;
    }

    if (response.data.autoFlagged) {
      console.log('❌ FAILED: Should not auto-flag with only 1 report');
      return false;
    }

    return true;
  } catch (error) {
    console.log('❌ FAILED:', error.response?.data?.message || error.message);
    return false;
  }
}

/**
 * Test 2: Submit duplicate report (should fail)
 */
async function testDuplicateReport() {
  console.log('\n========================================');
  console.log('🧪 Test 2: Submit Duplicate Report (Should Fail)');
  console.log('========================================\n');

  try {
    await axios.post(
      `${API_BASE}/reports`,
      {
        entityType: 'Business',
        entityId: testBusiness._id.toString(),
        reason: 'spam',
        description: 'Duplicate report from same user'
      },
      {
        headers: { Authorization: `Bearer ${userTokens[0]}` }
      }
    );

    console.log('❌ FAILED: Should not allow duplicate report');
    return false;
  } catch (error) {
    if (error.response?.data?.message.includes('already reported')) {
      console.log('✅ PASSED: Duplicate report correctly rejected');
      console.log('Error message:', error.response.data.message);
      return true;
    }
    console.log('❌ FAILED: Wrong error message:', error.response?.data?.message || error.message);
    return false;
  }
}

/**
 * Test 3: Submit multiple reports to trigger auto-flag
 */
async function testAutoFlag() {
  console.log('\n========================================');
  console.log('🧪 Test 3: Auto-Flag Threshold (3 reports)');
  console.log('========================================\n');

  try {
    // Submit 2nd report (from user 2)
    const response2 = await axios.post(
      `${API_BASE}/reports`,
      {
        entityType: 'Business',
        entityId: testBusiness._id.toString(),
        reason: 'inappropriate',
        description: 'Inappropriate content'
      },
      {
        headers: { Authorization: `Bearer ${userTokens[1]}` }
      }
    );

    console.log('Report 2 submitted - Similar reports:', response2.data.similarReportsCount);
    console.log('Auto-flagged:', response2.data.autoFlagged);

    if (response2.data.autoFlagged) {
      console.log('❌ FAILED: Should not auto-flag at 2 reports (threshold is 3)');
      return false;
    }

    // Submit 3rd report (from user 3) - should trigger auto-flag
    const response3 = await axios.post(
      `${API_BASE}/reports`,
      {
        entityType: 'Business',
        entityId: testBusiness._id.toString(),
        reason: 'fake',
        description: 'This is a fake business listing'
      },
      {
        headers: { Authorization: `Bearer ${userTokens[2]}` }
      }
    );

    console.log('Report 3 submitted - Similar reports:', response3.data.similarReportsCount);
    console.log('Auto-flagged:', response3.data.autoFlagged);

    if (!response3.data.autoFlagged) {
      console.log('❌ FAILED: Should auto-flag at 3 reports');
      return false;
    }

    // Check if business was actually flagged
    const business = await Business.findById(testBusiness._id);
    if (!business.isFlagged) {
      console.log('❌ FAILED: Business should be flagged');
      return false;
    }

    if (business.status !== 'pending') {
      console.log('❌ FAILED: Business status should be "pending"');
      return false;
    }

    console.log('✅ PASSED: Auto-flag triggered at 3 reports');
    console.log('Business status:', business.status);
    console.log('Business isFlagged:', business.isFlagged);
    console.log('Flag reason:', business.flagReason);

    return true;
  } catch (error) {
    console.log('❌ FAILED:', error.response?.data?.message || error.message);
    return false;
  }
}

/**
 * Test 4: Admin view report queue
 */
async function testAdminReportQueue() {
  console.log('\n========================================');
  console.log('🧪 Test 4: Admin Report Queue');
  console.log('========================================\n');

  try {
    const response = await axios.get(
      `${API_BASE}/admin/moderation/reports?status=open`,
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );

    console.log('✅ PASSED: Admin report queue retrieved');
    console.log('Total reports:', response.data.pagination.total);
    console.log('Reports in queue:', response.data.reports.length);

    if (response.data.reports.length < 3) {
      console.log('❌ FAILED: Should have at least 3 reports');
      return false;
    }

    // Check report stats
    const statsResponse = await axios.get(
      `${API_BASE}/admin/moderation/reports/stats`,
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );

    console.log('\nReport Statistics:');
    console.log('Open:', statsResponse.data.stats.openReports);
    console.log('In Progress:', statsResponse.data.stats.inProgressReports);
    console.log('Resolved:', statsResponse.data.stats.resolvedReports);

    return true;
  } catch (error) {
    console.log('❌ FAILED:', error.response?.data?.message || error.message);
    return false;
  }
}

/**
 * Test 5: Admin resolve report with user warning
 */
async function testAdminResolveReport() {
  console.log('\n========================================');
  console.log('🧪 Test 5: Admin Resolve Report (User Warning)');
  console.log('========================================\n');

  try {
    const response = await axios.post(
      `${API_BASE}/admin/moderation/reports/${testReportId}/resolve`,
      {
        resolution: 'user_warned',
        adminNotes: 'First warning for spam activity'
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );

    console.log('✅ PASSED: Report resolved with user warning');
    console.log('Resolution:', response.data.report.resolution);
    console.log('Resolved at:', response.data.report.resolvedAt);

    // Check if user received warning
    const user = await User.findById(testUsers[0]._id);
    if (user.warningCount !== 1) {
      console.log('❌ FAILED: User should have 1 warning');
      return false;
    }

    console.log('User warning count:', user.warningCount);
    console.log('Warnings:', user.warnings.length);

    // Check audit log
    const auditLogs = await AuditLog.find({ action: 'resolve_report' });
    if (auditLogs.length === 0) {
      console.log('❌ FAILED: Audit log should be created');
      return false;
    }

    console.log('Audit logs created:', auditLogs.length);

    return true;
  } catch (error) {
    console.log('❌ FAILED:', error.response?.data?.message || error.message);
    console.log('Error details:', error.response?.data);
    return false;
  }
}

/**
 * Test 6: Get user's reports
 */
async function testGetMyReports() {
  console.log('\n========================================');
  console.log('🧪 Test 6: Get My Reports');
  console.log('========================================\n');

  try {
    const response = await axios.get(
      `${API_BASE}/reports/my-reports`,
      {
        headers: { Authorization: `Bearer ${userTokens[0]}` }
      }
    );

    console.log('✅ PASSED: Retrieved user reports');
    console.log('Total reports:', response.data.pagination.total);
    console.log('Reports:', response.data.reports.length);

    if (response.data.reports.length !== 1) {
      console.log('❌ FAILED: User should have 1 report');
      return false;
    }

    const report = response.data.reports[0];
    console.log('Report status:', report.status);
    console.log('Report resolution:', report.resolution);

    return true;
  } catch (error) {
    console.log('❌ FAILED:', error.response?.data?.message || error.message);
    return false;
  }
}

/**
 * Test 7: Test ban system (create 2nd report and ban user)
 */
async function testBanSystem() {
  console.log('\n========================================');
  console.log('🧪 Test 7: Ban System');
  console.log('========================================\n');

  try {
    // Create a second business to report
    const business2 = await Business.create({
      name: 'Test Business 2 for Ban Test',
      city: 'Miami',
      category: 'Spa',
      description: 'Another test business',
      owner: testUsers[0]._id,
      status: 'approved',
      moderationStatus: 'APPROVED',
      location: { type: 'Point', coordinates: [-80.1918, 25.7617] }
    });

    // User 1 submits spam report
    const reportRes = await axios.post(
      `${API_BASE}/reports`,
      {
        entityType: 'Business',
        entityId: business2._id.toString(),
        reason: 'spam',
        description: 'Repeated spam violations'
      },
      {
        headers: { Authorization: `Bearer ${userTokens[1]}` }
      }
    );

    const reportId = reportRes.data.report.id;

    // Admin resolves with ban
    const resolveRes = await axios.post(
      `${API_BASE}/admin/moderation/reports/${reportId}/resolve`,
      {
        resolution: 'user_banned',
        adminNotes: 'Second violation - temporary ban'
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );

    console.log('✅ Report resolved with ban');

    // Check if user is banned
    const ban = await BannedUser.findOne({ user: testUsers[0]._id });
    if (!ban) {
      console.log('❌ FAILED: Ban record should be created');
      return false;
    }

    console.log('✅ PASSED: User banned');
    console.log('Ban type:', ban.banType);
    console.log('Duration days:', ban.durationDays);
    console.log('Expires at:', ban.expiresAt);
    console.log('Previous bans:', ban.previousBans);

    // Test ban queue
    const banQueueRes = await axios.get(
      `${API_BASE}/admin/moderation/bans`,
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );

    console.log('Active bans:', banQueueRes.data.pagination.total);

    return true;
  } catch (error) {
    console.log('❌ FAILED:', error.response?.data?.message || error.message);
    console.log('Error details:', error.response?.data);
    return false;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════╗');
  console.log('║  🧪 PHASE 2: REPORTING SYSTEM TEST SUITE  ║');
  console.log('╔════════════════════════════════════════════╝');
  console.log('');

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Run tests in sequence
    await setup();

    const results = {
      'Submit Report': await testSubmitReport(),
      'Duplicate Report Prevention': await testDuplicateReport(),
      'Auto-Flag Threshold': await testAutoFlag(),
      'Admin Report Queue': await testAdminReportQueue(),
      'Admin Resolve Report': await testAdminResolveReport(),
      'Get My Reports': await testGetMyReports(),
      'Ban System': await testBanSystem()
    };

    // Summary
    console.log('\n');
    console.log('========================================');
    console.log('📊 TEST SUMMARY');
    console.log('========================================\n');

    const passed = Object.values(results).filter(r => r === true).length;
    const total = Object.keys(results).length;

    Object.entries(results).forEach(([name, result]) => {
      const icon = result ? '✅' : '❌';
      console.log(`${icon} ${name}`);
    });

    console.log('');
    console.log(`Total: ${passed}/${total} tests passed`);
    console.log('');

    if (passed === total) {
      console.log('🎉 ALL TESTS PASSED! Phase 2 is working correctly.\n');
      console.log('✅ Ready to proceed to Phase 3: Claim This Business\n');
    } else {
      console.log('⚠️  Some tests failed. Please review above.\n');
    }

    // Disconnect
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB\n');

    process.exit(passed === total ? 0 : 1);
  } catch (error) {
    console.error('❌ Test suite error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run tests
runTests();
