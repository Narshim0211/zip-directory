const stripe = require('../config/stripe');
const Subscription = require('../models/Subscription');
const Transaction = require('../models/Transaction');
const { AppError } = require('../middlewares/errorMiddleware');
const logger = require('../utils/logger');

/**
 * Subscription Management Service
 * Per PRD Section 7: Subscription Billing ($10 Basic, $20 Premium)
 */

class SubscriptionService {
  /**
   * Create subscription for owner
   */
  async createSubscription(ownerId, email, plan, paymentMethodId) {
    try {
      // Validate plan
      if (!['basic', 'premium'].includes(plan)) {
        throw new AppError('Invalid plan', 400, 'INVALID_PLAN');
      }

      // Check if subscription already exists
      const existing = await Subscription.findOne({ ownerId });
      if (existing && existing.isActive()) {
        throw new AppError('Active subscription already exists', 400, 'SUBSCRIPTION_EXISTS');
      }

      // Get or create Stripe customer
      const customer = await this.getOrCreateCustomer(ownerId, email);

      // Attach payment method
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customer.id,
      });

      // Set as default payment method
      await stripe.customers.update(customer.id, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      // Get price ID based on plan
      const priceId = plan === 'basic' 
        ? process.env.BASIC_PLAN_ID 
        : process.env.PREMIUM_PLAN_ID;

      const amount = plan === 'basic' ? 10 : 20;

      // Create Stripe subscription
      const stripeSubscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: priceId }],
        metadata: {
          ownerId: ownerId.toString(),
          plan,
        },
        expand: ['latest_invoice.payment_intent'],
      });

      // Create or update subscription record
      const subscription = existing || new Subscription();
      subscription.ownerId = ownerId;
      subscription.stripeSubscriptionId = stripeSubscription.id;
      subscription.stripeCustomerId = customer.id;
      subscription.stripePriceId = priceId;
      subscription.plan = plan;
      subscription.status = stripeSubscription.status;
      subscription.amount = amount;
      subscription.currency = 'usd';
      subscription.interval = 'month';
      subscription.currentPeriodStart = new Date(stripeSubscription.current_period_start * 1000);
      subscription.currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);
      subscription.nextPaymentDate = subscription.currentPeriodEnd;

      await subscription.save();

      // Create transaction record
      await Transaction.create({
        ownerId,
        customerId: ownerId,
        stripePaymentIntentId: stripeSubscription.latest_invoice?.payment_intent?.id,
        stripeCustomerId: customer.id,
        amount,
        currency: 'usd',
        type: 'subscription',
        status: stripeSubscription.status === 'active' ? 'succeeded' : 'pending',
        description: `${plan.charAt(0).toUpperCase() + plan.slice(1)} subscription`,
      });

      logger.info('Subscription created', {
        ownerId,
        plan,
        subscriptionId: stripeSubscription.id,
      });

      return subscription;
    } catch (error) {
      logger.error('Failed to create subscription', {
        error: error.message,
        ownerId,
        plan,
      });
      throw error;
    }
  }

  /**
   * Get or create Stripe customer for owner
   */
  async getOrCreateCustomer(ownerId, email) {
    try {
      // Check if customer exists in subscriptions
      const existingSubscription = await Subscription.findOne({ ownerId });

      if (existingSubscription && existingSubscription.stripeCustomerId) {
        return await stripe.customers.retrieve(existingSubscription.stripeCustomerId);
      }

      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email,
        metadata: {
          ownerId: ownerId.toString(),
        },
      });

      return customer;
    } catch (error) {
      logger.error('Failed to get or create customer', {
        error: error.message,
        ownerId,
      });
      throw error;
    }
  }

  /**
   * Get subscription details
   */
  async getSubscription(ownerId) {
    const subscription = await Subscription.findOne({ ownerId });

    if (!subscription) {
      throw new AppError('Subscription not found', 404, 'SUBSCRIPTION_NOT_FOUND');
    }

    // Fetch latest from Stripe
    if (subscription.stripeSubscriptionId) {
      const stripeSubscription = await stripe.subscriptions.retrieve(
        subscription.stripeSubscriptionId
      );

      subscription.status = stripeSubscription.status;
      subscription.currentPeriodStart = new Date(stripeSubscription.current_period_start * 1000);
      subscription.currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);
      subscription.cancelAtPeriodEnd = stripeSubscription.cancel_at_period_end;
      
      await subscription.save();
    }

    return subscription;
  }

  /**
   * Update subscription plan
   */
  async updateSubscription(ownerId, newPlan) {
    try {
      if (!['basic', 'premium'].includes(newPlan)) {
        throw new AppError('Invalid plan', 400, 'INVALID_PLAN');
      }

      const subscription = await Subscription.findOne({ ownerId });

      if (!subscription) {
        throw new AppError('Subscription not found', 404, 'SUBSCRIPTION_NOT_FOUND');
      }

      if (subscription.plan === newPlan) {
        throw new AppError('Already on this plan', 400, 'SAME_PLAN');
      }

      const newPriceId = newPlan === 'basic' 
        ? process.env.BASIC_PLAN_ID 
        : process.env.PREMIUM_PLAN_ID;

      const newAmount = newPlan === 'basic' ? 10 : 20;

      // Update Stripe subscription
      const stripeSubscription = await stripe.subscriptions.retrieve(
        subscription.stripeSubscriptionId
      );

      const updatedSubscription = await stripe.subscriptions.update(
        subscription.stripeSubscriptionId,
        {
          items: [{
            id: stripeSubscription.items.data[0].id,
            price: newPriceId,
          }],
          proration_behavior: 'create_prorations',
        }
      );

      // Update local record
      subscription.plan = newPlan;
      subscription.stripePriceId = newPriceId;
      subscription.amount = newAmount;
      subscription.status = updatedSubscription.status;

      await subscription.save();

      logger.info('Subscription updated', {
        ownerId,
        oldPlan: subscription.plan,
        newPlan,
      });

      return subscription;
    } catch (error) {
      logger.error('Failed to update subscription', {
        error: error.message,
        ownerId,
        newPlan,
      });
      throw error;
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(ownerId, immediate = false) {
    try {
      const subscription = await Subscription.findOne({ ownerId });

      if (!subscription) {
        throw new AppError('Subscription not found', 404, 'SUBSCRIPTION_NOT_FOUND');
      }

      if (!subscription.isActive()) {
        throw new AppError('Subscription is not active', 400, 'NOT_ACTIVE');
      }

      // Cancel in Stripe
      const stripeSubscription = immediate
        ? await stripe.subscriptions.cancel(subscription.stripeSubscriptionId)
        : await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
            cancel_at_period_end: true,
          });

      // Update local record
      subscription.status = immediate ? 'cancelled' : subscription.status;
      subscription.cancelAtPeriodEnd = !immediate;
      subscription.cancelledAt = immediate ? new Date() : null;

      await subscription.save();

      logger.info('Subscription cancelled', {
        ownerId,
        immediate,
      });

      return subscription;
    } catch (error) {
      logger.error('Failed to cancel subscription', {
        error: error.message,
        ownerId,
      });
      throw error;
    }
  }

  /**
   * Reactivate subscription
   */
  async reactivateSubscription(ownerId) {
    try {
      const subscription = await Subscription.findOne({ ownerId });

      if (!subscription) {
        throw new AppError('Subscription not found', 404, 'SUBSCRIPTION_NOT_FOUND');
      }

      if (!subscription.cancelAtPeriodEnd) {
        throw new AppError('Subscription is not scheduled for cancellation', 400, 'NOT_CANCELLING');
      }

      // Reactivate in Stripe
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: false,
      });

      // Update local record
      subscription.cancelAtPeriodEnd = false;
      subscription.cancelledAt = null;

      await subscription.save();

      logger.info('Subscription reactivated', {
        ownerId,
      });

      return subscription;
    } catch (error) {
      logger.error('Failed to reactivate subscription', {
        error: error.message,
        ownerId,
      });
      throw error;
    }
  }

  /**
   * Get subscription invoices
   */
  async getInvoices(ownerId) {
    try {
      const subscription = await Subscription.findOne({ ownerId });

      if (!subscription) {
        throw new AppError('Subscription not found', 404, 'SUBSCRIPTION_NOT_FOUND');
      }

      const invoices = await stripe.invoices.list({
        customer: subscription.stripeCustomerId,
        limit: 100,
      });

      return invoices.data;
    } catch (error) {
      logger.error('Failed to get invoices', {
        error: error.message,
        ownerId,
      });
      throw error;
    }
  }
}

module.exports = new SubscriptionService();
