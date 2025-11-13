import api from './axios';

/**
 * Booking Microservice API Client
 * Calls main backend proxy at /api/booking-service/*
 * Per PRD Section 8: Frontend → Main Backend → Microservices
 */

const bookingService = {
  // ==================== Services Management ====================

  /**
   * Create a new service (owners only)
   * @param {Object} serviceData - Service data
   */
  createService: async (serviceData) => {
    const response = await api.post('/booking-service/services', serviceData);
    return response.data;
  },

  /**
   * Get service by ID
   * @param {string} serviceId - Service ID
   */
  getServiceById: async (serviceId) => {
    const response = await api.get(`/booking-service/services/${serviceId}`);
    return response.data;
  },

  /**
   * Get my services (for logged-in owner)
   * @param {Object} filters - Optional filters
   */
  getMyServices: async (filters = {}) => {
    const response = await api.get('/booking-service/services/my', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get services by owner ID
   * @param {string} ownerId - Owner ID
   * @param {Object} filters - Optional filters
   */
  getOwnerServices: async (ownerId, filters = {}) => {
    const response = await api.get(`/booking-service/services/owner/${ownerId}`, {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get services by business ID
   * @param {string} businessId - Business ID
   */
  getBusinessServices: async (businessId) => {
    const response = await api.get(`/booking-service/services/business/${businessId}`);
    return response.data;
  },

  /**
   * Update service
   * @param {string} serviceId - Service ID
   * @param {Object} updateData - Update data
   */
  updateService: async (serviceId, updateData) => {
    const response = await api.patch(`/booking-service/services/${serviceId}`, updateData);
    return response.data;
  },

  /**
   * Delete service
   * @param {string} serviceId - Service ID
   */
  deleteService: async (serviceId) => {
    const response = await api.delete(`/booking-service/services/${serviceId}`);
    return response.data;
  },

  /**
   * Search services
   * @param {string} query - Search query
   * @param {Object} filters - Optional filters
   */
  searchServices: async (query, filters = {}) => {
    const response = await api.get('/booking-service/services/search', {
      params: { q: query, ...filters },
    });
    return response.data;
  },

  /**
   * Assign staff to service
   * @param {string} serviceId - Service ID
   * @param {Array} staffIds - Array of staff IDs
   */
  assignStaffToService: async (serviceId, staffIds) => {
    const response = await api.post(`/booking-service/services/${serviceId}/staff`, {
      staffIds,
    });
    return response.data;
  },

  /**
   * Remove staff from service
   * @param {string} serviceId - Service ID
   * @param {string} staffId - Staff ID
   */
  removeStaffFromService: async (serviceId, staffId) => {
    const response = await api.delete(`/booking-service/services/${serviceId}/staff/${staffId}`);
    return response.data;
  },

  // ==================== Staff Management ====================

  /**
   * Create staff member (owners only)
   * @param {Object} staffData - Staff data
   */
  createStaff: async (staffData) => {
    const response = await api.post('/booking-service/staff', staffData);
    return response.data;
  },

  /**
   * Get staff by ID
   * @param {string} staffId - Staff ID
   */
  getStaffById: async (staffId) => {
    const response = await api.get(`/booking-service/staff/${staffId}`);
    return response.data;
  },

  /**
   * Get my staff profile
   */
  getMyStaffProfile: async () => {
    const response = await api.get('/booking-service/staff/me');
    return response.data;
  },

  /**
   * Get owner's staff members
   * @param {string} ownerId - Owner ID
   * @param {boolean} includeInactive - Include inactive staff
   */
  getOwnerStaff: async (ownerId, includeInactive = false) => {
    const response = await api.get(`/booking-service/staff/owner/${ownerId}`, {
      params: { includeInactive },
    });
    return response.data;
  },

  /**
   * Get business staff members
   * @param {string} businessId - Business ID
   * @param {boolean} includeInactive - Include inactive staff
   */
  getBusinessStaff: async (businessId, includeInactive = false) => {
    const response = await api.get(`/booking-service/staff/business/${businessId}`, {
      params: { includeInactive },
    });
    return response.data;
  },

  /**
   * Update staff
   * @param {string} staffId - Staff ID
   * @param {Object} updateData - Update data
   */
  updateStaff: async (staffId, updateData) => {
    const response = await api.patch(`/booking-service/staff/${staffId}`, updateData);
    return response.data;
  },

  /**
   * Update staff working hours
   * @param {string} staffId - Staff ID
   * @param {Object} workingHours - Working hours data
   */
  updateStaffWorkingHours: async (staffId, workingHours) => {
    const response = await api.patch(`/booking-service/staff/${staffId}/hours`, workingHours);
    return response.data;
  },

  /**
   * Deactivate staff
   * @param {string} staffId - Staff ID
   */
  deactivateStaff: async (staffId) => {
    const response = await api.delete(`/booking-service/staff/${staffId}`);
    return response.data;
  },

  /**
   * Create schedule exception (day off, custom hours)
   * @param {string} staffId - Staff ID
   * @param {Object} exceptionData - Exception data
   */
  createScheduleException: async (staffId, exceptionData) => {
    const response = await api.post(`/booking-service/staff/${staffId}/exceptions`, exceptionData);
    return response.data;
  },

  /**
   * Get schedule exceptions
   * @param {string} staffId - Staff ID
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   */
  getScheduleExceptions: async (staffId, startDate, endDate) => {
    const response = await api.get(`/booking-service/staff/${staffId}/exceptions`, {
      params: { startDate, endDate },
    });
    return response.data;
  },

  /**
   * Delete schedule exception
   * @param {string} exceptionId - Exception ID
   */
  deleteScheduleException: async (exceptionId) => {
    const response = await api.delete(`/booking-service/staff/exceptions/${exceptionId}`);
    return response.data;
  },

  // ==================== Booking/Appointments ====================

  /**
   * Get available time slots
   * @param {string} serviceId - Service ID
   * @param {string} staffId - Staff ID
   * @param {string} date - Date (YYYY-MM-DD)
   */
  getAvailableSlots: async (serviceId, staffId, date) => {
    const response = await api.get('/booking-service/bookings/availability', {
      params: { serviceId, staffId, date },
    });
    return response.data;
  },

  /**
   * Create booking/appointment
   * @param {Object} bookingData - Booking data
   */
  createBooking: async (bookingData) => {
    const response = await api.post('/booking-service/bookings', bookingData);
    return response.data;
  },

  /**
   * Get booking by ID
   * @param {string} bookingId - Booking ID
   */
  getBookingById: async (bookingId) => {
    const response = await api.get(`/booking-service/bookings/${bookingId}`);
    return response.data;
  },

  /**
   * Get my bookings (customer view)
   * @param {Object} filters - Optional filters
   */
  getMyBookings: async (filters = {}) => {
    const response = await api.get('/booking-service/bookings/my', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get owner bookings
   * @param {Object} filters - Optional filters
   */
  getOwnerBookings: async (filters = {}) => {
    const response = await api.get('/booking-service/bookings/owner', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get staff bookings
   * @param {string} staffId - Staff ID
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   */
  getStaffBookings: async (staffId, startDate, endDate) => {
    const response = await api.get(`/booking-service/bookings/staff/${staffId}`, {
      params: { startDate, endDate },
    });
    return response.data;
  },

  /**
   * Update booking status
   * @param {string} bookingId - Booking ID
   * @param {string} status - New status
   */
  updateBookingStatus: async (bookingId, status) => {
    const response = await api.patch(`/booking-service/bookings/${bookingId}/status`, {
      status,
    });
    return response.data;
  },

  /**
   * Cancel booking
   * @param {string} bookingId - Booking ID
   * @param {string} reason - Cancellation reason
   */
  cancelBooking: async (bookingId, reason) => {
    const response = await api.post(`/booking-service/bookings/${bookingId}/cancel`, {
      reason,
    });
    return response.data;
  },

  /**
   * Reschedule booking
   * @param {string} bookingId - Booking ID
   * @param {string} newStartTime - New start time
   */
  rescheduleBooking: async (bookingId, newStartTime) => {
    const response = await api.post(`/booking-service/bookings/${bookingId}/reschedule`, {
      newStartTime,
    });
    return response.data;
  },

  /**
   * Get booking statistics (owners only)
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   */
  getBookingStats: async (startDate, endDate) => {
    const response = await api.get('/booking-service/bookings/stats', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  // ==================== Health Check ====================

  /**
   * Check if booking service is healthy
   */
  healthCheck: async () => {
    const response = await api.get('/booking-service/health');
    return response.data;
  },
};

export default bookingService;
