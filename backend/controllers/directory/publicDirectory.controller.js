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
 * 🔥 WORLD-CLASS SEARCH (2025 Standard):
 * - Never shows "No results" (auto-expands radius)
 * - Sorts by rating DESC, then distance ASC
 * - Supports geolocation for personalized results
 * - Smart fallback messages for expanded searches
 */

const Business = require('../../models/Business');
const { calculateDistance, getCoordinatesFromZip } = require('../../utils/calculateDistance');
const { catchAsync } = require('../../core/errors/globalErrorHandler');
const AppError = require('../../core/errors/globalErrorHandler').AppError;

// Default center: DFW Metroplex (between Fort Worth and Dallas)
const DEFAULT_CENTER = { lat: 32.85, lng: -97.15 };

// Radius expansion tiers (in miles)
const RADIUS_TIERS = [15, 30, 50, 100, 250];

/**
 * @route   GET /api/public/directory/search
 * @desc    World-class search with smart sorting and auto-radius expansion
 * @access  Public
 * @query   q (search term), lat, lng, sort (rating|distance), category, radius
 */
exports.searchBusinesses = catchAsync(async (req, res, next) => {
  const {
    q,
    city,
    zip,
    category,
    lat,
    lng,
    sort = 'rating', // Default: highest rated first
    radius = 50 // Default radius in miles
  } = req.query;

  console.log('🔍 [SMART SEARCH] Request:', { q, lat, lng, sort, category, radius });

  // Step 1: Determine user location
  let userCoords = null;

  // Priority 1: Explicit lat/lng from browser geolocation
  if (lat && lng) {
    userCoords = { lat: parseFloat(lat), lng: parseFloat(lng) };
  }
  // Priority 2: ZIP code from search term
  else if (q && /^\d{5}$/.test(q.trim())) {
    userCoords = getCoordinatesFromZip(q.trim());
  }
  // Priority 3: Explicit zip parameter
  else if (zip) {
    userCoords = getCoordinatesFromZip(zip);
  }
  // Priority 4: Default to DFW center
  else {
    userCoords = DEFAULT_CENTER;
  }

  // Step 2: Build base query
  const query = {
    status: 'approved',
    // Only include businesses with valid coordinates
    'location.coordinates': { $exists: true, $ne: null }
  };

  // Search term filtering (name, city, category)
  const searchTerm = q?.trim();
  if (searchTerm && !/^\d{5}$/.test(searchTerm)) {
    // Not a ZIP code - search by name, city, or category
    const searchRegex = new RegExp(searchTerm, 'i');
    query.$or = [
      { name: searchRegex },
      { city: searchRegex },
      { category: searchRegex },
    ];
  }

  // Category filter
  if (category && category !== 'All' && category !== 'All Categories') {
    query.category = category;
  }

  console.log('🔎 [SMART SEARCH] Query:', JSON.stringify(query));

  // Step 3: Fetch ALL matching businesses (we'll filter by radius in memory)
  // Include googlePhotos for soft profile display (public teaser photos)
  const businesses = await Business.find(query)
    .select('name city state zip category logoUrl coverPhotoUrl googlePhotos hasGooglePhotos location status ratingAverage ratingsCount verificationStatus listingType')
    .limit(500) // Get more to ensure we have fallback results
    .lean();

  console.log(`📦 [SMART SEARCH] Found ${businesses.length} total businesses`);

  // Step 4: Calculate distance for each business and filter by radius
  let radiusUsed = parseFloat(radius);
  let expandedSearch = false;
  let softProfiles = [];

  // Try progressively larger radius until we get results
  for (const tierRadius of RADIUS_TIERS) {
    if (tierRadius < radiusUsed) continue;

    softProfiles = businesses
      .map((business) => {
        if (!business.location?.coordinates) return null;

        const [bizLng, bizLat] = business.location.coordinates;
        const distance = calculateDistance(
          userCoords.lat,
          userCoords.lng,
          bizLat,
          bizLng,
          'mi'
        );

        // Filter by current radius tier
        if (distance > tierRadius) return null;

        return {
          id: business._id,
          name: business.name,
          city: business.city,
          state: business.state,
          zip: business.zip,
          category: business.category,
          heroImage: business.coverPhotoUrl || business.logoUrl || '',
          // Include Google photos for soft profile gallery (public, entices sign-up)
          photos: business.googlePhotos || [],
          hasPhotos: (business.googlePhotos?.length > 0) || business.hasGooglePhotos,
          location: business.location,
          rating: business.ratingAverage || 0,
          reviewCount: business.ratingsCount || 0,
          distance: distance,
          verificationStatus: business.verificationStatus,
          listingType: business.listingType,
        };
      })
      .filter(Boolean);

    if (softProfiles.length > 0) {
      radiusUsed = tierRadius;
      expandedSearch = tierRadius > parseFloat(radius);
      break;
    }
  }

  // Step 5: Smart sorting based on user preference
  if (sort === 'distance') {
    // Sort by distance first, then rating
    softProfiles.sort((a, b) => {
      if (a.distance !== b.distance) return a.distance - b.distance;
      return (b.rating || 0) - (a.rating || 0);
    });
  } else {
    // Default: Sort by rating first, then distance
    softProfiles.sort((a, b) => {
      // Higher rating first
      if ((b.rating || 0) !== (a.rating || 0)) {
        return (b.rating || 0) - (a.rating || 0);
      }
      // Then closer distance
      return (a.distance || Infinity) - (b.distance || Infinity);
    });
  }

  // Step 6: Limit results
  const limitedResults = softProfiles.slice(0, 100);

  // Step 7: Build response with helpful metadata
  const nearestCity = limitedResults[0]?.city || 'your area';

  console.log(`✅ [SMART SEARCH] Returning ${limitedResults.length} results (radius: ${radiusUsed}mi, expanded: ${expandedSearch})`);

  res.status(200).json({
    success: true,
    count: limitedResults.length,
    data: limitedResults,
    meta: {
      userLocation: userCoords,
      radiusUsed: radiusUsed,
      expandedSearch: expandedSearch,
      sortedBy: sort,
      message: expandedSearch
        ? `Showing nearest results in ${nearestCity} (expanded to ${radiusUsed} mi)`
        : limitedResults.length > 0
          ? `Found ${limitedResults.length} businesses near you`
          : 'No businesses found in this area yet'
    }
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
    .select('name city state zip category logoUrl coverPhotoUrl googlePhotos hasGooglePhotos location description status ratingAverage ratingsCount verificationStatus listingType')
    .lean();

  if (!business) {
    return next(new AppError('Business not found', 404));
  }

  // Show pending and approved businesses, hide rejected ones
  if (business.status === 'rejected') {
    return next(new AppError('Business not available', 404));
  }

  // Build photos array from googlePhotos or heroImage
  const photos = business.googlePhotos?.length > 0
    ? business.googlePhotos
    : (business.coverPhotoUrl ? [business.coverPhotoUrl] : []);

  const softProfile = {
    id: business._id,
    name: business.name,
    city: business.city,
    state: business.state,
    zip: business.zip,
    category: business.category,
    heroImage: business.coverPhotoUrl || business.logoUrl || '',
    photos: photos,
    hasPhotos: photos.length > 0,
    description: business.description || '',
    location: business.location,
    rating: business.ratingAverage || 0,
    reviewCount: business.ratingsCount || 0,
    verificationStatus: business.verificationStatus,
    listingType: business.listingType,
  };

  res.status(200).json({
    success: true,
    data: softProfile,
  });
});
