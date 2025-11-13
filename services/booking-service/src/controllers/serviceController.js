const serviceService = require('../services/serviceService');

/**
 * Service Management Controllers
 * Per PRD Section 16.3: Controllers have zero business logic
 */

class ServiceController {
  /**
   * Create new service
   * POST /api/services
   */
  async createService(req, res, next) {
    try {
      const { ownerId, role } = req.user;

      if (role !== 'owner' && role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Only owners can create services',
        });
      }

      const service = await serviceService.createService(ownerId || req.user.userId, req.body);

      res.status(201).json({
        success: true,
        data: service,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get service by ID
   * GET /api/services/:id
   */
  async getServiceById(req, res, next) {
    try {
      const service = await serviceService.getServiceById(req.params.id);

      res.status(200).json({
        success: true,
        data: service,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get owner services
   * GET /api/services/owner/:ownerId
   */
  async getOwnerServices(req, res, next) {
    try {
      const { ownerId } = req.params;
      const { isActive, category } = req.query;

      const filters = {};
      if (isActive !== undefined) filters.isActive = isActive === 'true';
      if (category) filters.category = category;

      const services = await serviceService.getOwnerServices(ownerId, filters);

      res.status(200).json({
        success: true,
        count: services.length,
        data: services,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get my services (for logged-in owner)
   * GET /api/services/my
   */
  async getMyServices(req, res, next) {
    try {
      const { ownerId, userId, role } = req.user;
      const effectiveOwnerId = role === 'owner' ? (ownerId || userId) : null;

      if (!effectiveOwnerId) {
        return res.status(403).json({
          success: false,
          message: 'Only owners can access this endpoint',
        });
      }

      const { isActive, category } = req.query;
      const filters = {};
      if (isActive !== undefined) filters.isActive = isActive === 'true';
      if (category) filters.category = category;

      const services = await serviceService.getOwnerServices(effectiveOwnerId, filters);

      res.status(200).json({
        success: true,
        count: services.length,
        data: services,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get business services
   * GET /api/services/business/:businessId
   */
  async getBusinessServices(req, res, next) {
    try {
      const services = await serviceService.getBusinessServices(req.params.businessId);

      res.status(200).json({
        success: true,
        count: services.length,
        data: services,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update service
   * PATCH /api/services/:id
   */
  async updateService(req, res, next) {
    try {
      const { ownerId, userId, role } = req.user;
      const effectiveOwnerId = role === 'owner' ? (ownerId || userId) : null;

      if (!effectiveOwnerId) {
        return res.status(403).json({
          success: false,
          message: 'Only owners can update services',
        });
      }

      const service = await serviceService.updateService(
        req.params.id,
        effectiveOwnerId,
        req.body
      );

      res.status(200).json({
        success: true,
        data: service,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete service
   * DELETE /api/services/:id
   */
  async deleteService(req, res, next) {
    try {
      const { ownerId, userId, role } = req.user;
      const effectiveOwnerId = role === 'owner' ? (ownerId || userId) : null;

      if (!effectiveOwnerId) {
        return res.status(403).json({
          success: false,
          message: 'Only owners can delete services',
        });
      }

      const result = await serviceService.deleteService(req.params.id, effectiveOwnerId);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Assign staff to service
   * POST /api/services/:id/staff
   */
  async assignStaff(req, res, next) {
    try {
      const { ownerId, userId, role } = req.user;
      const effectiveOwnerId = role === 'owner' ? (ownerId || userId) : null;

      if (!effectiveOwnerId) {
        return res.status(403).json({
          success: false,
          message: 'Only owners can assign staff',
        });
      }

      const { staffIds } = req.body;
      const service = await serviceService.assignStaffToService(
        req.params.id,
        effectiveOwnerId,
        staffIds
      );

      res.status(200).json({
        success: true,
        data: service,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove staff from service
   * DELETE /api/services/:id/staff/:staffId
   */
  async removeStaff(req, res, next) {
    try {
      const { ownerId, userId, role } = req.user;
      const effectiveOwnerId = role === 'owner' ? (ownerId || userId) : null;

      if (!effectiveOwnerId) {
        return res.status(403).json({
          success: false,
          message: 'Only owners can remove staff',
        });
      }

      const service = await serviceService.removeStaffFromService(
        req.params.id,
        effectiveOwnerId,
        req.params.staffId
      );

      res.status(200).json({
        success: true,
        data: service,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search services
   * GET /api/services/search
   */
  async searchServices(req, res, next) {
    try {
      const { q, category, ownerId } = req.query;

      const filters = {};
      if (category) filters.category = category;
      if (ownerId) filters.ownerId = ownerId;

      const services = await serviceService.searchServices(q, filters);

      res.status(200).json({
        success: true,
        count: services.length,
        data: services,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ServiceController();
