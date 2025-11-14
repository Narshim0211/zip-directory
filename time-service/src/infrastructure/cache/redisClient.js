/**
 * Redis Client Management
 *
 * Enterprise-grade caching layer with:
 * - Connection pooling
 * - Automatic reconnection
 * - Error handling
 * - Performance monitoring
 */

const Redis = require('ioredis');
const config = require('../../../config');
const logger = require('../../shared/utils/logger');

class RedisClient {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  connect() {
    if (this.client) {
      logger.warn('Redis client already exists');
      return this.client;
    }

    try {
      this.client = new Redis({
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password,
        db: config.redis.db,
        keyPrefix: config.redis.keyPrefix,
        retryStrategy: config.redis.retryStrategy,
        enableReadyCheck: true,
        maxRetriesPerRequest: 3,
        lazyConnect: false
      });

      // Event handlers
      this.client.on('connect', () => {
        this.isConnected = true;
        logger.info('Redis connected successfully', {
          host: config.redis.host,
          port: config.redis.port,
          db: config.redis.db
        });
      });

      this.client.on('ready', () => {
        logger.info('Redis client ready');
      });

      this.client.on('error', (error) => {
        this.isConnected = false;
        logger.error('Redis connection error', { error: error.message });
      });

      this.client.on('close', () => {
        this.isConnected = false;
        logger.warn('Redis connection closed');
      });

      this.client.on('reconnecting', () => {
        logger.info('Redis reconnecting...');
      });

      return this.client;
    } catch (error) {
      logger.error('Failed to create Redis client', { error: error.message });
      throw error;
    }
  }

  async disconnect() {
    if (!this.client) {
      return;
    }

    try {
      await this.client.quit();
      this.client = null;
      this.isConnected = false;
      logger.info('Redis disconnected gracefully');
    } catch (error) {
      logger.error('Error disconnecting from Redis', { error: error.message });
      // Force disconnect if graceful quit fails
      if (this.client) {
        this.client.disconnect();
        this.client = null;
        this.isConnected = false;
      }
    }
  }

  getClient() {
    if (!this.client) {
      throw new Error('Redis client not initialized. Call connect() first.');
    }
    return this.client;
  }

  isHealthy() {
    return this.isConnected && this.client && this.client.status === 'ready';
  }
}

// Export singleton instance
module.exports = new RedisClient();
