const express = require('express');
const paymentController = require('../controllers/paymentController');
const subscriptionController = require('../controllers/subscriptionController');
const stripeConnectController = require('../controllers/stripeConnectController');
const webhookController = require('../controllers/webhookController');
const { validateToken, requireRole } = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * Payment Service Routes
 * Per PRD Section 7: Payment Microservice API
 */

// ==================== Health Check ====================

router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'payment-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// ==================== Payment Routes ====================

// Create payments
router.post('/payments/deposit', validateToken, paymentController.createDeposit);
router.post('/payments/full', validateToken, paymentController.createFullPayment);
router.post('/payments/confirm', validateToken, paymentController.confirmPayment);

// Refund
router.post('/payments/:id/refund', validateToken, requireRole(['owner', 'admin']), paymentController.refundPayment);

// Get transactions
router.get('/payments/transactions/my', validateToken, paymentController.getMyTransactions);
router.get('/payments/transactions/owner', validateToken, requireRole(['owner', 'admin']), paymentController.getOwnerTransactions);
router.get('/payments/transactions/booking/:bookingId', validateToken, paymentController.getBookingTransactions);
router.get('/payments/transactions/:id', validateToken, paymentController.getTransaction);

// ==================== Subscription Routes ====================

// Subscription management
router.post('/subscriptions', validateToken, requireRole(['owner', 'admin']), subscriptionController.createSubscription);
router.get('/subscriptions/my', validateToken, requireRole(['owner', 'admin']), subscriptionController.getMySubscription);
router.patch('/subscriptions', validateToken, requireRole(['owner', 'admin']), subscriptionController.updateSubscription);
router.post('/subscriptions/cancel', validateToken, requireRole(['owner', 'admin']), subscriptionController.cancelSubscription);
router.post('/subscriptions/reactivate', validateToken, requireRole(['owner', 'admin']), subscriptionController.reactivateSubscription);

// Invoices
router.get('/subscriptions/invoices', validateToken, requireRole(['owner', 'admin']), subscriptionController.getInvoices);

// ==================== Stripe Connect Routes ====================

// Connect account management
router.post('/stripe/connect', validateToken, requireRole(['owner', 'admin']), stripeConnectController.createAccount);
router.post('/stripe/connect/link', validateToken, requireRole(['owner', 'admin']), stripeConnectController.createAccountLink);
router.get('/stripe/connect', validateToken, requireRole(['owner', 'admin']), stripeConnectController.getAccount);
router.post('/stripe/connect/login', validateToken, requireRole(['owner', 'admin']), stripeConnectController.createLoginLink);
router.delete('/stripe/connect', validateToken, requireRole(['owner', 'admin']), stripeConnectController.deleteAccount);

// ==================== Webhook Routes ====================

// Stripe webhooks (no auth - verified by signature)
router.post('/webhooks/stripe', express.raw({ type: 'application/json' }), webhookController.handleStripeWebhook);

module.exports = router;
