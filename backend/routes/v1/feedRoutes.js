const express = require('express');
const router = express.Router();
const { getFeed } = require('../../controllers/v1/feedController');

// GET /api/v1/feed - Public feed
router.get('/', getFeed);

module.exports = router;
