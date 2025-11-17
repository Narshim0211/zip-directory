const Business = require('../models/Business');
const Booking = require('../models/Booking');
const { AppError } = require('../utils/errorHandler');

/**
 * @route   GET /api/owner/bookings
 * @desc    Get all bookings for owner's business (with filtering)
 * @access  Private (Owner)
 */
exports.getBookings = async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    const { status, date, staffId, page = 1, limit = 50 } = req.query;

    // Find business
    const business = await Business.findOne({ owner: ownerId }).select('_id');
    if (!business) {
      throw new AppError('BUSINESS_NOT_FOUND', 'Business not found.', 404);
    }

    // Build query
    const query = { business: business._id };

    if (status) {
      query.status = status;
    }

    if (date) {
      // Filter by specific date
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.appointmentDate = { $gte: startDate, $lte: endDate };
    }

    if (staffId) {
      query['staff.staffId'] = staffId;
    }

    // Query bookings with pagination
    const skip = (page - 1) * limit;
    const bookings = await Booking.find(query)
      .sort({ appointmentDate: 1, startTime: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalBookings = await Booking.countDocuments(query);

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(totalBookings / limit),
          totalBookings,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/owner/bookings/:bookingId
 * @desc    Get single booking details
 * @access  Private (Owner)
 */
exports.getBookingById = async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    const { bookingId } = req.params;

    // Find business
    const business = await Business.findOne({ owner: ownerId }).select('_id');
    if (!business) {
      throw new AppError('BUSINESS_NOT_FOUND', 'Business not found.', 404);
    }

    // Find booking
    const booking = await Booking.findOne({
      _id: bookingId,
      business: business._id,
    });

    if (!booking) {
      throw new AppError('BOOKING_NOT_FOUND', 'Booking not found.', 404);
    }

    res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/owner/bookings/:bookingId/status
 * @desc    Update booking status (confirm, cancel, complete, no-show)
 * @access  Private (Owner)
 */
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    const { bookingId } = req.params;
    const { status, cancellationReason } = req.body;

    if (!status) {
      throw new AppError('VALIDATION_ERROR', 'Status is required.', 400);
    }

    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'];
    if (!validStatuses.includes(status)) {
      throw new AppError('VALIDATION_ERROR', 'Invalid status value.', 400);
    }

    // Find business
    const business = await Business.findOne({ owner: ownerId }).select('_id');
    if (!business) {
      throw new AppError('BUSINESS_NOT_FOUND', 'Business not found.', 404);
    }

    // Find booking
    const booking = await Booking.findOne({
      _id: bookingId,
      business: business._id,
    });

    if (!booking) {
      throw new AppError('BOOKING_NOT_FOUND', 'Booking not found.', 404);
    }

    // Update status
    booking.status = status;

    if (status === 'confirmed') {
      booking.confirmedAt = new Date();
    }

    if (status === 'cancelled') {
      booking.cancelledAt = new Date();
      if (cancellationReason) {
        booking.cancellationReason = cancellationReason;
      }
    }

    await booking.save();

    res.json({
      success: true,
      data: booking,
      message: `Booking status updated to ${status}.`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/owner/bookings/:bookingId
 * @desc    Delete a booking permanently
 * @access  Private (Owner)
 */
exports.deleteBooking = async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    const { bookingId } = req.params;

    // Find business
    const business = await Business.findOne({ owner: ownerId }).select('_id');
    if (!business) {
      throw new AppError('BUSINESS_NOT_FOUND', 'Business not found.', 404);
    }

    // Delete booking
    const result = await Booking.deleteOne({
      _id: bookingId,
      business: business._id,
    });

    if (result.deletedCount === 0) {
      throw new AppError('BOOKING_NOT_FOUND', 'Booking not found.', 404);
    }

    res.json({
      success: true,
      message: 'Booking deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/owner/bookings/stats/summary
 * @desc    Get booking statistics (today, upcoming, total)
 * @access  Private (Owner)
 */
exports.getBookingStats = async (req, res, next) => {
  try {
    const ownerId = req.user.id;

    // Find business
    const business = await Business.findOne({ owner: ownerId }).select('_id');
    if (!business) {
      throw new AppError('BUSINESS_NOT_FOUND', 'Business not found.', 404);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's bookings
    const todayCount = await Booking.countDocuments({
      business: business._id,
      appointmentDate: { $gte: today, $lt: tomorrow },
      status: { $in: ['pending', 'confirmed'] },
    });

    // Upcoming bookings (next 7 days)
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const upcomingCount = await Booking.countDocuments({
      business: business._id,
      appointmentDate: { $gte: today, $lt: nextWeek },
      status: { $in: ['pending', 'confirmed'] },
    });

    // Total bookings
    const totalCount = await Booking.countDocuments({
      business: business._id,
    });

    // Pending confirmations
    const pendingCount = await Booking.countDocuments({
      business: business._id,
      status: 'pending',
    });

    res.json({
      success: true,
      data: {
        today: todayCount,
        upcoming: upcomingCount,
        total: totalCount,
        pending: pendingCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
