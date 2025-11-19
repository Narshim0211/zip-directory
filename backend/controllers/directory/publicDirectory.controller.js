/**
 * Public Directory Controller
 * Handles public (unauthenticated) directory search and soft profile viewing
 * Returns ONLY non-sensitive business data
 * NO duplication with visitor/owner controllers
 * 
 * 🌍 UNIVERSAL BEHAVIOR:
 * The soft-profile browsing and login-gated full-profile access apply
 * universally to ALL business profiles in the directory. Every business
 * uses the same public soft-profile endpoint and the same authenticated
 * full-profile endpoint, unless explicitly flagged with custom access
 * rules in future versions.
 * 
 * This ensures:
 * - Consistent user experience across all businesses
 * - Predictable security model (no per-business exceptions)
 * - Clear separation of public vs authenticated data
 * - No routing conflicts or data leakage
 */

const Business = require('../../models/Business');
const { calculateDistance, getCoordinatesFromZip } = require('../../utils/calculateDistance');
const { catchAsync } = require('../../core/errors/globalErrorHandler');
const AppError = require('../../core/errors/globalErrorHandler').AppError;

/**
 * @route   GET /api/public/directory/search
 * @desc    Search businesses with soft profile data (public, no auth required)
 * @access  Public
 * @query   city (required), zip (optional), category (optional)
 */
exports.searchBusinesses = catchAsync(async (req, res, next) => {
  const { city, zip, category } = req.query;

  console.log('🔍 [PUBLIC SEARCH] Request received:', { city, zip, category });

  // Validate required parameters
  if (!city) {
    return next(new AppError('City is required for search', 400));
  }

  // First, let's check if ANY businesses exist
  const totalCount = await Business.countDocuments();
  console.log('📊 [PUBLIC SEARCH] Total businesses in database:', totalCount);

  // Build query
  const query = {
    city: new RegExp(city, 'i'), // Case-insensitive city search
  };

  // Show approved and pending businesses (for now - can be restricted later)
  // Only hide rejected businesses
  query.status = { $ne: 'rejected' };

  if (category && category !== 'All' && category !== 'All Categories') {
    query.category = category;
  }

  console.log('🔎 [PUBLIC SEARCH] MongoDB query:', JSON.stringify(query));

  // Execute query with only public-safe fields
  const businesses = await Business.find(query)
    .select('name city zip category logoUrl coverPhotoUrl location status')
    .limit(50) // Limit results to prevent overload
    .lean();

  console.log(`✅ [PUBLIC SEARCH] Found ${businesses.length} businesses`);
  if (businesses.length > 0) {
    console.log('📍 [PUBLIC SEARCH] Sample result:', {
      name: businesses[0].name,
      city: businesses[0].city,
      status: businesses[0].status
    });
  }

  // Calculate distances if user provided ZIP
  let userCoords = null;
  if (zip) {
    userCoords = getCoordinatesFromZip(zip);
  }

  // Transform to soft profile format
  const softProfiles = businesses.map((business) => {
    const softProfile = {
      id: business._id,
      name: business.name,
      city: business.city,
      zip: business.zip,
      category: business.category,
      heroImage: business.coverPhotoUrl || business.logoUrl || '',
      location: business.location,
    };

    // Add distance if user ZIP provided and business has coordinates
    if (userCoords && business.location && business.location.coordinates) {
      const [lng, lat] = business.location.coordinates;
      softProfile.distance = calculateDistance(
        userCoords.lat,
        userCoords.lng,
        lat,
        lng,
        'mi'
      );
    }

    return softProfile;
  });

  // Sort by distance if available
  if (userCoords) {
    softProfiles.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
  }

  console.log('📤 [PUBLIC SEARCH] Returning', softProfiles.length, 'soft profiles');

  res.status(200).json({
    success: true,
    count: softProfiles.length,
    data: softProfiles,
  });
});

/**
 * @route   GET /api/public/directory/cities
 * @desc    Get list of all cities with businesses (debugging helper)
 * @access  Public
 */
exports.getCities = catchAsync(async (req, res, next) => {
  const cities = await Business.distinct('city');
  console.log('📍 [DEBUG] Cities in database:', cities);
  
  res.status(200).json({
    success: true,
    count: cities.length,
    data: cities
  });
});

/**
 * @route   GET /api/public/directory/business/:id/soft
 * @desc    Get soft profile for a single business (public, no auth required)
 * @access  Public
 */
exports.getSoftProfile = catchAsync(async (req, res, next) => {
  const business = await Business.findById(req.params.id)
    .select('name city zip category logoUrl coverPhotoUrl location description status')
    .lean();

  if (!business) {
    return next(new AppError('Business not found', 404));
  }

  // Show pending and approved businesses, hide rejected ones
  if (business.status === 'rejected') {
    return next(new AppError('Business not available', 404));
  }

  const softProfile = {
    id: business._id,
    name: business.name,
    city: business.city,
    zip: business.zip,
    category: business.category,
    heroImage: business.coverPhotoUrl || business.logoUrl || '',
    description: business.description || '',
    location: business.location,
  };

  res.status(200).json({
    success: true,
    data: softProfile,
  });
});
