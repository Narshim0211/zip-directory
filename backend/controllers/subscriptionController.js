const Stripe = require('stripe');
const User = require('../models/User');
const logger = require('../utils/logger');

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

/**
 * Create Chat Pass Checkout Session
 * Visitor subscribes to $9.99/mo Stylist Access Pass
 */
const createChatPassCheckout = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ success: false, message: 'Stripe not configured' });
    }

    const userId = req.user.id; // From auth middleware
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if user already has active chat pass
    if (user.hasChatPass && user.chatPassExpiresAt && user.chatPassExpiresAt > new Date()) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active Chat Pass',
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: user.stripeCustomerId || undefined,
      customer_email: !user.stripeCustomerId ? user.email : undefined,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Stylist Access Pass',
              description: 'Unlimited messaging with all premium salons',
            },
            recurring: {
              interval: 'month',
            },
            unit_amount: 999, // $9.99
          },
          quantity: 1,
        },
      ],
      metadata: {
        subscriptionType: 'CHAT_PASS',
        userId: userId.toString(),
      },
      success_url: `${process.env.FRONTEND_URL}/visitor/messages?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/visitor/messages`,
    });

    logger.info('Chat Pass checkout session created', { userId, sessionId: session.id });

    res.json({
      success: true,
      checkoutUrl: session.url,
    });
  } catch (error) {
    logger.error('Chat Pass checkout failed', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to create checkout session',
    });
  }
};

/**
 * Get Chat Pass Status
 * Returns current chat pass subscription status
 */
const getChatPassStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('hasChatPass chatPassExpiresAt chatPassGraceEndsAt');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const now = new Date();
    const hasActive = user.hasChatPass && user.chatPassExpiresAt && user.chatPassExpiresAt > now;
    const inGrace = user.chatPassGraceEndsAt && user.chatPassGraceEndsAt > now;

    res.json({
      success: true,
      hasChatPass: hasActive,
      inGracePeriod: inGrace,
      expiresAt: user.chatPassExpiresAt,
      graceEndsAt: user.chatPassGraceEndsAt,
    });
  } catch (error) {
    logger.error('Get chat pass status failed', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to get chat pass status',
    });
  }
};

module.exports = {
  createChatPassCheckout,
  getChatPassStatus,
};
