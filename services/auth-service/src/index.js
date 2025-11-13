const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const { errorHandler, notFoundHandler, setupUnhandledRejectionHandlers } = require('./middlewares/errorMiddleware');
const logger = require('./utils/logger');

/**
 * Auth Microservice - Main Server
 * Per Part 15.1: Microservice scalability
 * Per Part 15.2.1: Stateless backend services
 * Per Part 16.2: Enterprise folder structure
 */

const app = express();

// Setup unhandled rejection handlers
setupUnhandledRejectionHandlers();

// Security middleware
app.use(helmet());

// CORS Configuration
const allowedOrigins = [
  process.env.WEB_ORIGIN,
  process.env.ADMIN_ORIGIN,
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3002',
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1 || /^https?:\/\/(localhost|127\.0\.0\.1)(:\\d+)?$/i.test(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database Connection
mongoose
  .connect(process.env.MONGO_URI, {
    dbName: 'salonhub-auth',
  })
  .then(() => {
    logger.info('MongoDB connected - Auth Service');
  })
  .catch((err) => {
    logger.error('MongoDB connection error', { error: err.message });
    process.exit(1);
  });

// Routes
app.use('/auth', authRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    service: process.env.SERVICE_NAME || 'auth-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 404 Handler
app.use(notFoundHandler);

// Global Error Handler (must be last)
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  logger.info(`Auth Service running on http://localhost:${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  mongoose.connection.close(false, () => {
    logger.info('MongoDB connection closed');
    process.exit(0);
  });
});

module.exports = app;
