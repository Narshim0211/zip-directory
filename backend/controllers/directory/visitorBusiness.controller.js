/**
 * Visitor Business Controller
 * Handles authenticated visitor access to full business profiles
 * Returns complete business data (excluding owner-only fields)
 * NO duplication with public/owner controllers
 * 
 * 🌍 UNIVERSAL BEHAVIOR:
 * ALL businesses in the directory require authentication for full profile access.
 * No per-business custom logic or conditional rendering based on business type.
 * Every business follows the same access rules:
 * - Public soft profile: Limited data, no auth required
 * - Full profile: Complete data, authentication required
 * 
 * This applies universally to:
 * - Salons
 * - Spas
 * - Barbershops
 * - Freelance Stylists
 * - Any future business categories
 */

const Business = require('../../models/Business');
const { catchAsync } = require('../../core/errors/globalErrorHandler');
const AppError = require('../../core/errors/globalErrorHandler').AppError;

/**
 * @route   GET /api/visitor/business/:id/full
 * @desc    Get full business profile for authenticated visitors
 * @access  Private (Visitor only)
 */
exports.getFullProfile = catchAsync(async (req, res, next) => {
  const business = await Business.findById(req.params.id)
    .select('-__v') // Exclude version key
    .populate('owner', 'name email') // Include owner basic info
    .lean();

  if (!business) {
    return next(new AppError('Business not found', 404));
  }

  // Show pending and approved businesses, hide rejected ones
  if (business.status === 'rejected') {
    return next(new AppError('Business not available', 404));
  }

  // Transform to full profile format (safe for visitors)
  const fullProfile = {
    id: business._id,
    name: business.name,
    city: business.city,
    state: business.state,
    zip: business.zip,
    address: business.address,
    category: business.category,
    businessType: business.businessType,
    description: business.description,
    images: business.images || [],
    logoUrl: business.logoUrl,
    coverPhotoUrl: business.coverPhotoUrl,
    services: business.services || [],
    specialties: business.specialties || [],
    location: business.location,
    
    // Contact information
    phone: business.phone || '',
    email: business.email || '',
    website: business.website || '',
    socialLinks: business.socialLinks || {},
    
    // Business hours
    hours: business.hours || {},
    
    // Ratings
    ratingAverage: business.ratingAverage || 0,
    ratingsCount: business.ratingsCount || 0,
    
    // Booking info
    bookingSlug: business.bookingSlug,
    bookingEnabled: business.bookingEnabled || false,
    
    // Owner info (limited)
    owner: business.owner ? {
      name: business.owner.name,
      email: business.owner.email,
    } : null,
    
    createdAt: business.createdAt,
    updatedAt: business.updatedAt,
  };

  res.status(200).json({
    success: true,
    data: fullProfile,
  });
});

/**
 * @route   GET /api/visitor/business/nearby
 * @desc    Get nearby businesses for authenticated visitors (with full details)
 * @access  Private (Visitor only)
 */
exports.getNearbyBusinesses = catchAsync(async (req, res, next) => {
  const { lat, lng, radius = 25, category } = req.query;

  if (!lat || !lng) {
    return next(new AppError('Latitude and longitude are required', 400));
  }

  const query = {
    status: 'approved',
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)],
        },
        $maxDistance: parseFloat(radius) * 1609.34, // Convert miles to meters
      },
    },
  };

  if (category && category !== 'All') {
    query.category = category;
  }

  const businesses = await Business.find(query)
    .limit(20)
    .select('-__v')
    .lean();

  res.status(200).json({
    success: true,
    count: businesses.length,
    data: businesses,
  });
});
