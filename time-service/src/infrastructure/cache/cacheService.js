/**
 * Cache Service
 *
 * High-level caching abstraction with:
 * - TTL management
 * - Key generation
 * - Batch operations
 * - Cache invalidation patterns
 */

const redisClient = require('./redisClient');
const config = require('../../../config');
const logger = require('../../shared/utils/logger');

class CacheService {
  /**
   * Generate cache key for user tasks
   * @param {string} userId - User ID
   * @param {string} scope - daily, weekly, or monthly
   * @param {string} date - Date string (YYYY-MM-DD)
   * @returns {string} Cache key
   */
  generateTaskKey(userId, scope, date) {
    return `tasks:${userId}:${scope}:${date}`;
  }

  /**
   * Get cached data
   * @param {string} key - Cache key
   * @returns {Promise<any|null>} Cached data or null
   */
  async get(key) {
    try {
      const client = redisClient.getClient();
      const data = await client.get(key);

      if (data) {
        logger.debug('Cache hit', { key });
        return JSON.parse(data);
      }

      logger.debug('Cache miss', { key });
      return null;
    } catch (error) {
      logger.error('Cache get error', { key, error: error.message });
      return null; // Fail silently, don't break the app
    }
  }

  /**
   * Set cached data with TTL
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   * @param {number} ttl - Time to live in seconds (optional)
   * @returns {Promise<boolean>} Success status
   */
  async set(key, data, ttl = null) {
    try {
      const client = redisClient.getClient();
      const serialized = JSON.stringify(data);

      if (ttl) {
        await client.setex(key, ttl, serialized);
      } else {
        await client.set(key, serialized);
      }

      logger.debug('Cache set', { key, ttl });
      return true;
    } catch (error) {
      logger.error('Cache set error', { key, error: error.message });
      return false;
    }
  }

  /**
   * Delete cached data
   * @param {string|string[]} keys - Cache key(s) to delete
   * @returns {Promise<number>} Number of keys deleted
   */
  async delete(keys) {
    try {
      const client = redisClient.getClient();
      const keysArray = Array.isArray(keys) ? keys : [keys];

      if (keysArray.length === 0) {
        return 0;
      }

      const deleted = await client.del(...keysArray);
      logger.debug('Cache delete', { keys: keysArray, deleted });
      return deleted;
    } catch (error) {
      logger.error('Cache delete error', { keys, error: error.message });
      return 0;
    }
  }

  /**
   * Delete all keys matching a pattern
   * @param {string} pattern - Key pattern (e.g., "tasks:user123:*")
   * @returns {Promise<number>} Number of keys deleted
   */
  async deletePattern(pattern) {
    try {
      const client = redisClient.getClient();

      // Get all keys matching pattern
      const keys = await client.keys(pattern);

      if (keys.length === 0) {
        return 0;
      }

      // Delete keys
      const deleted = await client.del(...keys);
      logger.debug('Cache delete pattern', { pattern, deleted });
      return deleted;
    } catch (error) {
      logger.error('Cache delete pattern error', { pattern, error: error.message });
      return 0;
    }
  }

  /**
   * Invalidate all user task caches
   * @param {string} userId - User ID
   * @returns {Promise<number>} Number of keys deleted
   */
  async invalidateUserTasks(userId) {
    const pattern = `tasks:${userId}:*`;
    return this.deletePattern(pattern);
  }

  /**
   * Invalidate specific scope for user
   * @param {string} userId - User ID
   * @param {string} scope - daily, weekly, or monthly
   * @returns {Promise<number>} Number of keys deleted
   */
  async invalidateUserScope(userId, scope) {
    const pattern = `tasks:${userId}:${scope}:*`;
    return this.deletePattern(pattern);
  }

  /**
   * Check if cache is available
   * @returns {boolean}
   */
  isAvailable() {
    return redisClient.isHealthy();
  }

  /**
   * Get TTL for scope
   * @param {string} scope - daily, weekly, or monthly
   * @returns {number} TTL in seconds
   */
  getTTL(scope) {
    return config.cache.ttl[scope] || config.cache.ttl.daily;
  }

  /**
   * Cache with automatic TTL based on scope
   * @param {string} userId - User ID
   * @param {string} scope - daily, weekly, or monthly
   * @param {string} date - Date string
   * @param {any} data - Data to cache
   * @returns {Promise<boolean>}
   */
  async cacheTaskData(userId, scope, date, data) {
    const key = this.generateTaskKey(userId, scope, date);
    const ttl = this.getTTL(scope);
    return this.set(key, data, ttl);
  }

  /**
   * Get cached task data
   * @param {string} userId - User ID
   * @param {string} scope - daily, weekly, or monthly
   * @param {string} date - Date string
   * @returns {Promise<any|null>}
   */
  async getTaskData(userId, scope, date) {
    const key = this.generateTaskKey(userId, scope, date);
    return this.get(key);
  }
}

module.exports = new CacheService();
