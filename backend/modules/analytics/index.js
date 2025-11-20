const express = require('express');
const router = express.Router();

/**
 * Main Analytics Router
 * Aggregates all analytics sub-routes
 * Clean namespace: /api/v1/analytics
 * NO conflicts, NO duplication
 */

// Import sub-routers
const profileRoutes = require('./profile/profileInsight.routes');
const surveyRoutes = require('./survey/surveyEngagement.routes');
const postRoutes = require('./post/postEngagement.routes');
const reactionRoutes = require('./reactions/reaction.routes');
const impressionRoutes = require('./impressions/impression.routes');

// Mount sub-routers
router.use('/profile', profileRoutes);   // /api/v1/analytics/profile/*
router.use('/survey', surveyRoutes);     // /api/v1/analytics/survey/*
router.use('/post', postRoutes);         // /api/v1/analytics/post/*
router.use('/reactions', reactionRoutes); // /api/v1/analytics/reactions/*
router.use('/impressions', impressionRoutes); // /api/v1/analytics/impressions/*

// Health check for analytics module
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Analytics module is operational',
    endpoints: {
      profile: '/api/v1/analytics/profile',
      survey: '/api/v1/analytics/survey',
      post: '/api/v1/analytics/post',
      reactions: '/api/v1/analytics/reactions',
      impressions: '/api/v1/analytics/impressions'
    }
  });
});

module.exports = router;
