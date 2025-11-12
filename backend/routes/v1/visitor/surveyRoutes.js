const express = require('express');
const router = express.Router();
const { vote } = require('../../../controllers/v1/visitor/surveyController');
const { protect } = require('../../../middleWare/authMiddleware');

// POST /api/v1/visitor/surveys/:id/vote
router.post('/:id/vote', protect, vote);

module.exports = router;
