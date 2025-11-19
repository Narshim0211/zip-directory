const express = require('express');
const router = express.Router();
const { protect } = require('../../middleWare/authMiddleware');
const { restrictTo } = require('../../middleWare/roleMiddleware');
const {
  getAllFeedback,
  updateFeedbackStatus
} = require('../../controllers/feedbackController');
const { validateAdminUpdate } = require('../../validators/feedbackValidator');

/**
 * @route   GET /api/admin/feedback
 * @desc    Get all feedback with filters
 * @access  Private (Admin only)
 * @query   userType, status, page, limit, search
 */
router.get(
  '/',
  protect,
  restrictTo('admin'),
  getAllFeedback
);

/**
 * @route   PATCH /api/admin/feedback/:id
 * @desc    Update feedback status and internal notes
 * @access  Private (Admin only)
 */
router.patch(
  '/:id',
  protect,
  restrictTo('admin'),
  validateAdminUpdate,
  updateFeedbackStatus
);

module.exports = router;
