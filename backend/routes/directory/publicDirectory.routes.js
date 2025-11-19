/**
 * Public Directory Routes
 * Routes accessible without authentication
 * Returns soft profile data only
 * NO duplication with visitor/owner routes
 */

const express = require('express');
const router = express.Router();
const publicDirectoryController = require('../../controllers/directory/publicDirectory.controller');

// @route   GET /api/public/directory/search
// @desc    Search businesses (soft profiles only)
// @access  Public
router.get('/search', publicDirectoryController.searchBusinesses);

// @route   GET /api/public/directory/cities
// @desc    Get all cities (debugging helper)
// @access  Public
router.get('/cities', publicDirectoryController.getCities);

// @route   GET /api/public/directory/business/:id/soft
// @desc    Get single business soft profile
// @access  Public
router.get('/business/:id/soft', publicDirectoryController.getSoftProfile);

module.exports = router;
