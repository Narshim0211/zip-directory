const express = require('express');
const router = express.Router();
const { protect } = require('../../middleWare/authMiddleware');
const { restrictTo } = require('../../middleWare/roleMiddleware');
const { submitVisitorFeedback } = require('../../controllers/feedbackController');
const { validateFeedback } = require('../../validators/feedbackValidator');

/**
 * @route   POST /api/visitor/feedback
 * @desc    Submit visitor feedback
 * @access  Private (Visitor only)
 */
router.post(
  '/',
  protect,
  restrictTo('visitor'),
  validateFeedback,
  submitVisitorFeedback
);

module.exports = router;
