const express = require('express');
const router = express.Router();
const profileResolverController = require('../controllers/profileResolverController');
const { authenticateOptional } = require('../middleWare/authMiddleware');

/**
 * Profile Resolver Routes
 * Unified profile lookup system that works for both Owner and Visitor profiles
 */

// GET /api/profile/:handle - Get profile by handle (supports optional auth for follow status)
router.get('/:handle', authenticateOptional, profileResolverController.getProfileByHandle);

// GET /api/profile/id/:userId - Get profile by user ID
router.get('/id/:userId', profileResolverController.getProfileById);

// GET /api/profile/check-handle/:handle - Check if handle is available
router.get('/check-handle/:handle', authenticateOptional, profileResolverController.checkHandleAvailability);

module.exports = router;
