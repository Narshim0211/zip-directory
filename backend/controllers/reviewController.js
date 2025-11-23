const Review = require('../models/Review');
const Business = require('../models/Business');
const { AppError } = require('../utils/errorHandler');
const axios = require('axios');
const logger = require('../utils/logger');
const mongoose = require('mongoose');

const BOOKING_SERVICE_URL = process.env.BOOKING_SERVICE_URL || 'http://localhost:6002';

/**
 * @route   POST /api/reviews
 * @desc    Submit a review for a completed booking
 * @access  Private (requires authentication)
 */
exports.createReview = async (req, res, next) => {
  try {
    // Get authenticated user
    const userId = req.user?._id;
    if (!userId) {
      throw new AppError('UNAUTHORIZED', 'Authentication required', 401);
    }

    const { businessId, bookingId, rating, message, photoUrl } = req.body;

    // ===========================
    // 1. VALIDATE INPUTS
    // ===========================

    if (!businessId || !bookingId) {
      throw new AppError('VALIDATION_ERROR', 'businessId and bookingId are required', 400);
    }

    if (!rating || rating < 1 || rating > 5) {
      throw new AppError('VALIDATION_ERROR', 'Rating must be between 1 and 5', 400);
    }

    if (!message || message.trim().length < 10) {
      throw new AppError('VALIDATION_ERROR', 'Review message must be at least 10 characters', 400);
    }

    if (message.trim().length > 500) {
      throw new AppError('VALIDATION_ERROR', 'Review message cannot exceed 500 characters', 400);
    }

    // ===========================
    // 2. VERIFY BUSINESS EXISTS
    // ===========================

    const business = await Business.findById(businessId);
    if (!business) {
      throw new AppError('BUSINESS_NOT_FOUND', 'Business not found', 404);
    }

    // ===========================
    // 3. VERIFY BOOKING VIA BOOKING MICROSERVICE
    // ===========================

    let booking;
    try {
      const bookingResponse = await axios.get(
        `${BOOKING_SERVICE_URL}/api/bookings/${bookingId}`,
        {
          headers: {
            'x-internal-key': process.env.INTERNAL_API_KEY || '',
          },
          timeout: 5000,
        }
      );

      booking = bookingResponse.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new AppError('BOOKING_NOT_FOUND', 'Booking not found', 404);
      }
      logger.error(`Booking service error: ${error.message}`);
      throw new AppError('BOOKING_SERVICE_ERROR', 'Unable to verify booking at this time', 503);
    }

    // ===========================
    // 4. VERIFY BOOKING OWNERSHIP
    // ===========================

    const bookingUserId = booking.userId || booking.customer?.userId;
    if (String(bookingUserId) !== String(userId)) {
      throw new AppError('FORBIDDEN', 'You can only review your own bookings', 403);
    }

    // ===========================
    // 5. VERIFY BOOKING IS FOR THIS BUSINESS
    // ===========================

    const bookingBusinessId = booking.businessId || booking.business;
    if (String(bookingBusinessId) !== String(businessId)) {
      throw new AppError('BUSINESS_MISMATCH', 'Booking does not match business', 400);
    }

    // ===========================
    // 6. VERIFY BOOKING IS COMPLETED
    // ===========================

    if (booking.status !== 'completed' && booking.status !== 'COMPLETED') {
      throw new AppError(
        'BOOKING_NOT_COMPLETED',
        'Reviews are only allowed for completed bookings',
        400
      );
    }

    // ===========================
    // 7. CREATE REVIEW (Auto-approved, no moderation)
    // ===========================

    const review = await Review.create({
      businessId,
      userId,
      bookingId,
      rating,
      message: message.trim(),
      photoUrl: photoUrl || null,
      status: 'APPROVED', // Auto-approve all reviews (no moderation)
    });

    logger.info(`Review created successfully: ${review._id} for business ${businessId}`);

    // ===========================
    // 8. UPDATE BUSINESS STATS
    // ===========================

    // If review has a photo, increment photoReviewCount (FIX #2)
    if (photoUrl) {
      await Business.findByIdAndUpdate(businessId, {
        $inc: { photoReviewCount: 1 },
      });
      logger.info(`Incremented photoReviewCount for business ${businessId}`);
    }

    // Recalculate average rating and ratings count
    await updateBusinessRatings(businessId);

    // ===========================
    // 9. RETURN SUCCESS RESPONSE
    // ===========================

    res.status(201).json({
      success: true,
      reviewId: review._id,
      status: review.status,
      message: 'Review submitted successfully!',
    });

  } catch (error) {
    // Handle duplicate review error (unique constraint on bookingId)
    if (error.code === 11000 && error.keyPattern?.bookingId) {
      return next(new AppError(
        'DUPLICATE_REVIEW',
        'You have already reviewed this booking',
        409
      ));
    }

    next(error);
  }
};

/**
 * @route   GET /api/reviews/business/:id
 * @desc    Get all approved reviews for a business with stats
 * @access  Public
 * @query   ?sort=recent|highest|lowest&page=0&limit=10
 */
exports.getBusinessReviews = async (req, res, next) => {
  try {
    const { id: businessId } = req.params;
    const { sort = 'recent', page = 0, limit = 10 } = req.query;

    // Validate businessId
    if (!businessId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('VALIDATION_ERROR', 'Invalid business ID', 400);
    }

    // Validate pagination
    const pageNum = Math.max(0, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

    // Determine sort order
    const sortMap = {
      recent: { createdAt: -1 },
      highest: { rating: -1, createdAt: -1 },
      lowest: { rating: 1, createdAt: -1 },
    };
    const sortOrder = sortMap[sort] || sortMap.recent;

    // ===========================
    // 1. FETCH REVIEWS (Paginated)
    // ===========================

    const reviews = await Review.find({
      businessId,
      status: 'APPROVED', // Only show approved reviews publicly
    })
      .sort(sortOrder)
      .skip(pageNum * limitNum)
      .limit(limitNum)
      .populate('userId', 'name firstName lastName avatarUrl') // Populate user info
      .lean();

    // ===========================
    // 2. CALCULATE STATS (Aggregation)
    // ===========================

    const stats = await Review.aggregate([
      {
        $match: {
          businessId: new mongoose.Types.ObjectId(businessId),
          status: 'APPROVED',
        },
      },
      {
        $group: {
          _id: '$businessId',
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          photoReviewCount: {
            $sum: {
              $cond: [{ $ne: ['$photoUrl', null] }, 1, 0],
            },
          },
          // Rating distribution
          rating5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
          rating4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          rating3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          rating2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          rating1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
        },
      },
    ]);

    const stat = stats[0] || {
      avgRating: 0,
      totalReviews: 0,
      photoReviewCount: 0,
      rating5: 0,
      rating4: 0,
      rating3: 0,
      rating2: 0,
      rating1: 0,
    };

    // ===========================
    // 3. FORMAT REVIEWS FOR RESPONSE
    // ===========================

    const formattedReviews = reviews.map(review => ({
      _id: review._id,
      rating: review.rating,
      message: review.message,
      photoUrl: review.photoUrl,
      createdAt: review.createdAt,
      userId: {
        name: review.userId?.name || review.userId?.firstName + ' ' + review.userId?.lastName || 'Anonymous',
        avatarUrl: review.userId?.avatarUrl || null,
      },
    }));

    // ===========================
    // 4. RETURN RESPONSE
    // ===========================

    res.json({
      success: true,
      reviews: formattedReviews,
      avgRating: Number(stat.avgRating || 0).toFixed(1),
      totalReviews: stat.totalReviews || 0,
      photoReviewCount: stat.photoReviewCount || 0,
      distribution: {
        5: stat.rating5 || 0,
        4: stat.rating4 || 0,
        3: stat.rating3 || 0,
        2: stat.rating2 || 0,
        1: stat.rating1 || 0,
      },
      pagination: {
        page: pageNum,
        limit: limitNum,
        hasMore: reviews.length === limitNum,
      },
    });

  } catch (error) {
    next(error);
  }
};

/**
 * 📊 HELPER: Update Business Rating Stats
 *
 * Recalculates average rating and total reviews count for a business.
 * Called after a new review is created.
 *
 * @param {string} businessId - The business ID
 */
async function updateBusinessRatings(businessId) {
  try {
    const stats = await Review.aggregate([
      {
        $match: {
          businessId: new mongoose.Types.ObjectId(businessId),
          status: 'APPROVED',
        },
      },
      {
        $group: {
          _id: '$businessId',
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    const stat = stats[0];
    if (stat) {
      await Business.findByIdAndUpdate(businessId, {
        ratingAverage: Number(stat.avgRating).toFixed(1),
        ratingsCount: stat.totalReviews,
      });

      logger.info(`Updated business ${businessId} ratings: avg=${stat.avgRating.toFixed(1)}, count=${stat.totalReviews}`);
    }
  } catch (error) {
    logger.error(`Failed to update business ratings: ${error.message}`);
  }
}
