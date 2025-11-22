/**
 * 💎 PREMIUM SUBSCRIPTION CONTROLLER (v1.0)
 *
 * Handles monthly premium subscription payments to the platform
 * This is SEPARATE from Stripe Connect (which handles customer payments)
 *
 * Premium Subscription unlocks:
 * - Top search placement
 * - Premium badge
 * - Advanced analytics
 * - Priority support
 *
 * Routes: /api/v1/premium/*
 */

const Stripe = require('stripe');
const Business = require('../models/Business');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../core/errors/globalErrorHandler').AppError;
const logger = require('../utils/logger');

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

/**
 * @route   GET /api/v1/premium/status/:businessId
 * @desc    Get premium subscription status for a business
 * @access  Private (Owner)
 */
exports.getSubscriptionStatus = catchAsync(async (req, res, next) => {
  const { businessId } = req.params;

  if (!stripe) {
    return next(new AppError('Stripe is not configured', 500));
  }

  const business = await Business.findById(businessId);
  if (!business) {
    return next(new AppError('Business not found', 404));
  }

  const subscriptionData = business.premiumSubscription || {
    active: false,
    status: 'inactive'
  };

  // If there's a subscription ID, fetch latest data from Stripe
  if (subscriptionData.subscriptionId) {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionData.subscriptionId);

      // Update local data with Stripe's current status
      subscriptionData.status = subscription.status;
      subscriptionData.currentPeriodEnd = subscription.current_period_end * 1000; // Convert to milliseconds
      subscriptionData.active = subscription.status === 'active';
    } catch (err) {
      logger.error('Failed to fetch subscription from Stripe:', err);
    }
  }

  res.status(200).json({
    success: true,
    data: subscriptionData
  });
});

/**
 * @route   POST /api/v1/premium/create-checkout
 * @desc    Create Stripe Checkout session for premium subscription
 * @access  Private (Owner)
 */
exports.createCheckoutSession = catchAsync(async (req, res, next) => {
  const { businessId, priceId } = req.body;

  if (!stripe) {
    return next(new AppError('Stripe is not configured', 500));
  }

  if (!businessId) {
    return next(new AppError('Business ID is required', 400));
  }

  const business = await Business.findById(businessId);
  if (!business) {
    return next(new AppError('Business not found', 404));
  }

  // Check if already has active subscription
  if (business.premiumSubscription?.active) {
    return next(new AppError('Business already has an active premium subscription', 400));
  }

  // Create or retrieve Stripe customer
  let customerId = business.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: business.email,
      metadata: {
        businessId: business._id.toString(),
        businessName: business.name
      }
    });
    customerId = customer.id;
    business.stripeCustomerId = customerId;
    await business.save();
  }

  // Use provided priceId or default from environment
  const finalPriceId = priceId || process.env.STRIPE_PREMIUM_PRICE_ID;

  if (!finalPriceId) {
    return next(new AppError('Premium subscription price not configured', 500));
  }

  // Create Checkout Session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: finalPriceId,
        quantity: 1
      }
    ],
    success_url: `${process.env.FRONTEND_URL}/owner/my-business?premium=success`,
    cancel_url: `${process.env.FRONTEND_URL}/owner/my-business?premium=canceled`,
    metadata: {
      businessId: business._id.toString()
    }
  });

  res.status(200).json({
    success: true,
    data: {
      url: session.url,
      sessionId: session.id
    }
  });
});

/**
 * @route   POST /api/v1/premium/create-portal-session
 * @desc    Create Stripe Customer Portal session for subscription management
 * @access  Private (Owner)
 */
exports.createPortalSession = catchAsync(async (req, res, next) => {
  const { businessId } = req.body;

  if (!stripe) {
    return next(new AppError('Stripe is not configured', 500));
  }

  if (!businessId) {
    return next(new AppError('Business ID is required', 400));
  }

  const business = await Business.findById(businessId);
  if (!business) {
    return next(new AppError('Business not found', 404));
  }

  if (!business.stripeCustomerId) {
    return next(new AppError('No subscription found for this business', 404));
  }

  // Create Customer Portal session
  const session = await stripe.billingPortal.sessions.create({
    customer: business.stripeCustomerId,
    return_url: `${process.env.FRONTEND_URL}/owner/my-business`
  });

  res.status(200).json({
    success: true,
    data: {
      url: session.url
    }
  });
});

/**
 * @route   POST /api/v1/premium/webhook
 * @desc    Handle Stripe webhooks for premium subscriptions
 * @access  Public (Stripe webhook)
 */
exports.handleWebhook = catchAsync(async (req, res, next) => {
  if (!stripe) {
    return next(new AppError('Stripe is not configured', 500));
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    logger.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle subscription events
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      await handleSubscriptionUpdate(event.data.object);
      break;

    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object);
      break;

    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;

    case 'invoice.payment_succeeded':
      await handlePaymentSucceeded(event.data.object);
      break;

    default:
      logger.info(`Unhandled event type: ${event.type}`);
  }

  res.status(200).json({ received: true });
});

/**
 * Helper: Handle subscription created/updated
 */
async function handleSubscriptionUpdate(subscription) {
  const customerId = subscription.customer;
  const business = await Business.findOne({ stripeCustomerId: customerId });

  if (!business) {
    logger.warn(`Business not found for customer: ${customerId}`);
    return;
  }

  const isActive = subscription.status === 'active';

  business.premiumSubscription = {
    active: isActive,
    subscriptionId: subscription.id,
    status: subscription.status,
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    cancelAtPeriodEnd: subscription.cancel_at_period_end
  };

  // Update verification step
  await business.updateVerificationStep('premiumPlanActive', isActive);

  logger.info(`Premium subscription ${isActive ? 'activated' : 'updated'} for business: ${business._id}`);
}

/**
 * Helper: Handle subscription deleted/canceled
 */
async function handleSubscriptionDeleted(subscription) {
  const customerId = subscription.customer;
  const business = await Business.findOne({ stripeCustomerId: customerId });

  if (!business) {
    logger.warn(`Business not found for customer: ${customerId}`);
    return;
  }

  business.premiumSubscription = {
    active: false,
    subscriptionId: subscription.id,
    status: 'canceled',
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    cancelAtPeriodEnd: true
  };

  // Update verification step
  await business.updateVerificationStep('premiumPlanActive', false);

  logger.info(`Premium subscription canceled for business: ${business._id}`);
}

/**
 * Helper: Handle payment failed
 */
async function handlePaymentFailed(invoice) {
  const customerId = invoice.customer;
  const business = await Business.findOne({ stripeCustomerId: customerId });

  if (!business) {
    logger.warn(`Business not found for customer: ${customerId}`);
    return;
  }

  if (business.premiumSubscription) {
    business.premiumSubscription.status = 'past_due';
    await business.save();
  }

  logger.warn(`Payment failed for business: ${business._id}`);

  // TODO: Send email notification to business owner about payment failure
}

/**
 * Helper: Handle payment succeeded
 */
async function handlePaymentSucceeded(invoice) {
  const customerId = invoice.customer;
  const business = await Business.findOne({ stripeCustomerId: customerId });

  if (!business) {
    logger.warn(`Business not found for customer: ${customerId}`);
    return;
  }

  if (business.premiumSubscription) {
    business.premiumSubscription.status = 'active';
    business.premiumSubscription.active = true;
    await business.save();
  }

  logger.info(`Payment succeeded for business: ${business._id}`);

  // TODO: Send email notification confirming payment
}
