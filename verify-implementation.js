#!/usr/bin/env node

/**
 * Quick Verification Script
 * Checks if all required files exist and are properly configured
 */

const fs = require('fs');
const path = require('path');

const checks = {
  frontend: [
    'frontend/src/pages/ProfilePage.jsx',
    'frontend/src/components/profile/ProfileTabs.jsx',
    'frontend/src/components/profile/ProfileFollowButton.jsx',
    'frontend/src/components/profile/ProfileFollowButton.css',
    'frontend/src/components/engagement/SurveyEngagementBar.jsx',
    'frontend/src/components/engagement/PostEngagementBar.jsx',
    'frontend/src/components/engagement/ProfileInsightBar.jsx',
    'frontend/src/api/followApi.js',
    'frontend/src/api/engagementApi.js',
    'frontend/src/api/profileApi.js',
  ],
  backend: [
    'backend/routes/v1/followRoutes.js',
    'backend/modules/analytics/survey/surveyEngagement.routes.js',
    'backend/modules/analytics/post/postEngagement.routes.js',
    'backend/modules/analytics/profile/profileInsight.routes.js',
  ],
};

console.log('🔍 Verifying Implementation Files...\n');

let allGood = true;

// Check Frontend Files
console.log('📱 Frontend Files:');
checks.frontend.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(exists ? '  ✅' : '  ❌', file);
  if (!exists) allGood = false;
});

console.log('\n🔧 Backend Files:');
checks.backend.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(exists ? '  ✅' : '  ❌', file);
  if (!exists) allGood = false;
});

// Check if route is registered
console.log('\n🛣️  Route Registration:');
try {
  const appJs = fs.readFileSync('frontend/src/App.js', 'utf8');

  const hasProfileRoute = appJs.includes('path="/profile/:userId"');
  console.log(hasProfileRoute ? '  ✅' : '  ❌', '/profile/:userId route in App.js');
  if (!hasProfileRoute) allGood = false;

  const importsProfilePage = appJs.includes('import ProfilePage');
  console.log(importsProfilePage ? '  ✅' : '  ❌', 'ProfilePage imported in App.js');
  if (!importsProfilePage) allGood = false;
} catch (err) {
  console.log('  ❌ Could not read App.js');
  allGood = false;
}

// Check if engagement bars are integrated
console.log('\n📊 Engagement Bar Integration:');
try {
  const feedSurvey = fs.readFileSync('frontend/src/visitor/components/FeedSurveyCard.jsx', 'utf8');
  const hasSurveyBar = feedSurvey.includes('SurveyEngagementBar');
  console.log(hasSurveyBar ? '  ✅' : '  ❌', 'SurveyEngagementBar in FeedSurveyCard');
  if (!hasSurveyBar) allGood = false;

  const feedPost = fs.readFileSync('frontend/src/visitor/components/FeedPostCard.jsx', 'utf8');
  const hasPostBar = feedPost.includes('PostEngagementBar');
  console.log(hasPostBar ? '  ✅' : '  ❌', 'PostEngagementBar in FeedPostCard');
  if (!hasPostBar) allGood = false;
} catch (err) {
  console.log('  ❌ Could not read feed card files');
  allGood = false;
}

// Check if username is clickable
console.log('\n🔗 Username Clickability:');
try {
  const identityBadge = fs.readFileSync('frontend/src/components/SharedComponents/IdentityBadge.jsx', 'utf8');
  const hasProfileLink = identityBadge.includes('userId || slug');
  console.log(hasProfileLink ? '  ✅' : '  ❌', 'Username links to /profile/:userId in IdentityBadge');
  if (!hasProfileLink) allGood = false;
} catch (err) {
  console.log('  ❌ Could not read IdentityBadge.jsx');
  allGood = false;
}

// Check backend route mounting
console.log('\n🔌 Backend Route Mounting:');
try {
  const serverJs = fs.readFileSync('backend/server.js', 'utf8');

  const hasFollowRoutes = serverJs.includes("app.use('/api/v1/follow'");
  console.log(hasFollowRoutes ? '  ✅' : '  ❌', '/api/v1/follow routes mounted');
  if (!hasFollowRoutes) allGood = false;

  const hasAnalyticsRoutes = serverJs.includes("app.use('/api/v1/analytics'");
  console.log(hasAnalyticsRoutes ? '  ✅' : '  ❌', '/api/v1/analytics routes mounted');
  if (!hasAnalyticsRoutes) allGood = false;

  const hasUserRoutes = serverJs.includes("app.use('/api/v1/users'");
  console.log(hasUserRoutes ? '  ✅' : '  ❌', '/api/v1/users routes mounted');
  if (!hasUserRoutes) allGood = false;
} catch (err) {
  console.log('  ❌ Could not read server.js');
  allGood = false;
}

console.log('\n' + '='.repeat(50));
if (allGood) {
  console.log('✅ ALL CHECKS PASSED!');
  console.log('\n📝 Next Steps:');
  console.log('1. Start backend: cd backend && npm start');
  console.log('2. Start frontend: cd frontend && npm start');
  console.log('3. Follow TEST_ACTUAL_IMPLEMENTATION.md');
} else {
  console.log('❌ SOME CHECKS FAILED!');
  console.log('\n⚠️  Missing files or configurations detected.');
  console.log('Please review the output above and fix the issues.');
}
console.log('='.repeat(50) + '\n');

process.exit(allGood ? 0 : 1);
