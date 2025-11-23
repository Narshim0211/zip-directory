/**
 * Comments System End-to-End Test
 *
 * Tests all comment features:
 * 1. Comment creation (with entitlements)
 * 2. Comment fetching
 * 3. Love reactions on comments
 * 4. Comment reporting
 * 5. Paywall enforcement
 * 6. Premium owner gold orbit
 */

const API_BASE = 'http://localhost:5000/api';
let authTokens = {};

// Test users
const PREMIUM_OWNER_EMAIL = 'owner@example.com';
const FREE_OWNER_EMAIL = 'freeowner@example.com';
const CHAT_PASS_VISITOR_EMAIL = 'visitor@example.com';
const FREE_VISITOR_EMAIL = 'freevisitor@example.com';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.cyan}${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}${colors.reset}\n`),
};

// Helper to make API requests
async function request(method, endpoint, body = null, token = null) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, options);
  const data = await response.json();

  return { status: response.status, data, ok: response.ok };
}

// Test 1: Authentication
async function testAuthentication() {
  log.section('TEST 1: Authentication');

  try {
    // Login premium owner
    log.info('Logging in premium owner...');
    const ownerLogin = await request('POST', '/auth/login', {
      email: PREMIUM_OWNER_EMAIL,
      password: 'password123',
    });

    if (ownerLogin.ok) {
      authTokens.premiumOwner = ownerLogin.data.token;
      log.success(`Premium owner logged in (ID: ${ownerLogin.data._id})`);
    } else {
      log.warn('Premium owner login failed - user may not exist');
    }

    // Login chat pass visitor
    log.info('Logging in chat pass visitor...');
    const visitorLogin = await request('POST', '/auth/login', {
      email: CHAT_PASS_VISITOR_EMAIL,
      password: 'password123',
    });

    if (visitorLogin.ok) {
      authTokens.chatPassVisitor = visitorLogin.data.token;
      log.success(`Chat pass visitor logged in (ID: ${visitorLogin.data._id})`);
    } else {
      log.warn('Chat pass visitor login failed - user may not exist');
    }

    // Login free visitor
    log.info('Logging in free visitor...');
    const freeVisitorLogin = await request('POST', '/auth/login', {
      email: FREE_VISITOR_EMAIL,
      password: 'password123',
    });

    if (freeVisitorLogin.ok) {
      authTokens.freeVisitor = freeVisitorLogin.data.token;
      log.success(`Free visitor logged in (ID: ${freeVisitorLogin.data._id})`);
    } else {
      log.warn('Free visitor login failed - user may not exist');
    }

    return true;
  } catch (error) {
    log.error(`Authentication failed: ${error.message}`);
    return false;
  }
}

// Test 2: Get Survey for Testing
async function getSurvey() {
  log.section('TEST 2: Get Survey for Testing');

  try {
    log.info('Fetching surveys from feed...');
    const feed = await request('GET', '/feed', null, authTokens.premiumOwner || authTokens.chatPassVisitor);

    if (feed.ok && feed.data.items && feed.data.items.length > 0) {
      const survey = feed.data.items.find(item => item.type === 'survey');

      if (survey) {
        log.success(`Found survey: ${survey.question} (ID: ${survey._id})`);
        return survey._id;
      } else {
        log.error('No surveys found in feed');
        return null;
      }
    } else {
      log.error('Failed to fetch feed');
      return null;
    }
  } catch (error) {
    log.error(`Failed to get survey: ${error.message}`);
    return null;
  }
}

// Test 3: Comment Creation with Entitlements
async function testCommentCreation(surveyId) {
  log.section('TEST 3: Comment Creation with Entitlements');

  // Test 3.1: Premium owner can comment
  if (authTokens.premiumOwner) {
    log.info('Testing premium owner comment creation...');
    const ownerComment = await request('POST', '/comments', {
      contentType: 'survey',
      contentId: surveyId,
      text: 'Test comment from premium owner with gold orbit!',
    }, authTokens.premiumOwner);

    if (ownerComment.ok) {
      log.success('✓ Premium owner can comment');
      log.info(`  - Comment ID: ${ownerComment.data._id}`);
      log.info(`  - isPremiumAuthor: ${ownerComment.data.isPremiumAuthor}`);
      log.info(`  - authorType: ${ownerComment.data.authorType}`);
    } else {
      log.error(`✗ Premium owner comment failed: ${ownerComment.data.message}`);
    }
  }

  // Test 3.2: Chat pass visitor can comment
  if (authTokens.chatPassVisitor) {
    log.info('Testing chat pass visitor comment creation...');
    const visitorComment = await request('POST', '/comments', {
      contentType: 'survey',
      contentId: surveyId,
      text: 'Test comment from visitor with chat pass!',
    }, authTokens.chatPassVisitor);

    if (visitorComment.ok) {
      log.success('✓ Chat pass visitor can comment');
      log.info(`  - Comment ID: ${visitorComment.data._id}`);
    } else {
      log.error(`✗ Chat pass visitor comment failed: ${visitorComment.data.message}`);
    }
  }

  // Test 3.3: Free visitor CANNOT comment (paywall)
  if (authTokens.freeVisitor) {
    log.info('Testing free visitor comment creation (should fail)...');
    const freeComment = await request('POST', '/comments', {
      contentType: 'survey',
      contentId: surveyId,
      text: 'This should be blocked by paywall',
    }, authTokens.freeVisitor);

    if (!freeComment.ok && freeComment.status === 403) {
      log.success('✓ Free visitor correctly blocked by paywall');
      log.info(`  - Error message: ${freeComment.data.message}`);
      log.info(`  - requiresPayment: ${freeComment.data.requiresPayment}`);
      log.info(`  - upgradePrice: ${freeComment.data.upgradePrice}`);
    } else {
      log.error('✗ Free visitor should be blocked but was not');
    }
  }
}

// Test 4: Fetch Comments
async function testFetchComments(surveyId) {
  log.section('TEST 4: Fetch Comments');

  try {
    log.info('Fetching comments for survey...');
    const comments = await request('GET', `/comments?contentType=survey&contentId=${surveyId}`);

    if (comments.ok) {
      log.success(`✓ Fetched ${comments.data.length} comments`);

      comments.data.forEach((comment, index) => {
        log.info(`\nComment ${index + 1}:`);
        log.info(`  - Author: ${comment.author?.firstName || 'Unknown'}`);
        log.info(`  - Text: ${comment.content}`);
        log.info(`  - Type: ${comment.authorType}`);
        log.info(`  - Premium Author: ${comment.isPremiumAuthor}`);
        log.info(`  - Likes: ${comment.likes?.length || 0}`);
      });

      return comments.data[0]?._id; // Return first comment ID for testing
    } else {
      log.error('Failed to fetch comments');
      return null;
    }
  } catch (error) {
    log.error(`Failed to fetch comments: ${error.message}`);
    return null;
  }
}

// Test 5: Love Reactions on Comments
async function testCommentReactions(commentId) {
  log.section('TEST 5: Love Reactions on Comments');

  if (!commentId) {
    log.warn('No comment ID - skipping reaction test');
    return;
  }

  try {
    // Test 5.1: Add love reaction
    log.info('Adding love reaction to comment...');
    const reaction = await request('POST', `/engagement/react`, {
      contentType: 'comment',
      contentId: commentId,
      reactionType: 'love',
    }, authTokens.premiumOwner || authTokens.chatPassVisitor);

    if (reaction.ok) {
      log.success('✓ Love reaction added');
      log.info(`  - User reaction: ${reaction.data.userReaction}`);
      log.info(`  - Love count: ${reaction.data.reactions?.love || 0}`);
    } else {
      log.error(`✗ Failed to add love reaction: ${reaction.data.message}`);
    }

    // Test 5.2: Remove love reaction (toggle)
    log.info('Toggling love reaction (should remove)...');
    const toggleReaction = await request('POST', `/engagement/react`, {
      contentType: 'comment',
      contentId: commentId,
      reactionType: 'love',
    }, authTokens.premiumOwner || authTokens.chatPassVisitor);

    if (toggleReaction.ok) {
      log.success('✓ Love reaction toggled');
      log.info(`  - User reaction: ${toggleReaction.data.userReaction}`);
      log.info(`  - Love count: ${toggleReaction.data.reactions?.love || 0}`);
    } else {
      log.error(`✗ Failed to toggle love reaction: ${toggleReaction.data.message}`);
    }
  } catch (error) {
    log.error(`Failed to test reactions: ${error.message}`);
  }
}

// Test 6: Report Comment
async function testReportComment(commentId) {
  log.section('TEST 6: Report Comment');

  if (!commentId) {
    log.warn('No comment ID - skipping report test');
    return;
  }

  try {
    log.info('Reporting comment...');
    const report = await request('POST', `/comments/${commentId}/report`, {
      reason: 'Automated test report - inappropriate content',
    }, authTokens.chatPassVisitor || authTokens.premiumOwner);

    if (report.ok) {
      log.success('✓ Comment reported successfully');
      log.info(`  - isHidden: ${report.data.isHidden}`);
      log.info(`  - Message: ${report.data.message}`);
    } else {
      log.error(`✗ Failed to report comment: ${report.data.message}`);
    }
  } catch (error) {
    log.error(`Failed to report comment: ${error.message}`);
  }
}

// Test 7: Feed Integration (Comment Count)
async function testFeedIntegration() {
  log.section('TEST 7: Feed Integration - Comment Count');

  try {
    log.info('Fetching feed to verify comment counts...');
    const feed = await request('GET', '/feed', null, authTokens.premiumOwner || authTokens.chatPassVisitor);

    if (feed.ok && feed.data.items && feed.data.items.length > 0) {
      const surveysWithComments = feed.data.items.filter(item => item.commentCount > 0);

      log.success(`✓ Feed integration working`);
      log.info(`  - Total items: ${feed.data.items.length}`);
      log.info(`  - Items with comments: ${surveysWithComments.length}`);

      surveysWithComments.slice(0, 3).forEach(item => {
        log.info(`\n  Survey: ${item.question || item.content}`);
        log.info(`    - Comment count: ${item.commentCount}`);
        log.info(`    - Views: ${item.views || 0}`);
        log.info(`    - Reactions: ${item.reactions?.total || 0}`);
      });
    } else {
      log.error('Failed to fetch feed for integration test');
    }
  } catch (error) {
    log.error(`Failed to test feed integration: ${error.message}`);
  }
}

// Main test runner
async function runTests() {
  console.log('\n' + '='.repeat(60));
  console.log('COMMENTS SYSTEM - END-TO-END TEST');
  console.log('='.repeat(60) + '\n');

  // Step 1: Authenticate
  const authSuccess = await testAuthentication();
  if (!authSuccess) {
    log.error('Authentication failed - cannot proceed with tests');
    return;
  }

  // Step 2: Get a survey to test with
  const surveyId = await getSurvey();
  if (!surveyId) {
    log.error('No survey found - cannot proceed with comment tests');
    return;
  }

  // Step 3: Test comment creation with entitlements
  await testCommentCreation(surveyId);

  // Step 4: Fetch comments
  const commentId = await testFetchComments(surveyId);

  // Step 5: Test reactions on comments
  await testCommentReactions(commentId);

  // Step 6: Test reporting
  await testReportComment(commentId);

  // Step 7: Test feed integration
  await testFeedIntegration();

  // Final summary
  log.section('TEST SUMMARY');
  log.success('All tests completed!');
  log.info('Check the logs above for detailed results');
  log.info('\nNext steps:');
  log.info('1. Open frontend and click comment button on a survey');
  log.info('2. Verify CommentsSheet slides up with Instagram Threads style');
  log.info('3. Verify premium owners have gold orbit on comments');
  log.info('4. Verify paywall appears for free users');
  log.info('5. Test love reaction toggle on comments');
  log.info('6. Test report button (3-dot menu)');
}

// Run tests
runTests().catch(error => {
  log.error(`Test runner failed: ${error.message}`);
  console.error(error);
});
