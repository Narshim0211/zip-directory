const stripe = require('../config/stripe');
const StripeAccount = require('../models/StripeAccount');
const { AppError } = require('../middlewares/errorMiddleware');
const logger = require('../utils/logger');

/**
 * Stripe Connect Service
 * Per PRD Section 7: Stripe Connect Integration
 */

class StripeConnectService {
  /**
   * Create Stripe Connect account for owner
   */
  async createConnectAccount(ownerId, email, businessName, country = 'US') {
    try {
      // Check if account already exists
      const existing = await StripeAccount.findOne({ ownerId });
      if (existing) {
        throw new AppError('Stripe account already exists', 400, 'ACCOUNT_EXISTS');
      }

      // Create Stripe Express account
      const account = await stripe.accounts.create({
        type: 'express',
        country,
        email,
        business_type: 'individual',
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_profile: {
          name: businessName,
        },
      });

      // Save to database
      const stripeAccount = await StripeAccount.create({
        ownerId,
        stripeAccountId: account.id,
        accountType: 'express',
        email,
        country,
        businessName,
        onboardingStatus: 'incomplete',
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted,
      });

      logger.info('Stripe Connect account created', {
        ownerId,
        stripeAccountId: account.id,
      });

      return stripeAccount;
    } catch (error) {
      logger.error('Failed to create Stripe Connect account', {
        error: error.message,
        ownerId,
      });
      throw error;
    }
  }

  /**
   * Create account link for onboarding
   */
  async createAccountLink(ownerId, returnUrl, refreshUrl) {
    try {
      const account = await StripeAccount.findOne({ ownerId });

      if (!account) {
        throw new AppError('Stripe account not found', 404, 'ACCOUNT_NOT_FOUND');
      }

      const accountLink = await stripe.accountLinks.create({
        account: account.stripeAccountId,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: 'account_onboarding',
      });

      logger.info('Account link created', {
        ownerId,
        stripeAccountId: account.stripeAccountId,
      });

      return accountLink;
    } catch (error) {
      logger.error('Failed to create account link', {
        error: error.message,
        ownerId,
      });
      throw error;
    }
  }

  /**
   * Get Stripe account details
   */
  async getAccount(ownerId) {
    try {
      const account = await StripeAccount.findOne({ ownerId });

      if (!account) {
        throw new AppError('Stripe account not found', 404, 'ACCOUNT_NOT_FOUND');
      }

      // Fetch latest details from Stripe
      const stripeAccount = await stripe.accounts.retrieve(account.stripeAccountId);

      // Update local database
      account.chargesEnabled = stripeAccount.charges_enabled;
      account.payoutsEnabled = stripeAccount.payouts_enabled;
      account.detailsSubmitted = stripeAccount.details_submitted;
      account.requirements = {
        currentlyDue: stripeAccount.requirements?.currently_due || [],
        eventuallyDue: stripeAccount.requirements?.eventually_due || [],
        pastDue: stripeAccount.requirements?.past_due || [],
        disabled: stripeAccount.requirements?.disabled_reason ? true : false,
        disabledReason: stripeAccount.requirements?.disabled_reason,
      };
      account.capabilities = {
        cardPayments: stripeAccount.capabilities?.card_payments,
        transfers: stripeAccount.capabilities?.transfers,
      };

      if (stripeAccount.charges_enabled && stripeAccount.payouts_enabled && stripeAccount.details_submitted) {
        account.onboardingStatus = 'complete';
      } else if (stripeAccount.details_submitted) {
        account.onboardingStatus = 'pending';
      }

      await account.save();

      return account;
    } catch (error) {
      logger.error('Failed to get account', {
        error: error.message,
        ownerId,
      });
      throw error;
    }
  }

  /**
   * Create login link for dashboard access
   */
  async createLoginLink(ownerId) {
    try {
      const account = await StripeAccount.findOne({ ownerId });

      if (!account) {
        throw new AppError('Stripe account not found', 404, 'ACCOUNT_NOT_FOUND');
      }

      const loginLink = await stripe.accounts.createLoginLink(account.stripeAccountId);

      logger.info('Login link created', {
        ownerId,
        stripeAccountId: account.stripeAccountId,
      });

      return loginLink;
    } catch (error) {
      logger.error('Failed to create login link', {
        error: error.message,
        ownerId,
      });
      throw error;
    }
  }

  /**
   * Delete Stripe account
   */
  async deleteAccount(ownerId) {
    try {
      const account = await StripeAccount.findOne({ ownerId });

      if (!account) {
        throw new AppError('Stripe account not found', 404, 'ACCOUNT_NOT_FOUND');
      }

      // Delete from Stripe
      await stripe.accounts.del(account.stripeAccountId);

      // Delete from database
      await account.deleteOne();

      logger.info('Stripe account deleted', {
        ownerId,
        stripeAccountId: account.stripeAccountId,
      });

      return { message: 'Account deleted successfully' };
    } catch (error) {
      logger.error('Failed to delete account', {
        error: error.message,
        ownerId,
      });
      throw error;
    }
  }
}

module.exports = new StripeConnectService();
