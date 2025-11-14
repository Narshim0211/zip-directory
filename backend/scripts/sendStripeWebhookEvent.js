const axios = require("axios");
const Stripe = require("stripe");

require("dotenv").config({ path: require("path").resolve(__dirname, "..", ".env") });

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

if (!stripe) {
  console.error("Missing STRIPE_SECRET_KEY in env.");
  process.exit(1);
}

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
if (!webhookSecret) {
  console.error("Missing STRIPE_WEBHOOK_SECRET in env.");
  process.exit(1);
}

const webhookUrl = process.env.TOOLKIT_WEBHOOK_TEST_URL || "http://localhost:5000/webhooks/stripe";

const userId = process.argv[2];
const customerEmail = process.argv[3] || "tester@example.com";

if (!userId) {
  console.error("Usage: node sendStripeWebhookEvent.js <userId> [email]");
  process.exit(1);
}

const payload = JSON.stringify({
  id: `evt_test_${Date.now()}`,
  object: "event",
  type: "checkout.session.completed",
  data: {
    object: {
      id: `cs_test_${Date.now()}`,
      object: "checkout.session",
      mode: "subscription",
      customer: `cus_test_${Date.now()}`,
      subscription: `sub_test_${Date.now()}`,
      customer_email: customerEmail,
      metadata: {
        toolkitUserId: userId,
      },
    },
  },
});

const header = Stripe.webhooks.generateTestHeaderString({
  payload,
  secret: webhookSecret,
  timestamp: Math.floor(Date.now() / 1000),
});

axios
  .post(webhookUrl, payload, {
    headers: {
      "Content-Type": "application/json",
      "Stripe-Signature": header,
    },
  })
  .then((response) => {
    console.log("Webhook delivered:", response.status, response.data);
  })
  .catch((error) => {
    console.error("Webhook delivery failed", error.response?.data || error.message);
    process.exit(1);
  });
