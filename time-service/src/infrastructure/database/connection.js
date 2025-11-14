/**
 * MongoDB Connection Management
 *
 * Enterprise-grade database connection with:
 * - Connection pooling
 * - Retry logic
 * - Event handlers
 * - Graceful shutdown
 */

const mongoose = require('mongoose');
const config = require('../../../config');
const logger = require('../../shared/utils/logger');

class DatabaseConnection {
  constructor() {
    this.isConnected = false;
    this.connectionAttempts = 0;
    this.maxRetries = 5;
  }

  async connect() {
    if (this.isConnected) {
      logger.info('MongoDB already connected');
      return;
    }

    try {
      mongoose.set('strictQuery', false);

      // Connection event handlers
      mongoose.connection.on('connected', () => {
        this.isConnected = true;
        this.connectionAttempts = 0;
        logger.info('MongoDB connected successfully', {
          host: config.mongodb.uri.split('@')[1]?.split('/')[0] || 'localhost',
          database: config.mongodb.dbName
        });
      });

      mongoose.connection.on('error', (err) => {
        logger.error('MongoDB connection error', { error: err.message });
      });

      mongoose.connection.on('disconnected', () => {
        this.isConnected = false;
        logger.warn('MongoDB disconnected');
      });

      // Attempt connection
      await mongoose.connect(config.mongodb.uri, config.mongodb.options);

    } catch (error) {
      this.connectionAttempts++;
      logger.error('MongoDB connection failed', {
        attempt: this.connectionAttempts,
        maxRetries: this.maxRetries,
        error: error.message
      });

      if (this.connectionAttempts < this.maxRetries) {
        const retryDelay = Math.min(1000 * Math.pow(2, this.connectionAttempts), 30000);
        logger.info(`Retrying connection in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return this.connect();
      } else {
        throw new Error(`Failed to connect to MongoDB after ${this.maxRetries} attempts`);
      }
    }
  }

  async disconnect() {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.connection.close();
      this.isConnected = false;
      logger.info('MongoDB disconnected gracefully');
    } catch (error) {
      logger.error('Error disconnecting from MongoDB', { error: error.message });
      throw error;
    }
  }

  getConnection() {
    return mongoose.connection;
  }

  isHealthy() {
    return this.isConnected && mongoose.connection.readyState === 1;
  }
}

// Export singleton instance
module.exports = new DatabaseConnection();
