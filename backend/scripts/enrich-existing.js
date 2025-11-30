/**
 * Enrich Existing Businesses Script
 *
 * Purpose: Add phone numbers, websites, and hours to existing businesses
 * that were seeded via Nearby Search (which doesn't return phone numbers).
 *
 * Uses Google Place Details API to fetch missing contact information.
 *
 * Usage: node scripts/enrich-existing.js
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
const PLACE_DETAILS_URL = 'https://maps.googleapis.com/maps/api/place/details/json';
const PHOTO_URL_BASE = 'https://maps.googleapis.com/maps/api/place/photo';

// Photo settings
const MAX_PHOTOS = 5;
const PHOTO_MAX_WIDTH = 1200;

// Rate limiting: 1 request per 200ms = 5 requests/second (well under Google's limit)
const RATE_LIMIT_MS = 200;

// Pilot cities for Phase 1
const PILOT_CITIES = ['North Richland Hills', 'Hurst', 'Colleyville'];

// Stats tracking
const stats = {
  total: 0,
  enriched: 0,
  alreadyHasPhone: 0,
  noPlaceId: 0,
  apiErrors: 0,
  notFound: 0
};

/**
 * Sleep helper for rate limiting
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Convert Google photo references to permanent URLs
 */
function getPhotoUrls(photos) {
  if (!photos || !Array.isArray(photos)) return [];

  return photos.slice(0, MAX_PHOTOS).map(photo => {
    if (!photo.photo_reference) return null;
    return `${PHOTO_URL_BASE}?maxwidth=${PHOTO_MAX_WIDTH}&photoreference=${photo.photo_reference}&key=${GOOGLE_API_KEY}`;
  }).filter(Boolean);
}

/**
 * Fetch place details from Google Places API
 * @param {string} placeId - Google Place ID
 * @returns {Object|null} - Place details or null on error
 */
async function fetchPlaceDetails(placeId) {
  try {
    const response = await axios.get(PLACE_DETAILS_URL, {
      params: {
        place_id: placeId,
        fields: 'formatted_phone_number,international_phone_number,website,opening_hours,url,photos,rating,user_ratings_total',
        key: GOOGLE_API_KEY
      }
    });

    if (response.data.status === 'OK') {
      return response.data.result;
    } else if (response.data.status === 'NOT_FOUND') {
      console.log(`  ⚠️  Place not found: ${placeId}`);
      stats.notFound++;
      return null;
    } else {
      console.log(`  ❌ API Error: ${response.data.status} - ${response.data.error_message || ''}`);
      stats.apiErrors++;
      return null;
    }
  } catch (error) {
    console.log(`  ❌ Request failed: ${error.message}`);
    stats.apiErrors++;
    return null;
  }
}

/**
 * Format opening hours from Google's format to our schema
 */
function formatHours(openingHours) {
  if (!openingHours || !openingHours.periods) {
    return null;
  }

  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const hours = {};

  // Initialize all days as closed
  dayNames.forEach(day => {
    hours[day] = { open: '', close: '', isClosed: true };
  });

  // Fill in open hours
  openingHours.periods.forEach(period => {
    if (period.open && period.open.day !== undefined) {
      const dayName = dayNames[period.open.day];
      const openTime = period.open.time || '';
      const closeTime = period.close?.time || '';

      // Format time from "0900" to "09:00"
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
 * Main enrichment function
 */
async function enrichExistingBusinesses() {
  console.log('\n🚀 Starting Business Enrichment Script');
  console.log('=====================================\n');

  // Check for API key
  if (!GOOGLE_API_KEY) {
    console.error('❌ Error: GOOGLE_PLACES_API_KEY not found in environment');
    console.log('   Please add it to your .env file');
    process.exit(1);
  }

  // Connect to MongoDB
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }

  // Find businesses in pilot cities that have placeId but no phone
  const query = {
    city: { $in: PILOT_CITIES },
    'metadata.placeId': { $exists: true, $ne: null },
    $or: [
      { phone: { $exists: false } },
      { phone: null },
      { phone: '' }
    ]
  };

  const businesses = await Business.find(query).lean();
  stats.total = businesses.length;

  console.log(`📊 Found ${stats.total} businesses to enrich in pilot cities:`);
  PILOT_CITIES.forEach(city => {
    const count = businesses.filter(b => b.city === city).length;
    console.log(`   • ${city}: ${count}`);
  });
  console.log('');

  if (stats.total === 0) {
    // Check if businesses already have phones
    const withPhones = await Business.countDocuments({
      city: { $in: PILOT_CITIES },
      phone: { $exists: true, $ne: null, $ne: '' }
    });
    console.log(`ℹ️  ${withPhones} businesses already have phone numbers`);
    await mongoose.disconnect();
    return;
  }

  console.log('🔄 Starting enrichment (this may take a few minutes)...\n');

  // Process each business
  for (let i = 0; i < businesses.length; i++) {
    const business = businesses[i];
    const progress = `[${i + 1}/${stats.total}]`;

    console.log(`${progress} ${business.name} (${business.city})`);

    // Get place details
    const details = await fetchPlaceDetails(business.metadata.placeId);

    if (details) {
      // Prepare update
      const update = {};

      if (details.formatted_phone_number) {
        update.phone = details.formatted_phone_number;
        console.log(`  📞 Phone: ${details.formatted_phone_number}`);
      }

      if (details.website) {
        update.website = details.website;
        console.log(`  🌐 Website: ${details.website.slice(0, 50)}...`);
      }

      if (details.opening_hours) {
        const formattedHours = formatHours(details.opening_hours);
        if (formattedHours) {
          update.hours = formattedHours;
          console.log(`  🕐 Hours: Added`);
        }
      }

      if (details.url) {
        update['metadata.googleMapsUrl'] = details.url;
      }

      // Add Google photos (up to 5)
      const photoUrls = getPhotoUrls(details.photos);
      if (photoUrls.length > 0) {
        update.googlePhotos = photoUrls;
        update.hasGooglePhotos = true;
        // Use first photo as cover if business doesn't have one
        if (!business.coverPhotoUrl) {
          update.coverPhotoUrl = photoUrls[0];
        }
        console.log(`  📷 Photos: ${photoUrls.length} added`);
      }

      // Add ratings if available
      if (details.rating) {
        update.ratingAverage = details.rating;
        update.ratingsCount = details.user_ratings_total || 0;
        console.log(`  ⭐ Rating: ${details.rating} (${details.user_ratings_total || 0} Google reviews)`);
      }

      // Apply update if we have any new data
      if (Object.keys(update).length > 0) {
        await Business.updateOne(
          { _id: business._id },
          { $set: update }
        );
        stats.enriched++;
        console.log(`  ✅ Enriched with ${Object.keys(update).length} fields`);
      } else {
        console.log(`  ⚠️  No new data found`);
      }
    }

    // Rate limiting
    await sleep(RATE_LIMIT_MS);
  }

  // Print summary
  console.log('\n=====================================');
  console.log('📊 ENRICHMENT COMPLETE');
  console.log('=====================================');
  console.log(`Total processed: ${stats.total}`);
  console.log(`Successfully enriched: ${stats.enriched}`);
  console.log(`Place not found: ${stats.notFound}`);
  console.log(`API errors: ${stats.apiErrors}`);
  console.log('');

  // Verify results
  const verifyQuery = {
    city: { $in: PILOT_CITIES },
    phone: { $exists: true, $ne: null, $ne: '' }
  };
  const withPhones = await Business.countDocuments(verifyQuery);
  const totalInCities = await Business.countDocuments({ city: { $in: PILOT_CITIES } });

  console.log('📈 COVERAGE AFTER ENRICHMENT:');
  console.log(`   Businesses with phones: ${withPhones}/${totalInCities} (${Math.round(withPhones/totalInCities*100)}%)`);

  await mongoose.disconnect();
  console.log('\n✅ Done! Database connection closed.');
}

// Run the script
enrichExistingBusinesses().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
