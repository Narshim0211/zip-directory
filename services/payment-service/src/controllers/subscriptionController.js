const subscriptionService = require('../services/subscriptionService');

/**
 * Subscription Controllers
 */

class SubscriptionController {
  /**
   * Create subscription
   * POST /api/subscriptions
   */
  async createSubscription(req, res, next) {
    try {
      const { ownerId, userId, role, email } = req.user;
      const effectiveOwnerId = role === 'owner' ? (ownerId || userId) : null;

      if (!effectiveOwnerId) {
        return res.status(403).json({
          success: false,
          message: 'Only owners can create subscriptions',
        });
      }

      const { plan, paymentMethodId } = req.body;

      const subscription = await subscriptionService.createSubscription(
        effectiveOwnerId,
        email,
        plan,
        paymentMethodId
      );

      res.status(201).json({
        success: true,
        data: subscription,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get my subscription
   * GET /api/subscriptions/my
   */
  async getMySubscription(req, res, next) {
    try {
      const { ownerId, userId, role } = req.user;
      const effectiveOwnerId = role === 'owner' ? (ownerId || userId) : null;

      if (!effectiveOwnerId) {
        return res.status(403).json({
          success: false,
          message: 'Only owners can access subscriptions',
        });
      }

      const subscription = await subscriptionService.getSubscription(effectiveOwnerId);

      res.status(200).json({
        success: true,
        data: subscription,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update subscription
   * PATCH /api/subscriptions
   */
  async updateSubscription(req, res, next) {
    try {
      const { ownerId, userId, role } = req.user;
      const effectiveOwnerId = role === 'owner' ? (ownerId || userId) : null;

      if (!effectiveOwnerId) {
        return res.status(403).json({
          success: false,
          message: 'Only owners can update subscriptions',
        });
      }

      const { plan } = req.body;

      const subscription = await subscriptionService.updateSubscription(
        effectiveOwnerId,
        plan
      );

      res.status(200).json({
        success: true,
        data: subscription,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel subscription
   * POST /api/subscriptions/cancel
   */
  async cancelSubscription(req, res, next) {
    try {
      const { ownerId, userId, role } = req.user;
      const effectiveOwnerId = role === 'owner' ? (ownerId || userId) : null;

      if (!effectiveOwnerId) {
        return res.status(403).json({
          success: false,
          message: 'Only owners can cancel subscriptions',
        });
      }

      const { immediate } = req.body;

      const subscription = await subscriptionService.cancelSubscription(
        effectiveOwnerId,
        immediate
      );

      res.status(200).json({
        success: true,
        data: subscription,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reactivate subscription
   * POST /api/subscriptions/reactivate
   */
  async reactivateSubscription(req, res, next) {
    try {
      const { ownerId, userId, role } = req.user;
      const effectiveOwnerId = role === 'owner' ? (ownerId || userId) : null;

      if (!effectiveOwnerId) {
        return res.status(403).json({
          success: false,
          message: 'Only owners can reactivate subscriptions',
        });
      }

      const subscription = await subscriptionService.reactivateSubscription(effectiveOwnerId);

      res.status(200).json({
        success: true,
        data: subscription,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get invoices
   * GET /api/subscriptions/invoices
   */
  async getInvoices(req, res, next) {
    try {
      const { ownerId, userId, role } = req.user;
      const effectiveOwnerId = role === 'owner' ? (ownerId || userId) : null;

      if (!effectiveOwnerId) {
        return res.status(403).json({
          success: false,
          message: 'Only owners can access invoices',
        });
      }

      const invoices = await subscriptionService.getInvoices(effectiveOwnerId);

      res.status(200).json({
        success: true,
        count: invoices.length,
        data: invoices,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SubscriptionController();
