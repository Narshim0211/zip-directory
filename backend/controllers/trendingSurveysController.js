const trendingSurveysService = require('../services/trendingSurveysService');
const logger = require('../utils/logger');

/**
 * Trending Surveys Controller
 * Handles HTTP requests for trending survey data
 */

/**
 * @route   GET /api/surveys/trending/survey-of-the-day
 * @desc    Get the survey with highest love velocity in last 24h
 * @access  Public
 */
exports.getSurveyOfTheDay = async (req, res) => {
  try {
    const survey = await trendingSurveysService.getSurveyOfTheDay();

    if (!survey) {
      return res.json({
        success: true,
        data: null,
        message: 'No survey of the day available yet'
      });
    }

    res.json({
      success: true,
      data: survey
    });
  } catch (error) {
    logger.error('Survey of the Day error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch survey of the day',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @route   GET /api/surveys/trending/today
 * @desc    Get top trending surveys from last 24 hours
 * @access  Public
 * @query   limit - Number of surveys to return (default: 5, max: 20)
 */
exports.getTrendingToday = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 5, 20);
    const surveys = await trendingSurveysService.getTrendingToday(limit);

    res.json({
      success: true,
      data: surveys,
      count: surveys.length
    });
  } catch (error) {
    logger.error('Trending Today error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trending surveys',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @route   GET /api/surveys/trending/week
 * @desc    Get top trending surveys from last 7 days
 * @access  Public
 * @query   limit - Number of surveys to return (default: 5, max: 20)
 */
exports.getTrendingThisWeek = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 5, 20);
    const surveys = await trendingSurveysService.getTrendingThisWeek(limit);

    res.json({
      success: true,
      data: surveys,
      count: surveys.length
    });
  } catch (error) {
    logger.error('Trending Week error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trending surveys',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @route   POST /api/surveys/trending/cache/clear
 * @desc    Clear trending surveys cache (admin only)
 * @access  Private/Admin
 */
exports.clearCache = async (req, res) => {
  try {
    const result = trendingSurveysService.clearCache();
    logger.info('Trending surveys cache cleared');

    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    logger.error('Clear cache error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cache',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @route   GET /api/surveys/trending/cache/stats
 * @desc    Get cache statistics (admin/monitoring)
 * @access  Private/Admin
 */
exports.getCacheStats = async (req, res) => {
  try {
    const stats = trendingSurveysService.getCacheStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Get cache stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cache stats',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
