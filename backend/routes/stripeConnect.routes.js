/**
 * 💳 STRIPE CONNECT ROUTES (v1.0)
 *
 * Routes for Stripe Connect integration
 * Base path: /api/v1/stripe-connect
 */

const express = require('express');
const router = express.Router();
const stripeConnectController = require('../controllers/stripeConnectController');
// TODO: Add auth middleware when ready
// const { protect } = require('../middleWare/authMiddleware');

/**
 * @route   POST /api/v1/stripe-connect/create-account-link
 * @desc    Create Stripe Connect onboarding link
 * @access  Private (Owner only)
 * @body    { businessId: String }
 */
router.post('/create-account-link', stripeConnectController.createAccountLink);

/**
 * @route   GET /api/v1/stripe-connect/account-status/:businessId
 * @desc    Get Stripe Connect account status
 * @access  Private (Owner only)
 */
router.get('/account-status/:businessId', stripeConnectController.getAccountStatus);

/**
 * @route   POST /api/v1/stripe-connect/disconnect/:businessId
 * @desc    Disconnect Stripe account from business
 * @access  Private (Owner only)
 */
router.post('/disconnect/:businessId', stripeConnectController.disconnectAccount);

/**
 * @route   POST /api/v1/stripe-connect/create-login-link/:businessId
 * @desc    Create Stripe Express Dashboard login link
 * @access  Private (Owner only)
 */
router.post('/create-login-link/:businessId', stripeConnectController.createLoginLink);

module.exports = router;
