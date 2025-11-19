const express = require('express');
const router = express.Router();
const { protect } = require('../../middleWare/authMiddleware');
const { restrictTo } = require('../../middleWare/roleMiddleware');
const { submitOwnerFeedback } = require('../../controllers/feedbackController');
const { validateOwnerFeedback } = require('../../validators/feedbackValidator');

/**
 * @route   POST /api/owner/feedback
 * @desc    Submit owner feedback
 * @access  Private (Owner only)
 */
router.post(
  '/',
  protect,
  restrictTo('owner'),
  validateOwnerFeedback,
  submitOwnerFeedback
);

module.exports = router;
