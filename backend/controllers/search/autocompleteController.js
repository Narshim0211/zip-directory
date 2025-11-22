/**
 * Autocomplete Controller (v1.0)
 *
 * Provides instant search suggestions as user types
 * - Fuzzy matching on business names and service keywords
 * - Grouped by type (businesses, services, cities)
 * - 2-character minimum
 * - 10-result limit for speed
 *
 * Works with Atlas Search "autocomplete" index when available
 * Falls back to regex search in development
 */

const Business = require('../../models/Business');
const { catchAsync } = require('../../core/errors/globalErrorHandler');

/**
 * @route   GET /api/suggest
 * @desc    Autocomplete suggestions for search
 * @access  Public
 * @query   {string} q - Search query (minimum 2 characters)
 */
exports.suggest = catchAsync(async (req, res, next) => {
  const { q = '' } = req.query;
  const searchQuery = String(q).trim();

  // Minimum 2 characters required
  if (searchQuery.length < 2) {
    return res.status(200).json({
      success: true,
      suggestions: []
    });
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('[AUTOCOMPLETE] Query:', searchQuery);
  }

  let suggestions = [];

  try {
    // Try Atlas Search autocomplete index first
    suggestions = await Business.aggregate([
      {
        $search: {
          index: 'autocomplete',
          autocomplete: {
            query: searchQuery,
            path: ['name', 'serviceKeywords'],
            fuzzy: { maxEdits: 1 }
          }
        }
      },
      { $match: { status: 'approved' } }, // Only approved businesses
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          name: 1,
          city: 1,
          category: 1,
          serviceKeywords: 1
        }
      }
    ]);
  } catch (err) {
    // Fallback to regex search if Atlas Search not available
    const regex = new RegExp(searchQuery, 'i');

    suggestions = await Business.find({
      status: 'approved',
      $or: [
        { name: regex },
        { serviceKeywords: regex },
        { city: regex }
      ]
    })
      .select('name city category serviceKeywords')
      .limit(10)
      .lean();
  }

  // Group suggestions by type
  const businessNames = [];
  const services = new Set();
  const cities = new Set();

  suggestions.forEach(item => {
    // Add business name
    if (item.name) {
      businessNames.push({
        type: 'business',
        value: item.name,
        city: item.city,
        category: item.category
      });
    }

    // Add matching services
    if (item.serviceKeywords && Array.isArray(item.serviceKeywords)) {
      const searchLower = searchQuery.toLowerCase();
      item.serviceKeywords.forEach(keyword => {
        if (keyword.toLowerCase().includes(searchLower)) {
          services.add(keyword);
        }
      });
    }

    // Add city
    if (item.city) {
      cities.add(item.city);
    }
  });

  // Format response
  const grouped = {
    businesses: businessNames.slice(0, 5),
    services: Array.from(services).slice(0, 5).map(s => ({
      type: 'service',
      value: s
    })),
    cities: Array.from(cities).slice(0, 3).map(c => ({
      type: 'city',
      value: c
    }))
  };

  // Flatten for simple autocomplete (can also return grouped)
  const flatSuggestions = [
    ...grouped.services,
    ...grouped.businesses,
    ...grouped.cities
  ];

  res.status(200).json({
    success: true,
    suggestions: flatSuggestions,
    grouped // Include grouped version for advanced UI
  });
});
