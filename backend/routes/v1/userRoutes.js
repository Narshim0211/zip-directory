const express = require('express');
const router = express.Router();
const { getUserStats } = require('../../controllers/v1/userStatsController');

// GET /api/v1/users/:userId/stats - Get user statistics
router.get('/:userId/stats', getUserStats);

module.exports = router;
