const express = require('express');
const router = express.Router();
const surveyController = require('./surveyEngagement.controller');

/**
 * Survey Engagement Routes
 * Clear, predictable, no conflicts
 * Base: /api/v1/analytics/survey
 */

// Record a survey view (public - anyone can trigger)
router.post('/view/:surveyId', surveyController.recordView);

// Record a survey response (authenticated users only)
router.post('/respond/:surveyId', surveyController.recordResponse);

// Add/update a reaction (authenticated users only)
router.post('/react/:surveyId', surveyController.addReaction);

// Get survey engagement metrics (public - anyone can see)
router.get('/:surveyId', surveyController.getEngagement);

module.exports = router;
