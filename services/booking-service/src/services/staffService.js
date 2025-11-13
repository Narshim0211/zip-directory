const Staff = require('../models/Staff');
const ScheduleException = require('../models/ScheduleException');
const { AppError } = require('../middlewares/errorMiddleware');
const logger = require('../utils/logger');

/**
 * Staff Management Business Logic
 * Per PRD Section 6.2: Staff Management
 */

class StaffService {
  /**
   * Create staff member
   */
  async createStaff(ownerId, staffData) {
    try {
      // Check if staff already exists
      const existing = await Staff.findOne({ userId: staffData.userId });
      if (existing) {
        throw new AppError('Staff member already exists', 400, 'STAFF_EXISTS');
      }

      const staff = await Staff.create({
        ...staffData,
        ownerId,
      });

      logger.info('Staff created', {
        staffId: staff._id,
        ownerId,
        userId: staff.userId,
      });

      return staff;
    } catch (error) {
      logger.error('Failed to create staff', {
        error: error.message,
        ownerId,
      });
      throw error;
    }
  }

  /**
   * Get staff by ID
   */
  async getStaffById(staffId) {
    const staff = await Staff.findById(staffId);

    if (!staff) {
      throw new AppError('Staff not found', 404, 'STAFF_NOT_FOUND');
    }

    return staff;
  }

  /**
   * Get staff by userId
   */
  async getStaffByUserId(userId) {
    const staff = await Staff.findOne({ userId });

    if (!staff) {
      throw new AppError('Staff not found', 404, 'STAFF_NOT_FOUND');
    }

    return staff;
  }

  /**
   * Get all staff for an owner
   */
  async getOwnerStaff(ownerId, includeInactive = false) {
    const query = { ownerId };
    if (!includeInactive) {
      query.isActive = true;
    }

    const staff = await Staff.find(query).sort({ firstName: 1 });
    return staff;
  }

  /**
   * Get staff for a business
   */
  async getBusinessStaff(businessId, includeInactive = false) {
    const query = { businessId };
    if (!includeInactive) {
      query.isActive = true;
    }

    const staff = await Staff.find(query).sort({ firstName: 1 });
    return staff;
  }

  /**
   * Update staff
   */
  async updateStaff(staffId, ownerId, updateData) {
    const staff = await Staff.findOne({ _id: staffId, ownerId });

    if (!staff) {
      throw new AppError('Staff not found or access denied', 404, 'STAFF_NOT_FOUND');
    }

    // Prevent changing userId and ownerId
    delete updateData.userId;
    delete updateData.ownerId;

    Object.assign(staff, updateData);
    await staff.save();

    logger.info('Staff updated', {
      staffId,
      ownerId,
    });

    return staff;
  }

  /**
   * Update staff working hours
   */
  async updateWorkingHours(staffId, ownerId, workingHours) {
    const staff = await Staff.findOne({ _id: staffId, ownerId });

    if (!staff) {
      throw new AppError('Staff not found or access denied', 404, 'STAFF_NOT_FOUND');
    }

    staff.workingHours = { ...staff.workingHours, ...workingHours };
    await staff.save();

    logger.info('Staff working hours updated', {
      staffId,
      ownerId,
    });

    return staff;
  }

  /**
   * Deactivate staff
   */
  async deactivateStaff(staffId, ownerId) {
    const staff = await Staff.findOne({ _id: staffId, ownerId });

    if (!staff) {
      throw new AppError('Staff not found or access denied', 404, 'STAFF_NOT_FOUND');
    }

    staff.isActive = false;
    await staff.save();

    logger.info('Staff deactivated', {
      staffId,
      ownerId,
    });

    return { message: 'Staff deactivated successfully' };
  }

  /**
   * Create schedule exception (day off, custom hours)
   */
  async createScheduleException(ownerId, staffId, exceptionData) {
    const staff = await Staff.findOne({ _id: staffId, ownerId });

    if (!staff) {
      throw new AppError('Staff not found or access denied', 404, 'STAFF_NOT_FOUND');
    }

    const exception = await ScheduleException.create({
      ...exceptionData,
      staffId,
      ownerId,
    });

    logger.info('Schedule exception created', {
      exceptionId: exception._id,
      staffId,
      type: exception.type,
    });

    return exception;
  }

  /**
   * Get schedule exceptions for staff
   */
  async getScheduleExceptions(staffId, startDate, endDate) {
    const query = { staffId };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const exceptions = await ScheduleException.find(query).sort({ date: 1 });
    return exceptions;
  }

  /**
   * Delete schedule exception
   */
  async deleteScheduleException(exceptionId, ownerId) {
    const exception = await ScheduleException.findOne({
      _id: exceptionId,
      ownerId,
    });

    if (!exception) {
      throw new AppError('Exception not found or access denied', 404, 'EXCEPTION_NOT_FOUND');
    }

    await exception.deleteOne();

    logger.info('Schedule exception deleted', {
      exceptionId,
      ownerId,
    });

    return { message: 'Exception deleted successfully' };
  }
}

module.exports = new StaffService();
