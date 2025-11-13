const express = require('express');
const serviceController = require('../controllers/serviceController');
const staffController = require('../controllers/staffController');
const bookingController = require('../controllers/bookingController');
const { validateToken, requireRole } = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * Booking Service Routes
 * Per PRD Section 6: Booking Microservice API
 */

// Health check (no auth required)
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'booking-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// ==================== Service Routes ====================

// Search services (public)
router.get('/services/search', validateToken, serviceController.searchServices);

// My services (owner)
router.get('/services/my', validateToken, requireRole(['owner', 'admin']), serviceController.getMyServices);

// CRUD operations
router.post('/services', validateToken, requireRole(['owner', 'admin']), serviceController.createService);
router.get('/services/:id', validateToken, serviceController.getServiceById);
router.patch('/services/:id', validateToken, requireRole(['owner', 'admin']), serviceController.updateService);
router.delete('/services/:id', validateToken, requireRole(['owner', 'admin']), serviceController.deleteService);

// Owner and business services
router.get('/services/owner/:ownerId', validateToken, serviceController.getOwnerServices);
router.get('/services/business/:businessId', validateToken, serviceController.getBusinessServices);

// Staff assignment
router.post('/services/:id/staff', validateToken, requireRole(['owner', 'admin']), serviceController.assignStaff);
router.delete('/services/:id/staff/:staffId', validateToken, requireRole(['owner', 'admin']), serviceController.removeStaff);

// ==================== Staff Routes ====================

// My staff profile
router.get('/staff/me', validateToken, requireRole(['staff', 'owner']), staffController.getMyStaffProfile);

// CRUD operations
router.post('/staff', validateToken, requireRole(['owner', 'admin']), staffController.createStaff);
router.get('/staff/:id', validateToken, staffController.getStaffById);
router.patch('/staff/:id', validateToken, requireRole(['owner', 'admin']), staffController.updateStaff);
router.delete('/staff/:id', validateToken, requireRole(['owner', 'admin']), staffController.deactivateStaff);

// Owner and business staff
router.get('/staff/owner/:ownerId', validateToken, staffController.getOwnerStaff);
router.get('/staff/business/:businessId', validateToken, staffController.getBusinessStaff);

// Working hours
router.patch('/staff/:id/hours', validateToken, requireRole(['owner', 'admin']), staffController.updateWorkingHours);

// Schedule exceptions
router.post('/staff/:id/exceptions', validateToken, requireRole(['owner', 'admin']), staffController.createException);
router.get('/staff/:id/exceptions', validateToken, staffController.getExceptions);
router.delete('/staff/exceptions/:exceptionId', validateToken, requireRole(['owner', 'admin']), staffController.deleteException);

// ==================== Booking Routes ====================

// Availability
router.get('/bookings/availability', validateToken, bookingController.getAvailableSlots);

// Statistics
router.get('/bookings/stats', validateToken, requireRole(['owner', 'admin']), bookingController.getStats);

// My bookings (customer)
router.get('/bookings/my', validateToken, bookingController.getMyBookings);

// Owner bookings
router.get('/bookings/owner', validateToken, requireRole(['owner', 'admin']), bookingController.getOwnerBookings);

// Staff bookings
router.get('/bookings/staff/:staffId', validateToken, bookingController.getStaffBookings);

// CRUD operations
router.post('/bookings', validateToken, bookingController.createBooking);
router.get('/bookings/:id', validateToken, bookingController.getBookingById);

// Booking actions
router.patch('/bookings/:id/status', validateToken, bookingController.updateStatus);
router.post('/bookings/:id/cancel', validateToken, bookingController.cancelBooking);
router.post('/bookings/:id/reschedule', validateToken, bookingController.rescheduleBooking);

module.exports = router;
