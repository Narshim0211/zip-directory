const express = require('express');
const router = express.Router();
const { create } = require('../../../controllers/v1/owner/surveyController');
const { protect } = require('../../../middleWare/authMiddleware');

// POST /api/v1/owner/surveys
router.post('/', protect, create);

module.exports = router;
