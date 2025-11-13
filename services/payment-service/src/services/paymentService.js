const stripe = require('../config/stripe');
const Transaction = require('../models/Transaction');
const StripeAccount = require('../models/StripeAccount');
const { AppError } = require('../middlewares/errorMiddleware');
const logger = require('../utils/logger');

/**
 * Payment Processing Service
 * Per PRD Section 7: Payment Processing with Stripe
 */

class PaymentService {
  /**
   * Create payment intent for deposit
   */
  async createDepositPayment(customerId, bookingId, amount, metadata = {}) {
    try {
      const depositAmount = Math.round(amount * (process.env.DEPOSIT_PERCENTAGE || 25) / 100);

      // Create or get Stripe customer
      const stripeCustomer = await this.getOrCreateStripeCustomer(customerId, metadata.customerEmail);

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: depositAmount * 100, // Convert to cents
        currency: process.env.CURRENCY || 'usd',
        customer: stripeCustomer.id,
        metadata: {
          bookingId: bookingId.toString(),
          customerId: customerId.toString(),
          type: 'deposit',
          ...metadata,
        },
        description: `Deposit for booking ${bookingId}`,
      });

      // Create transaction record
      const transaction = await Transaction.create({
        customerId,
        bookingId,
        ownerId: metadata.ownerId,
        stripePaymentIntentId: paymentIntent.id,
        stripeCustomerId: stripeCustomer.id,
        amount: depositAmount,
        currency: paymentIntent.currency,
        type: 'deposit',
        status: 'pending',
        description: paymentIntent.description,
      });

      logger.info('Deposit payment intent created', {
        transactionId: transaction._id,
        bookingId,
        amount: depositAmount,
      });

      return {
        transaction,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      logger.error('Failed to create deposit payment', {
        error: error.message,
        customerId,
        bookingId,
      });
      throw error;
    }
  }

  /**
   * Create payment intent for full payment
   */
  async createFullPayment(customerId, bookingId, amount, depositPaid = 0, metadata = {}) {
    try {
      const remainingAmount = amount - depositPaid;

      if (remainingAmount <= 0) {
        throw new AppError('Payment already completed', 400, 'ALREADY_PAID');
      }

      // Create or get Stripe customer
      const stripeCustomer = await this.getOrCreateStripeCustomer(customerId, metadata.customerEmail);

      // Get owner's connected account
      const ownerAccount = await StripeAccount.findOne({ ownerId: metadata.ownerId });

      if (!ownerAccount || !ownerAccount.isFullyOnboarded()) {
        throw new AppError(
          'Owner payment account not configured',
          400,
          'ACCOUNT_NOT_CONFIGURED'
        );
      }

      // Calculate platform fee (e.g., 3%)
      const platformFeePercentage = 3;
      const platformFee = Math.round((remainingAmount * platformFeePercentage) / 100);

      // Create payment intent with transfer to connected account
      const paymentIntent = await stripe.paymentIntents.create({
        amount: remainingAmount * 100, // Convert to cents
        currency: process.env.CURRENCY || 'usd',
        customer: stripeCustomer.id,
        application_fee_amount: platformFee * 100,
        transfer_data: {
          destination: ownerAccount.stripeAccountId,
        },
        metadata: {
          bookingId: bookingId.toString(),
          customerId: customerId.toString(),
          type: 'full_payment',
          ...metadata,
        },
        description: `Full payment for booking ${bookingId}`,
      });

      // Create transaction record
      const transaction = await Transaction.create({
        customerId,
        bookingId,
        ownerId: metadata.ownerId,
        stripePaymentIntentId: paymentIntent.id,
        stripeCustomerId: stripeCustomer.id,
        stripeAccountId: ownerAccount.stripeAccountId,
        amount: remainingAmount,
        currency: paymentIntent.currency,
        type: 'full_payment',
        status: 'pending',
        platformFee,
        netAmount: remainingAmount - platformFee,
        description: paymentIntent.description,
      });

      logger.info('Full payment intent created', {
        transactionId: transaction._id,
        bookingId,
        amount: remainingAmount,
      });

      return {
        transaction,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      logger.error('Failed to create full payment', {
        error: error.message,
        customerId,
        bookingId,
      });
      throw error;
    }
  }

  /**
   * Get or create Stripe customer
   */
  async getOrCreateStripeCustomer(userId, email) {
    try {
      // Check if customer exists in transactions
      const existingTransaction = await Transaction.findOne({ 
        customerId: userId,
        stripeCustomerId: { $exists: true, $ne: null }
      });

      if (existingTransaction && existingTransaction.stripeCustomerId) {
        return await stripe.customers.retrieve(existingTransaction.stripeCustomerId);
      }

      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email,
        metadata: {
          userId: userId.toString(),
        },
      });

      return customer;
    } catch (error) {
      logger.error('Failed to get or create Stripe customer', {
        error: error.message,
        userId,
      });
      throw error;
    }
  }

  /**
   * Confirm payment
   */
  async confirmPayment(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      const transaction = await Transaction.findOne({ stripePaymentIntentId: paymentIntentId });

      if (!transaction) {
        throw new AppError('Transaction not found', 404, 'TRANSACTION_NOT_FOUND');
      }

      if (paymentIntent.status === 'succeeded') {
        transaction.status = 'succeeded';
        transaction.stripeChargeId = paymentIntent.latest_charge;
        transaction.receiptUrl = paymentIntent.charges?.data[0]?.receipt_url;
      } else if (paymentIntent.status === 'canceled') {
        transaction.status = 'cancelled';
      } else if (paymentIntent.status === 'requires_action') {
        transaction.status = 'pending';
      }

      await transaction.save();

      logger.info('Payment confirmed', {
        transactionId: transaction._id,
        status: transaction.status,
      });

      return transaction;
    } catch (error) {
      logger.error('Failed to confirm payment', {
        error: error.message,
        paymentIntentId,
      });
      throw error;
    }
  }

  /**
   * Refund payment
   */
  async refundPayment(transactionId, amount, reason) {
    try {
      const transaction = await Transaction.findById(transactionId);

      if (!transaction) {
        throw new AppError('Transaction not found', 404, 'TRANSACTION_NOT_FOUND');
      }

      if (transaction.status !== 'succeeded') {
        throw new AppError('Cannot refund unsuccessful payment', 400, 'INVALID_STATUS');
      }

      const refundAmount = amount || transaction.amount;

      // Create refund in Stripe
      const refund = await stripe.refunds.create({
        payment_intent: transaction.stripePaymentIntentId,
        amount: refundAmount * 100, // Convert to cents
        reason: reason || 'requested_by_customer',
      });

      // Create refund transaction
      const refundTransaction = await Transaction.create({
        customerId: transaction.customerId,
        bookingId: transaction.bookingId,
        ownerId: transaction.ownerId,
        stripePaymentIntentId: transaction.stripePaymentIntentId,
        stripeChargeId: refund.charge,
        amount: refundAmount,
        currency: transaction.currency,
        type: 'refund',
        status: 'succeeded',
        description: `Refund for ${transaction.description}`,
      });

      logger.info('Payment refunded', {
        transactionId: transaction._id,
        refundTransactionId: refundTransaction._id,
        amount: refundAmount,
      });

      return refundTransaction;
    } catch (error) {
      logger.error('Failed to refund payment', {
        error: error.message,
        transactionId,
      });
      throw error;
    }
  }

  /**
   * Get transaction by ID
   */
  async getTransaction(transactionId) {
    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      throw new AppError('Transaction not found', 404, 'TRANSACTION_NOT_FOUND');
    }

    return transaction;
  }

  /**
   * Get customer transactions
   */
  async getCustomerTransactions(customerId, filters = {}) {
    const query = { customerId, ...filters };
    const transactions = await Transaction.find(query).sort({ createdAt: -1 });
    return transactions;
  }

  /**
   * Get owner transactions
   */
  async getOwnerTransactions(ownerId, filters = {}) {
    const query = { ownerId, ...filters };
    const transactions = await Transaction.find(query).sort({ createdAt: -1 });
    return transactions;
  }

  /**
   * Get booking transactions
   */
  async getBookingTransactions(bookingId) {
    const transactions = await Transaction.find({ bookingId }).sort({ createdAt: 1 });
    return transactions;
  }
}

module.exports = new PaymentService();
