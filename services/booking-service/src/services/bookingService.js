const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Staff = require('../models/Staff');
const ScheduleException = require('../models/ScheduleException');
const { AppError } = require('../middlewares/errorMiddleware');
const { hasTimeOverlap, generateTimeSlots, isWithinWorkingHours } = require('../utils/timeUtils');
const logger = require('../utils/logger');
const { startOfDay, endOfDay, addMinutes } = require('date-fns');

/**
 * Booking Management Business Logic
 * Per PRD Section 6.3: Appointments & Booking
 */

class BookingService {
  /**
   * Calculate availability for public booking page
   * Generates time slots based on staff working hours and existing bookings
   */
  async calculateAvailability(serviceId, staffId, date) {
    try {
      // 1. Fetch service and staff
      const [service, staff] = await Promise.all([
        Service.findById(serviceId),
        Staff.findById(staffId),
      ]);

      if (!service) {
        throw new AppError('Service not found', 404, 'SERVICE_NOT_FOUND');
      }

      if (!staff || !staff.isActive) {
        throw new AppError('Staff not found or inactive', 404, 'STAFF_NOT_FOUND');
      }

      // 2. Parse date and get day of week
      const targetDate = new Date(date);
      const dayOfWeek = targetDate.toLocaleDateString('en-US', { weekday: 'lowercase' });

      // 3. Check if staff works on this day
      const daySchedule = staff.workingHours[dayOfWeek];
      if (!daySchedule || !daySchedule.enabled) {
        logger.info('Staff not working on this day', { staffId, date, dayOfWeek });
        return [];
      }

      // 4. Generate time slots based on working hours
      const slots = this._generateSlots(
        daySchedule.start,
        daySchedule.end,
        service.duration
      );

      // 5. Get existing bookings for this staff on this date
      const existingBookings = await Booking.find({
        staffId,
        status: { $in: ['pending', 'confirmed', 'in_progress'] },
        startTime: {
          $gte: startOfDay(targetDate),
          $lte: endOfDay(targetDate),
        },
      }).select('startTime endTime');

      // 6. Filter out booked slots
      const availableSlots = slots.filter((slot) => {
        const slotTime = new Date(`${date}T${slot}`);
        const slotEnd = addMinutes(slotTime, service.duration);

        // Check if this slot conflicts with any existing booking
        return !existingBookings.some((booking) => {
          return (
            (slotTime >= booking.startTime && slotTime < booking.endTime) ||
            (slotEnd > booking.startTime && slotEnd <= booking.endTime) ||
            (slotTime <= booking.startTime && slotEnd >= booking.endTime)
          );
        });
      });

      logger.info('Calculated availability', {
        serviceId,
        staffId,
        date,
        totalSlots: slots.length,
        availableSlots: availableSlots.length,
      });

      return availableSlots;
    } catch (error) {
      logger.error('Failed to calculate availability', {
        error: error.message,
        serviceId,
        staffId,
        date,
      });
      throw error;
    }
  }

  /**
   * Helper: Generate time slots between start and end time
   * @private
   */
  _generateSlots(startTime, endTime, serviceDuration) {
    const slots = [];
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    let currentMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    // Use 30-minute intervals or service duration, whichever is smaller
    const slotInterval = Math.min(30, serviceDuration);

    while (currentMinutes + serviceDuration <= endMinutes) {
      const hours = Math.floor(currentMinutes / 60);
      const minutes = currentMinutes % 60;
      slots.push(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`);
      currentMinutes += slotInterval;
    }

    return slots;
  }

  /**
   * Get available time slots for a service with a specific staff member
   */
  async getAvailableSlots(serviceId, staffId, date) {
    try {
      // Get service and staff
      const service = await Service.findById(serviceId);
      const staff = await Staff.findById(staffId);

      if (!service || !staff) {
        throw new AppError('Service or staff not found', 404, 'RESOURCE_NOT_FOUND');
      }

      // Check if staff can perform this service
      if (!service.staffIds.some((id) => id.toString() === staffId.toString())) {
        throw new AppError('Staff cannot perform this service', 400, 'STAFF_MISMATCH');
      }

      const targetDate = new Date(date);
      
      // Check for schedule exceptions
      const exception = await ScheduleException.findOne({
        staffId,
        date: {
          $gte: startOfDay(targetDate),
          $lte: endOfDay(targetDate),
        },
      });

      if (exception && exception.type === 'day_off') {
        return [];
      }

      // Get working hours (use exception custom hours if available)
      const workingHours = exception?.type === 'custom_hours' && exception.customHours
        ? { [targetDate.getDay()]: { enabled: true, ...exception.customHours } }
        : staff.workingHours;

      // Get existing bookings for the day
      const existingBookings = await Booking.find({
        staffId,
        status: { $in: ['pending', 'confirmed', 'in_progress'] },
        startTime: {
          $gte: startOfDay(targetDate),
          $lte: endOfDay(targetDate),
        },
      });

      // Generate available slots
      const slots = generateTimeSlots(
        targetDate,
        workingHours,
        service.duration,
        existingBookings,
        staff.timezone
      );

      return slots;
    } catch (error) {
      logger.error('Failed to get available slots', {
        error: error.message,
        serviceId,
        staffId,
        date,
      });
      throw error;
    }
  }

  /**
   * Create a booking
   */
  async createBooking(customerId, bookingData) {
    try {
      const { serviceId, staffId, startTime } = bookingData;

      // Get service and staff
      const service = await Service.findById(serviceId);
      const staff = await Staff.findById(staffId);

      if (!service || !staff) {
        throw new AppError('Service or staff not found', 404, 'RESOURCE_NOT_FOUND');
      }

      const bookingStart = new Date(startTime);
      const bookingEnd = addMinutes(bookingStart, service.duration);

      // Check for overlapping bookings (double-booking prevention)
      const overlappingBookings = await Booking.find({
        staffId,
        status: { $in: ['pending', 'confirmed', 'in_progress'] },
        $or: [
          {
            startTime: { $lte: bookingStart },
            endTime: { $gt: bookingStart },
          },
          {
            startTime: { $lt: bookingEnd },
            endTime: { $gte: bookingEnd },
          },
          {
            startTime: { $gte: bookingStart },
            endTime: { $lte: bookingEnd },
          },
        ],
      });

      if (overlappingBookings.length > 0) {
        throw new AppError(
          'Time slot not available - overlapping booking exists',
          409,
          'BOOKING_CONFLICT'
        );
      }

      // Check if within working hours
      if (!isWithinWorkingHours(bookingStart, staff.workingHours, staff.timezone)) {
        throw new AppError('Time slot outside working hours', 400, 'OUTSIDE_WORKING_HOURS');
      }

      // Create booking
      const booking = await Booking.create({
        ...bookingData,
        customerId,
        ownerId: staff.ownerId,
        startTime: bookingStart,
        endTime: bookingEnd,
        duration: service.duration,
        serviceName: service.name,
        servicePrice: service.price,
        staffName: staff.fullName,
        depositRequired: service.depositRequired,
        depositAmount: service.computedDeposit,
      });

      logger.info('Booking created', {
        bookingId: booking._id,
        customerId,
        serviceId,
        staffId,
        startTime: bookingStart,
      });

      return booking;
    } catch (error) {
      logger.error('Failed to create booking', {
        error: error.message,
        customerId,
      });
      throw error;
    }
  }

  /**
   * Get booking by ID
   */
  async getBookingById(bookingId) {
    const booking = await Booking.findById(bookingId)
      .populate('serviceId')
      .populate('staffId');

    if (!booking) {
      throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
    }

    return booking;
  }

  /**
   * Get customer bookings
   */
  async getCustomerBookings(customerId, filters = {}) {
    const query = { customerId, ...filters };
    
    const bookings = await Booking.find(query)
      .populate('serviceId')
      .populate('staffId')
      .sort({ startTime: -1 });

    return bookings;
  }

  /**
   * Get owner bookings
   */
  async getOwnerBookings(ownerId, filters = {}) {
    const query = { ownerId, ...filters };
    
    const bookings = await Booking.find(query)
      .populate('serviceId')
      .populate('staffId')
      .sort({ startTime: -1 });

    return bookings;
  }

  /**
   * Get staff bookings
   */
  async getStaffBookings(staffId, startDate, endDate) {
    const query = { staffId };

    if (startDate && endDate) {
      query.startTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const bookings = await Booking.find(query)
      .populate('serviceId')
      .sort({ startTime: 1 });

    return bookings;
  }

  /**
   * Update booking status
   */
  async updateBookingStatus(bookingId, userId, status) {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
    }

    booking.status = status;
    await booking.save();

    logger.info('Booking status updated', {
      bookingId,
      userId,
      newStatus: status,
    });

    return booking;
  }

  /**
   * Cancel booking
   */
  async cancelBooking(bookingId, userId, role, reason) {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
    }

    // Check if user has permission to cancel
    if (role === 'customer' && booking.customerId.toString() !== userId.toString()) {
      throw new AppError('Access denied', 403, 'ACCESS_DENIED');
    }

    // Check if booking can be cancelled
    if (!booking.canCancel()) {
      throw new AppError(
        'Booking cannot be cancelled - too close to appointment time or already completed',
        400,
        'CANCELLATION_NOT_ALLOWED'
      );
    }

    booking.status = 'cancelled';
    booking.cancellationReason = reason;
    booking.cancelledBy = role;
    booking.cancelledAt = new Date();
    await booking.save();

    logger.info('Booking cancelled', {
      bookingId,
      userId,
      role,
    });

    return booking;
  }

  /**
   * Reschedule booking
   */
  async rescheduleBooking(bookingId, userId, newStartTime) {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
    }

    // Check if booking can be rescheduled
    if (!booking.canReschedule()) {
      throw new AppError(
        'Booking cannot be rescheduled - too close to appointment time',
        400,
        'RESCHEDULE_NOT_ALLOWED'
      );
    }

    const newStart = new Date(newStartTime);
    const newEnd = addMinutes(newStart, booking.duration);

    // Check for overlapping bookings
    const overlappingBookings = await Booking.find({
      _id: { $ne: bookingId },
      staffId: booking.staffId,
      status: { $in: ['pending', 'confirmed', 'in_progress'] },
      $or: [
        {
          startTime: { $lte: newStart },
          endTime: { $gt: newStart },
        },
        {
          startTime: { $lt: newEnd },
          endTime: { $gte: newEnd },
        },
        {
          startTime: { $gte: newStart },
          endTime: { $lte: newEnd },
        },
      ],
    });

    if (overlappingBookings.length > 0) {
      throw new AppError('New time slot not available', 409, 'BOOKING_CONFLICT');
    }

    booking.startTime = newStart;
    booking.endTime = newEnd;
    await booking.save();

    logger.info('Booking rescheduled', {
      bookingId,
      userId,
      newStartTime: newStart,
    });

    return booking;
  }

  /**
   * Get booking statistics for owner
   */
  async getBookingStats(ownerId, startDate, endDate) {
    const matchQuery = { ownerId };

    if (startDate && endDate) {
      matchQuery.startTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const stats = await Booking.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$servicePrice' },
        },
      },
    ]);

    return stats;
  }
}

module.exports = new BookingService();
