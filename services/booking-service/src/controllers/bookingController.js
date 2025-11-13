const bookingService = require('../services/bookingService');

/**
 * Booking Management Controllers
 */

class BookingController {
  /**
   * Get available slots
   * GET /api/bookings/availability
   */
  async getAvailableSlots(req, res, next) {
    try {
      const { serviceId, staffId, date } = req.query;

      if (!serviceId || !staffId || !date) {
        return res.status(400).json({
          success: false,
          message: 'serviceId, staffId, and date are required',
        });
      }

      const slots = await bookingService.getAvailableSlots(serviceId, staffId, date);

      res.status(200).json({
        success: true,
        count: slots.length,
        data: slots,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create booking
   * POST /api/bookings
   */
  async createBooking(req, res, next) {
    try {
      const { userId } = req.user;
      const booking = await bookingService.createBooking(userId, req.body);

      res.status(201).json({
        success: true,
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get booking by ID
   * GET /api/bookings/:id
   */
  async getBookingById(req, res, next) {
    try {
      const booking = await bookingService.getBookingById(req.params.id);

      // Check access permission
      const { userId, role, ownerId } = req.user;
      const hasAccess =
        booking.customerId.toString() === userId.toString() ||
        booking.ownerId.toString() === (ownerId || userId).toString() ||
        role === 'admin';

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }

      res.status(200).json({
        success: true,
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get my bookings (customer view)
   * GET /api/bookings/my
   */
  async getMyBookings(req, res, next) {
    try {
      const { userId } = req.user;
      const { status, upcoming } = req.query;

      const filters = {};
      if (status) filters.status = status;
      if (upcoming === 'true') {
        filters.startTime = { $gte: new Date() };
      }

      const bookings = await bookingService.getCustomerBookings(userId, filters);

      res.status(200).json({
        success: true,
        count: bookings.length,
        data: bookings,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get owner bookings
   * GET /api/bookings/owner
   */
  async getOwnerBookings(req, res, next) {
    try {
      const { ownerId, userId, role } = req.user;
      const effectiveOwnerId = role === 'owner' ? (ownerId || userId) : null;

      if (!effectiveOwnerId) {
        return res.status(403).json({
          success: false,
          message: 'Only owners can access this endpoint',
        });
      }

      const { status, startDate, endDate } = req.query;

      const filters = {};
      if (status) filters.status = status;
      if (startDate && endDate) {
        filters.startTime = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        };
      }

      const bookings = await bookingService.getOwnerBookings(effectiveOwnerId, filters);

      res.status(200).json({
        success: true,
        count: bookings.length,
        data: bookings,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get staff bookings
   * GET /api/bookings/staff/:staffId
   */
  async getStaffBookings(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const bookings = await bookingService.getStaffBookings(
        req.params.staffId,
        startDate,
        endDate
      );

      res.status(200).json({
        success: true,
        count: bookings.length,
        data: bookings,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update booking status
   * PATCH /api/bookings/:id/status
   */
  async updateStatus(req, res, next) {
    try {
      const { status } = req.body;
      const { userId } = req.user;

      const booking = await bookingService.updateBookingStatus(
        req.params.id,
        userId,
        status
      );

      res.status(200).json({
        success: true,
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel booking
   * POST /api/bookings/:id/cancel
   */
  async cancelBooking(req, res, next) {
    try {
      const { reason } = req.body;
      const { userId, role } = req.user;

      const booking = await bookingService.cancelBooking(
        req.params.id,
        userId,
        role,
        reason
      );

      res.status(200).json({
        success: true,
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reschedule booking
   * POST /api/bookings/:id/reschedule
   */
  async rescheduleBooking(req, res, next) {
    try {
      const { newStartTime } = req.body;
      const { userId } = req.user;

      const booking = await bookingService.rescheduleBooking(
        req.params.id,
        userId,
        newStartTime
      );

      res.status(200).json({
        success: true,
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get booking statistics
   * GET /api/bookings/stats
   */
  async getStats(req, res, next) {
    try {
      const { ownerId, userId, role } = req.user;
      const effectiveOwnerId = role === 'owner' ? (ownerId || userId) : null;

      if (!effectiveOwnerId) {
        return res.status(403).json({
          success: false,
          message: 'Only owners can access statistics',
        });
      }

      const { startDate, endDate } = req.query;
      const stats = await bookingService.getBookingStats(
        effectiveOwnerId,
        startDate,
        endDate
      );

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BookingController();
