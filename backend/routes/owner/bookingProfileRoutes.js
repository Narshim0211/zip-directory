const express = require('express');
const router = express.Router();
const ownerBookingProfileController = require('../../controllers/ownerBookingProfileController');
const protectOwner = require('../../middleWare/authOwnerMiddleware');

// All routes require owner authentication
router.use(protectOwner);

// Get owner's current booking profile
router.get('/booking-profile', ownerBookingProfileController.getBookingProfile);

// Update booking profile (logo, bio, photos, videos, etc.)
router.patch('/booking-profile', ownerBookingProfileController.updateBookingProfile);

// Update booking slug
router.patch('/booking-slug', ownerBookingProfileController.updateBookingSlug);

// Toggle service visibility on public page
router.patch('/booking-profile/services', ownerBookingProfileController.toggleServiceVisibility);

// Toggle public profile activation
router.patch('/booking-profile/activate', ownerBookingProfileController.togglePublicProfile);

module.exports = router;
