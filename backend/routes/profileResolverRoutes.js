const express = require('express');
const router = express.Router();
const { protect } = require('../middleWare/authMiddleware');
const controller = require('../controllers/profileResolverController');
const rateLimit = require('../middleWare/rateLimit');

/**
 * Profile Resolver Routes
 *
 * Public endpoints for resolving profiles across Owner/Visitor roles
 */

// Get profile by handle (works for both Owner and Visitor)
// Public endpoint - optional auth for follow status
router.get(
  '/:handle',
  rateLimit({ windowMs: 60 * 1000, max: 100 }),
  controller.getProfileByHandle
);

// Get profile by user ID
router.get(
  '/id/:userId',
  rateLimit({ windowMs: 60 * 1000, max: 100 }),
  controller.getProfileById
);

// Check handle availability
router.get(
  '/check-handle/:handle',
  rateLimit({ windowMs: 60 * 1000, max: 100 }),
  controller.checkHandleAvailability
);

module.exports = router;
