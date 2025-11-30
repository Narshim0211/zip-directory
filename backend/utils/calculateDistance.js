/**
 * Distance Calculation Utility
 * Uses Haversine formula to calculate distance between two lat/lng points
 * NO duplication - single source of truth for distance calculations
 */

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {Number} lat1 - Latitude of point 1
 * @param {Number} lon1 - Longitude of point 1
 * @param {Number} lat2 - Latitude of point 2
 * @param {Number} lon2 - Longitude of point 2
 * @param {String} unit - Unit of measurement ('mi' for miles, 'km' for kilometers)
 * @returns {Number} Distance in specified unit
 */
function calculateDistance(lat1, lon1, lat2, lon2, unit = 'mi') {
  if (lat1 === lat2 && lon1 === lon2) {
    return 0;
  }

  const radlat1 = (Math.PI * lat1) / 180;
  const radlat2 = (Math.PI * lat2) / 180;
  const theta = lon1 - lon2;
  const radtheta = (Math.PI * theta) / 180;

  let dist =
    Math.sin(radlat1) * Math.sin(radlat2) +
    Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);

  if (dist > 1) {
    dist = 1;
  }

  dist = Math.acos(dist);
  dist = (dist * 180) / Math.PI;
  dist = dist * 60 * 1.1515; // Distance in miles

  if (unit === 'km') {
    dist = dist * 1.609344; // Convert to kilometers
  }

  return Math.round(dist * 10) / 10; // Round to 1 decimal place
}

/**
 * Tarrant County ZIP codes and city coordinates
 * Loaded from data/tarrant-zips.json
 */
const tarrantZips = require('../data/tarrant-zips.json');

/**
 * Get user coordinates from ZIP code or city name
 * Supports all Tarrant County ZIP codes and major cities
 * @param {String} zipOrCity - ZIP code or city name
 * @returns {Object|null} { lat, lng } or null if not found
 */
function getCoordinatesFromZip(zipOrCity) {
  if (!zipOrCity) return null;

  // Clean input
  const input = zipOrCity.toString().trim();

  // Try direct lookup (works for both ZIP codes and city names)
  const coords = tarrantZips[input];
  if (coords) {
    return { lat: coords.lat, lng: coords.lng };
  }

  // Try case-insensitive city name match
  const lowerInput = input.toLowerCase();
  for (const [key, value] of Object.entries(tarrantZips)) {
    if (key.toLowerCase() === lowerInput) {
      return { lat: value.lat, lng: value.lng };
    }
  }

  // Default to Fort Worth center if not found
  return { lat: 32.7555, lng: -97.3308 };
}

module.exports = {
  calculateDistance,
  getCoordinatesFromZip,
};
