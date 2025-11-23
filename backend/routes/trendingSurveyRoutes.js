const express = require('express');
const router = express.Router();
const trendingSurveysController = require('../controllers/trendingSurveysController');
const { protect } = require('../middleWare/authMiddleware');

/**
 * Trending Surveys Routes
 * Public endpoints for Owner Home Page trending panels
 */

// Public endpoints - No authentication required
router.get('/survey-of-the-day', trendingSurveysController.getSurveyOfTheDay);
router.get('/today', trendingSurveysController.getTrendingToday);
router.get('/week', trendingSurveysController.getTrendingThisWeek);

// Admin endpoints - Require authentication
router.post('/cache/clear', protect, trendingSurveysController.clearCache);
router.get('/cache/stats', protect, trendingSurveysController.getCacheStats);

module.exports = router;
