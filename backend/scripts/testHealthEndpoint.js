/**
 * Health Endpoint Test Script
 *
 * Tests all health and monitoring endpoints
 * Run: node backend/scripts/testHealthEndpoint.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const chalk = require('chalk');

const BASE_URL = 'http://localhost:5001';
const MONGODB_URI = process.env.MONGODB_URI;

let testsPassed = 0;
let testsFailed = 0;

// Styling
const pass = (msg) => console.log(chalk.green.bold('  ✓ PASS'), msg);
const fail = (msg) => console.log(chalk.red.bold('  ✗ FAIL'), msg);
const info = (msg) => console.log(chalk.cyan('    →'), msg);
const warn = (msg) => console.log(chalk.yellow('    ℹ'), msg);
const title = (msg) => console.log(chalk.bold.blue(`\n━━━ ${msg} ━━━\n`));
const header = (msg) => console.log(chalk.bold.cyan(`\n${msg}`));

function logTest(message, condition) {
  if (condition) {
    testsPassed++;
    pass(message);
    return true;
  } else {
    testsFailed++;
    fail(message);
    return false;
  }
}

async function testHealthEndpoints() {
  console.log(chalk.bold.cyan('🧪 HEALTH ENDPOINT TEST SUITE'));
  console.log(chalk.yellow('Testing health and monitoring endpoints...\n'));

  try {
    // Connect to database first
    title('Database Connection');
    await mongoose.connect(MONGODB_URI);
    pass('MongoDB Connected');
    info(`Connected to ${mongoose.connection.name}`);

    // Test 1: Basic Health Check
    title('Test 1: Basic Health Check');
    try {
      const response = await axios.get(`${BASE_URL}/api/health`);
      logTest('Basic health endpoint responds', response.status === 200);
      logTest('Response has status field', response.data.status === 'healthy');
      logTest('Response has timestamp', !!response.data.timestamp);
      logTest('Response has uptime', typeof response.data.uptime === 'number');
      info(`Uptime: ${Math.floor(response.data.uptime)}s`);
      info(`Environment: ${response.data.environment}`);
    } catch (error) {
      fail('Basic health endpoint failed');
      info(error.message);
    }

    // Test 2: Detailed Health Check
    title('Test 2: Detailed Health Check');
    try {
      const response = await axios.get(`${BASE_URL}/api/health/detailed`);
      logTest('Detailed health endpoint responds', response.status === 200);
      logTest('Overall status present', !!response.data.status);
      logTest('Services object present', !!response.data.services);

      // Check individual services
      const services = response.data.services;

      if (services.database) {
        logTest('Database service check present', !!services.database);
        info(`Database: ${services.database.status} (${services.database.state})`);
      }

      if (services.stripe) {
        logTest('Stripe service check present', !!services.stripe);
        info(`Stripe: ${services.stripe.status}`);
      }

      if (services.email) {
        logTest('Email service check present', !!services.email);
        info(`Email: ${services.email.status} (configured: ${services.email.configured})`);
      }

      if (services.memory) {
        logTest('Memory service check present', !!services.memory);
        info(`Memory: ${services.memory.heapUsed} / ${services.memory.heapTotal} (${services.memory.percentage})`);
      }
    } catch (error) {
      fail('Detailed health endpoint failed');
      info(error.message);
    }

    // Test 3: Verification Metrics
    title('Test 3: Verification Metrics');
    try {
      const response = await axios.get(`${BASE_URL}/api/health/metrics/verification`);
      logTest('Verification metrics endpoint responds', response.status === 200);
      logTest('Response has metrics object', !!response.data.metrics);

      const metrics = response.data.metrics;

      logTest('Total businesses count present', typeof metrics.totalBusinesses === 'number');
      info(`Total businesses: ${metrics.totalBusinesses}`);

      logTest('Tier distribution present', !!metrics.tierDistribution);
      info(`Unverified: ${metrics.tierDistribution.unverified}`);
      info(`Basic: ${metrics.tierDistribution.basic}`);
      info(`Fully Verified: ${metrics.tierDistribution.fully_verified}`);

      logTest('Tier percentages present', !!metrics.tierPercentages);
      info(`Unverified: ${metrics.tierPercentages.unverified}%`);
      info(`Basic: ${metrics.tierPercentages.basic}%`);
      info(`Fully Verified: ${metrics.tierPercentages.fully_verified}%`);

      logTest('Verification rates present', !!metrics.verificationRates);
      info(`Email verified: ${metrics.verificationRates.emailVerified}%`);
      info(`Phone verified: ${metrics.verificationRates.phoneVerified}%`);
      info(`Stripe connected: ${metrics.verificationRates.stripeConnected}%`);

      logTest('Average profile completion present', typeof metrics.averageProfileCompletion === 'number');
      info(`Avg profile completion: ${metrics.averageProfileCompletion}%`);
    } catch (error) {
      fail('Verification metrics endpoint failed');
      info(error.message);
    }

    // Test 4: Performance Metrics
    title('Test 4: Performance Metrics');
    try {
      const response = await axios.get(`${BASE_URL}/api/health/metrics/performance`);
      logTest('Performance metrics endpoint responds', response.status === 200);
      logTest('Response has performance object', !!response.data.performance);

      const perf = response.data.performance;

      logTest('Uptime data present', !!perf.uptime);
      info(`Uptime: ${perf.uptime.formatted} (${perf.uptime.seconds}s)`);

      logTest('CPU data present', !!perf.cpu);
      info(`CPU User: ${perf.cpu.user}`);
      info(`CPU System: ${perf.cpu.system}`);

      logTest('Memory data present', !!perf.memory);
      info(`RSS: ${perf.memory.rss}`);
      info(`Heap Used: ${perf.memory.heapUsed} / ${perf.memory.heapTotal} (${perf.memory.heapPercentage})`);

      logTest('Node version present', !!perf.nodeVersion);
      info(`Node: ${perf.nodeVersion}`);
      info(`Platform: ${perf.platform}`);
      info(`Architecture: ${perf.arch}`);
    } catch (error) {
      fail('Performance metrics endpoint failed');
      info(error.message);
    }

    // Test 5: Health Endpoint Response Times
    title('Test 5: Response Time Performance');
    try {
      const startBasic = Date.now();
      await axios.get(`${BASE_URL}/api/health`);
      const basicTime = Date.now() - startBasic;

      const startDetailed = Date.now();
      await axios.get(`${BASE_URL}/api/health/detailed`);
      const detailedTime = Date.now() - startDetailed;

      logTest('Basic health responds quickly', basicTime < 100);
      info(`Basic health: ${basicTime}ms`);

      logTest('Detailed health responds reasonably', detailedTime < 1000);
      info(`Detailed health: ${detailedTime}ms`);
    } catch (error) {
      fail('Response time test failed');
      info(error.message);
    }

    // Cleanup
    title('Cleanup');
    await mongoose.connection.close();
    pass('Database connection closed');

    // Results
    console.log(chalk.bold.cyan('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(chalk.bold('📊 TEST RESULTS\n'));
    console.log(`  Total Tests: ${testsPassed + testsFailed}`);
    console.log(chalk.green.bold(`  ✓ Passed: ${testsPassed}`));
    console.log(chalk.red.bold(`  ✗ Failed: ${testsFailed}`));
    console.log(`  Success Rate: ${Math.round((testsPassed / (testsPassed + testsFailed)) * 100)}%\n`);

    if (testsFailed === 0) {
      console.log(chalk.green.bold('🎉 ALL TESTS PASSED! 🎉\n'));
      console.log(chalk.cyan('✅ Health endpoints are working correctly!'));
      console.log(chalk.cyan('✅ All monitoring endpoints accessible'));
      console.log(chalk.cyan('✅ Ready for deployment'));
    } else {
      console.log(chalk.red.bold('⚠️ SOME TESTS FAILED\n'));
      console.log(chalk.yellow('Please review the failed tests above'));
    }

    process.exit(testsFailed === 0 ? 0 : 1);

  } catch (error) {
    console.error(chalk.red.bold('\n❌ FATAL ERROR:'), error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run tests
testHealthEndpoints();
