const staffService = require('../services/staffService');

/**
 * Staff Management Controllers
 */

class StaffController {
  /**
   * Create staff member
   * POST /api/staff
   */
  async createStaff(req, res, next) {
    try {
      const { ownerId, userId, role } = req.user;
      const effectiveOwnerId = role === 'owner' ? (ownerId || userId) : null;

      if (!effectiveOwnerId) {
        return res.status(403).json({
          success: false,
          message: 'Only owners can create staff',
        });
      }

      const staff = await staffService.createStaff(effectiveOwnerId, req.body);

      res.status(201).json({
        success: true,
        data: staff,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get staff by ID
   * GET /api/staff/:id
   */
  async getStaffById(req, res, next) {
    try {
      const staff = await staffService.getStaffById(req.params.id);

      res.status(200).json({
        success: true,
        data: staff,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get my staff profile
   * GET /api/staff/me
   */
  async getMyStaffProfile(req, res, next) {
    try {
      const staff = await staffService.getStaffByUserId(req.user.userId);

      res.status(200).json({
        success: true,
        data: staff,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get owner staff
   * GET /api/staff/owner/:ownerId
   */
  async getOwnerStaff(req, res, next) {
    try {
      const { includeInactive } = req.query;
      const staff = await staffService.getOwnerStaff(
        req.params.ownerId,
        includeInactive === 'true'
      );

      res.status(200).json({
        success: true,
        count: staff.length,
        data: staff,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get business staff
   * GET /api/staff/business/:businessId
   */
  async getBusinessStaff(req, res, next) {
    try {
      const { includeInactive } = req.query;
      const staff = await staffService.getBusinessStaff(
        req.params.businessId,
        includeInactive === 'true'
      );

      res.status(200).json({
        success: true,
        count: staff.length,
        data: staff,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update staff
   * PATCH /api/staff/:id
   */
  async updateStaff(req, res, next) {
    try {
      const { ownerId, userId, role } = req.user;
      const effectiveOwnerId = role === 'owner' ? (ownerId || userId) : null;

      if (!effectiveOwnerId) {
        return res.status(403).json({
          success: false,
          message: 'Only owners can update staff',
        });
      }

      const staff = await staffService.updateStaff(
        req.params.id,
        effectiveOwnerId,
        req.body
      );

      res.status(200).json({
        success: true,
        data: staff,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update working hours
   * PATCH /api/staff/:id/hours
   */
  async updateWorkingHours(req, res, next) {
    try {
      const { ownerId, userId, role } = req.user;
      const effectiveOwnerId = role === 'owner' ? (ownerId || userId) : null;

      if (!effectiveOwnerId) {
        return res.status(403).json({
          success: false,
          message: 'Only owners can update working hours',
        });
      }

      const staff = await staffService.updateWorkingHours(
        req.params.id,
        effectiveOwnerId,
        req.body
      );

      res.status(200).json({
        success: true,
        data: staff,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Deactivate staff
   * DELETE /api/staff/:id
   */
  async deactivateStaff(req, res, next) {
    try {
      const { ownerId, userId, role } = req.user;
      const effectiveOwnerId = role === 'owner' ? (ownerId || userId) : null;

      if (!effectiveOwnerId) {
        return res.status(403).json({
          success: false,
          message: 'Only owners can deactivate staff',
        });
      }

      const result = await staffService.deactivateStaff(req.params.id, effectiveOwnerId);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create schedule exception
   * POST /api/staff/:id/exceptions
   */
  async createException(req, res, next) {
    try {
      const { ownerId, userId, role } = req.user;
      const effectiveOwnerId = role === 'owner' ? (ownerId || userId) : null;

      if (!effectiveOwnerId) {
        return res.status(403).json({
          success: false,
          message: 'Only owners can create exceptions',
        });
      }

      const exception = await staffService.createScheduleException(
        effectiveOwnerId,
        req.params.id,
        req.body
      );

      res.status(201).json({
        success: true,
        data: exception,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get schedule exceptions
   * GET /api/staff/:id/exceptions
   */
  async getExceptions(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const exceptions = await staffService.getScheduleExceptions(
        req.params.id,
        startDate,
        endDate
      );

      res.status(200).json({
        success: true,
        count: exceptions.length,
        data: exceptions,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete exception
   * DELETE /api/staff/exceptions/:exceptionId
   */
  async deleteException(req, res, next) {
    try {
      const { ownerId, userId, role } = req.user;
      const effectiveOwnerId = role === 'owner' ? (ownerId || userId) : null;

      if (!effectiveOwnerId) {
        return res.status(403).json({
          success: false,
          message: 'Only owners can delete exceptions',
        });
      }

      const result = await staffService.deleteScheduleException(
        req.params.exceptionId,
        effectiveOwnerId
      );

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new StaffController();
