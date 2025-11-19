const express = require('express');
const router = express.Router();
const { create, vote } = require('../../../controllers/v1/visitor/surveyController');
const { protect } = require('../../../middleWare/authMiddleware');

// POST /api/v1/visitor/surveys - Create survey
router.post('/', protect, create);

// POST /api/v1/visitor/surveys/:id/vote - Vote on survey
router.post('/:id/vote', protect, vote);

module.exports = router;
