/**
 * 🧪 Business Moderation Engine Test Script
 *
 * Tests all moderation features end-to-end:
 * 1. Creates test users (owner + admin)
 * 2. Creates incomplete business → expects PENDING
 * 3. Creates complete business → expects AUTO-APPROVE
 * 4. Tests admin queue endpoints
 * 5. Tests admin approve/reject
 * 6. Tests public explore filtering
 *
 * Run: node backend/scripts/testBusinessModeration.js
 */

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const axios = require('axios');
require('dotenv').config();

// Models
const User = require('../models/User');
const Business = require('../models/Business');

const API_BASE = 'http://localhost:5002/api';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Test data
let testOwner, testAdmin, ownerToken, adminToken;
let incompleteBusinessId, completeBusinessId;

/**
 * Generate JWT token
 */
function generateToken(userId, role = 'owner') {
  return jwt.sign({ id: userId, role }, JWT_SECRET, { expiresIn: '1h' });
}

/**
 * Test 1: Setup - Create test users
 */
async function setupTestUsers() {
  console.log('\n\ud83d\udee0\ufe0f  Test 1: Creating test users...\n');

  // Clean up existing test users
  await User.deleteMany({ email: { $in: ['testowner@test.com', 'testadmin@test.com'] } });

  // Create test owner
  testOwner = await User.create({
    name: 'Test Owner',
    email: 'testowner@test.com',
    password: 'password123',
    role: 'owner'
  });

  // Create test admin
  testAdmin = await User.create({
    name: 'Test Admin',
    email: 'testadmin@test.com',
    password: 'password123',
    role: 'admin'
  });

  // Generate tokens
  ownerToken = generateToken(testOwner._id, 'owner');
  adminToken = generateToken(testAdmin._id, 'admin');

  console.log('✅ Test Owner Created:', testOwner.email);
  console.log('✅ Test Admin Created:', testAdmin.email);
  console.log('✅ Tokens Generated\n');
}

/**
 * Test 2: Create incomplete business (should be PENDING)
 */
async function testIncompleteBusinessPending() {
  console.log('\n🧪 Test 2: Creating INCOMPLETE business (should be PENDING)...\n');

  const incompleteData = {
    name: 'Test Salon Incomplete',
    city: 'Miami',
    category: 'Salon',
    description: 'Short' // Too short (< 30 chars)
    // Missing: phone, address, logoUrl, coverPhotoUrl, photos
  };

  try {
    const response = await axios.post(`${API_BASE}/businesses`, incompleteData, {
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });

    const business = response.data;
    incompleteBusinessId = business._id;

    console.log('📋 Business Created:');
    console.log(`   Name: ${business.name}`);
    console.log(`   Moderation Status: ${business.moderationStatus}`);
    console.log(`   Issues (${business.moderationIssues?.length || 0}):`);
    business.moderationIssues?.forEach((issue, i) => {
      console.log(`      ${i + 1}. ${issue}`);
    });

    if (business.moderationStatus === 'PENDING' && business.moderationIssues.length > 0) {
      console.log('\n✅ Test 2 PASSED: Business is PENDING with issues listed\n');
      return true;
    } else {
      console.log('\n❌ Test 2 FAILED: Expected PENDING status with issues\n');
      return false;
    }
  } catch (error) {
    console.log('\n❌ Test 2 FAILED:', error.response?.data || error.message, '\n');
    return false;
  }
}

/**
 * Test 3: Create complete business (should AUTO-APPROVE)
 */
async function testCompleteBusinessApproval() {
  console.log('\n🧪 Test 3: Creating COMPLETE business (should AUTO-APPROVE)...\n');

  const completeData = {
    name: 'Miami Glow Salon Complete',
    city: 'Miami',
    category: 'Salon',
    description: 'Premium hair salon specializing in balayage, braids, and color treatments. We offer exceptional service and use top-quality products.',
    phone: '305-555-1234',
    address: '123 Ocean Dr, Miami, FL 33139',
    logoUrl: 'https://example.com/logo.jpg',
    coverPhotoUrl: 'https://example.com/cover.jpg',
    photos: [
      { url: 'https://example.com/photo1.jpg' },
      { url: 'https://example.com/photo2.jpg' },
      { url: 'https://example.com/photo3.jpg' }
    ]
  };

  try {
    const response = await axios.post(`${API_BASE}/businesses`, completeData, {
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });

    const business = response.data;
    completeBusinessId = business._id;

    console.log('📋 Business Created:');
    console.log(`   Name: ${business.name}`);
    console.log(`   Moderation Status: ${business.moderationStatus}`);
    console.log(`   Issues: ${business.moderationIssues?.length || 0}`);

    if (business.moderationStatus === 'APPROVED' && business.moderationIssues.length === 0) {
      console.log('\n✅ Test 3 PASSED: Business AUTO-APPROVED\n');
      return true;
    } else {
      console.log('\n❌ Test 3 FAILED: Expected APPROVED status with no issues\n');
      console.log('Actual:', JSON.stringify(business._moderation, null, 2));
      return false;
    }
  } catch (error) {
    console.log('\n❌ Test 3 FAILED:', error.response?.data || error.message, '\n');
    return false;
  }
}

/**
 * Test 4: Admin pending queue
 */
async function testAdminPendingQueue() {
  console.log('\n🧪 Test 4: Testing admin pending queue...\n');

  try {
    const response = await axios.get(`${API_BASE}/admin/moderation/pending`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });

    const { pending, pagination } = response.data;

    console.log('📋 Pending Queue:');
    console.log(`   Total Pending: ${pagination.total}`);
    console.log(`   Businesses in queue:`);
    pending.forEach((business, i) => {
      console.log(`      ${i + 1}. ${business.name} - Issues: ${business.moderationIssues.length}`);
    });

    const hasPendingBusiness = pending.some(b => b._id === incompleteBusinessId);

    if (hasPendingBusiness && pagination.total > 0) {
      console.log('\n✅ Test 4 PASSED: Pending queue contains our incomplete business\n');
      return true;
    } else {
      console.log('\n❌ Test 4 FAILED: Pending queue missing our incomplete business\n');
      return false;
    }
  } catch (error) {
    console.log('\n❌ Test 4 FAILED:', error.response?.data || error.message, '\n');
    return false;
  }
}

/**
 * Test 5: Admin approve business
 */
async function testAdminApproveBusiness() {
  console.log('\n🧪 Test 5: Testing admin approve business...\n');

  try {
    const response = await axios.post(
      `${API_BASE}/admin/moderation/businesses/${incompleteBusinessId}/approve`,
      {},
      { headers: { 'Authorization': `Bearer ${adminToken}` } }
    );

    const { business } = response.data;

    console.log('📋 Approval Result:');
    console.log(`   Business: ${business.name}`);
    console.log(`   New Status: ${business.moderationStatus}`);

    if (business.moderationStatus === 'APPROVED') {
      console.log('\n✅ Test 5 PASSED: Business approved by admin\n');
      return true;
    } else {
      console.log('\n❌ Test 5 FAILED: Business not approved\n');
      return false;
    }
  } catch (error) {
    console.log('\n❌ Test 5 FAILED:', error.response?.data || error.message, '\n');
    return false;
  }
}

/**
 * Test 6: Public explore (only APPROVED visible)
 */
async function testPublicExplore() {
  console.log('\n🧪 Test 6: Testing public explore page (only APPROVED visible)...\n');

  try {
    const response = await axios.get(`${API_BASE}/businesses`);
    const businesses = response.data;

    console.log('📋 Public Explore Results:');
    console.log(`   Total Businesses: ${businesses.length}`);

    // Check if all returned businesses are APPROVED
    const allApproved = businesses.every(b => b.moderationStatus === 'APPROVED' || b.status === 'approved');

    // Check if our complete business is visible
    const completeBusinessVisible = businesses.some(b => b._id === completeBusinessId);

    console.log(`   All APPROVED: ${allApproved ? 'Yes' : 'No'}`);
    console.log(`   Complete Business Visible: ${completeBusinessVisible ? 'Yes' : 'No'}`);

    if (allApproved && completeBusinessVisible) {
      console.log('\n✅ Test 6 PASSED: Only APPROVED businesses visible\n');
      return true;
    } else {
      console.log('\n❌ Test 6 FAILED: PENDING/REJECTED businesses visible OR complete business missing\n');
      return false;
    }
  } catch (error) {
    console.log('\n❌ Test 6 FAILED:', error.response?.data || error.message, '\n');
    return false;
  }
}

/**
 * Cleanup test data
 */
async function cleanup() {
  console.log('\n🧹 Cleaning up test data...\n');

  // Delete test businesses
  await Business.deleteMany({
    _id: { $in: [incompleteBusinessId, completeBusinessId] }
  });

  // Delete test users
  await User.deleteMany({
    _id: { $in: [testOwner._id, testAdmin._id] }
  });

  console.log('✅ Test data cleaned up\n');
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('\n' + '='.repeat(70));
  console.log('🧪 BUSINESS MODERATION ENGINE - TEST SUITE');
  console.log('='.repeat(70));

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/salonhub', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('\n✅ Connected to MongoDB\n');

    // Run tests
    const results = {
      setup: await setupTestUsers(),
      test2: await testIncompleteBusinessPending(),
      test3: await testCompleteBusinessApproval(),
      test4: await testAdminPendingQueue(),
      test5: await testAdminApproveBusiness(),
      test6: await testPublicExplore()
    };

    // Cleanup
    await cleanup();

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(70) + '\n');

    const passedTests = Object.values(results).filter(r => r === true).length;
    const totalTests = Object.keys(results).length - 1; // Exclude setup

    console.log(`Tests Passed: ${passedTests - 1}/${totalTests}`); // Subtract setup from passed count
    console.log(`Tests Failed: ${totalTests - (passedTests - 1)}/${totalTests}`);

    if (passedTests === totalTests + 1) { // +1 for setup
      console.log('\n✅ ALL TESTS PASSED! Business Moderation Engine working correctly.\n');
    } else {
      console.log('\n❌ SOME TESTS FAILED. Please review the output above.\n');
    }

    console.log('='.repeat(70) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run tests
runTests();
