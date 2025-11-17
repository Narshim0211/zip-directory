const express = require('express');
const router = express.Router();
const ownerBookingController = require('../../controllers/ownerBookingController');
const { protectOwner } = require('../../middleware/authOwnerMiddleware');

// All routes require owner authentication
router.use(protectOwner);

// Get booking statistics
router.get('/stats/summary', ownerBookingController.getBookingStats);

// Get all bookings (with filtering)
router.get('/', ownerBookingController.getBookings);

// Get single booking
router.get('/:bookingId', ownerBookingController.getBookingById);

// Update booking status
router.patch('/:bookingId/status', ownerBookingController.updateBookingStatus);

// Delete booking
router.delete('/:bookingId', ownerBookingController.deleteBooking);

module.exports = router;
