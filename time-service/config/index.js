/**
 * Configuration Management
 *
 * Centralizes all environment variables and configuration
 * Following 12-Factor App methodology
 */

require('dotenv').config();

const config = {
  // Server
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5500,
  serviceName: process.env.SERVICE_NAME || 'time-service',

  // Database
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/salonhub',
    dbName: process.env.MONGODB_DB_NAME || 'salonhub',
    options: {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }
  },

  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB, 10) || 0,
    keyPrefix: 'time-service:',
    retryStrategy: (times) => {
      if (times > 3) {
        return null; // Stop retrying
      }
      return Math.min(times * 100, 3000);
    }
  },

  // Cache TTL (seconds)
  cache: {
    ttl: {
      daily: parseInt(process.env.CACHE_TTL_DAILY, 10) || 300,    // 5 minutes
      weekly: parseInt(process.env.CACHE_TTL_WEEKLY, 10) || 600,   // 10 minutes
      monthly: parseInt(process.env.CACHE_TTL_MONTHLY, 10) || 900  // 15 minutes
    }
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 60
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback_secret_key_change_me',
    expiresIn: '7d'
  },

  // Twilio (SMS)
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER
  },

  // SendGrid (Email)
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY,
    fromEmail: process.env.SENDGRID_FROM_EMAIL || 'noreply@salonhub.com',
    fromName: process.env.SENDGRID_FROM_NAME || 'SalonHub Time Manager'
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    filePath: process.env.LOG_FILE_PATH || './logs'
  },

  // Worker Settings
  worker: {
    concurrency: parseInt(process.env.REMINDER_WORKER_CONCURRENCY, 10) || 5,
    cronSchedule: process.env.REMINDER_CRON_SCHEDULE || '*/1 * * * *'
  },

  // CORS
  cors: {
    allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:5000').split(',')
  }
};

// Validate critical configuration
const validateConfig = () => {
  const errors = [];

  if (!config.mongodb.uri) {
    errors.push('MONGODB_URI is required');
  }

  if (!config.jwt.secret || config.jwt.secret === 'fallback_secret_key_change_me') {
    console.warn('⚠️  WARNING: Using fallback JWT secret. Set JWT_SECRET in .env');
  }

  if (!config.sendgrid.apiKey && config.env === 'production') {
    console.warn('⚠️  WARNING: SendGrid API key not configured. Email reminders will not work.');
  }

  if (!config.twilio.accountSid && config.env === 'production') {
    console.warn('⚠️  WARNING: Twilio not configured. SMS reminders will not work.');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration errors:\n${errors.join('\n')}`);
  }
};

// Run validation
validateConfig();

module.exports = config;
