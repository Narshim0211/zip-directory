const stripe = require('../config/stripe');
const Transaction = require('../models/Transaction');
const Subscription = require('../models/Subscription');
const logger = require('../utils/logger');

/**
 * Webhook Controller for Stripe Events
 * Per PRD Section 7: Webhook Handling
 */

class WebhookController {
  /**
   * Handle Stripe webhooks
   * POST /api/webhooks/stripe
   */
  async handleStripeWebhook(req, res, next) {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      // Verify webhook signature
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      logger.error('Webhook signature verification failed', {
        error: err.message,
      });
      return res.status(400).json({
        success: false,
        message: `Webhook Error: ${err.message}`,
      });
    }

    try {
      // Handle the event
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event.data.object);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(event.data.object);
          break;

        case 'charge.refunded':
          await this.handleChargeRefunded(event.data.object);
          break;

        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object);
          break;

        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object);
          break;

        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object);
          break;

        case 'account.updated':
          await this.handleAccountUpdated(event.data.object);
          break;

        default:
          logger.info('Unhandled webhook event type', {
            type: event.type,
          });
      }

      res.status(200).json({ received: true });
    } catch (error) {
      logger.error('Webhook handling error', {
        error: error.message,
        eventType: event.type,
      });
      res.status(500).json({
        success: false,
        message: 'Webhook processing failed',
      });
    }
  }

  /**
   * Handle successful payment intent
   */
  async handlePaymentIntentSucceeded(paymentIntent) {
    logger.info('Payment intent succeeded', {
      paymentIntentId: paymentIntent.id,
    });

    const transaction = await Transaction.findOne({
      stripePaymentIntentId: paymentIntent.id,
    });

    if (transaction) {
      transaction.status = 'succeeded';
      transaction.stripeChargeId = paymentIntent.latest_charge;
      await transaction.save();
    }
  }

  /**
   * Handle failed payment intent
   */
  async handlePaymentIntentFailed(paymentIntent) {
    logger.error('Payment intent failed', {
      paymentIntentId: paymentIntent.id,
      error: paymentIntent.last_payment_error?.message,
    });

    const transaction = await Transaction.findOne({
      stripePaymentIntentId: paymentIntent.id,
    });

    if (transaction) {
      transaction.status = 'failed';
      transaction.errorMessage = paymentIntent.last_payment_error?.message;
      await transaction.save();
    }
  }

  /**
   * Handle charge refunded
   */
  async handleChargeRefunded(charge) {
    logger.info('Charge refunded', {
      chargeId: charge.id,
    });

    const transaction = await Transaction.findOne({
      stripeChargeId: charge.id,
    });

    if (transaction) {
      transaction.status = 'refunded';
      await transaction.save();
    }
  }

  /**
   * Handle subscription created/updated
   */
  async handleSubscriptionUpdated(stripeSubscription) {
    logger.info('Subscription updated', {
      subscriptionId: stripeSubscription.id,
      status: stripeSubscription.status,
    });

    const subscription = await Subscription.findOne({
      stripeSubscriptionId: stripeSubscription.id,
    });

    if (subscription) {
      subscription.status = stripeSubscription.status;
      subscription.currentPeriodStart = new Date(
        stripeSubscription.current_period_start * 1000
      );
      subscription.currentPeriodEnd = new Date(
        stripeSubscription.current_period_end * 1000
      );
      subscription.cancelAtPeriodEnd = stripeSubscription.cancel_at_period_end;
      subscription.nextPaymentDate = subscription.currentPeriodEnd;

      await subscription.save();
    }
  }

  /**
   * Handle subscription deleted
   */
  async handleSubscriptionDeleted(stripeSubscription) {
    logger.info('Subscription deleted', {
      subscriptionId: stripeSubscription.id,
    });

    const subscription = await Subscription.findOne({
      stripeSubscriptionId: stripeSubscription.id,
    });

    if (subscription) {
      subscription.status = 'cancelled';
      subscription.cancelledAt = new Date();
      await subscription.save();
    }
  }

  /**
   * Handle successful invoice payment
   */
  async handleInvoicePaymentSucceeded(invoice) {
    logger.info('Invoice payment succeeded', {
      invoiceId: invoice.id,
      subscriptionId: invoice.subscription,
    });

    const subscription = await Subscription.findOne({
      stripeSubscriptionId: invoice.subscription,
    });

    if (subscription) {
      subscription.lastPaymentDate = new Date();
      subscription.failedPaymentCount = 0;
      await subscription.save();

      // Create transaction record
      await Transaction.create({
        ownerId: subscription.ownerId,
        customerId: subscription.ownerId,
        stripePaymentIntentId: invoice.payment_intent,
        stripeCustomerId: invoice.customer,
        amount: invoice.amount_paid / 100, // Convert from cents
        currency: invoice.currency,
        type: 'subscription',
        status: 'succeeded',
        description: `Subscription payment - ${subscription.plan}`,
      });
    }
  }

  /**
   * Handle failed invoice payment
   */
  async handleInvoicePaymentFailed(invoice) {
    logger.error('Invoice payment failed', {
      invoiceId: invoice.id,
      subscriptionId: invoice.subscription,
    });

    const subscription = await Subscription.findOne({
      stripeSubscriptionId: invoice.subscription,
    });

    if (subscription) {
      subscription.status = 'past_due';
      subscription.failedPaymentCount += 1;
      await subscription.save();
    }
  }

  /**
   * Handle account updated (Stripe Connect)
   */
  async handleAccountUpdated(account) {
    logger.info('Account updated', {
      accountId: account.id,
    });

    const StripeAccount = require('../models/StripeAccount');

    const stripeAccount = await StripeAccount.findOne({
      stripeAccountId: account.id,
    });

    if (stripeAccount) {
      stripeAccount.chargesEnabled = account.charges_enabled;
      stripeAccount.payoutsEnabled = account.payouts_enabled;
      stripeAccount.detailsSubmitted = account.details_submitted;
      stripeAccount.requirements = {
        currentlyDue: account.requirements?.currently_due || [],
        eventuallyDue: account.requirements?.eventually_due || [],
        pastDue: account.requirements?.past_due || [],
        disabled: account.requirements?.disabled_reason ? true : false,
        disabledReason: account.requirements?.disabled_reason,
      };
      stripeAccount.capabilities = {
        cardPayments: account.capabilities?.card_payments,
        transfers: account.capabilities?.transfers,
      };

      if (account.charges_enabled && account.payouts_enabled && account.details_submitted) {
        stripeAccount.onboardingStatus = 'complete';
      }

      await stripeAccount.save();
    }
  }
}

module.exports = new WebhookController();
