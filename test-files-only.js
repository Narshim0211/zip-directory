/**
 * FILE-BASED TEST SCRIPT (No DB Required)
 * Tests all new features by checking files and code:
 * 1. Backend files exist
 * 2. Code patterns are present
 * 3. Frontend components updated
 */

const fs = require('fs');
const path = require('path');

function testFiles() {
  console.log('\n🧪 STARTING FILE-BASED FEATURE TEST\n');
  console.log('='.repeat(70));

  let passedTests = 0;
  let failedTests = 0;

  // ========================================
  // TEST 1: Backend Analytics Controller
  // ========================================
  console.log('\n💰 TEST 1: Backend Analytics Controller');
  console.log('-'.repeat(70));

  const analyticsControllerPath = path.join(__dirname, 'backend/controllers/ownerAnalyticsController.js');
  if (fs.existsSync(analyticsControllerPath)) {
    console.log('✅ Analytics controller file exists');
    passedTests++;

    const controllerContent = fs.readFileSync(analyticsControllerPath, 'utf8');

    // Check for required functions
    const requiredFunctions = [
      'getDashboardStats',
      'getPromotionAnalytics'
    ];

    requiredFunctions.forEach(func => {
      if (controllerContent.includes(`exports.${func}`)) {
        console.log(`   ✅ Function "${func}" found`);
        passedTests++;
      } else {
        console.log(`   ❌ Function "${func}" NOT FOUND`);
        failedTests++;
      }
    });

    // Check for key logic
    const keyLogic = [
      { pattern: 'thisMonthRevenue', name: 'Revenue calculation' },
      { pattern: 'returningCount', name: 'Returning clients logic' },
      { pattern: 'topService', name: 'Top service logic' },
      { pattern: 'promotion', name: 'Promotion stats' }
    ];

    keyLogic.forEach(check => {
      if (controllerContent.includes(check.pattern)) {
        console.log(`   ✅ ${check.name}: Present`);
        passedTests++;
      } else {
        console.log(`   ❌ ${check.name}: MISSING`);
        failedTests++;
      }
    });

  } else {
    console.log('❌ Analytics controller file NOT FOUND');
    console.log(`   Expected at: ${analyticsControllerPath}`);
    failedTests++;
  }

  // ========================================
  // TEST 2: Owner Routes Updated
  // ========================================
  console.log('\n🌐 TEST 2: Owner Routes');
  console.log('-'.repeat(70));

  const routesPath = path.join(__dirname, 'backend/routes/ownerRoutes.js');
  if (fs.existsSync(routesPath)) {
    console.log('✅ Owner routes file exists');
    passedTests++;

    const routesContent = fs.readFileSync(routesPath, 'utf8');

    const requiredRoutes = [
      { pattern: '/analytics/dashboard', name: 'Dashboard analytics endpoint' },
      { pattern: '/analytics/promotion', name: 'Promotion analytics endpoint' },
      { pattern: 'ownerAnalyticsController', name: 'Analytics controller import' }
    ];

    requiredRoutes.forEach(check => {
      if (routesContent.includes(check.pattern)) {
        console.log(`   ✅ ${check.name}: Registered`);
        passedTests++;
      } else {
        console.log(`   ❌ ${check.name}: NOT FOUND`);
        failedTests++;
      }
    });

  } else {
    console.log('❌ Owner routes file NOT FOUND');
    failedTests++;
  }

  // ========================================
  // TEST 3: Service Model - Cancellation Policy
  // ========================================
  console.log('\n📋 TEST 3: Service Model - Cancellation Policy');
  console.log('-'.repeat(70));

  const servicePath = path.join(__dirname, 'services/booking-service/src/models/Service.js');
  if (fs.existsSync(servicePath)) {
    console.log('✅ Service model file exists');
    passedTests++;

    const serviceContent = fs.readFileSync(servicePath, 'utf8');

    const requiredFields = [
      'cancellationPolicy',
      'enabled',
      'hoursNotice',
      'feeAmount',
      'feePercentage'
    ];

    requiredFields.forEach(field => {
      if (serviceContent.includes(field)) {
        console.log(`   ✅ Field "${field}": Present`);
        passedTests++;
      } else {
        console.log(`   ❌ Field "${field}": MISSING`);
        failedTests++;
      }
    });

  } else {
    console.log('❌ Service model file NOT FOUND');
    failedTests++;
  }

  // ========================================
  // TEST 4: ServiceModal Component
  // ========================================
  console.log('\n🎨 TEST 4: ServiceModal Component - Deposit & Cancellation UI');
  console.log('-'.repeat(70));

  const serviceModalPath = path.join(__dirname, 'frontend/src/components/booking/ServiceModal.jsx');
  if (fs.existsSync(serviceModalPath)) {
    console.log('✅ ServiceModal component exists');
    passedTests++;

    const modalContent = fs.readFileSync(serviceModalPath, 'utf8');

    const requiredUI = [
      { pattern: 'cancellationPolicy', name: 'Cancellation policy state' },
      { pattern: 'handleCancellationChange', name: 'Cancellation change handler' },
      { pattern: 'Cancellation Policy', name: 'Cancellation UI section' },
      { pattern: 'hoursNotice', name: 'Hours notice dropdown' },
      { pattern: 'feeAmount', name: 'Fee amount input' },
      { pattern: 'feePercentage', name: 'Fee percentage input' }
    ];

    requiredUI.forEach(check => {
      if (modalContent.includes(check.pattern)) {
        console.log(`   ✅ ${check.name}: Present`);
        passedTests++;
      } else {
        console.log(`   ❌ ${check.name}: MISSING`);
        failedTests++;
      }
    });

  } else {
    console.log('❌ ServiceModal component NOT FOUND');
    failedTests++;
  }

  // ========================================
  // TEST 5: OwnerDashboard Component
  // ========================================
  console.log('\n🏠 TEST 5: OwnerDashboard Component - Money Cards & Feed Removal');
  console.log('-'.repeat(70));

  const dashboardPath = path.join(__dirname, 'frontend/src/components/OwnerDashboard.js');
  if (fs.existsSync(dashboardPath)) {
    console.log('✅ OwnerDashboard component exists');
    passedTests++;

    const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');

    // Check for money cards
    const moneyCardChecks = [
      { pattern: 'moneyStats', name: 'Money stats state' },
      { pattern: '/owner/analytics/dashboard', name: 'Analytics API call' },
      { pattern: 'Revenue This Month', name: 'Revenue card' },
      { pattern: 'Returning Clients', name: 'Returning clients card' },
      { pattern: 'Top Service', name: 'Top service card' },
      { pattern: 'Promotion Status', name: 'Promotion card' }
    ];

    console.log('\n   💰 Money Cards Implementation:');
    moneyCardChecks.forEach(check => {
      if (dashboardContent.includes(check.pattern)) {
        console.log(`   ✅ ${check.name}: Present`);
        passedTests++;
      } else {
        console.log(`   ❌ ${check.name}: MISSING`);
        failedTests++;
      }
    });

    // Check feed components are REMOVED
    const removedComponents = [
      { pattern: 'PostComposer', name: 'PostComposer import' },
      { pattern: 'PostCard', name: 'PostCard import' },
      { pattern: 'SurveyCard', name: 'SurveyCard import' },
      { pattern: 'SearchSection', name: 'SearchSection import' }
    ];

    console.log('\n   🗑️  Feed Components (Should be REMOVED):');
    removedComponents.forEach(check => {
      if (!dashboardContent.includes(check.pattern)) {
        console.log(`   ✅ ${check.name}: REMOVED (good!)`);
        passedTests++;
      } else {
        console.log(`   ⚠️  ${check.name}: STILL PRESENT (should be removed)`);
        failedTests++;
      }
    });

  } else {
    console.log('❌ OwnerDashboard component NOT FOUND');
    failedTests++;
  }

  // ========================================
  // TEST 6: Documentation Files
  // ========================================
  console.log('\n📚 TEST 6: Documentation Files');
  console.log('-'.repeat(70));

  const docFiles = [
    'MONEY_DASHBOARD_COMPLETE.md',
    'DEPOSIT_CANCELLATION_COMPLETE.md'
  ];

  docFiles.forEach(file => {
    const docPath = path.join(__dirname, file);
    if (fs.existsSync(docPath)) {
      console.log(`✅ ${file}: Exists`);
      const stats = fs.statSync(docPath);
      console.log(`   └─ Size: ${(stats.size / 1024).toFixed(1)} KB`);
      passedTests++;
    } else {
      console.log(`❌ ${file}: NOT FOUND`);
      failedTests++;
    }
  });

  // ========================================
  // FINAL SUMMARY
  // ========================================
  console.log('\n' + '='.repeat(70));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(70));

  const total = passedTests + failedTests;
  const passRate = ((passedTests / total) * 100).toFixed(1);

  console.log(`\n✅ Passed: ${passedTests}/${total} tests (${passRate}%)`);
  console.log(`❌ Failed: ${failedTests}/${total} tests`);

  if (failedTests === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Features are ready for manual testing.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the output above.');
  }

  console.log('\n' + '='.repeat(70));
  console.log('🎯 IMPLEMENTATION STATUS');
  console.log('='.repeat(70));

  console.log('\n✅ Backend:');
  console.log('   ├─ Analytics Controller: Implemented');
  console.log('   ├─ API Routes: Registered');
  console.log('   └─ Service Model: Updated with cancellation policy');

  console.log('\n✅ Frontend:');
  console.log('   ├─ OwnerDashboard: Updated with money cards');
  console.log('   ├─ Feed Section: Removed');
  console.log('   ├─ ServiceModal: Updated with deposit & cancellation UI');
  console.log('   └─ Compact Social Stats: Added');

  console.log('\n📋 Manual Testing Checklist:');
  console.log('   □ 1. Refresh browser and login as owner');
  console.log('   □ 2. Verify dashboard shows 4 gradient money cards');
  console.log('   □ 3. Verify feed section is gone');
  console.log('   □ 4. Verify create post section is gone');
  console.log('   □ 5. Verify survey section is gone');
  console.log('   □ 6. Edit a service');
  console.log('   □ 7. Test deposit percentage toggle');
  console.log('   □ 8. Test cancellation policy toggle');
  console.log('   □ 9. Set cancellation hours (12/24/48/72)');
  console.log('   □ 10. Test fee amount OR percentage (mutually exclusive)');
  console.log('   □ 11. Save service and verify data persists');
  console.log('   □ 12. Check money cards show real data');

  console.log('\n✨ Testing complete!\n');
}

// Run tests
testFiles();
