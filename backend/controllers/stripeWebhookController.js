const Stripe = require("stripe");
const User = require("../models/User");
const Business = require("../models/Business");
const logger = require("../utils/logger");

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

const verifySecret = process.env.STRIPE_WEBHOOK_SECRET;

const handleEvent = async (event) => {
  // ========================================
  // USER SUBSCRIPTION EVENTS
  // ========================================
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const subscriptionType = session.metadata?.subscriptionType; // 'CHAT_PASS' or 'PREMIUM' or 'TOOLKIT'
    const userId = session.metadata?.userId || session.metadata?.toolkitUserId;

    const user = userId ? await User.findById(userId) : await User.findOne({ email: session.customer_email });
    if (!user) {
      logger.warn("Stripe webhook: user not found", { userId, email: session.customer_email });
      return;
    }

    // Handle Chat Pass subscription (Visitor Stylist Access Pass - $9.99/mo)
    if (subscriptionType === 'CHAT_PASS') {
      user.hasChatPass = true;
      user.chatPassActivatedAt = new Date();
      user.chatPassExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      user.chatPassSubscriptionId = session.subscription;
      user.chatPassGraceEndsAt = null; // Clear grace period
      user.stripeCustomerId = session.customer;
      await user.save();
      logger.info(`Chat Pass activated for user: ${user._id}`);
    }
    // Handle existing toolkit/premium user subscriptions
    else {
      user.subscriptionStatus = "active";
      user.subscriptionPlan = "premium";
      user.subscriptionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      user.stripeCustomerId = session.customer;
      user.stripeSubscriptionId = session.subscription;
      await user.save();
    }
  }

  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object;
    const subscriptionId = invoice.subscription;

    // Try to find user subscription first
    const user = await User.findOne({ stripeSubscriptionId: subscriptionId });
    if (user) {
      user.subscriptionStatus = "past_due";
      if (invoice.next_payment_attempt) {
        user.subscriptionExpiresAt = new Date(invoice.next_payment_attempt * 1000);
      }
      await user.save();
      return; // Exit early if user subscription found
    }

    // If not a user subscription, check if it's a business premium subscription
    if (invoice.subscription) {
      const customerId = invoice.customer;
      const business = await Business.findOne({ stripeCustomerId: customerId });

      if (business && business.premiumSubscription) {
        business.premiumSubscription.status = "past_due";
        await business.save();
        logger.warn(`Premium payment failed for business: ${business._id}`);
      }
    }
  }

  // ========================================
  // BUSINESS PREMIUM SUBSCRIPTION EVENTS
  // ========================================

  // Premium subscription created or updated
  if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated") {
    const subscription = event.data.object;
    const customerId = subscription.customer;

    const business = await Business.findOne({ stripeCustomerId: customerId });

    if (business) {
      const isActive = subscription.status === "active";

      business.premiumSubscription = {
        active: isActive,
        subscriptionId: subscription.id,
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end
      };

      await business.updateVerificationStep('premiumPlanActive', isActive);

      logger.info(`Premium subscription ${isActive ? 'activated' : 'updated'} for business: ${business._id}`);
    }
  }

  // Premium subscription deleted/canceled
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object;
    const customerId = subscription.customer;

    // Check if this is a Chat Pass subscription
    const userWithChatPass = await User.findOne({ chatPassSubscriptionId: subscription.id });
    if (userWithChatPass) {
      // Set grace period: 30 days from now
      userWithChatPass.hasChatPass = false;
      userWithChatPass.chatPassExpiresAt = new Date(subscription.current_period_end * 1000);
      userWithChatPass.chatPassGraceEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await userWithChatPass.save();
      logger.info(`Chat Pass canceled for user: ${userWithChatPass._id}, grace period active until ${userWithChatPass.chatPassGraceEndsAt}`);
      return;
    }

    // Check if this is a business premium subscription
    const business = await Business.findOne({ stripeCustomerId: customerId });

    if (business) {
      business.premiumSubscription = {
        active: false,
        subscriptionId: subscription.id,
        status: "canceled",
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: true
      };

      await business.updateVerificationStep('premiumPlanActive', false);

      logger.info(`Premium subscription canceled for business: ${business._id}`);
    }
  }

  // Premium subscription payment succeeded
  if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object;

    // Only handle if this is for a subscription (not a one-time payment)
    if (invoice.subscription) {
      const customerId = invoice.customer;
      const business = await Business.findOne({ stripeCustomerId: customerId });

      if (business && business.premiumSubscription) {
        business.premiumSubscription.status = "active";
        business.premiumSubscription.active = true;
        await business.save();

        logger.info(`Premium payment succeeded for business: ${business._id}`);
      }
    }
  }

  // ========================================
  // BUSINESS STRIPE CONNECT EVENTS
  // ========================================

  // Stripe Connect account successfully created and verified
  if (event.type === "account.updated") {
    const account = event.data.object;

    // Find business by Stripe account ID
    const business = await Business.findOne({ stripeAccountId: account.id });

    if (business) {
      // Check if account is fully verified (charges_enabled = true)
      const isVerified = account.charges_enabled === true;

      if (isVerified && !business.verificationSteps.stripeConnected) {
        logger.info("Stripe Connect account verified", {
          businessId: business._id,
          stripeAccountId: account.id
        });

        // Update verification status
        await business.updateVerificationStep('stripeConnected', true);

        logger.info("Business verification updated to fully_verified", {
          businessId: business._id,
          newStatus: business.verificationStatus
        });
      } else if (!isVerified && business.verificationSteps.stripeConnected) {
        // Handle account becoming unverified (rare case)
        logger.warn("Stripe Connect account lost verification", {
          businessId: business._id,
          stripeAccountId: account.id
        });

        await business.updateVerificationStep('stripeConnected', false);
      }
    } else {
      logger.warn("Stripe Connect account updated but no matching business found", {
        stripeAccountId: account.id
      });
    }
  }

  // Stripe Connect account application submitted
  if (event.type === "account.application.authorized") {
    const account = event.data.object;

    logger.info("Stripe Connect account authorized", {
      stripeAccountId: account.id
    });
  }

  // Stripe Connect account application deauthorized
  if (event.type === "account.application.deauthorized") {
    const account = event.data.object;

    const business = await Business.findOne({ stripeAccountId: account.id });

    if (business) {
      logger.warn("Stripe Connect account deauthorized", {
        businessId: business._id,
        stripeAccountId: account.id
      });

      // Remove Stripe connection
      business.stripeAccountId = "";
      await business.updateVerificationStep('stripeConnected', false);
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
