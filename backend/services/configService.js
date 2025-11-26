/**
 * ⚙️ CONFIG SERVICE
 *
 * Centralized configuration management with in-memory caching.
 * Single source of truth for all runtime platform settings.
 *
 * Architecture:
 * - In-memory cache with 5-minute TTL (300,000ms)
 * - Automatic cache refresh on first access after TTL expires
 * - Falls back to safe defaults if DB is unavailable
 * - Instant cache update on writes (no wait for TTL)
 *
 * Performance:
 * - Zero DB queries after initial load (until cache expires)
 * - Handles high-traffic scenarios without DB hammering
 * - Graceful degradation if database is down
 *
 * Usage:
 * const { isCommentPaywallEnabled } = require('./services/configService');
 * const enabled = await isCommentPaywallEnabled();
 * if (!enabled) { // allow free access }
 *
 * Admin Changes:
 * When admin updates config via API → cache updates instantly
 * All servers refresh within 5 minutes (TTL expiry)
 */

const SystemConfig = require('../models/SystemConfig');

// Cache configuration
const CACHE_TTL = 300000; // 5 minutes in milliseconds
let configCache = {}; // In-memory cache: { key: value }
let lastFetchTimestamp = 0;

/**
 * Fetch all configs from database and populate cache
 * @private
 */
async function refreshCache() {
  try {
    const configs = await SystemConfig.find({}).lean();
    configCache = {};

    for (const config of configs) {
      configCache[config.key] = config.value;
    }

    lastFetchTimestamp = Date.now();
    console.log(`[ConfigService] Cache refreshed with ${configs.length} config(s)`);
  } catch (error) {
    console.error('[ConfigService] Failed to refresh cache:', error);
    // Keep existing cache on error
  }
}

/**
 * Get config value by key with automatic cache management
 * @param {string} key - Config key to retrieve
 * @param {*} defaultValue - Fallback value if config doesn't exist
 * @returns {Promise<*>} Config value or default
 */
async function getConfig(key, defaultValue) {
  const now = Date.now();
  const cacheAge = now - lastFetchTimestamp;

  // Refresh cache if expired or never loaded
  if (cacheAge > CACHE_TTL) {
    await refreshCache();
  }

  // Return cached value or default
  return configCache[key] !== undefined ? configCache[key] : defaultValue;
}

/**
 * Set config value and update cache instantly
 * @param {string} key - Config key
 * @param {*} value - Config value
 * @param {string} adminId - ID of admin making the change (for audit)
 * @returns {Promise<void>}
 */
async function setConfig(key, value, adminId = null) {
  try {
    await SystemConfig.updateOne(
      { key },
      {
        key,
        value,
        updatedBy: adminId
      },
      { upsert: true }
    );

    // Instant cache update (don't wait for next TTL cycle)
    configCache[key] = value;

    console.log(`[ConfigService] Updated config: ${key} = ${JSON.stringify(value)}`);
  } catch (error) {
    console.error('[ConfigService] Failed to set config:', error);
    throw error;
  }
}

/**
 * Initialize default configs on server startup
 * Creates configs if they don't exist, preserves existing values
 * @returns {Promise<void>}
 */
async function initializeDefaults() {
  const defaults = [
    {
      key: 'commentPaywallEnabled',
      value: true,
      description: 'Require premium/chat pass to comment on posts and surveys'
    },
    // Add more default configs here as needed
    // { key: 'maintenanceMode', value: false, description: 'Platform maintenance mode' },
  ];

  try {
    for (const config of defaults) {
      const existing = await SystemConfig.findOne({ key: config.key });
      if (!existing) {
        await SystemConfig.create(config);
        console.log(`[ConfigService] Initialized default config: ${config.key}`);
      }
    }

    // Initial cache load
    await refreshCache();
  } catch (error) {
    console.error('[ConfigService] Failed to initialize defaults:', error);
  }
}

/**
 * Check if comment paywall is enabled
 * This is the global kill-switch for comment monetization
 * @returns {Promise<boolean>}
 */
async function isCommentPaywallEnabled() {
  return await getConfig('commentPaywallEnabled', true); // Default: enabled
}

// Export public API
module.exports = {
  getConfig,
  setConfig,
  initializeDefaults,
  isCommentPaywallEnabled,
  refreshCache // Exposed for testing/debugging
};
