/**
 * Premium Subscription Routes
 *
 * Handles monthly premium subscription to the platform
 * This is SEPARATE from Stripe Connect (customer payments)
 */

const express = require('express');
const router = express.Router();
const premiumController = require('../controllers/premiumSubscriptionController');

/**
 * @route   GET /api/v1/premium/status/:businessId
 * @desc    Get premium subscription status
 * @access  Private (Owner)
 */
router.get('/status/:businessId', premiumController.getSubscriptionStatus);

/**
 * @route   POST /api/v1/premium/create-checkout
 * @desc    Create Stripe Checkout session for subscription
 * @access  Private (Owner)
 * @body    { businessId, priceId? }
 */
router.post('/create-checkout', premiumController.createCheckoutSession);

/**
 * @route   POST /api/v1/premium/create-portal-session
 * @desc    Create Stripe Customer Portal session
 * @access  Private (Owner)
 * @body    { businessId }
 */
router.post('/create-portal-session', premiumController.createPortalSession);

module.exports = router;
