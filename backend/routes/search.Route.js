/**
 * Smart Search Routes (v1.0)
 *
 * Public search endpoints for beauty directory
 * - Main search with ranking
 * - Autocomplete suggestions
 * - Smart query parsing
 * - Geocoding
 */

const createRouter = require('./asyncRouter');
const router = createRouter();
const searchController = require('../controllers/search/searchController');
const autocompleteController = require('../controllers/search/autocompleteController');
const parseQueryController = require('../controllers/search/parseQueryController');

/**
 * @route   GET /api/search
 * @desc    Smart search with fuzzy matching, geo, filters, and ranking
 * @access  Public
 * @example /api/search?q=braids&lat=32.7767&lng=-96.7970&rating=4.5&open=1&sort=best&page=0
 * @example /api/search?city=Dallas&zip=75001&q=braids
 */
router.get('/', searchController.search);

/**
 * @route   GET /api/search/suggest
 * @desc    Autocomplete suggestions as user types
 * @access  Public
 * @example /api/search/suggest?q=bra
 */
router.get('/suggest', autocompleteController.suggest);

/**
 * @route   POST /api/search/parse
 * @desc    Parse natural language search query
 * @access  Public
 * @example POST { "query": "braids in Dallas 75001" }
 */
router.post('/parse', parseQueryController.parseQuery);

/**
 * @route   POST /api/search/geocode
 * @desc    Convert city/zip/address to coordinates
 * @access  Public
 * @example POST { "city": "Dallas", "zip": "75001" }
 */
router.post('/geocode', parseQueryController.geocode);

module.exports = router;
