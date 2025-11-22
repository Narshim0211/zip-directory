/**
 * 💳 STRIPE CONNECT CONTROLLER (v1.0)
 *
 * Handles Stripe Connect onboarding for business owners
 * - Create Connect account link
 * - Check account status
 * - Disconnect account
 *
 * Routes: /api/v1/stripe-connect/*
 */

const Stripe = require('stripe');
const Business = require('../models/Business');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../core/errors/globalErrorHandler').AppError;

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

/**
 * @route   POST /api/v1/stripe-connect/create-account-link
 * @desc    Create Stripe Connect onboarding link for business
 * @access  Private (Owner only)
 */
exports.createAccountLink = catchAsync(async (req, res, next) => {
  if (!stripe) {
    return next(new AppError('Stripe is not configured', 503));
  }

  const { businessId } = req.body;

  if (!businessId) {
    return next(new AppError('Business ID is required', 400));
  }

  const business = await Business.findById(businessId);

  if (!business) {
    return next(new AppError('Business not found', 404));
  }

  // TODO: Add owner authorization check
  // if (business.owner.toString() !== req.user.id) {
  //   return next(new AppError('Not authorized', 403));
  // }

  let accountId = business.stripeAccountId;

  // Create new Stripe Connect account if doesn't exist
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: 'express', // Express = simplified onboarding
      country: 'US', // TODO: Make dynamic based on business location
      email: business.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true }
      },
      business_profile: {
        name: business.name,
        product_description: business.description || 'Beauty and wellness services',
        support_email: business.email,
        support_phone: business.phone
      },
      metadata: {
        businessId: business._id.toString(),
        businessName: business.name
      }
    });

    accountId = account.id;
    business.stripeAccountId = accountId;
    await business.save();
  }

  // Create account link for onboarding
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${process.env.FRONTEND_URL}/owner/settings/payments?refresh=true`,
    return_url: `${process.env.FRONTEND_URL}/owner/settings/payments?success=true`,
    type: 'account_onboarding'
  });

  res.status(200).json({
    success: true,
    data: {
      url: accountLink.url,
      accountId: accountId,
      expiresAt: accountLink.expires_at
    }
  });
});

/**
 * @route   GET /api/v1/stripe-connect/account-status/:businessId
 * @desc    Get Stripe Connect account status
 * @access  Private (Owner only)
 */
exports.getAccountStatus = catchAsync(async (req, res, next) => {
  if (!stripe) {
    return next(new AppError('Stripe is not configured', 503));
  }

  const { businessId } = req.params;

  const business = await Business.findById(businessId);

  if (!business) {
    return next(new AppError('Business not found', 404));
  }

  if (!business.stripeAccountId) {
    return res.status(200).json({
      success: true,
      data: {
        connected: false,
        accountId: null,
        chargesEnabled: false,
        detailsSubmitted: false,
        payoutsEnabled: false
      }
    });
  }

  // Fetch account details from Stripe
  const account = await stripe.accounts.retrieve(business.stripeAccountId);

  res.status(200).json({
    success: true,
    data: {
      connected: true,
      accountId: account.id,
      chargesEnabled: account.charges_enabled,
      detailsSubmitted: account.details_submitted,
      payoutsEnabled: account.payouts_enabled,
      requirements: {
        currentlyDue: account.requirements?.currently_due || [],
        errors: account.requirements?.errors || [],
        pendingVerification: account.requirements?.pending_verification || []
      },
      verificationStatus: business.verificationStatus
    }
  });
});

/**
 * @route   POST /api/v1/stripe-connect/disconnect/:businessId
 * @desc    Disconnect Stripe account from business
 * @access  Private (Owner only)
 */
exports.disconnectAccount = catchAsync(async (req, res, next) => {
  if (!stripe) {
    return next(new AppError('Stripe is not configured', 503));
  }

  const { businessId } = req.params;

  const business = await Business.findById(businessId);

  if (!business) {
    return next(new AppError('Business not found', 404));
  }

  if (!business.stripeAccountId) {
    return next(new AppError('No Stripe account connected', 400));
  }

  // Delete the Stripe Connect account
  try {
    await stripe.accounts.del(business.stripeAccountId);
  } catch (error) {
    // Account might already be deleted or invalid - continue anyway
    console.warn('Failed to delete Stripe account:', error.message);
  }

  // Update business
  business.stripeAccountId = "";
  await business.updateVerificationStep('stripeConnected', false);

  res.status(200).json({
    success: true,
    message: 'Stripe account disconnected successfully',
    data: {
      verificationStatus: business.verificationStatus,
      verificationSteps: business.verificationSteps
    }
  });
});

/**
 * @route   POST /api/v1/stripe-connect/create-login-link/:businessId
 * @desc    Create Stripe Express Dashboard login link
 * @access  Private (Owner only)
 */
exports.createLoginLink = catchAsync(async (req, res, next) => {
  if (!stripe) {
    return next(new AppError('Stripe is not configured', 503));
  }

  const { businessId } = req.params;

  const business = await Business.findById(businessId);

  if (!business) {
    return next(new AppError('Business not found', 404));
  }

  if (!business.stripeAccountId) {
    return next(new AppError('No Stripe account connected', 400));
  }

  // Create login link to Stripe Express Dashboard
  const loginLink = await stripe.accounts.createLoginLink(business.stripeAccountId);

  res.status(200).json({
    success: true,
    data: {
      url: loginLink.url
    }
  });
});
