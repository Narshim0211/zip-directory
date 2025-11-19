const express = require('express');
const router = express.Router();
const profileController = require('./profileInsight.controller');

/**
 * Profile Analytics Routes
 * Clear, predictable, no conflicts
 * Base: /api/v1/analytics/profile
 */

// Record a profile view (public - anyone can trigger)
router.post('/view/:ownerId', profileController.recordProfileView);

// Get profile insights (public - anyone can see)
router.get('/:ownerId', profileController.getProfileInsights);

module.exports = router;
