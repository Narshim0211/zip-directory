const Stripe = require("stripe");
const User = require("../models/User");
const logger = require("../utils/logger");

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

const verifySecret = process.env.STRIPE_WEBHOOK_SECRET;

const handleEvent = async (event) => {
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata?.toolkitUserId;

    const user = userId ? await User.findById(userId) : await User.findOne({ email: session.customer_email });
    if (!user) {
      logger.warn("Stripe webhook: user not found", { userId, email: session.customer_email });
      return;
    }

    user.subscriptionStatus = "active";
    user.subscriptionPlan = "premium";
    user.subscriptionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    user.stripeCustomerId = session.customer;
    user.stripeSubscriptionId = session.subscription;
    await user.save();
  }

  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object;
    const subscriptionId = invoice.subscription;
    const user = await User.findOne({ stripeSubscriptionId: subscriptionId });
    if (user) {
      user.subscriptionStatus = "past_due";
      if (invoice.next_payment_attempt) {
        user.subscriptionExpiresAt = new Date(invoice.next_payment_attempt * 1000);
      }
      await user.save();
    }
  }
};

const stripeWebhook = async (req, res) => {
  if (!stripe || !verifySecret) {
    return res.status(503).send("Stripe is not configured");
  }

  const payload = req.rawBody;
  const signature = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, verifySecret);
  } catch (err) {
    logger.error("Stripe webhook signature invalid", { message: err.message });
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    await handleEvent(event);
    res.json({ received: true });
  } catch (err) {
    logger.error("Stripe webhook processing failed", { message: err.message });
    res.status(500).send("Webhook handler failed");
  }
};

module.exports = { stripeWebhook };
