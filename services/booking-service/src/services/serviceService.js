const Service = require('../models/Service');
const Staff = require('../models/Staff');
const { AppError } = require('../middlewares/errorMiddleware');
const logger = require('../utils/logger');

/**
 * Service Management Business Logic
 * Per PRD Section 6.1: Services
 */

class ServiceService {
  /**
   * Create a new service
   */
  async createService(ownerId, serviceData) {
    try {
      const service = await Service.create({
        ...serviceData,
        ownerId,
      });

      logger.info('Service created', {
        serviceId: service._id,
        ownerId,
        name: service.name,
      });

      return service;
    } catch (error) {
      logger.error('Failed to create service', {
        error: error.message,
        ownerId,
      });
      throw error;
    }
  }

  /**
   * Get service by ID
   */
  async getServiceById(serviceId) {
    const service = await Service.findById(serviceId).populate('staffIds');

    if (!service) {
      throw new AppError('Service not found', 404, 'SERVICE_NOT_FOUND');
    }

    return service;
  }

  /**
   * Get all services for an owner
   */
  async getOwnerServices(ownerId, filters = {}) {
    const query = { ownerId, isActive: true, ...filters };
    
    const services = await Service.find(query)
      .populate('staffIds')
      .sort({ createdAt: -1 });

    return services;
  }

  /**
   * Get active services for a business
   */
  async getBusinessServices(businessId) {
    const services = await Service.find({
      businessId,
      isActive: true,
    })
      .populate('staffIds')
      .sort({ category: 1, name: 1 });

    return services;
  }

  /**
   * Update service
   */
  async updateService(serviceId, ownerId, updateData) {
    const service = await Service.findOne({ _id: serviceId, ownerId });

    if (!service) {
      throw new AppError('Service not found or access denied', 404, 'SERVICE_NOT_FOUND');
    }

    // If staffIds are being updated, maintain two-way relationship
    if (updateData.staffIds !== undefined) {
      const oldStaffIds = service.staffIds.map(id => id.toString());
      const newStaffIds = updateData.staffIds.map(id => id.toString());

      // Staff to add: in new but not in old
      const staffToAdd = newStaffIds.filter(id => !oldStaffIds.includes(id));
      // Staff to remove: in old but not in new
      const staffToRemove = oldStaffIds.filter(id => !newStaffIds.includes(id));

      // Add this service to new staff members
      if (staffToAdd.length > 0) {
        await Staff.updateMany(
          { _id: { $in: staffToAdd } },
          { $addToSet: { serviceIds: serviceId } }
        );
      }

      // Remove this service from removed staff members
      if (staffToRemove.length > 0) {
        await Staff.updateMany(
          { _id: { $in: staffToRemove } },
          { $pull: { serviceIds: serviceId } }
        );
      }

      logger.info('Two-way staff-service relationship updated', {
        serviceId,
        staffToAdd: staffToAdd.length,
        staffToRemove: staffToRemove.length,
      });
    }

    Object.assign(service, updateData);
    await service.save();

    logger.info('Service updated', {
      serviceId,
      ownerId,
    });

    return service;
  }

  /**
   * Delete (soft delete) service
   */
  async deleteService(serviceId, ownerId) {
    const service = await Service.findOne({ _id: serviceId, ownerId });

    if (!service) {
      throw new AppError('Service not found or access denied', 404, 'SERVICE_NOT_FOUND');
    }

    service.isActive = false;
    await service.save();

    logger.info('Service deleted', {
      serviceId,
      ownerId,
    });

    return { message: 'Service deleted successfully' };
  }

  /**
   * Assign staff to service (TWO-WAY SYNC)
   * Updates both Service.staffIds[] and Staff.serviceIds[]
   */
  async assignStaffToService(serviceId, ownerId, staffIds) {
    const service = await Service.findOne({ _id: serviceId, ownerId });

    if (!service) {
      throw new AppError('Service not found or access denied', 404, 'SERVICE_NOT_FOUND');
    }

    // Update service with staff IDs (avoid duplicates)
    service.staffIds = [...new Set([...service.staffIds, ...staffIds])];
    await service.save();

    // 🔗 TWO-WAY SYNC: Update each staff to include this service
    await Staff.updateMany(
      { _id: { $in: staffIds }, ownerId },
      { $addToSet: { serviceIds: serviceId } }
    );

    logger.info('Staff assigned to service (two-way sync)', {
      serviceId,
      staffIds,
    });

    return service;
  }

  /**
   * Remove staff from service (TWO-WAY SYNC)
   * Updates both Service.staffIds[] and Staff.serviceIds[]
   */
  async removeStaffFromService(serviceId, ownerId, staffId) {
    const service = await Service.findOne({ _id: serviceId, ownerId });

    if (!service) {
      throw new AppError('Service not found or access denied', 404, 'SERVICE_NOT_FOUND');
    }

    // Remove staff from service
    service.staffIds = service.staffIds.filter((id) => id.toString() !== staffId.toString());
    await service.save();

    // 🔗 TWO-WAY SYNC: Remove this service from staff
    await Staff.updateOne(
      { _id: staffId, ownerId },
      { $pull: { serviceIds: serviceId } }
    );

    logger.info('Staff removed from service (two-way sync)', {
      serviceId,
      staffId,
    });

    return service;
  }

  /**
   * Get staff for a specific service
   * Returns active staff who can perform this service
   */
  async getStaffForService(serviceId) {
    const service = await Service.findById(serviceId);

    if (!service) {
      throw new AppError('Service not found', 404, 'SERVICE_NOT_FOUND');
    }

    // Find all active staff who have this service in their serviceIds
    const staff = await Staff.find({
      serviceIds: serviceId,
      isActive: true,
    }).select('firstName lastName email phone specialties workingHours avatarUrl');

    logger.info('Fetched staff for service', {
      serviceId,
      staffCount: staff.length,
    });

    return staff;
  }

  /**
   * Search services
   */
  async searchServices(searchQuery, filters = {}) {
    const query = {
      isActive: true,
      ...filters,
    };

    if (searchQuery) {
      query.$text = { $search: searchQuery };
    }

    const services = await Service.find(query)
      .populate('staffIds')
      .sort(searchQuery ? { score: { $meta: 'textScore' } } : { name: 1 });

    return services;
  }
}

module.exports = new ServiceService();
