const stripeConnectService = require('../services/stripeConnectService');

/**
 * Stripe Connect Controllers
 */

class StripeConnectController {
  /**
   * Create Stripe Connect account
   * POST /api/stripe/connect
   */
  async createAccount(req, res, next) {
    try {
      const { ownerId, userId, role, email } = req.user;
      const effectiveOwnerId = role === 'owner' ? (ownerId || userId) : null;

      if (!effectiveOwnerId) {
        return res.status(403).json({
          success: false,
          message: 'Only owners can create Stripe Connect accounts',
        });
      }

      const { businessName, country } = req.body;

      const account = await stripeConnectService.createConnectAccount(
        effectiveOwnerId,
        email,
        businessName,
        country
      );

      res.status(201).json({
        success: true,
        data: account,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create account link for onboarding
   * POST /api/stripe/connect/link
   */
  async createAccountLink(req, res, next) {
    try {
      const { ownerId, userId, role } = req.user;
      const effectiveOwnerId = role === 'owner' ? (ownerId || userId) : null;

      if (!effectiveOwnerId) {
        return res.status(403).json({
          success: false,
          message: 'Only owners can access this endpoint',
        });
      }

      const { returnUrl, refreshUrl } = req.body;

      const link = await stripeConnectService.createAccountLink(
        effectiveOwnerId,
        returnUrl,
        refreshUrl
      );

      res.status(200).json({
        success: true,
        data: {
          url: link.url,
          expiresAt: link.expires_at,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Stripe Connect account details
   * GET /api/stripe/connect
   */
  async getAccount(req, res, next) {
    try {
      const { ownerId, userId, role } = req.user;
      const effectiveOwnerId = role === 'owner' ? (ownerId || userId) : null;

      if (!effectiveOwnerId) {
        return res.status(403).json({
          success: false,
          message: 'Only owners can access this endpoint',
        });
      }

      const account = await stripeConnectService.getAccount(effectiveOwnerId);

      res.status(200).json({
        success: true,
        data: account,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create login link for Stripe dashboard
   * POST /api/stripe/connect/login
   */
  async createLoginLink(req, res, next) {
    try {
      const { ownerId, userId, role } = req.user;
      const effectiveOwnerId = role === 'owner' ? (ownerId || userId) : null;

      if (!effectiveOwnerId) {
        return res.status(403).json({
          success: false,
          message: 'Only owners can access this endpoint',
        });
      }

      const link = await stripeConnectService.createLoginLink(effectiveOwnerId);

      res.status(200).json({
        success: true,
        data: {
          url: link.url,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete Stripe Connect account
   * DELETE /api/stripe/connect
   */
  async deleteAccount(req, res, next) {
    try {
      const { ownerId, userId, role } = req.user;
      const effectiveOwnerId = role === 'owner' ? (ownerId || userId) : null;

      if (!effectiveOwnerId) {
        return res.status(403).json({
          success: false,
          message: 'Only owners can delete accounts',
        });
      }

      const result = await stripeConnectService.deleteAccount(effectiveOwnerId);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new StripeConnectController();
