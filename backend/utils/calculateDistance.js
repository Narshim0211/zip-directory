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
 * Get user coordinates from ZIP code (simplified version)
 * In production, integrate with a geocoding API like Google Maps or Mapbox
 * @param {String} zip - ZIP code
 * @returns {Object|null} { lat, lng } or null if not found
 */
function getCoordinatesFromZip(zip) {
  // Simplified hardcoded coordinates for major US cities
  // In production, use a real geocoding service
  const zipDatabase = {
    '10001': { lat: 40.7506, lng: -73.9971 }, // NYC
    '90001': { lat: 33.9731, lng: -118.2479 }, // LA
    '60601': { lat: 41.8858, lng: -87.6229 }, // Chicago
    '77001': { lat: 29.7499, lng: -95.3588 }, // Houston
    '19019': { lat: 39.9496, lng: -75.1503 }, // Philadelphia
  };

  return zipDatabase[zip] || null;
}

module.exports = {
  calculateDistance,
  getCoordinatesFromZip,
};
