/**
 * Test Script for Staff + Booking API Endpoints
 * Run with: node test-staff-booking-api.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';
let bookingSlug = '';
let staffId = '';
let serviceId = '';
let bookingId = '';

// ANSI color codes for terminal output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message, error) {
  log(`❌ ${message}`, 'red');
  if (error.response) {
    console.log('   Status:', error.response.status);
    console.log('   Data:', JSON.stringify(error.response.data, null, 2));
  } else {
    console.log('   Error:', error.message);
  }
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Test 1: Login as owner
async function testOwnerLogin() {
  logSection('TEST 1: Owner Login');
  try {
    const response = await axios.post(`${BASE_URL}/owner/auth/login`, {
      email: 'owner@example.com', // Update with actual owner email
      password: 'password123', // Update with actual password
    });
    
    authToken = response.data.data.token;
    logSuccess('Owner login successful');
    console.log('   Token:', authToken.substring(0, 20) + '...');
    return true;
  } catch (error) {
    logError('Owner login failed', error);
    logWarning('Please update email/password in the script or create owner account');
    return false;
  }
}

// Test 2: Get business profile to extract bookingSlug
async function testGetBusinessProfile() {
  logSection('TEST 2: Get Business Profile');
  try {
    const response = await axios.get(`${BASE_URL}/owner/business/profile`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    bookingSlug = response.data.data.bookingSlug;
    const services = response.data.data.services || [];
    if (services.length > 0) {
      serviceId = services[0]._id;
    }
    
    logSuccess('Business profile retrieved');
    console.log('   Booking Slug:', bookingSlug);
    console.log('   Services Count:', services.length);
    if (serviceId) console.log('   First Service ID:', serviceId);
    return true;
  } catch (error) {
    logError('Failed to get business profile', error);
    return false;
  }
}

// Test 3: Create a staff member
async function testCreateStaff() {
  logSection('TEST 3: Create Staff Member');
  try {
    const staffData = {
      name: 'Sarah Johnson',
      role: 'Senior Stylist',
      photoUrl: 'https://i.pravatar.cc/300?img=47',
      serviceIds: serviceId ? [serviceId] : [],
      weeklySchedule: {
        monday: [{ start: '09:00', end: '17:00' }],
        tuesday: [{ start: '09:00', end: '17:00' }],
        wednesday: [{ start: '09:00', end: '17:00' }],
        thursday: [{ start: '09:00', end: '17:00' }],
        friday: [{ start: '09:00', end: '17:00' }],
        saturday: [{ start: '10:00', end: '16:00' }],
        sunday: [],
      },
    };

    const response = await axios.post(`${BASE_URL}/owner/staff`, staffData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    staffId = response.data.data.staff[response.data.data.staff.length - 1]._id;
    logSuccess('Staff member created');
    console.log('   Staff ID:', staffId);
    console.log('   Name:', response.data.data.staff[response.data.data.staff.length - 1].name);
    return true;
  } catch (error) {
    logError('Failed to create staff', error);
    return false;
  }
}

// Test 4: Get all staff (owner)
async function testGetStaff() {
  logSection('TEST 4: Get Staff List (Owner)');
  try {
    const response = await axios.get(`${BASE_URL}/owner/staff`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const staff = response.data.data.staff || [];
    logSuccess(`Retrieved ${staff.length} staff members`);
    staff.forEach((s, idx) => {
      console.log(`   ${idx + 1}. ${s.name} (${s.role}) - Active: ${s.isActive}`);
    });
    return true;
  } catch (error) {
    logError('Failed to get staff list', error);
    return false;
  }
}

// Test 5: Update staff member
async function testUpdateStaff() {
  logSection('TEST 5: Update Staff Member');
  if (!staffId) {
    logWarning('No staff ID available, skipping test');
    return false;
  }

  try {
    const response = await axios.patch(`${BASE_URL}/owner/staff/${staffId}`, {
      role: 'Master Stylist',
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    logSuccess('Staff member updated');
    const updatedStaff = response.data.data.staff.find(s => s._id.toString() === staffId);
    console.log('   New Role:', updatedStaff.role);
    return true;
  } catch (error) {
    logError('Failed to update staff', error);
    return false;
  }
}

// Test 6: Enable customer staff selection
async function testEnableStaffSelection() {
  logSection('TEST 6: Enable Customer Staff Selection');
  try {
    const response = await axios.patch(`${BASE_URL}/owner/staff/settings`, {
      allowCustomerChooseStaff: true,
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    logSuccess('Staff selection enabled');
    console.log('   Setting:', response.data.data.allowCustomerChooseStaff);
    return true;
  } catch (error) {
    logError('Failed to update settings', error);
    return false;
  }
}

// Test 7: Get public staff list
async function testGetPublicStaff() {
  logSection('TEST 7: Get Public Staff List');
  if (!bookingSlug) {
    logWarning('No booking slug available, skipping test');
    return false;
  }

  try {
    const url = serviceId 
      ? `${BASE_URL}/public/staff/${bookingSlug}?serviceId=${serviceId}`
      : `${BASE_URL}/public/staff/${bookingSlug}`;
    
    const response = await axios.get(url);
    
    const staff = response.data.data.staff || [];
    logSuccess(`Retrieved ${staff.length} public staff members`);
    console.log('   Allow Customer Choose:', response.data.data.allowCustomerChooseStaff);
    staff.forEach((s, idx) => {
      console.log(`   ${idx + 1}. ${s.name} (${s.role})`);
    });
    return true;
  } catch (error) {
    logError('Failed to get public staff list', error);
    return false;
  }
}

// Test 8: Get availability
async function testGetAvailability() {
  logSection('TEST 8: Get Availability Slots');
  if (!bookingSlug) {
    logWarning('No booking slug available, skipping test');
    return false;
  }

  try {
    const date = '2025-11-18'; // Monday
    const url = staffId 
      ? `${BASE_URL}/public/availability/${bookingSlug}?date=${date}&staffId=${staffId}&serviceId=${serviceId}`
      : `${BASE_URL}/public/availability/${bookingSlug}?date=${date}&serviceId=${serviceId}`;
    
    const response = await axios.get(url);
    
    const slots = response.data.data.slots || [];
    logSuccess(`Retrieved ${slots.length} available time slots`);
    console.log('   Date:', response.data.data.date);
    if (slots.length > 0) {
      console.log('   First 5 slots:', slots.slice(0, 5).join(', '));
      console.log('   Last 5 slots:', slots.slice(-5).join(', '));
    }
    return true;
  } catch (error) {
    logError('Failed to get availability', error);
    return false;
  }
}

// Test 9: Create a booking
async function testCreateBooking() {
  logSection('TEST 9: Create Booking');
  if (!bookingSlug || !serviceId) {
    logWarning('Missing booking slug or service ID, skipping test');
    return false;
  }

  try {
    const bookingData = {
      serviceId: serviceId,
      staffId: staffId || 'any',
      date: '2025-11-18',
      time: '10:00',
      customerName: 'Jane Doe',
      customerEmail: 'jane.doe@example.com',
      customerPhone: '555-123-4567',
      customerNotes: 'First time customer, looking for balayage',
    };

    const response = await axios.post(`${BASE_URL}/public/booking/${bookingSlug}`, bookingData);
    
    bookingId = response.data.data.bookingId;
    logSuccess('Booking created successfully');
    console.log('   Booking ID:', bookingId);
    console.log('   Date:', response.data.data.appointmentDate);
    console.log('   Time:', response.data.data.startTime, '-', response.data.data.endTime);
    console.log('   Staff:', response.data.data.staff);
    console.log('   Status:', response.data.data.status);
    return true;
  } catch (error) {
    logError('Failed to create booking', error);
    return false;
  }
}

// Test 10: Get booking statistics
async function testGetBookingStats() {
  logSection('TEST 10: Get Booking Statistics');
  try {
    const response = await axios.get(`${BASE_URL}/owner/bookings/stats/summary`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    logSuccess('Booking statistics retrieved');
    console.log('   Today:', response.data.data.today);
    console.log('   Upcoming (7 days):', response.data.data.upcoming);
    console.log('   Total:', response.data.data.total);
    console.log('   Pending:', response.data.data.pending);
    return true;
  } catch (error) {
    logError('Failed to get booking stats', error);
    return false;
  }
}

// Test 11: Get all bookings
async function testGetBookings() {
  logSection('TEST 11: Get All Bookings');
  try {
    const response = await axios.get(`${BASE_URL}/owner/bookings`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const bookings = response.data.data.bookings || [];
    logSuccess(`Retrieved ${bookings.length} bookings`);
    bookings.forEach((b, idx) => {
      console.log(`   ${idx + 1}. ${b.customer.name} - ${new Date(b.appointmentDate).toLocaleDateString()} ${b.startTime} - ${b.status}`);
    });
    return true;
  } catch (error) {
    logError('Failed to get bookings', error);
    return false;
  }
}

// Test 12: Update booking status
async function testUpdateBookingStatus() {
  logSection('TEST 12: Update Booking Status');
  if (!bookingId) {
    logWarning('No booking ID available, skipping test');
    return false;
  }

  try {
    const response = await axios.patch(`${BASE_URL}/owner/bookings/${bookingId}/status`, {
      status: 'confirmed',
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    logSuccess('Booking status updated');
    console.log('   New Status:', response.data.data.status);
    console.log('   Confirmed At:', response.data.data.confirmedAt);
    return true;
  } catch (error) {
    logError('Failed to update booking status', error);
    return false;
  }
}

// Test 13: Get single booking
async function testGetBookingById() {
  logSection('TEST 13: Get Single Booking');
  if (!bookingId) {
    logWarning('No booking ID available, skipping test');
    return false;
  }

  try {
    const response = await axios.get(`${BASE_URL}/owner/bookings/${bookingId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    logSuccess('Booking details retrieved');
    console.log('   Customer:', response.data.data.customer.name);
    console.log('   Service:', response.data.data.service.name);
    console.log('   Price:', response.data.data.service.price);
    console.log('   Status:', response.data.data.status);
    return true;
  } catch (error) {
    logError('Failed to get booking by ID', error);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  log('\n🚀 Starting Staff + Booking API Tests\n', 'blue');
  
  const results = {
    passed: 0,
    failed: 0,
    skipped: 0,
  };

  const tests = [
    { name: 'Owner Login', fn: testOwnerLogin, critical: true },
    { name: 'Get Business Profile', fn: testGetBusinessProfile, critical: true },
    { name: 'Create Staff Member', fn: testCreateStaff, critical: false },
    { name: 'Get Staff List', fn: testGetStaff, critical: false },
    { name: 'Update Staff Member', fn: testUpdateStaff, critical: false },
    { name: 'Enable Staff Selection', fn: testEnableStaffSelection, critical: false },
    { name: 'Get Public Staff List', fn: testGetPublicStaff, critical: false },
    { name: 'Get Availability', fn: testGetAvailability, critical: false },
    { name: 'Create Booking', fn: testCreateBooking, critical: false },
    { name: 'Get Booking Statistics', fn: testGetBookingStats, critical: false },
    { name: 'Get All Bookings', fn: testGetBookings, critical: false },
    { name: 'Update Booking Status', fn: testUpdateBookingStatus, critical: false },
    { name: 'Get Single Booking', fn: testGetBookingById, critical: false },
  ];

  for (const test of tests) {
    const result = await test.fn();
    
    if (result === true) {
      results.passed++;
    } else if (result === false && test.critical) {
      results.failed++;
      log(`\n⛔ Critical test failed. Stopping tests.\n`, 'red');
      break;
    } else if (result === false) {
      results.skipped++;
    }
    
    await wait(500); // Small delay between tests
  }

  // Summary
  logSection('TEST SUMMARY');
  log(`✅ Passed: ${results.passed}`, 'green');
  if (results.failed > 0) log(`❌ Failed: ${results.failed}`, 'red');
  if (results.skipped > 0) log(`⚠️  Skipped: ${results.skipped}`, 'yellow');
  
  const total = results.passed + results.failed + results.skipped;
  const percentage = Math.round((results.passed / total) * 100);
  log(`\n📊 Success Rate: ${percentage}%\n`, percentage === 100 ? 'green' : 'yellow');
}

// Run tests
runAllTests().catch(error => {
  console.error('Test runner crashed:', error);
  process.exit(1);
});
