/**
 * Test script to verify contact information is showing in admin feedback inbox
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testContactInfoInFeedback() {
  console.log('\n🧪 Testing Contact Information in Admin Feedback Inbox\n');
  console.log('='.repeat(60));

  try {
    // 1. Login as admin (use test admin from test script)
    console.log('\n📝 Step 1: Logging in as admin...');
    const adminLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });
    const adminToken = adminLogin.data.token;
    console.log('✅ Admin logged in successfully');

    // 2. Fetch all feedback
    console.log('\n📝 Step 2: Fetching all feedback from admin endpoint...');
    const response = await axios.get(`${API_BASE}/admin/feedback`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    console.log(`✅ Retrieved ${response.data.data.length} feedback items`);

    // 3. Check if contact info is present
    console.log('\n📝 Step 3: Checking if contact information is included...\n');
    
    let hasContactInfo = true;
    response.data.data.forEach((feedback, index) => {
      console.log(`\n📋 Feedback #${index + 1}:`);
      console.log(`   Title: ${feedback.title}`);
      console.log(`   User Type: ${feedback.userType}`);
      
      if (feedback.user) {
        console.log(`   👤 Name: ${feedback.user.name}`);
        console.log(`   📧 Email: ${feedback.user.email}`);
        console.log(`   🏷️  Role: ${feedback.user.role}`);
        console.log('   ✅ Contact info present');
      } else {
        console.log('   ❌ Contact info MISSING');
        hasContactInfo = false;
      }
    });

    console.log('\n' + '='.repeat(60));
    if (hasContactInfo) {
      console.log('\n🎉 SUCCESS: All feedback items have contact information!');
      console.log('\n✅ Admin can now see:');
      console.log('   • User name');
      console.log('   • User email (clickable mailto: link)');
      console.log('   • User role');
      console.log('\n💡 Next steps:');
      console.log('   1. Open http://localhost:5173/feedback');
      console.log('   2. Login as admin');
      console.log('   3. See contact info in feedback cards');
      console.log('   4. Click on feedback to see detailed contact section');
    } else {
      console.log('\n⚠️  WARNING: Some feedback items are missing contact info');
      console.log('   This might be due to deleted users or data issues');
    }

    console.log('\n📊 Summary:');
    console.log(`   Total Feedback: ${response.data.pagination.total}`);
    console.log(`   Visitors: ${response.data.counts.visitor}`);
    console.log(`   Owners: ${response.data.counts.owner}`);
    console.log(`   Open: ${response.data.counts.open}`);

  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data?.message || error.message);
    console.error('Error details:', error.code || error.response?.status);
    if (error.response?.data) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    if (error.response?.status === 401) {
      console.log('\n💡 Tip: Make sure admin credentials are correct');
      console.log('   Default: admin@example.com / admin123');
    }
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Tip: Make sure backend is running on port 5000');
      console.log('   Run: cd backend && npm start');
    }
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

testContactInfoInFeedback();
