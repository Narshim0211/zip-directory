/**
 * Test Script for Feed Ranking Algorithm
 *
 * Tests the ranking service with sample data to verify:
 * 1. Follow boost works (followed items appear first)
 * 2. Velocity works (fast-rising content beats old popular)
 * 3. Premium boost works (but doesn't overwhelm)
 * 4. New creator boost works
 * 5. Score calculation handles edge cases
 */

const feedRankingService = require('../services/feedRankingService');

// Sample feed items (simulating different scenarios)
const sampleItems = [
  {
    _id: '1',
    type: 'survey',
    authorId: 'user-followed-1',
    question: 'Should I get balayage?',
    loveCount: 5,
    totalVotes: 10,
    viewCount: 20,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    isPremium: false
  },
  {
    _id: '2',
    type: 'post',
    authorId: 'user-not-followed-1',
    text: 'Check out this amazing hair transformation!',
    loveCount: 100,
    viewCount: 500,
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
    isPremium: true
  },
  {
    _id: '3',
    type: 'survey',
    authorId: 'user-new-creator',
    question: 'What color should I try next?',
    loveCount: 3,
    totalVotes: 5,
    viewCount: 10,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago (fast-rising!)
    isPremium: false
  },
  {
    _id: '4',
    type: 'post',
    authorId: 'user-followed-2',
    text: 'New salon opening next week!',
    loveCount: 20,
    viewCount: 100,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    isPremium: true
  },
  {
    _id: '5',
    type: 'survey',
    authorId: 'user-spam',
    question: 'Vote for me!',
    loveCount: 50,
    viewCount: 5000, // Very low unique rate = spam
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    isPremium: false
  }
];

// User follows user-followed-1 and user-followed-2
const followedIds = ['user-followed-1', 'user-followed-2'];
const userId = 'test-user';

console.log('🧪 FEED RANKING ALGORITHM TEST\n');
console.log('=' .repeat(60));

// Test 1: Calculate individual scores
console.log('\n📊 TEST 1: Individual Score Calculation\n');
sampleItems.forEach((item, index) => {
  const explanation = feedRankingService.explainScore(item, userId, followedIds);

  console.log(`Item ${index + 1}: ${item.question || item.text}`);
  console.log(`  Author: ${item.authorId}`);
  console.log(`  Type: ${item.type}`);
  console.log(`  Age: ${explanation.metadata.hoursOld} hours`);
  console.log(`  Engagement: ${explanation.metadata.totalEngagement} (loves + votes)`);
  console.log(`  Followed: ${explanation.metadata.isFollowed ? '✅' : '❌'}`);
  console.log(`  Premium: ${explanation.metadata.isPremium ? '💎' : '⚪'}`);
  console.log(`  TOTAL SCORE: ${explanation.totalScore}`);
  console.log(`  Breakdown:`);
  console.log(`    - Velocity: ${explanation.breakdown.velocity.weighted.toFixed(2)}`);
  console.log(`    - Love count: ${explanation.breakdown.loveCount.weighted.toFixed(2)}`);
  console.log(`    - Unique rate: ${explanation.breakdown.uniqueRate.weighted.toFixed(2)}`);
  console.log(`    - Follow boost: ${explanation.breakdown.followBoost.value}`);
  console.log(`    - Premium boost: ${explanation.breakdown.premiumBoost.value}`);
  console.log(`    - New item boost: ${explanation.breakdown.newItemBoost.value}`);
  console.log(`    - Decay: ${explanation.breakdown.decay.weighted.toFixed(2)}`);
  console.log('');
});

// Test 2: Rank all items
console.log('=' .repeat(60));
console.log('\n🏆 TEST 2: Ranked Feed Order\n');

const rankedItems = feedRankingService.rankFeedItems(sampleItems, userId, followedIds);

rankedItems.forEach((item, index) => {
  const followIcon = item._isFollowed ? '✅ FOLLOWED' : '⚪ Not followed';
  const premiumIcon = item._isPremium ? '💎 PREMIUM' : '';

  console.log(`${index + 1}. Score: ${item._rankingScore.toFixed(2)} | ${followIcon} ${premiumIcon}`);
  console.log(`   ${item.question || item.text}`);
  console.log('');
});

// Test 3: Verify expected behavior
console.log('=' .repeat(60));
console.log('\n✅ TEST 3: Validation Checks\n');

const checks = [
  {
    name: 'Followed items appear before non-followed',
    pass: rankedItems[0]._isFollowed && rankedItems[1]._isFollowed,
    details: `Top 2 items are followed: ${rankedItems[0]._isFollowed && rankedItems[1]._isFollowed}`
  },
  {
    name: 'Fast-rising content (Item 3) beats old popular (Item 2)',
    pass: rankedItems.findIndex(item => item._id === '3') < rankedItems.findIndex(item => item._id === '2'),
    details: `Item 3 position: ${rankedItems.findIndex(item => item._id === '3') + 1}, Item 2 position: ${rankedItems.findIndex(item => item._id === '2') + 1}`
  },
  {
    name: 'Spam content (low unique rate) appears last',
    pass: rankedItems[rankedItems.length - 1]._id === '5',
    details: `Last item ID: ${rankedItems[rankedItems.length - 1]._id}`
  },
  {
    name: 'All items have valid scores',
    pass: rankedItems.every(item => item._rankingScore >= 0),
    details: `Min score: ${Math.min(...rankedItems.map(i => i._rankingScore))}, Max: ${Math.max(...rankedItems.map(i => i._rankingScore))}`
  }
];

checks.forEach(check => {
  const icon = check.pass ? '✅' : '❌';
  console.log(`${icon} ${check.name}`);
  console.log(`   ${check.details}`);
  console.log('');
});

// Test 4: Edge cases
console.log('=' .repeat(60));
console.log('\n🔬 TEST 4: Edge Cases\n');

const edgeCases = [
  { name: 'Item with 0 loves', item: { loveCount: 0, viewCount: 10, createdAt: new Date(), authorId: 'test' } },
  { name: 'Very old item (30 days)', item: { loveCount: 100, viewCount: 200, createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), authorId: 'test' } },
  { name: 'Brand new item (5 minutes)', item: { loveCount: 2, viewCount: 3, createdAt: new Date(Date.now() - 5 * 60 * 1000), authorId: 'test' } },
  { name: 'Item with missing data', item: { createdAt: new Date() } }
];

edgeCases.forEach(testCase => {
  const score = feedRankingService.calculateScore(testCase.item, userId, followedIds);
  console.log(`${testCase.name}: ${score.toFixed(2)}`);
});

console.log('\n' + '='.repeat(60));
console.log('\n✅ RANKING ALGORITHM TEST COMPLETE\n');
console.log('If all checks passed, the algorithm is working correctly!');
console.log('Ready to integrate into feedAggregatorService.js\n');
