const express = require('express');
const router = express.Router();
const { createReview, getBusinessReviews } = require('../controllers/reviewController');
const { protect } = require('../middleWare/authMiddleware');

/**
 * 🌟 REVIEWS API ROUTES
 *
 * Public routes - no authentication required:
 * - GET /api/reviews/business/:id - Get all reviews for a business
 *
 * Protected routes - authentication required:
 * - POST /api/reviews - Submit a new review
 */

// ===========================
// PUBLIC ROUTES
// ===========================

/**
 * @route   GET /api/reviews/business/:id
 * @desc    Get all approved reviews for a business with pagination and sorting
 * @access  Public
 * @query   ?sort=recent|highest|lowest&page=0&limit=10
 */
router.get('/business/:id', getBusinessReviews);

// ===========================
// PROTECTED ROUTES
// ===========================

/**
 * @route   POST /api/reviews
 * @desc    Submit a review for a completed booking
 * @access  Private (requires authentication via JWT)
 * @body    { businessId, bookingId, rating, message, photoUrl }
 */
router.post('/', protect, createReview);

module.exports = router;
