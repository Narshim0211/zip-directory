/**
 * Smart Query Parser Controller
 *
 * Parses natural language search queries into structured data
 * Examples:
 *   "braids in Dallas" → { service: "braids", city: "Dallas" }
 *   "Dallas 75001" → { city: "Dallas", zip: "75001" }
 *   "75001 braids" → { zip: "75001", service: "braids" }
 *   "123 Main St, Dallas, TX" → { address: "123 Main St", city: "Dallas", state: "TX" }
 */

const { catchAsync } = require('../../core/errors/globalErrorHandler');

/**
 * Parse a search query into structured components
 * @route POST /api/search/parse
 * @access Public
 */
exports.parseQuery = catchAsync(async (req, res) => {
  const { query } = req.body;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Query string is required'
    });
  }

  const trimmedQuery = query.trim();
  const parsed = {
    original: trimmedQuery,
    service: null,
    city: null,
    state: null,
    zip: null,
    address: null
  };

  let remainingText = trimmedQuery;

  // STEP 1: Extract ZIP code (5 digits)
  const zipMatch = remainingText.match(/\b(\d{5})\b/);
  if (zipMatch) {
    parsed.zip = zipMatch[1];
    remainingText = remainingText.replace(zipMatch[0], '').trim();
  }

  // STEP 2: Extract state abbreviation (2 uppercase letters)
  const stateMatch = remainingText.match(/\b([A-Z]{2})\b/);
  if (stateMatch) {
    parsed.state = stateMatch[1];
    remainingText = remainingText.replace(stateMatch[0], '').trim();
  }

  // STEP 3: Extract city name (capitalized words, common city patterns)
  // Match patterns like "Dallas", "Fort Worth", "New York", "San Antonio"
  const cityPatterns = [
    /\b(Dallas|Fort Worth|Arlington|Plano|Irving|Garland|Grand Prairie|McKinney|Frisco|Denton|Carrollton|Richardson|Lewisville|Flower Mound|Mansfield|Euless|DeSoto|Grapevine|Cedar Hill|Haltom City|Keller|Coppell|Duncanville|Burleson|Hurst|The Colony|Farmers Branch|Watauga|Wylie|Sachse|Murphy|Addison|Highland Village|University Park|Southlake|Colleyville|Bedford|North Richland Hills|Rowlett|Mesquite|Allen)\b/i,
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/
  ];

  for (const pattern of cityPatterns) {
    const cityMatch = remainingText.match(pattern);
    if (cityMatch && cityMatch[1]) {
      // Verify it's likely a city (not a common word)
      const potentialCity = cityMatch[1];
      const commonWords = ['in', 'near', 'at', 'for', 'with', 'and', 'or', 'the'];
      if (!commonWords.includes(potentialCity.toLowerCase())) {
        parsed.city = potentialCity;
        remainingText = remainingText.replace(cityMatch[0], '').trim();
        break;
      }
    }
  }

  // STEP 4: Extract address (if contains street indicators)
  const addressIndicators = /\b(\d+)\s+([A-Za-z]+\s+)+(St|Street|Ave|Avenue|Rd|Road|Blvd|Boulevard|Dr|Drive|Ln|Lane|Way|Ct|Court|Pl|Place)\b/i;
  const addressMatch = trimmedQuery.match(addressIndicators);
  if (addressMatch) {
    parsed.address = addressMatch[0];
    remainingText = remainingText.replace(addressMatch[0], '').trim();
  }

  // STEP 5: Clean up remaining text (remove common prepositions)
  remainingText = remainingText
    .replace(/\b(in|near|at|for|around|close to|nearby)\b/gi, '')
    .replace(/[,;]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // STEP 6: Everything else is the service/keyword
  if (remainingText.length > 0) {
    parsed.service = remainingText.toLowerCase();
  }

  // STEP 7: Smart defaults for DFW
  if (!parsed.city && !parsed.zip && !parsed.address) {
    // No location specified - will use DFW fallback in search API
    parsed.useDfwFallback = true;
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('[PARSE] Original:', trimmedQuery);
    console.log('[PARSE] Parsed:', parsed);
  }

  res.status(200).json({
    success: true,
    parsed
  });
});

/**
 * Smart geocoding helper
 * Converts city/zip/address to lat/lng coordinates
 * @route POST /api/search/geocode
 * @access Public
 */
exports.geocode = catchAsync(async (req, res) => {
  const { city, state, zip, address } = req.body;

  // Simple ZIP code to coordinates lookup (Texas major cities)
  const zipToCoords = {
    // Dallas area
    '75001': { lat: 32.7767, lng: -96.7970, city: 'Dallas' },
    '75201': { lat: 32.7831, lng: -96.8067, city: 'Dallas' },
    '75202': { lat: 32.7767, lng: -96.7970, city: 'Dallas' },
    '75203': { lat: 32.7767, lng: -96.7970, city: 'Dallas' },

    // Fort Worth area
    '76102': { lat: 32.7555, lng: -97.3308, city: 'Fort Worth' },
    '76103': { lat: 32.7555, lng: -97.3308, city: 'Fort Worth' },
    '76104': { lat: 32.7555, lng: -97.3308, city: 'Fort Worth' },

    // Plano area
    '75023': { lat: 33.0198, lng: -96.6989, city: 'Plano' },
    '75024': { lat: 33.0198, lng: -96.6989, city: 'Plano' },
    '75025': { lat: 33.0198, lng: -96.6989, city: 'Plano' },
  };

  // City name to coordinates lookup
  const cityToCoords = {
    'dallas': { lat: 32.7767, lng: -96.7970 },
    'fort worth': { lat: 32.7555, lng: -97.3308 },
    'arlington': { lat: 32.7357, lng: -97.1081 },
    'plano': { lat: 33.0198, lng: -96.6989 },
    'irving': { lat: 32.8140, lng: -96.9489 },
    'garland': { lat: 32.9126, lng: -96.6389 },
    'frisco': { lat: 33.1507, lng: -96.8236 },
    'mckinney': { lat: 33.1972, lng: -96.6397 },
    'denton': { lat: 33.2148, lng: -97.1331 },
  };

  let result = null;

  // Try ZIP lookup first
  if (zip && zipToCoords[zip]) {
    result = zipToCoords[zip];
  }
  // Then try city lookup
  else if (city) {
    const cityLower = city.toLowerCase();
    if (cityToCoords[cityLower]) {
      result = { ...cityToCoords[cityLower], city };
    }
  }

  // If no match, return DFW default
  if (!result) {
    result = {
      lat: 32.7767,
      lng: -96.7970,
      city: 'Dallas',
      note: 'Using DFW default coordinates'
    };
  }

  res.status(200).json({
    success: true,
    coordinates: result
  });
});
