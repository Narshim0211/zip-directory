const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleWare/asyncHandler');
const { getSurveyOfTheDay, refreshSurveyOfTheDay, getCacheStatus } = require('../services/surveyOfTheDayService');
const { protect } = require('../middleWare/authMiddleWare');

/**
 * @route   GET /api/survey-of-the-day
 * @desc    Get current Survey of the Day
 * @access  Public
 */
router.get('/', asyncHandler(async (req, res) => {
  const surveyOfTheDay = await getSurveyOfTheDay();

  if (!surveyOfTheDay) {
    return res.json({
      success: true,
      survey: null,
      message: 'No Survey of the Day available at this time',
    });
  }

  res.json({
    success: true,
    survey: surveyOfTheDay,
  });
}));

/**
 * @route   POST /api/survey-of-the-day/refresh
 * @desc    Manually refresh Survey of the Day (admin/testing)
 * @access  Private (authenticated users)
 */
router.post('/refresh', protect, asyncHandler(async (req, res) => {
  console.log('[SurveyOfTheDay API] Manual refresh requested by user:', req.user?._id);

  const newSurvey = await refreshSurveyOfTheDay();

  if (!newSurvey) {
    return res.json({
      success: true,
      survey: null,
      message: 'No eligible survey found for Survey of the Day',
    });
  }

  res.json({
    success: true,
    survey: newSurvey,
    message: 'Survey of the Day refreshed successfully',
  });
}));

/**
 * @route   GET /api/survey-of-the-day/status
 * @desc    Get cache status (debugging/monitoring)
 * @access  Public
 */
router.get('/status', asyncHandler(async (req, res) => {
  const status = getCacheStatus();

  res.json({
    success: true,
    status,
  });
}));

module.exports = router;
