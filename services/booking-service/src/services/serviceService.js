const Service = require('../models/Service');
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
    const query = { ownerId, ...filters };
    
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
   * Assign staff to service
   */
  async assignStaffToService(serviceId, ownerId, staffIds) {
    const service = await Service.findOne({ _id: serviceId, ownerId });

    if (!service) {
      throw new AppError('Service not found or access denied', 404, 'SERVICE_NOT_FOUND');
    }

    service.staffIds = [...new Set([...service.staffIds, ...staffIds])];
    await service.save();

    logger.info('Staff assigned to service', {
      serviceId,
      staffIds,
    });

    return service;
  }

  /**
   * Remove staff from service
   */
  async removeStaffFromService(serviceId, ownerId, staffId) {
    const service = await Service.findOne({ _id: serviceId, ownerId });

    if (!service) {
      throw new AppError('Service not found or access denied', 404, 'SERVICE_NOT_FOUND');
    }

    service.staffIds = service.staffIds.filter((id) => id.toString() !== staffId.toString());
    await service.save();

    logger.info('Staff removed from service', {
      serviceId,
      staffId,
    });

    return service;
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
