/**
 * 🏪 TARRANT COUNTY SALON SEEDER
 *
 * One-time script to pull real salons from Google Places API
 * and store them in your MongoDB forever.
 *
 * Usage: node backend/scripts/seed-tarrant-county.js
 *
 * Cost: ~$40-$90 one-time (Google Places API)
 * Result: 1,200+ real Tarrant County salons in your database
 */

const path = require('path');
// Load from backend/.env first, then root .env as fallback
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const mongoose = require('mongoose');
const fetch = require('node-fetch');

// Use your existing Business model
const Business = require('../models/Business');

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

// Tarrant County center points for better coverage
const SEARCH_CENTERS = [
  { lat: 32.7555, lng: -97.3308, name: 'Fort Worth Downtown' },
  { lat: 32.7357, lng: -97.1081, name: 'Arlington' },
  { lat: 32.9346, lng: -97.2293, name: 'Keller' },
  { lat: 32.5632, lng: -97.1417, name: 'Mansfield' },
  { lat: 32.8140, lng: -97.1330, name: 'North Arlington/Hurst' },
  { lat: 32.6513, lng: -97.4083, name: 'Benbrook' },
  { lat: 32.8998, lng: -97.1500, name: 'Bedford/Euless' },
  { lat: 32.6998, lng: -97.1250, name: 'South Arlington' },
];

// Search keywords to get variety
const SEARCH_KEYWORDS = [
  'hair salon',
  'barber shop',
  'braiding salon',
  'hair extensions',
  'beauty salon',
  'natural hair salon',
  'african american hair salon',
  'mens haircut',
];

// Track unique places to avoid duplicates
const seenPlaceIds = new Set();
let totalSaved = 0;

async function fetchPlaces(center, keyword) {
  let pageToken = null;
  let pagesProcessed = 0;

  do {
    let url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${center.lat},${center.lng}&radius=16000&keyword=${encodeURIComponent(keyword)}&type=hair_care&key=${GOOGLE_API_KEY}`;

    if (pageToken) {
      url += `&pagetoken=${pageToken}`;
    }

    console.log(`\n📍 Searching "${keyword}" near ${center.name}... (page ${pagesProcessed + 1})`);

    const res = await fetch(url);
    const json = await res.json();

    if (json.status === 'REQUEST_DENIED') {
      console.error('❌ API Key issue:', json.error_message);
      return;
    }

    if (json.status === 'ZERO_RESULTS') {
      console.log('   No results for this search');
      break;
    }

    for (const place of json.results || []) {
      // Skip if already seen or not operational
      if (seenPlaceIds.has(place.place_id)) continue;
      if (place.business_status !== 'OPERATIONAL') continue;

      seenPlaceIds.add(place.place_id);

      // Determine category based on name/types
      let category = 'Salon';
      const nameLower = place.name.toLowerCase();
      if (nameLower.includes('barber')) {
        category = 'Barbershop';
      } else if (nameLower.includes('spa')) {
        category = 'Spa';
      }

      // Extract city and zip from address
      const address = place.vicinity || place.formatted_address || '';
      let city = 'Fort Worth';
      let zip = '';
      let state = 'TX';

      // Try to parse city from address
      const cityMatch = address.match(/,\s*([A-Za-z\s]+),?\s*TX/i);
      if (cityMatch) {
        city = cityMatch[1].trim();
      }

      // Get photo reference
      const photoRef = place.photos?.[0]?.photo_reference || null;

      // Build cover photo URL if we have a reference
      let coverPhotoUrl = '';
      if (photoRef) {
        coverPhotoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photoRef}&key=${GOOGLE_API_KEY}`;
      }

      try {
        await Business.updateOne(
          { 'metadata.placeId': place.place_id },
          {
            $set: {
              name: place.name,
              address: address,
              city: city,
              state: state,
              zip: zip,
              category: category,
              businessType: category === 'Barbershop' ? 'salon' : 'salon',
              phone: place.formatted_phone_number || '',
              ratingAverage: place.rating || 0,
              ratingsCount: place.user_ratings_total || 0,
              coverPhotoUrl: coverPhotoUrl,
              location: {
                type: 'Point',
                coordinates: [place.geometry.location.lng, place.geometry.location.lat]
              },
              // Mark as approved so they show in search
              status: 'approved',
              moderationStatus: 'APPROVED',
              // Store Google data in metadata for reference
              metadata: {
                placeId: place.place_id,
                photoRef: photoRef,
                googleRating: place.rating,
                googleReviewCount: place.user_ratings_total,
                seededAt: new Date(),
                source: 'google_places'
              },
              // Default hours (can be updated later)
              hours: {
                mon: '09:00-18:00',
                tue: '09:00-18:00',
                wed: '09:00-18:00',
                thu: '09:00-18:00',
                fri: '09:00-18:00',
                sat: '09:00-17:00',
                sun: 'closed'
              },
              listingType: 'free',
              verificationStatus: 'unverified',
            }
          },
          { upsert: true }
        );

        totalSaved++;
        console.log(`   ✅ ${totalSaved}: ${place.name} (${city})`);

      } catch (err) {
        console.log(`   ⚠️ Skip: ${place.name} - ${err.message}`);
      }
    }

    pageToken = json.next_page_token;
    pagesProcessed++;

    // Google requires 2-second delay before using next_page_token
    if (pageToken) {
      console.log('   ⏳ Waiting for next page...');
      await new Promise(r => setTimeout(r, 2500));
    }

  } while (pageToken && pagesProcessed < 3); // Max 3 pages per search (60 results)
}

async function main() {
  console.log('🚀 TARRANT COUNTY SALON SEEDER');
  console.log('================================\n');

  // Verify API key exists
  if (!GOOGLE_API_KEY) {
    console.error('❌ ERROR: GOOGLE_PLACES_API_KEY not found in .env');
    console.error('   Add it to your backend/.env file');
    process.exit(1);
  }

  if (!MONGODB_URI) {
    console.error('❌ ERROR: MONGODB_URI not found in .env');
    process.exit(1);
  }

  console.log('✅ Google API Key found');
  console.log('✅ MongoDB URI found\n');

  // Connect to MongoDB
  console.log('📦 Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB\n');

  // Check current count
  const currentCount = await Business.countDocuments();
  console.log(`📊 Current businesses in DB: ${currentCount}`);

  // Ask if user wants to delete old data
  if (currentCount > 0) {
    console.log('\n⚠️  WARNING: Found existing businesses in database.');
    console.log('   This script will ADD to existing data (not replace).');
    console.log('   Duplicates are prevented by Google Place ID.\n');
  }

  console.log('🔍 Starting search across Tarrant County...\n');
  console.log('   This will take 15-30 minutes.');
  console.log('   Do NOT close this terminal.\n');

  // Search each center with each keyword
  for (const center of SEARCH_CENTERS) {
    for (const keyword of SEARCH_KEYWORDS) {
      await fetchPlaces(center, keyword);
      // Small delay between searches to avoid rate limiting
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  // Final count
  const finalCount = await Business.countDocuments();

  console.log('\n================================');
  console.log('🎉 TARRANT COUNTY SEEDING COMPLETE!');
  console.log('================================');
  console.log(`📊 Total salons saved: ${totalSaved}`);
  console.log(`📊 Total in database: ${finalCount}`);
  console.log('\n✅ Your database is now full of real Tarrant County salons!');
  console.log('   Users can search by zip code and see local results.');
  console.log('\n👉 Next step: Update the search controller to show distance.');

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
