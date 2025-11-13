const paymentService = require('../services/paymentService');

/**
 * Payment Controllers
 * Per PRD Section 16.3: Controllers have zero business logic
 */

class PaymentController {
  /**
   * Create deposit payment
   * POST /api/payments/deposit
   */
  async createDeposit(req, res, next) {
    try {
      const { userId } = req.user;
      const { bookingId, amount, customerEmail, ownerId } = req.body;

      const result = await paymentService.createDepositPayment(
        userId,
        bookingId,
        amount,
        { customerEmail, ownerId }
      );

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create full payment
   * POST /api/payments/full
   */
  async createFullPayment(req, res, next) {
    try {
      const { userId } = req.user;
      const { bookingId, amount, depositPaid, customerEmail, ownerId } = req.body;

      const result = await paymentService.createFullPayment(
        userId,
        bookingId,
        amount,
        depositPaid,
        { customerEmail, ownerId }
      );

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Confirm payment
   * POST /api/payments/confirm
   */
  async confirmPayment(req, res, next) {
    try {
      const { paymentIntentId } = req.body;

      const transaction = await paymentService.confirmPayment(paymentIntentId);

      res.status(200).json({
        success: true,
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refund payment
   * POST /api/payments/:id/refund
   */
  async refundPayment(req, res, next) {
    try {
      const { amount, reason } = req.body;

      const refund = await paymentService.refundPayment(
        req.params.id,
        amount,
        reason
      );

      res.status(200).json({
        success: true,
        data: refund,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get transaction by ID
   * GET /api/payments/transactions/:id
   */
  async getTransaction(req, res, next) {
    try {
      const transaction = await paymentService.getTransaction(req.params.id);

      // Check access permission
      const { userId, role, ownerId } = req.user;
      const hasAccess =
        transaction.customerId.toString() === userId.toString() ||
        transaction.ownerId.toString() === (ownerId || userId).toString() ||
        role === 'admin';

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }

      res.status(200).json({
        success: true,
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get my transactions
   * GET /api/payments/transactions/my
   */
  async getMyTransactions(req, res, next) {
    try {
      const { userId } = req.user;
      const { type, status } = req.query;

      const filters = {};
      if (type) filters.type = type;
      if (status) filters.status = status;

      const transactions = await paymentService.getCustomerTransactions(userId, filters);

      res.status(200).json({
        success: true,
        count: transactions.length,
        data: transactions,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get owner transactions
   * GET /api/payments/transactions/owner
   */
  async getOwnerTransactions(req, res, next) {
    try {
      const { ownerId, userId, role } = req.user;
      const effectiveOwnerId = role === 'owner' ? (ownerId || userId) : null;

      if (!effectiveOwnerId) {
        return res.status(403).json({
          success: false,
          message: 'Only owners can access this endpoint',
        });
      }

      const { type, status } = req.query;

      const filters = {};
      if (type) filters.type = type;
      if (status) filters.status = status;

      const transactions = await paymentService.getOwnerTransactions(effectiveOwnerId, filters);

      res.status(200).json({
        success: true,
        count: transactions.length,
        data: transactions,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get booking transactions
   * GET /api/payments/transactions/booking/:bookingId
   */
  async getBookingTransactions(req, res, next) {
    try {
      const transactions = await paymentService.getBookingTransactions(req.params.bookingId);

      res.status(200).json({
        success: true,
        count: transactions.length,
        data: transactions,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PaymentController();
