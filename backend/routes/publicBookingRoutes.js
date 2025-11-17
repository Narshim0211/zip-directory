const express = require('express');
const router = express.Router();
const publicBookingController = require('../controllers/publicBookingController');

// Public routes (no authentication required)

// Get public profile by booking slug
router.get('/profile/:slug', publicBookingController.getPublicProfile);

// Get booking page data by slug
router.get('/booking/:slug', publicBookingController.getBookingPage);

// Get staff list for booking (optionally filtered by service)
router.get('/staff/:slug', publicBookingController.getStaffBySlug);

// Get available time slots for booking
router.get('/availability/:slug', publicBookingController.getAvailability);

// Create a new booking/appointment
router.post('/booking/:slug', publicBookingController.createBooking);

module.exports = router;
