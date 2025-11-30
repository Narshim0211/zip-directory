/**
 * Seed Three Cities Script
 *
 * Purpose: Ensure 100% coverage of salons/spas in NRH, Hurst, and Colleyville
 * with complete business details including phone numbers.
 *
 * This script:
 * 1. Searches for ALL salons/spas in each city using Text Search
 * 2. Fetches Place Details for each to get phone, website, hours
 * 3. Upserts to database (updates existing or inserts new)
 *
 * Usage: node scripts/seed-three-cities.js [--dry-run]
 *
 * Environment: Requires GOOGLE_PLACES_API_KEY in .env
 */

require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');

// Import Business model
const Business = require('../models/Business');

// Configuration
const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const TEXT_SEARCH_URL = 'https://maps.googleapis.com/maps/api/place/textsearch/json';
const PLACE_DETAILS_URL = 'https://maps.googleapis.com/maps/api/place/details/json';
const PHOTO_URL_BASE = 'https://maps.googleapis.com/maps/api/place/photo';

// Photo settings
const MAX_PHOTOS = 5;
const PHOTO_MAX_WIDTH = 1200;

// Rate limiting
const RATE_LIMIT_MS = 200; // 5 requests per second

// Dry run mode (set via --dry-run flag)
const DRY_RUN = process.argv.includes('--dry-run');

// Target cities with their center coordinates
const TARGET_CITIES = [
  {
    name: 'North Richland Hills',
    state: 'TX',
    lat: 32.8343,
    lng: -97.2289,
    zips: ['76180', '76182', '76118']
  },
  {
    name: 'Hurst',
    state: 'TX',
    lat: 32.8234,
    lng: -97.1706,
    zips: ['76053', '76054']
  },
  {
    name: 'Colleyville',
    state: 'TX',
    lat: 32.8809,
    lng: -97.1550,
    zips: ['76034']
  }
];

// Search queries for comprehensive coverage
const SEARCH_QUERIES = [
  'hair salon',
  'beauty salon',
  'spa',
  'nail salon',
  'barber shop',
  'hair stylist',
  'beauty parlor',
  'day spa',
  'wellness spa',
  'lash salon',
  'brow salon',
  'waxing salon',
  'tanning salon'
];

// Stats tracking
const stats = {
  searched: 0,
  newBusinesses: 0,
  updated: 0,
  skipped: 0,
  apiErrors: 0
};

// Track place IDs to avoid duplicates within this run
const processedPlaceIds = new Set();

/**
 * Sleep helper for rate limiting
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Convert Google photo references to permanent URLs
 * @param {Array} photos - Array of photo objects from Google Places API
 * @returns {Array} - Array of photo URLs
 */
function getPhotoUrls(photos) {
  if (!photos || !Array.isArray(photos)) return [];

  return photos.slice(0, MAX_PHOTOS).map(photo => {
    if (!photo.photo_reference) return null;
    return `${PHOTO_URL_BASE}?maxwidth=${PHOTO_MAX_WIDTH}&photoreference=${photo.photo_reference}&key=${GOOGLE_API_KEY}`;
  }).filter(Boolean);
}

/**
 * Determine category from Google place types
 */
function determineCategory(types) {
  if (!types) return 'Salon';

  if (types.includes('spa')) return 'Spa';
  if (types.includes('hair_care')) return 'Salon';
  if (types.includes('beauty_salon')) return 'Salon';
  if (types.includes('nail_salon')) return 'Nail Salon';

  return 'Salon';
}

/**
 * Format opening hours from Google's format
 */
function formatHours(openingHours) {
  if (!openingHours || !openingHours.periods) {
    return null;
  }

  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const hours = {};

  dayNames.forEach(day => {
    hours[day] = { open: '', close: '', isClosed: true };
  });

  openingHours.periods.forEach(period => {
    if (period.open && period.open.day !== undefined) {
      const dayName = dayNames[period.open.day];
      const openTime = period.open.time || '';
      const closeTime = period.close?.time || '';

      const formatTime = (t) => {
        if (!t || t.length !== 4) return t;
        return `${t.slice(0, 2)}:${t.slice(2)}`;
      };

      hours[dayName] = {
        open: formatTime(openTime),
        close: formatTime(closeTime),
        isClosed: false
      };
    }
  });

  return hours;
}

/**
 * Text Search for businesses in a city
 */
async function searchCity(city, query) {
  const results = [];
  let nextPageToken = null;

  do {
    try {
      const params = {
        query: `${query} in ${city.name}, ${city.state}`,
        key: GOOGLE_API_KEY,
        type: 'establishment'
      };

      if (nextPageToken) {
        params.pagetoken = nextPageToken;
        // Google requires 2 second wait between page token requests
        await sleep(2000);
      }

      const response = await axios.get(TEXT_SEARCH_URL, { params });

      if (response.data.status === 'OK') {
        results.push(...response.data.results);
        nextPageToken = response.data.next_page_token || null;
      } else if (response.data.status === 'ZERO_RESULTS') {
        break;
      } else {
        console.log(`  ⚠️  Search status: ${response.data.status}`);
        break;
      }

      await sleep(RATE_LIMIT_MS);
    } catch (error) {
      console.log(`  ❌ Search error: ${error.message}`);
      stats.apiErrors++;
      break;
    }
  } while (nextPageToken);

  return results;
}

/**
 * Fetch detailed place information
 */
async function fetchPlaceDetails(placeId) {
  try {
    const response = await axios.get(PLACE_DETAILS_URL, {
      params: {
        place_id: placeId,
        fields: [
          'place_id',
          'name',
          'formatted_address',
          'formatted_phone_number',
          'international_phone_number',
          'website',
          'opening_hours',
          'geometry',
          'types',
          'photos',
          'rating',
          'user_ratings_total',
          'url'
        ].join(','),
        key: GOOGLE_API_KEY
      }
    });

    if (response.data.status === 'OK') {
      return response.data.result;
    }
    return null;
  } catch (error) {
    stats.apiErrors++;
    return null;
  }
}

/**
 * Parse address components from formatted address
 */
function parseAddress(formattedAddress, cityName) {
  // Example: "123 Main St, North Richland Hills, TX 76180, USA"
  const parts = formattedAddress.split(',').map(p => p.trim());

  let address = parts[0] || '';
  let city = cityName;
  let state = 'TX';
  let zip = '';

  // Try to extract ZIP from state part
  if (parts.length >= 3) {
    const stateZipPart = parts[parts.length - 2];
    const match = stateZipPart.match(/([A-Z]{2})\s*(\d{5})/);
    if (match) {
      state = match[1];
      zip = match[2];
    }
  }

  return { address, city, state, zip };
}

/**
 * Process and upsert a business
 */
async function processPlace(place, cityInfo) {
  const placeId = place.place_id;

  // Skip if already processed in this run
  if (processedPlaceIds.has(placeId)) {
    return 'skipped';
  }
  processedPlaceIds.add(placeId);

  // Fetch full details
  const details = await fetchPlaceDetails(placeId);
  await sleep(RATE_LIMIT_MS);

  if (!details) {
    return 'error';
  }

  // Parse location
  const lat = details.geometry?.location?.lat || place.geometry?.location?.lat;
  const lng = details.geometry?.location?.lng || place.geometry?.location?.lng;

  if (!lat || !lng) {
    return 'skipped';
  }

  // Parse address
  const addressParts = parseAddress(
    details.formatted_address || place.formatted_address || '',
    cityInfo.name
  );

  // Build business document
  const businessData = {
    name: details.name || place.name,
    address: addressParts.address,
    city: cityInfo.name,
    state: addressParts.state,
    zip: addressParts.zip || cityInfo.zips[0],
    phone: details.formatted_phone_number || '',
    email: '', // Not available from Google
    website: details.website || '',
    category: determineCategory(details.types || place.types),
    description: `${details.name} located in ${cityInfo.name}, Texas.`,
    location: {
      type: 'Point',
      coordinates: [lng, lat]
    },
    status: 'approved', // Auto-approve seeded businesses
    metadata: {
      placeId: placeId,
      googleMapsUrl: details.url || '',
      source: 'google_places_seed',
      lastEnriched: new Date()
    }
  };

  // Add hours if available
  if (details.opening_hours) {
    const formattedHours = formatHours(details.opening_hours);
    if (formattedHours) {
      businessData.hours = formattedHours;
    }
  }

  // Add ratings if available
  if (details.rating) {
    businessData.ratingAverage = details.rating;
    businessData.ratingsCount = details.user_ratings_total || 0;
  }

  // Add Google photos (up to 5)
  const photoUrls = getPhotoUrls(details.photos);
  if (photoUrls.length > 0) {
    businessData.googlePhotos = photoUrls;
    businessData.hasGooglePhotos = true;
    // Use first photo as cover if no cover exists
    if (!businessData.coverPhotoUrl) {
      businessData.coverPhotoUrl = photoUrls[0];
    }
  }

  if (DRY_RUN) {
    console.log(`  [DRY RUN] Would upsert: ${businessData.name}`);
    if (businessData.phone) console.log(`    📞 ${businessData.phone}`);
    if (photoUrls.length > 0) console.log(`    📷 ${photoUrls.length} photos`);
    return 'dry_run';
  }

  // Upsert to database
  const result = await Business.updateOne(
    { 'metadata.placeId': placeId },
    { $set: businessData },
    { upsert: true }
  );

  if (result.upsertedCount > 0) {
    return 'new';
  } else if (result.modifiedCount > 0) {
    return 'updated';
  }
  return 'unchanged';
}

/**
 * Main seeding function
 */
async function seedThreeCities() {
  console.log('\n🚀 Three Cities Complete Seeding Script');
  console.log('========================================');
  if (DRY_RUN) {
    console.log('🔸 DRY RUN MODE - No database changes will be made\n');
  }
  console.log('');

  // Check for API key
  if (!GOOGLE_API_KEY) {
    console.error('❌ Error: GOOGLE_PLACES_API_KEY not found in environment');
    process.exit(1);
  }

  // Connect to MongoDB
  if (!DRY_RUN) {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('✅ Connected to MongoDB\n');
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      process.exit(1);
    }
  }

  // Get current counts per city
  if (!DRY_RUN) {
    console.log('📊 Current database state:');
    for (const city of TARGET_CITIES) {
      const count = await Business.countDocuments({ city: city.name });
      const withPhone = await Business.countDocuments({
        city: city.name,
        phone: { $exists: true, $ne: null, $ne: '' }
      });
      console.log(`   ${city.name}: ${count} businesses (${withPhone} with phone)`);
    }
    console.log('');
  }

  // Process each city
  for (const city of TARGET_CITIES) {
    console.log(`\n🏙️  Processing ${city.name}, TX`);
    console.log('─'.repeat(40));

    let cityNew = 0;
    let cityUpdated = 0;
    let cityPlaces = [];

    // Search with each query type
    for (const query of SEARCH_QUERIES) {
      process.stdout.write(`  Searching "${query}"... `);
      const results = await searchCity(city, query);
      console.log(`${results.length} results`);
      cityPlaces.push(...results);
      stats.searched++;
    }

    // Deduplicate by place_id
    const uniquePlaces = [];
    const seenIds = new Set();
    for (const place of cityPlaces) {
      if (!seenIds.has(place.place_id)) {
        seenIds.add(place.place_id);
        uniquePlaces.push(place);
      }
    }

    console.log(`  📍 Found ${uniquePlaces.length} unique places`);
    console.log(`  🔄 Processing...`);

    // Process each place
    for (let i = 0; i < uniquePlaces.length; i++) {
      const place = uniquePlaces[i];
      const result = await processPlace(place, city);

      if (result === 'new') {
        stats.newBusinesses++;
        cityNew++;
        console.log(`  ✨ NEW: ${place.name}`);
      } else if (result === 'updated') {
        stats.updated++;
        cityUpdated++;
      } else if (result === 'skipped') {
        stats.skipped++;
      }

      // Progress indicator every 10 places
      if ((i + 1) % 10 === 0) {
        process.stdout.write(`  Processed ${i + 1}/${uniquePlaces.length}\r`);
      }
    }

    console.log(`  ✅ ${city.name}: +${cityNew} new, ${cityUpdated} updated`);
  }

  // Print summary
  console.log('\n========================================');
  console.log('📊 SEEDING COMPLETE');
  console.log('========================================');
  console.log(`Search queries run: ${stats.searched}`);
  console.log(`New businesses added: ${stats.newBusinesses}`);
  console.log(`Existing updated: ${stats.updated}`);
  console.log(`Skipped (duplicates): ${stats.skipped}`);
  console.log(`API errors: ${stats.apiErrors}`);

  // Verify final counts
  if (!DRY_RUN) {
    console.log('\n📈 FINAL COVERAGE:');
    for (const city of TARGET_CITIES) {
      const total = await Business.countDocuments({ city: city.name });
      const withPhone = await Business.countDocuments({
        city: city.name,
        phone: { $exists: true, $ne: null, $ne: '' }
      });
      const coverage = total > 0 ? Math.round(withPhone / total * 100) : 0;
      console.log(`   ${city.name}: ${total} businesses, ${withPhone} with phone (${coverage}%)`);
    }

    await mongoose.disconnect();
  }

  console.log('\n✅ Done!');
}

// Run the script
seedThreeCities().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
