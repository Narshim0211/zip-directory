/**
 * Stripe Webhook Diagnostic Tool
 * Tests your webhook endpoint and verifies configuration
 * 
 * Usage:
 * node backend/scripts/testWebhook.js "user@example.com"
 */

const axios = require('axios');
require('dotenv').config();
const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const webhookUrl = process.env.TOOLKIT_WEBHOOK_TEST_URL || 'http://localhost:5000/webhooks/stripe';

async function testWebhook(userEmail) {
  console.log('🔧 Stripe Webhook Diagnostic Tool\n');
  console.log('Configuration:');
  console.log('  Webhook URL:', webhookUrl);
  console.log('  Stripe Secret Key:', process.env.STRIPE_SECRET_KEY ? '✅ Set' : '❌ Missing');
  console.log('  Webhook Secret:', webhookSecret !== 'whsec_your_webhook_secret' ? '✅ Set' : '⚠️  Using placeholder');
  console.log('');

  // Check if webhook secret is placeholder
  if (webhookSecret === 'whsec_your_webhook_secret') {
    console.error('❌ ERROR: Webhook secret is still a placeholder!');
    console.error('');
    console.error('To fix this:');
    console.error('1. Go to: https://dashboard.stripe.com/test/webhooks');
    console.error('2. Click "Add endpoint"');
    console.error('3. Enter URL:', webhookUrl);
    console.error('4. Select events: checkout.session.completed, invoice.payment_failed');
    console.error('5. Copy the "Signing secret" (starts with whsec_)');
    console.error('6. Update STRIPE_WEBHOOK_SECRET in your .env file');
    console.error('7. Restart your backend server');
    console.error('');
    process.exit(1);
  }

  // Test 1: Check if backend is running
  console.log('Test 1: Checking if backend is running...');
  try {
    await axios.get(webhookUrl.replace('/webhooks/stripe', '/health'), { timeout: 3000 });
    console.log('✅ Backend is running\n');
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Backend is not running!');
      console.error('Start your backend: cd backend && npm run dev\n');
      process.exit(1);
    }
    console.log('⚠️  Health endpoint not found, but backend might be running\n');
  }

  // Test 2: Create a fake webhook event
  console.log('Test 2: Creating test webhook event...');
  
  const event = {
    id: 'evt_test_' + Date.now(),
    object: 'event',
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_' + Date.now(),
        object: 'checkout.session',
        customer: 'cus_test_123',
        customer_email: userEmail,
        subscription: 'sub_test_123',
        metadata: {
          toolkitUserId: null
        }
      }
    }
  };

  const payload = JSON.stringify(event);
  const timestamp = Math.floor(Date.now() / 1000);
  
  // Generate signature
  const signature = Stripe.webhooks.generateTestHeaderString({
    payload,
    secret: webhookSecret,
    timestamp
  });

  console.log('Event type:', event.type);
  console.log('Customer email:', userEmail);
  console.log('');

  // Test 3: Send webhook to your endpoint
  console.log('Test 3: Sending webhook to your endpoint...');
  try {
    const response = await axios.post(webhookUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Stripe-Signature': signature
      }
    });

    console.log('✅ Webhook received successfully!');
    console.log('Response:', response.data);
    console.log('');
    console.log('✅ SUCCESS: Your webhook is working!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Check your database to verify user was updated');
    console.log('2. Try a real Stripe checkout to confirm end-to-end flow');
    console.log('');
  } catch (error) {
    console.error('❌ Webhook failed!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    console.error('');
    console.error('Possible issues:');
    console.error('- Backend not running on port 5000');
    console.error('- Webhook secret mismatch');
    console.error('- Route not properly configured');
    console.error('');
    process.exit(1);
  }
}

const email = process.argv[2] || 'test@example.com';
testWebhook(email);
