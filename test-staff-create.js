const axios = require('axios');

// This simulates the exact request your frontend is making
async function testCreateStaff() {
  try {
    const payload = {
      firstName: "Narshim",
      lastName: "siwakoti",
      email: "narshim413@gmail.com",
      phone: "6824368435",
      specialties: "aaaa", // NOTE: This is a STRING, not an array!
      workingHours: {
        monday: { enabled: true, start: "09:00 AM", end: "05:00 PM" },
        tuesday: { enabled: true, start: "09:00 AM", end: "05:00 PM" },
        wednesday: { enabled: true, start: "09:00 AM", end: "05:00 PM" },
        thursday: { enabled: true, start: "09:00 AM", end: "05:00 PM" }
      }
    };

    console.log('Sending payload:', JSON.stringify(payload, null, 2));
    
    // Direct call to booking service (bypassing gateway for debugging)
    const response = await axios.post('http://localhost:6002/api/staff', payload, {
      headers: {
        'Content-Type': 'application/json',
        // Simulating a valid token
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      }
    });

    console.log('Success!', response.data);
  } catch (error) {
    console.error('========== ERROR ==========');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else {
      console.error('Error:', error.message);
    }
    console.error('===========================');
  }
}

testCreateStaff();
