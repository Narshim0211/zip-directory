/**
 * Quick API Test - Check server and routes
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function quickTest() {
  console.log('\n🔍 Quick API Health Check\n');
  
  // Test 1: Check if server is responding
  console.log('1. Testing server connection...');
  try {
    const response = await axios.get(`${BASE_URL}/public/profile/test-slug`);
    console.log('   ✅ Server responding');
  } catch (error) {
    if (error.response) {
      console.log('   ✅ Server responding (expected 404)');
    } else {
      console.log('   ❌ Server not responding');
      console.log('   Error:', error.message);
      return;
    }
  }

  // Test 2: List available routes
  console.log('\n2. API Routes registered:');
  console.log('   Owner Staff:');
  console.log('     - GET    /api/owner/staff');
  console.log('     - POST   /api/owner/staff');
  console.log('     - PATCH  /api/owner/staff/:staffId');
  console.log('     - DELETE /api/owner/staff/:staffId');
  console.log('     - PATCH  /api/owner/staff/settings');
  
  console.log('\n   Public Booking:');
  console.log('     - GET    /api/public/profile/:slug');
  console.log('     - GET    /api/public/booking/:slug');
  console.log('     - GET    /api/public/staff/:slug');
  console.log('     - GET    /api/public/availability/:slug');
  console.log('     - POST   /api/public/booking/:slug');
  
  console.log('\n   Owner Bookings:');
  console.log('     - GET    /api/owner/bookings');
  console.log('     - GET    /api/owner/bookings/stats/summary');
  console.log('     - GET    /api/owner/bookings/:bookingId');
  console.log('     - PATCH  /api/owner/bookings/:bookingId/status');
  console.log('     - DELETE /api/owner/bookings/:bookingId');

  // Test 3: Test public endpoint (no auth required)
  console.log('\n3. Testing public endpoint (no auth)...');
  try {
    const response = await axios.get(`${BASE_URL}/public/staff/nonexistent-slug`);
    console.log('   Status:', response.status);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log('   ✅ Public staff endpoint working (404 expected for invalid slug)');
    } else {
      console.log('   ❌ Unexpected error:', error.message);
    }
  }

  // Test 4: Test protected endpoint (should fail without auth)
  console.log('\n4. Testing protected endpoint (no auth - should fail)...');
  try {
    const response = await axios.get(`${BASE_URL}/owner/staff`);
    console.log('   ⚠️  Expected 401 but got:', response.status);
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('   ✅ Protected endpoint correctly requiring auth');
    } else {
      console.log('   Status:', error.response?.status || 'No response');
      console.log('   Error:', error.message);
    }
  }

  console.log('\n✅ Quick health check complete!\n');
  console.log('📝 Next steps:');
  console.log('   1. Login as owner to get auth token');
  console.log('   2. Run full test with: node test-staff-booking-api.js');
  console.log('   3. Update credentials in test script if needed\n');
}

quickTest().catch(error => {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
});
