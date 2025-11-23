/**
 * Quick API Test Script for Trending Surveys
 * Run with: node test-trending-apis.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/surveys/trending';

async function testTrendingAPIs() {
  console.log('🧪 Testing Trending Survey APIs...\n');

  try {
    // Test 1: Survey of the Day
    console.log('1️⃣ Testing Survey of the Day...');
    const sodResponse = await axios.get(`${BASE_URL}/survey-of-the-day`);
    console.log('✅ Status:', sodResponse.status);
    console.log('📊 Data:', sodResponse.data.success ? 'SUCCESS' : 'FAILED');
    if (sodResponse.data.data) {
      console.log('   Survey:', sodResponse.data.data.question);
      console.log('   Love Count:', sodResponse.data.data.loveCount);
      console.log('   Love Velocity:', sodResponse.data.data.loveVelocity?.toFixed(2));
    } else {
      console.log('   Message:', sodResponse.data.message);
    }
    console.log('');

    // Test 2: Trending Today
    console.log('2️⃣ Testing Trending Today...');
    const ttResponse = await axios.get(`${BASE_URL}/today?limit=5`);
    console.log('✅ Status:', ttResponse.status);
    console.log('📊 Data:', ttResponse.data.success ? 'SUCCESS' : 'FAILED');
    console.log('   Count:', ttResponse.data.count);
    if (ttResponse.data.data && ttResponse.data.data.length > 0) {
      ttResponse.data.data.forEach((survey, idx) => {
        console.log(`   ${idx + 1}. ${survey.question} (💜 ${survey.loveCount})`);
      });
    } else {
      console.log('   No trending surveys today');
    }
    console.log('');

    // Test 3: Trending This Week
    console.log('3️⃣ Testing Trending This Week...');
    const twResponse = await axios.get(`${BASE_URL}/week?limit=5`);
    console.log('✅ Status:', twResponse.status);
    console.log('📊 Data:', twResponse.data.success ? 'SUCCESS' : 'FAILED');
    console.log('   Count:', twResponse.data.count);
    if (twResponse.data.data && twResponse.data.data.length > 0) {
      twResponse.data.data.forEach((survey, idx) => {
        const emoji = idx === 0 ? '🏆' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '📊';
        console.log(`   ${emoji} #${idx + 1}. ${survey.question} (💜 ${survey.loveCount}, Engagement: ${survey.engagementScore?.toFixed(0)})`);
      });
    } else {
      console.log('   No trending surveys this week');
    }
    console.log('');

    // Test 4: Cache Stats
    console.log('4️⃣ Testing Cache Stats...');
    const cacheResponse = await axios.get(`${BASE_URL}/cache/stats`);
    console.log('✅ Status:', cacheResponse.status);
    console.log('📊 Cache Info:');
    console.log('   Size:', cacheResponse.data.data.size);
    console.log('   Keys:', cacheResponse.data.data.keys.join(', '));
    if (cacheResponse.data.data.timestamps) {
      Object.entries(cacheResponse.data.data.timestamps).forEach(([key, info]) => {
        console.log(`   ${key}: age ${info.age}s, TTL remaining ${info.ttlRemaining}s`);
      });
    }
    console.log('');

    console.log('🎉 All API tests passed!\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

// Run tests
testTrendingAPIs();
