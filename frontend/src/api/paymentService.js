import api from './axios';

/**
 * Payment Microservice API Client
 * Calls main backend proxy at /api/payment-service/*
 * Per PRD Section 8: Frontend → Main Backend → Microservices
 */

const paymentService = {
  // ==================== Payment Processing ====================

  /**
   * Create deposit payment intent
   * @param {Object} paymentData - Payment data
   */
  createDepositPayment: async (paymentData) => {
    const response = await api.post('/payment-service/payments/deposit', paymentData);
    return response.data;
  },

  /**
   * Create full payment intent
   * @param {Object} paymentData - Payment data
   */
  createFullPayment: async (paymentData) => {
    const response = await api.post('/payment-service/payments/full', paymentData);
    return response.data;
  },

  /**
   * Confirm payment
   * @param {string} paymentIntentId - Payment intent ID
   */
  confirmPayment: async (paymentIntentId) => {
    const response = await api.post('/payment-service/payments/confirm', {
      paymentIntentId,
    });
    return response.data;
  },

  /**
   * Refund payment (owners only)
   * @param {string} transactionId - Transaction ID
   * @param {number} amount - Amount to refund (optional, full refund if not specified)
   * @param {string} reason - Refund reason
   */
  refundPayment: async (transactionId, amount, reason) => {
    const response = await api.post(`/payment-service/payments/${transactionId}/refund`, {
      amount,
      reason,
    });
    return response.data;
  },

  // ==================== Transactions ====================

  /**
   * Get transaction by ID
   * @param {string} transactionId - Transaction ID
   */
  getTransaction: async (transactionId) => {
    const response = await api.get(`/payment-service/payments/transactions/${transactionId}`);
    return response.data;
  },

  /**
   * Get my transactions (customer view)
   * @param {Object} filters - Optional filters (type, status)
   */
  getMyTransactions: async (filters = {}) => {
    const response = await api.get('/payment-service/payments/transactions/my', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get owner transactions (owners only)
   * @param {Object} filters - Optional filters (type, status)
   */
  getOwnerTransactions: async (filters = {}) => {
    const response = await api.get('/payment-service/payments/transactions/owner', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get transactions for a specific booking
   * @param {string} bookingId - Booking ID
   */
  getBookingTransactions: async (bookingId) => {
    const response = await api.get(`/payment-service/payments/transactions/booking/${bookingId}`);
    return response.data;
  },

  // ==================== Subscriptions ====================

  /**
   * Create subscription (owners only)
   * @param {string} plan - Plan type ('basic' or 'premium')
   * @param {string} paymentMethodId - Stripe payment method ID
   */
  createSubscription: async (plan, paymentMethodId) => {
    const response = await api.post('/payment-service/subscriptions', {
      plan,
      paymentMethodId,
    });
    return response.data;
  },

  /**
   * Get my subscription (owners only)
   */
  getMySubscription: async () => {
    const response = await api.get('/payment-service/subscriptions/my');
    return response.data;
  },

  /**
   * Update subscription plan (owners only)
   * @param {string} newPlan - New plan type ('basic' or 'premium')
   */
  updateSubscription: async (newPlan) => {
    const response = await api.patch('/payment-service/subscriptions', {
      plan: newPlan,
    });
    return response.data;
  },

  /**
   * Cancel subscription (owners only)
   * @param {boolean} immediate - Cancel immediately or at period end
   */
  cancelSubscription: async (immediate = false) => {
    const response = await api.post('/payment-service/subscriptions/cancel', {
      immediate,
    });
    return response.data;
  },

  /**
   * Reactivate subscription (owners only)
   */
  reactivateSubscription: async () => {
    const response = await api.post('/payment-service/subscriptions/reactivate');
    return response.data;
  },

  /**
   * Get subscription invoices (owners only)
   */
  getInvoices: async () => {
    const response = await api.get('/payment-service/subscriptions/invoices');
    return response.data;
  },

  // ==================== Stripe Connect ====================

  /**
   * Create Stripe Connect account (owners only)
   * @param {string} businessName - Business name
   * @param {string} country - Country code (default: 'US')
   */
  createStripeAccount: async (businessName, country = 'US') => {
    const response = await api.post('/payment-service/stripe/connect', {
      businessName,
      country,
    });
    return response.data;
  },

  /**
   * Get Stripe Connect account details (owners only)
   */
  getStripeAccount: async () => {
    const response = await api.get('/payment-service/stripe/connect');
    return response.data;
  },

  /**
   * Create Stripe Connect onboarding link (owners only)
   * @param {string} returnUrl - URL to return to after onboarding
   * @param {string} refreshUrl - URL to return to if link expires
   */
  createStripeAccountLink: async (returnUrl, refreshUrl) => {
    const response = await api.post('/payment-service/stripe/connect/link', {
      returnUrl,
      refreshUrl,
    });
    return response.data;
  },

  /**
   * Create Stripe Dashboard login link (owners only)
   */
  createStripeDashboardLink: async () => {
    const response = await api.post('/payment-service/stripe/connect/login');
    return response.data;
  },

  /**
   * Delete Stripe Connect account (owners only)
   */
  deleteStripeAccount: async () => {
    const response = await api.delete('/payment-service/stripe/connect');
    return response.data;
  },

  // ==================== Health Check ====================

  /**
   * Check if payment service is healthy
   */
  healthCheck: async () => {
    const response = await api.get('/payment-service/health');
    return response.data;
  },
};

export default paymentService;
